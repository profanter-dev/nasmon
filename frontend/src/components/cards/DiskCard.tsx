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
  const accent = isHdd ? "#fbbf24" : "#f472b6";

  return (
    <div
      className="glass glass-hover glass-accent p-5 flex flex-col gap-3"
      style={{ ["--accent" as string]: accent }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className="text-[0.6rem] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{ background: `${accent}22`, color: accent }}
            >
              {isHdd ? "HDD" : "NVMe"}
            </span>
            <span className="text-sm font-semibold text-white truncate">
              {d.model || d.device}
            </span>
          </div>
          <div className="text-[0.65rem] text-slate-500 mt-0.5 font-mono">{d.device}</div>
        </div>
        <TempGauge celsius={d.temp_celsius} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-white/5 px-3 py-2">
          <div className="text-[0.6rem] uppercase tracking-wide text-slate-500">Read</div>
          <div className="text-sm font-semibold tnum text-emerald-400">
            {fmtMbs(d.read_bytes_per_sec)}
            <span className="text-[0.65rem] text-slate-500 font-normal"> MB/s</span>
          </div>
        </div>
        <div className="rounded-lg bg-white/5 px-3 py-2">
          <div className="text-[0.6rem] uppercase tracking-wide text-slate-500">Write</div>
          <div className="text-sm font-semibold tnum text-sky-400">
            {fmtMbs(d.write_bytes_per_sec)}
            <span className="text-[0.65rem] text-slate-500 font-normal"> MB/s</span>
          </div>
        </div>
      </div>

      {hdd && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 uppercase tracking-wide text-[0.65rem]">SMART</span>
          <StatusBadge status="" smartHealthy={hdd.smart_healthy} />
        </div>
      )}
    </div>
  );
}
