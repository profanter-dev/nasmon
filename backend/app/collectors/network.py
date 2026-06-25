import psutil

from app.models import NetworkInterfaceData


def get_network_data(
    prev: dict[str, tuple[int, int]], elapsed: float
) -> tuple[list[NetworkInterfaceData], dict[str, tuple[int, int]]]:
    counters = psutil.net_io_counters(pernic=True)
    result: list[NetworkInterfaceData] = []
    new_prev: dict[str, tuple[int, int]] = {}

    for name, stats in counters.items():
        if name == "lo":
            continue
        sent = stats.bytes_sent
        recv = stats.bytes_recv
        new_prev[name] = (sent, recv)

        if name in prev and elapsed > 0:
            sent_per_sec = (sent - prev[name][0]) / elapsed
            recv_per_sec = (recv - prev[name][1]) / elapsed
        else:
            sent_per_sec = 0.0
            recv_per_sec = 0.0

        result.append(
            NetworkInterfaceData(
                name=name,
                bytes_sent_per_sec=max(0.0, sent_per_sec),
                bytes_recv_per_sec=max(0.0, recv_per_sec),
            )
        )

    return result, new_prev
