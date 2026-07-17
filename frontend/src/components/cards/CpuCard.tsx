import { useEffect, useRef } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from "recharts";
import type { CpuData } from "../../types/dashboard";
import { TempGauge } from "../TempGauge";

interface Props {
  cpu: CpuData;
}

const MAX_HISTORY = 60;
const ACCENT = "#38bdf8";

export function CpuCard({ cpu }: Props) {
  const historyRef = useRef<number[]>([]);

  useEffect(() => {
    historyRef.current = [...historyRef.current, cpu.usage_percent].slice(-MAX_HISTORY);
  }, [cpu.usage_percent]);

  const sparkData = historyRef.current.map((v, i) => ({ i, v }));
  const coreData = cpu.usage_per_core.map((v, i) => ({ core: `C${i}`, v }));
  const primaryTemp = cpu.temperatures[0] ?? null;

  return (
    <div
      className="glass glass-hover glass-accent p-5 flex flex-col gap-3"
      style={{ ["--accent" as string]: ACCENT }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          CPU
        </span>
        {primaryTemp && <TempGauge celsius={primaryTemp.current_celsius} />}
      </div>

      <div className="flex items-end justify-between">
        <div className="text-4xl font-bold tnum text-white leading-none">
          {cpu.usage_percent.toFixed(1)}
          <span className="text-xl text-slate-500 font-semibold">%</span>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold tnum text-slate-300">
            {(cpu.freq_mhz / 1000).toFixed(2)}
            <span className="text-xs text-slate-500"> GHz</span>
          </div>
          <div className="text-[0.65rem] text-slate-500">{cpu.usage_per_core.length} cores</div>
        </div>
      </div>

      <div className="h-14">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={coreData} barSize={7} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
            <YAxis domain={[0, 100]} hide />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.05)" }}
              contentStyle={{
                background: "rgba(15,20,35,0.92)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                fontSize: 11,
                boxShadow: "0 8px 24px -8px rgba(0,0,0,0.7)",
              }}
              labelStyle={{ color: "#94a3b8" }}
              formatter={(v: number) => [`${v.toFixed(1)}%`, "load"]}
            />
            <Bar dataKey="v" fill={ACCENT} radius={[3, 3, 1, 1]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="h-12 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sparkData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="cpuFill" x1="0" y1="0" x2="0" y2="1">
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
              fill="url(#cpuFill)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
