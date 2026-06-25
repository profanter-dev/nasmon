import psutil

from app.models import FanData


def get_fan_data() -> list[FanData]:
    try:
        fans = psutil.sensors_fans()  # type: ignore[attr-defined]
        if not fans:
            return [FanData(label="System Fans", rpm=None)]

        result: list[FanData] = []
        for key, entries in fans.items():
            for entry in entries:
                result.append(FanData(label=entry.label or key, rpm=int(entry.current)))
        return result if result else [FanData(label="System Fans", rpm=None)]
    except Exception:
        return [FanData(label="System Fans", rpm=None)]
