import os

from app.models import NetworkInterfaceData

# Interfaces to always exclude from display
_SKIP_EXACT = {"lo"}
_SKIP_PREFIX = ("veth", "br-", "docker")


def _read_host_net_dev() -> dict[str, tuple[int, int]]:
    """Read /proc/1/net/dev from the host procfs.

    /proc/net/dev is network-namespace-aware: reading it from inside a
    container returns the container's namespace data, not the host's.
    /proc/1/net/dev bypasses this — PID 1 always lives in the host root
    namespace, so its per-PID net/dev file shows the real host interfaces.
    """
    proc_path = os.environ.get("HOST_PROC", "/proc")
    path = os.path.join(proc_path, "1", "net", "dev")
    result: dict[str, tuple[int, int]] = {}
    try:
        with open(path) as f:
            for line in f:
                if ":" not in line:
                    continue
                iface, data = line.split(":", 1)
                iface = iface.strip()
                fields = data.split()
                if len(fields) < 9:
                    continue
                # /proc/net/dev columns after the colon:
                # recv: bytes packets errs drop fifo frame compressed multicast
                # sent: bytes packets errs drop fifo colls carrier compressed
                result[iface] = (int(fields[0]), int(fields[8]))
    except OSError:
        pass
    return result


def get_network_data(
    prev: dict[str, tuple[int, int]], elapsed: float
) -> tuple[list[NetworkInterfaceData], dict[str, tuple[int, int]]]:
    counters = _read_host_net_dev()
    result: list[NetworkInterfaceData] = []
    new_prev: dict[str, tuple[int, int]] = {}

    for name, (recv, sent) in counters.items():
        if name in _SKIP_EXACT or any(name.startswith(p) for p in _SKIP_PREFIX):
            continue

        new_prev[name] = (recv, sent)

        if name in prev and elapsed > 0:
            recv_per_sec = (recv - prev[name][0]) / elapsed
            sent_per_sec = (sent - prev[name][1]) / elapsed
        else:
            recv_per_sec = 0.0
            sent_per_sec = 0.0

        result.append(
            NetworkInterfaceData(
                name=name,
                bytes_sent_per_sec=max(0.0, sent_per_sec),
                bytes_recv_per_sec=max(0.0, recv_per_sec),
            )
        )

    return result, new_prev
