import type { HddData, NvmeData } from "../../types/dashboard";
import { StatusBadge } from "../StatusBadge";
import { TempGauge } from "../TempGauge";

type DiskEntry = { type: "hdd"; data: HddData } | { type: "nvme"; data: NvmeData };

interface Props {
  disk: DiskEntry;
}

function fmtMbs(bytes: number) {
  return (bytes / 1048576).toFixed(1);
}

export function DiskCard({ disk }: Props) {
  const d = disk.data;
  const isHdd = disk.type === "hdd";
  const hdd = isHdd ? (d as HddData) : null;

  return (
    <div className="bg-gray-800 rounded-lg p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-300 truncate">{d.model || d.device}</span>
        <TempGauge celsius={d.temp_celsius} />
      </div>
      <div className="text-xs text-gray-500">{d.device}</div>
      <div className="flex justify-between text-xs">
        <span className="text-green-400">R {fmtMbs(d.read_bytes_per_sec)} MB/s</span>
        <span className="text-blue-400">W {fmtMbs(d.write_bytes_per_sec)} MB/s</span>
      </div>
      {hdd && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>SMART:</span>
          <StatusBadge status="" smartHealthy={hdd.smart_healthy} />
        </div>
      )}
    </div>
  );
}
