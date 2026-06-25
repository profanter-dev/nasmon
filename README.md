# nasmon

A read-only NAS monitoring dashboard designed for TrueNAS SCALE. The browser connects once via WebSocket and receives all sensor data pushed continuously — no page refresh, no frontend polling.

## Features

- CPU usage, per-core breakdown, frequency, and temperature sparklines
- RAM usage with sparkline history
- Network interface throughput (per-interface, live)
- ZFS pool status, usage, and health badges
- HDD and NVMe temperatures, SMART status, and real-time R/W throughput
- Fan RPM (graceful fallback when kernel driver is unavailable)
- Docker container status grid with per-service detail drawer
- Optional health alerts for \*arr applications (Sonarr, Radarr, Prowlarr)
- WebSocket auto-reconnect with backoff; last snapshot stays visible during disconnects

## Stack

| Layer     | Technology                                              |
|-----------|---------------------------------------------------------|
| Frontend  | React 19, Vite 6, TypeScript (strict), Tailwind CSS v4, recharts |
| Backend   | Python 3.12, FastAPI, uvicorn, psutil, websockets, Pydantic v2 |
| Container | Multi-stage Docker build (Node 22 Alpine → Python 3.12-slim) |
| Proxy     | Traefik (external network, TLS)                         |

## Prerequisites

- Docker and Docker Compose on the host
- A running Traefik instance with an external Docker network named `traefik`
- TrueNAS SCALE (the dashboard degrades gracefully if TrueNAS is unreachable)
- Internal DNS entry for the hostname you choose

## Setup

### 1. Clone the repository

```bash
git clone <repo-url>
cd nasmon
```

### 2. Create the config directory on the host

```bash
mkdir -p /mnt/apps/nasmon
```

### 3. Create the `.env` file

Copy the example and fill in your values:

```bash
cp .env.example /mnt/apps/nasmon/.env
$EDITOR /mnt/apps/nasmon/.env
```

Required values:

| Variable          | Description                                              |
|-------------------|----------------------------------------------------------|
| `TRAEFIK_HOST`    | Hostname Traefik will route to this service              |
| `TRUENAS_HOST`    | IP address of your TrueNAS machine                       |
| `TRUENAS_API_KEY` | TrueNAS API key (see below)                              |

All other variables have sensible defaults and can be left as-is initially.

### 4. Generate a TrueNAS API key

In the TrueNAS UI: click the user icon in the **top-right toolbar → My API Keys → Add API Key**. Copy the key immediately — TrueNAS will not show it again after you close the dialog. Paste it into `TRUENAS_API_KEY` in your `.env`.

### 5. Add a DNS entry

Create an internal DNS record pointing `TRAEFIK_HOST` to the IP of your Docker host. The exact method depends on your DNS setup (Pi-hole, router, etc.).

### 6. Build and start

```bash
docker compose up -d --build
```

The dashboard will be available at the hostname you set in `TRAEFIK_HOST`.

## Environment variables

### Core

| Variable                    | Default | Description                              |
|-----------------------------|---------|------------------------------------------|
| `TRAEFIK_HOST`              | —       | Hostname for Traefik routing (required)  |
| `TRUENAS_HOST`              | —       | TrueNAS IP address                       |
| `TRUENAS_API_KEY`           | —       | TrueNAS API key                          |
| `TRUENAS_WS_PORT`           | `80`    | TrueNAS WebSocket port                   |
| `FAST_INTERVAL_SECONDS`     | `2`     | How often CPU/RAM/network are pushed     |
| `PROCESS_INTERVAL_SECONDS`  | `5`     | How often the process list is refreshed  |
| `DISK_TEMP_INTERVAL_SECONDS`| `30`    | How often disk temps are fetched         |
| `POOL_INTERVAL_SECONDS`     | `30`    | How often pool status is fetched         |
| `SMART_INTERVAL_SECONDS`    | `300`   | How often SMART alerts are checked       |

### Docker / services monitoring

| Variable        | Default                    | Description                        |
|-----------------|----------------------------|------------------------------------|
| `DOCKER_SOCKET` | `/var/run/docker.sock`     | Path to the Docker socket          |

### \*arr health (all optional)

If both `_URL` and `_API_KEY` are set for a service, nasmon will poll `/api/v3/health` every 2 minutes and surface any warnings or errors in the service detail drawer. If only the Docker socket is available, the service still appears with its container state.

| Variable         | Description                  |
|------------------|------------------------------|
| `SONARR_URL`     | e.g. `http://sonarr:8989`    |
| `SONARR_API_KEY` | Sonarr API key               |
| `RADARR_URL`     | e.g. `http://radarr:7878`    |
| `RADARR_API_KEY` | Radarr API key               |
| `PROWLARR_URL`   | e.g. `http://prowlarr:9696`  |
| `PROWLARR_API_KEY`| Prowlarr API key            |

## Graceful degradation

| Condition                          | Behaviour                                                                 |
|------------------------------------|---------------------------------------------------------------------------|
| TrueNAS unreachable                | HDD temps and pool data show as unavailable; psutil metrics keep running  |
| Fan driver not loaded (`it87`)     | Fan card shows "Driver not loaded"; nothing else affected                 |
| Docker socket not mounted          | Services section is hidden entirely                                       |
| \*arr API key not configured       | Service shown with Docker container state only; no alerts section         |
| \*arr service unreachable          | Single red "Connection" alert shown in the detail drawer                  |
| Browser WebSocket disconnects      | Auto-reconnect with backoff; last snapshot stays visible                  |

## Development

### Backend

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Type-check with mypy:

```bash
mypy app/
```

### Frontend

```bash
cd frontend
yarn install
yarn dev
```

The Vite dev server proxies `/ws` to `localhost:8000`, so the backend must be running. The dashboard is available at `http://localhost:5173`.

## Volume mounts

| Host path               | Container path              | Purpose                              |
|-------------------------|-----------------------------|--------------------------------------|
| `/proc`                 | `/proc` (read-only)         | psutil system metrics                |
| `/sys`                  | `/sys` (read-only)          | NVMe temps, fan sensors via sysfs    |
| `/var/run/docker.sock`  | `/var/run/docker.sock` (ro) | Container status monitoring          |
| `/mnt/apps/nasmon`      | `/config`                   | Config directory (`.env` lives here) |

No privileged mode is required.
