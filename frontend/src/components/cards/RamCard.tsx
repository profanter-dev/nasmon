import { useEffect, useRef } from "react";
import { Area, AreaChart, YAxis, ResponsiveContainer } from "recharts";
import type { RamData } from "../../types/dashboard";

interface Props {
  ram: RamData;
}

const MAX_HISTORY = 60;
const ACCENT = "#a78bfa";

function fmtGb(bytes: number) {
  return (bytes / 1073741824).toFixed(1);
}

export function RamCard({ ram }: Props) {
  const historyRef = useRef<number[]>([]);

  useEffect(() => {
    historyRef.current = [...historyRef.current, ram.usage_percent].slice(-MAX_HISTORY);
  }, [ram.usage_percent]);

  const sparkData = historyRef.current.map((v, i) => ({ i, v }));

  return (
    <div
      className="glass glass-hover glass-accent p-5 flex flex-col gap-3"
      style={{ ["--accent" as string]: ACCENT }}
    >
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Memory
      </span>

      <div className="flex items-end justify-between">
        <div className="text-4xl font-bold tnum text-white leading-none">
          {ram.usage_percent.toFixed(1)}
          <span className="text-xl text-slate-500 font-semibold">%</span>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold tnum text-slate-300">
            {fmtGb(ram.used_bytes)}
            <span className="text-xs text-slate-500"> / {fmtGb(ram.total_bytes)} GB</span>
          </div>
          <div className="text-[0.65rem] text-slate-500">
            {fmtGb(ram.available_bytes)} GB free
          </div>
        </div>
      </div>

      <div className="w-full h-1.5 rounded-full bg-white/8 overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{
            width: `${Math.min(ram.usage_percent, 100)}%`,
            background: `linear-gradient(90deg, ${ACCENT}, #c4b5fd)`,
          }}
        />
      </div>

      <div className="h-12 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparkData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="ramFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={ACCENT} stopOpacity={0.4} />
                <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis domain={[0, 100]} hide />
            <Area
              type="monotone"
              dataKey="v"
              stroke={ACCENT}
              strokeWidth={2}
              fill="url(#ramFill)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
