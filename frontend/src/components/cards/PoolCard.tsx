import type { PoolData } from "../../types/dashboard";
import { StatusBadge } from "../StatusBadge";

interface Props {
  pool: PoolData;
}

const ACCENT = "#2dd4bf";

function fmtTib(bytes: number) {
  return (bytes / 1099511627776).toFixed(2);
}

export function PoolCard({ pool }: Props) {
  const pct = pool.usage_percent;
  const barGradient =
    pct > 90
      ? "linear-gradient(90deg, #f87171, #ef4444)"
      : pct > 75
        ? "linear-gradient(90deg, #fbbf24, #f59e0b)"
        : "linear-gradient(90deg, #2dd4bf, #22d3ee)";

  return (
    <div
      className="glass glass-hover glass-accent p-5 flex flex-col gap-4"
      style={{ ["--accent" as string]: ACCENT }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-teal-300 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="6" rx="8" ry="3" />
            <path d="M4 6v12c0 1.66 3.58 3 8 3s8-1.34 8-3V6" />
            <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" />
          </svg>
          <span className="text-sm font-semibold text-white truncate">{pool.name}</span>
        </div>
        <StatusBadge status={pool.status} />
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-bold tnum text-white leading-none">
          {pct.toFixed(0)}
        </span>
        <span className="text-lg text-slate-500 font-semibold">%</span>
        <span className="text-xs text-slate-500 ml-1">used</span>
      </div>

      <div className="w-full h-2 rounded-full bg-white/8 overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${Math.min(pct, 100)}%`, background: barGradient }}
        />
      </div>

      <div className="flex justify-between text-xs tnum">
        <div>
          <div className="text-slate-500 text-[0.65rem] uppercase tracking-wide">Used</div>
          <div className="text-slate-300 font-medium">{fmtTib(pool.used_bytes)} TiB</div>
        </div>
        <div className="text-right">
          <div className="text-slate-500 text-[0.65rem] uppercase tracking-wide">Free</div>
          <div className="text-slate-300 font-medium">
            {fmtTib(pool.total_bytes - pool.used_bytes)} TiB
          </div>
        </div>
      </div>
    </div>
  );
}
