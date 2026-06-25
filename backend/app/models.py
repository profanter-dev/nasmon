from pydantic import BaseModel


class TemperatureSensor(BaseModel):
    label: str
    current_celsius: float
    high_celsius: float | None = None
    critical_celsius: float | None = None


class CpuData(BaseModel):
    usage_percent: float
    usage_per_core: list[float]
    freq_mhz: float
    temperatures: list[TemperatureSensor]


class RamData(BaseModel):
    total_bytes: int
    used_bytes: int
    available_bytes: int
    usage_percent: float


class ProcessData(BaseModel):
    pid: int
    name: str
    cpu_percent: float
    ram_mb: float


class NetworkInterfaceData(BaseModel):
    name: str
    bytes_sent_per_sec: float
    bytes_recv_per_sec: float


class HddData(BaseModel):
    device: str
    model: str
    serial: str
    temp_celsius: float | None
    smart_healthy: bool | None
    read_bytes_per_sec: float
    write_bytes_per_sec: float
    pool: str | None = None


class NvmeData(BaseModel):
    device: str
    model: str
    temp_celsius: float | None
    read_bytes_per_sec: float
    write_bytes_per_sec: float
    pool: str | None = None


class PoolData(BaseModel):
    name: str
    status: str
    used_bytes: int
    total_bytes: int
    usage_percent: float


class FanData(BaseModel):
    label: str
    rpm: int | None


class ServiceAlert(BaseModel):
    level: str
    source: str
    message: str


class ServiceStatus(BaseModel):
    name: str
    stack: str
    status: str
    container_state: str
    restart_count: int
    started_at: str | None
    image: str
    alerts: list[ServiceAlert]


class DashboardSnapshot(BaseModel):
    timestamp: float
    cpu: CpuData
    ram: RamData
    top_cpu_processes: list[ProcessData]
    top_ram_processes: list[ProcessData]
    network: list[NetworkInterfaceData]
    hdds: list[HddData]
    nvmes: list[NvmeData]
    pools: list[PoolData]
    fans: list[FanData]
    truenas_connected: bool
    services: list[ServiceStatus]
