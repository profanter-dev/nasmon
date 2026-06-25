import asyncio
import logging
import os
import time
from typing import Any

from fastapi import WebSocket

from app.collectors.disks import get_disk_io, get_nvme_temperatures
from app.collectors.fans import get_fan_data
from app.collectors.network import get_network_data
from app.collectors.services import get_services_data, refresh_arr_health
from app.collectors.system import get_cpu_data, get_ram_data, get_top_processes
from app.config import settings
from app.models import (
    DashboardSnapshot,
    FanData,
    HddData,
    NvmeData,
    PoolData,
    ProcessData,
    ServiceAlert,
    ServiceStatus,
)
from app.truenas.client import TrueNasClient

logger = logging.getLogger(__name__)

def _real_disk_names(truenas_names: set[str]) -> set[str]:
    if truenas_names:
        return truenas_names
    # Fallback when TrueNAS is offline: /sys/block lists only whole disks,
    # not partitions. Filter out loop devices.
    try:
        return {
            d for d in os.listdir("/sys/block")
            if not d.startswith("loop")
        }
    except OSError:
        return set()


connected_clients: set[WebSocket] = set()

_truenas = TrueNasClient()
_prev_net: dict[str, tuple[int, int]] = {}
_prev_disk: dict[str, tuple[int, int]] = {}
_last_fast = 0.0
_last_process = 0.0
_cached_top_cpu: list[ProcessData] = []
_cached_top_ram: list[ProcessData] = []
_arr_health_cache: dict[str, list[ServiceAlert]] = {}
_last_snapshot: DashboardSnapshot | None = None


async def broadcast(snapshot: DashboardSnapshot) -> None:
    global _last_snapshot
    _last_snapshot = snapshot
    payload = snapshot.model_dump_json()
    dead: set[WebSocket] = set()
    for client in connected_clients:
        try:
            await client.send_text(payload)
        except Exception:
            dead.add(client)
    connected_clients.difference_update(dead)


async def _fast_loop() -> None:
    global _prev_net, _prev_disk, _last_fast, _last_process
    global _cached_top_cpu, _cached_top_ram

    while True:
        now = time.monotonic()
        elapsed = now - _last_fast if _last_fast else 1.0
        _last_fast = now

        cpu = get_cpu_data()
        ram = get_ram_data()

        if now - _last_process >= settings.process_interval_seconds:
            _cached_top_cpu, _cached_top_ram = get_top_processes(5)
            _last_process = now

        net_list, _prev_net = get_network_data(_prev_net, elapsed)
        disk_io, _prev_disk = get_disk_io(_prev_disk, elapsed)
        nvme_temps = get_nvme_temperatures()
        fans = get_fan_data()
        services = await get_services_data(_arr_health_cache)

        disk_meta = {d.name: d for d in _truenas.disks}
        allowed_disks = _real_disk_names(set(disk_meta.keys()))

        hdds: list[HddData] = []
        nvmes: list[NvmeData] = []

        for device, (read_bps, write_bps) in disk_io.items():
            if device not in allowed_disks:
                continue
            meta = disk_meta.get(device)
            pool = _truenas.disk_pool_map.get(device)
            if device.startswith("nvme") or (meta and meta.type == "SSD"):
                nvmes.append(
                    NvmeData(
                        device=device,
                        model=meta.model or "" if meta else "",
                        temp_celsius=nvme_temps.get(device),
                        read_bytes_per_sec=read_bps,
                        write_bytes_per_sec=write_bps,
                        pool=pool,
                    )
                )
            else:
                temp = _truenas.disk_temps.get(device)
                smart_ok: bool | None = None
                if _truenas.connected:
                    smart_ok = device not in _truenas.smart_alerts
                hdds.append(
                    HddData(
                        device=device,
                        model=meta.model or "" if meta else "",
                        serial=meta.serial or "" if meta else "",
                        temp_celsius=float(temp) if temp is not None else None,
                        smart_healthy=smart_ok,
                        read_bytes_per_sec=read_bps,
                        write_bytes_per_sec=write_bps,
                        pool=pool,
                    )
                )

        pools: list[PoolData] = []
        for pool in _truenas.pools:
            size = pool.size or 0
            allocated = pool.allocated or 0
            usage = (allocated / size * 100.0) if size > 0 else 0.0
            pools.append(
                PoolData(
                    name=pool.name,
                    status=pool.status,
                    used_bytes=allocated,
                    total_bytes=size,
                    usage_percent=usage,
                )
            )

        snapshot = DashboardSnapshot(
            timestamp=time.time(),
            cpu=cpu,
            ram=ram,
            top_cpu_processes=_cached_top_cpu,
            top_ram_processes=_cached_top_ram,
            network=net_list,
            hdds=hdds,
            nvmes=nvmes,
            pools=pools,
            fans=fans,
            truenas_connected=_truenas.connected,
            services=services,
        )

        await broadcast(snapshot)
        await asyncio.sleep(settings.fast_interval_seconds)


async def _slow_truenas_loop() -> None:
    while True:
        await asyncio.sleep(settings.pool_interval_seconds)
        await _truenas.refresh_slow()


async def _disk_metadata_loop() -> None:
    while True:
        await asyncio.sleep(300.0)
        await _truenas.refresh_disk_metadata()


async def _arr_health_loop() -> None:
    while True:
        await refresh_arr_health(_arr_health_cache)
        await asyncio.sleep(120.0)


async def start() -> None:
    asyncio.create_task(_truenas.run())
    asyncio.create_task(_fast_loop())
    asyncio.create_task(_slow_truenas_loop())
    asyncio.create_task(_disk_metadata_loop())
    asyncio.create_task(_arr_health_loop())


async def on_connect(websocket: WebSocket) -> None:
    await websocket.accept()
    connected_clients.add(websocket)
    if _last_snapshot is not None:
        try:
            await websocket.send_text(_last_snapshot.model_dump_json())
        except Exception:
            connected_clients.discard(websocket)


async def on_disconnect(websocket: WebSocket) -> None:
    connected_clients.discard(websocket)
