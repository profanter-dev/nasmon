import asyncio
import json
import logging
import ssl
import uuid
from typing import Any

import websockets
from pydantic import BaseModel

from app.config import settings

logger = logging.getLogger(__name__)


class TrueNasDiskInfo(BaseModel):
    name: str
    model: str | None = None
    serial: str | None = None
    type: str | None = None
    pool: str | None = None


class TrueNasPoolInfo(BaseModel):
    name: str
    status: str
    size: int | None = None
    allocated: int | None = None


class TrueNasDatasetInfo(BaseModel):
    name: str
    used: int | None = None
    available: int | None = None


class TrueNasClient:
    def __init__(self) -> None:
        self.connected: bool = False
        self.disks: list[TrueNasDiskInfo] = []
        self.disk_temps: dict[str, float | None] = {}
        self.smart_alerts: set[str] = set()
        self.pools: list[TrueNasPoolInfo] = []
        self.datasets: list[TrueNasDatasetInfo] = []
        self._ws: Any = None
        self._lock = asyncio.Lock()
        self._backoff: float = 2.0

    async def _send_rpc(self, ws: Any, method: str, params: list[Any]) -> Any:
        call_id = str(uuid.uuid4())
        msg = json.dumps({"jsonrpc": "2.0", "id": call_id, "method": method, "params": params})
        await ws.send(msg)
        while True:
            raw = await asyncio.wait_for(ws.recv(), timeout=30.0)
            data: dict[str, Any] = json.loads(raw)
            if data.get("id") == call_id:
                if "error" in data:
                    raise RuntimeError(f"RPC error: {data['error']}")
                return data.get("result")

    async def _connect_and_auth(self) -> Any:
        host = settings.truenas_host
        for scheme in ("https://", "http://", "wss://", "ws://"):
            if host.startswith(scheme):
                host = host[len(scheme):]
                break
        host = host.rstrip("/")
        url = f"wss://{host}:{settings.truenas_ws_port}/api/current"
        logger.info("Connecting to TrueNAS at %s", url)
        # TrueNAS uses a self-signed certificate by default
        ssl_ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
        ssl_ctx.check_hostname = False
        ssl_ctx.verify_mode = ssl.CERT_NONE
        ws = await websockets.connect(url, ssl=ssl_ctx)  # type: ignore[attr-defined]
        result = await self._send_rpc(ws, "auth.login_with_api_key", [settings.truenas_api_key])
        if result is not True:
            await ws.close()
            raise RuntimeError("TrueNAS auth failed")
        return ws

    async def _fetch_all(self, ws: Any) -> None:
        try:
            raw_disks: list[dict[str, Any]] = await self._send_rpc(ws, "disk.query", [[], {"extra": {}}])
            self.disks = [
                TrueNasDiskInfo(
                    name=d.get("name", ""),
                    model=d.get("model"),
                    serial=d.get("serial"),
                    type=d.get("type"),
                    pool=d.get("pool"),
                )
                for d in raw_disks
            ]
        except Exception as e:
            logger.warning("disk.query failed: %s", e)

        try:
            disk_names = [d.name for d in self.disks]
            if disk_names:
                raw_temps: dict[str, float | None] = await self._send_rpc(
                    ws, "disk.temperatures", [disk_names]
                )
                self.disk_temps = raw_temps
        except Exception as e:
            logger.warning("disk.temperatures failed: %s", e)

        try:
            raw_alerts: list[Any] = await self._send_rpc(ws, "disk.temperature_alerts", [])
            self.smart_alerts = {str(a) for a in raw_alerts} if raw_alerts else set()
        except Exception as e:
            logger.warning("disk.temperature_alerts failed: %s", e)

        try:
            raw_pools: list[dict[str, Any]] = await self._send_rpc(ws, "pool.query", [])
            self.pools = [
                TrueNasPoolInfo(
                    name=p.get("name", ""),
                    status=p.get("status", "UNKNOWN"),
                    size=p.get("size"),
                    allocated=p.get("allocated"),
                )
                for p in raw_pools
            ]
        except Exception as e:
            logger.warning("pool.query failed: %s", e)

        try:
            raw_datasets: list[dict[str, Any]] = await self._send_rpc(
                ws,
                "pool.dataset.query",
                [[["name", "in", ["media", "apps"]]]],
            )
            self.datasets = [
                TrueNasDatasetInfo(
                    name=ds.get("name", ""),
                    used=ds.get("used", {}).get("parsed") if isinstance(ds.get("used"), dict) else ds.get("used"),
                    available=ds.get("available", {}).get("parsed") if isinstance(ds.get("available"), dict) else ds.get("available"),
                )
                for ds in raw_datasets
            ]
        except Exception as e:
            logger.warning("pool.dataset.query failed: %s", e)

    async def run(self) -> None:
        while True:
            try:
                ws = await self._connect_and_auth()
                self.connected = True
                self._backoff = 2.0
                logger.info("TrueNAS WebSocket connected")
                async with self._lock:
                    self._ws = ws
                await self._fetch_all(ws)
                await ws.wait_closed()
            except Exception as e:
                logger.warning("TrueNAS connection error: %s — retrying in %.0fs", e, self._backoff)
            finally:
                self.connected = False
                async with self._lock:
                    self._ws = None

            await asyncio.sleep(self._backoff)
            self._backoff = min(self._backoff * 2, 60.0)

    async def refresh_slow(self) -> None:
        async with self._lock:
            ws = self._ws
        if ws is None:
            return
        try:
            disk_names = [d.name for d in self.disks]
            if disk_names:
                raw_temps = await self._send_rpc(ws, "disk.temperatures", [disk_names])
                self.disk_temps = raw_temps
            raw_alerts: list[Any] = await self._send_rpc(ws, "disk.temperature_alerts", [])
            self.smart_alerts = {str(a) for a in raw_alerts} if raw_alerts else set()
            raw_pools: list[dict[str, Any]] = await self._send_rpc(ws, "pool.query", [])
            self.pools = [
                TrueNasPoolInfo(
                    name=p.get("name", ""),
                    status=p.get("status", "UNKNOWN"),
                    size=p.get("size"),
                    allocated=p.get("allocated"),
                )
                for p in raw_pools
            ]
            raw_datasets: list[dict[str, Any]] = await self._send_rpc(
                ws,
                "pool.dataset.query",
                [[["name", "in", ["media", "apps"]]]],
            )
            self.datasets = [
                TrueNasDatasetInfo(
                    name=ds.get("name", ""),
                    used=ds.get("used", {}).get("parsed") if isinstance(ds.get("used"), dict) else ds.get("used"),
                    available=ds.get("available", {}).get("parsed") if isinstance(ds.get("available"), dict) else ds.get("available"),
                )
                for ds in raw_datasets
            ]
        except Exception as e:
            logger.warning("TrueNAS refresh_slow error: %s", e)

    async def refresh_disk_metadata(self) -> None:
        async with self._lock:
            ws = self._ws
        if ws is None:
            return
        try:
            raw_disks: list[dict[str, Any]] = await self._send_rpc(ws, "disk.query", [[], {"extra": {}}])
            self.disks = [
                TrueNasDiskInfo(
                    name=d.get("name", ""),
                    model=d.get("model"),
                    serial=d.get("serial"),
                    type=d.get("type"),
                    pool=d.get("pool"),
                )
                for d in raw_disks
            ]
        except Exception as e:
            logger.warning("TrueNAS disk metadata refresh error: %s", e)
