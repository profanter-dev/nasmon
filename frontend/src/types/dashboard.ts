export interface TemperatureSensor {
  label: string;
  current_celsius: number;
  high_celsius: number | null;
  critical_celsius: number | null;
}

export interface CpuData {
  usage_percent: number;
  usage_per_core: number[];
  freq_mhz: number;
  temperatures: TemperatureSensor[];
}

export interface RamData {
  total_bytes: number;
  used_bytes: number;
  available_bytes: number;
  usage_percent: number;
}

export interface ProcessData {
  pid: number;
  name: string;
  cpu_percent: number;
  ram_mb: number;
}

export interface NetworkInterfaceData {
  name: string;
  bytes_sent_per_sec: number;
  bytes_recv_per_sec: number;
}

export interface HddData {
  device: string;
  model: string;
  serial: string;
  temp_celsius: number | null;
  smart_healthy: boolean | null;
  read_bytes_per_sec: number;
  write_bytes_per_sec: number;
  pool: string | null;
}

export interface NvmeData {
  device: string;
  model: string;
  temp_celsius: number | null;
  read_bytes_per_sec: number;
  write_bytes_per_sec: number;
  pool: string | null;
}

export interface PoolData {
  name: string;
  status: string;
  used_bytes: number;
  total_bytes: number;
  usage_percent: number;
}

export interface ServiceAlert {
  level: "error" | "warning";
  source: string;
  message: string;
}

export interface ServiceStatus {
  name: string;
  stack: string;
  status: "green" | "yellow" | "red" | "grey";
  container_state: string;
  restart_count: number;
  started_at: string | null;
  image: string;
  alerts: ServiceAlert[];
}

export interface DashboardSnapshot {
  timestamp: number;
  cpu: CpuData;
  ram: RamData;
  top_cpu_processes: ProcessData[];
  top_ram_processes: ProcessData[];
  network: NetworkInterfaceData[];
  hdds: HddData[];
  nvmes: NvmeData[];
  pools: PoolData[];
  truenas_connected: boolean;
  services: ServiceStatus[];
}
