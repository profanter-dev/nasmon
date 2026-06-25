import { useEffect, useRef } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import { LineChart, Line } from "recharts";
import type { CpuData } from "../../types/dashboard";
import { TempGauge } from "../TempGauge";

interface Props {
  cpu: CpuData;
}

const MAX_HISTORY = 60;

export function CpuCard({ cpu }: Props) {
  const historyRef = useRef<number[]>([]);

  useEffect(() => {
    historyRef.current = [...historyRef.current, cpu.usage_percent].slice(-MAX_HISTORY);
  }, [cpu.usage_percent]);

  const sparkData = historyRef.current.map((v, i) => ({ i, v }));
  const coreData = cpu.usage_per_core.map((v, i) => ({ core: `C${i}`, v }));
  const primaryTemp = cpu.temperatures[0] ?? null;

  return (
    <div className="bg-gray-800 rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-300">CPU</span>
        {primaryTemp && <TempGauge celsius={primaryTemp.current_celsius} />}
      </div>
      <div className="text-4xl font-bold text-white">
        {cpu.usage_percent.toFixed(1)}<span className="text-xl text-gray-400">%</span>
      </div>
      <div className="text-xs text-gray-500">{(cpu.freq_mhz / 1000).toFixed(2)} GHz</div>
      <div className="h-16">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={coreData} barSize={6} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <YAxis domain={[0, 100]} hide />
            <Tooltip
              contentStyle={{ background: "#1f2937", border: "none", fontSize: 11 }}
              formatter={(v: number) => [`${v.toFixed(1)}%`, ""]}
            />
            <Bar dataKey="v" fill="#3b82f6" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="h-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sparkData}>
            <Line
              type="monotone"
              dataKey="v"
              stroke="#3b82f6"
              dot={false}
              strokeWidth={1.5}
              isAnimationActive={false}
            />
            <YAxis domain={[0, 100]} hide />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
