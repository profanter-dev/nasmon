import asyncio
import logging
from typing import Any

import aiohttp

from app.config import settings
from app.models import ServiceAlert, ServiceStatus

logger = logging.getLogger(__name__)

ARR_SERVICES: list[dict[str, Any]] = [
    {"name": "sonarr", "url_attr": "sonarr_url", "key_attr": "sonarr_api_key"},
    {"name": "radarr", "url_attr": "radarr_url", "key_attr": "radarr_api_key"},
    {"name": "prowlarr", "url_attr": "prowlarr_url", "key_attr": "prowlarr_api_key"},
]


def _docker_available() -> bool:
    import os
    return os.path.exists(settings.docker_socket)


def _get_docker_containers() -> list[dict[str, Any]]:
    import docker  # type: ignore[import-untyped]
    try:
        client = docker.DockerClient(base_url=f"unix://{settings.docker_socket}")
        result: list[dict[str, Any]] = []
        for container in client.containers.list(all=True):
            tags: list[str] = container.image.tags  # type: ignore[union-attr]
            image = tags[0] if tags else "unknown"
            result.append({
                "name": container.name,
                "status": container.status,
                "restart_count": container.attrs.get("RestartCount", 0),
                "started_at": container.attrs.get("State", {}).get("StartedAt"),
                "image": image,
                "stack": container.labels.get("com.docker.compose.project", "standalone"),
            })
        return result
    except Exception as e:
        logger.warning("Docker socket error: %s", e)
        return []


async def _fetch_arr_health(name: str, url: str, api_key: str) -> list[ServiceAlert]:
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{url}/api/v3/health",
                headers={"X-Api-Key": api_key},
                timeout=aiohttp.ClientTimeout(total=10),
            ) as resp:
                data: list[dict[str, Any]] = await resp.json()
                alerts: list[ServiceAlert] = []
                for item in data:
                    alerts.append(
                        ServiceAlert(
                            level=item.get("type", "error").lower(),
                            source=item.get("source", ""),
                            message=item.get("message", ""),
                        )
                    )
                return alerts
    except Exception as e:
        logger.warning("Could not reach %s: %s", name, e)
        return [ServiceAlert(level="error", source="Connection", message="Could not reach service")]


def _derive_status(
    container_state: str, restart_count: int, alerts: list[ServiceAlert]
) -> str:
    if container_state not in ("running",):
        return "red"
    has_errors = any(a.level == "error" for a in alerts)
    has_warnings = any(a.level == "warning" for a in alerts)
    if has_errors:
        return "red"
    if has_warnings or restart_count >= 3:
        return "yellow"
    return "green"


async def get_services_data(
    arr_health_cache: dict[str, list[ServiceAlert]]
) -> list[ServiceStatus]:
    if not _docker_available():
        return []

    containers = await asyncio.get_event_loop().run_in_executor(None, _get_docker_containers)
    container_map = {c["name"]: c for c in containers}

    result: list[ServiceStatus] = []

    for container in containers:
        name: str = container["name"]
        alerts: list[ServiceAlert] = arr_health_cache.get(name, [])
        state: str = container["status"]
        restart_count: int = container["restart_count"]
        status = _derive_status(state, restart_count, alerts)

        result.append(
            ServiceStatus(
                name=name,
                stack=container["stack"],
                status=status,
                container_state=state,
                restart_count=restart_count,
                started_at=container["started_at"],
                image=container["image"],
                alerts=alerts,
            )
        )

    return result


async def refresh_arr_health(cache: dict[str, list[ServiceAlert]]) -> None:
    for svc in ARR_SERVICES:
        url: str | None = getattr(settings, svc["url_attr"])
        key: str | None = getattr(settings, svc["key_attr"])
        if not url or not key:
            continue
        alerts = await _fetch_arr_health(svc["name"], url, key)
        cache[svc["name"]] = alerts
