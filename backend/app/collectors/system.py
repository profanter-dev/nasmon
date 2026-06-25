import psutil

from app.models import CpuData, ProcessData, RamData, TemperatureSensor


def get_cpu_data() -> CpuData:
    per_core: list[float] = list(psutil.cpu_percent(percpu=True))  # type: ignore[arg-type]
    usage_percent = sum(per_core) / len(per_core) if per_core else 0.0

    freq = psutil.cpu_freq()
    freq_mhz = float(freq.current) if freq else 0.0

    temps: list[TemperatureSensor] = []
    try:
        all_temps = psutil.sensors_temperatures()  # type: ignore[attr-defined]
        for sensor in all_temps.get("coretemp", []):
            temps.append(
                TemperatureSensor(
                    label=sensor.label or "Core",
                    current_celsius=float(sensor.current),
                    high_celsius=float(sensor.high) if sensor.high is not None else None,
                    critical_celsius=float(sensor.critical) if sensor.critical is not None else None,
                )
            )
    except AttributeError:
        pass

    return CpuData(
        usage_percent=usage_percent,
        usage_per_core=per_core,
        freq_mhz=freq_mhz,
        temperatures=temps,
    )


def get_ram_data() -> RamData:
    vm = psutil.virtual_memory()
    return RamData(
        total_bytes=vm.total,
        used_bytes=vm.used,
        available_bytes=vm.available,
        usage_percent=vm.percent,
    )


def get_top_processes(n: int = 5) -> tuple[list[ProcessData], list[ProcessData]]:
    processes: list[ProcessData] = []
    for proc in psutil.process_iter(["pid", "name", "cpu_percent", "memory_info"]):
        try:
            info = proc.info  # type: ignore[attr-defined]
            cpu = info.get("cpu_percent") or 0.0
            mem_info = info.get("memory_info")
            ram_mb = float(mem_info.rss) / (1024 * 1024) if mem_info else 0.0
            processes.append(
                ProcessData(
                    pid=info["pid"],
                    name=info["name"] or "",
                    cpu_percent=float(cpu),
                    ram_mb=ram_mb,
                )
            )
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            continue

    top_cpu = sorted(processes, key=lambda p: p.cpu_percent, reverse=True)[:n]
    top_ram = sorted(processes, key=lambda p: p.ram_mb, reverse=True)[:n]
    return top_cpu, top_ram
