import psutil


def get_disk_io(
    prev: dict[str, tuple[int, int]], elapsed: float
) -> tuple[dict[str, tuple[float, float]], dict[str, tuple[int, int]]]:
    counters = psutil.disk_io_counters(perdisk=True)
    result: dict[str, tuple[float, float]] = {}
    new_prev: dict[str, tuple[int, int]] = {}

    if counters is None:
        return result, new_prev

    for device, stats in counters.items():
        read_bytes = stats.read_bytes
        write_bytes = stats.write_bytes
        new_prev[device] = (read_bytes, write_bytes)

        if device in prev and elapsed > 0:
            read_per_sec = (read_bytes - prev[device][0]) / elapsed
            write_per_sec = (write_bytes - prev[device][1]) / elapsed
        else:
            read_per_sec = 0.0
            write_per_sec = 0.0

        result[device] = (max(0.0, read_per_sec), max(0.0, write_per_sec))

    return result, new_prev


def get_nvme_temperatures() -> dict[str, float | None]:
    """Read NVMe temps from sysfs as a fallback when TrueNAS is offline.
    psutil keys NVMe controllers as 'nvme0', 'nvme1', etc.; map to the
    standard block device name 'nvme0n1' used everywhere else."""
    result: dict[str, float | None] = {}
    try:
        all_temps = psutil.sensors_temperatures()  # type: ignore[attr-defined]
        for key, sensors in all_temps.items():
            if key.startswith("nvme") and sensors:
                device = key + "n1"
                result[device] = float(sensors[0].current)
    except AttributeError:
        pass
    return result
