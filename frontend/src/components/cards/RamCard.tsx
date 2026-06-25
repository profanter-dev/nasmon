import { useEffect, useRef } from "react";
import { LineChart, Line, YAxis, ResponsiveContainer } from "recharts";
import type { RamData } from "../../types/dashboard";

interface Props {
  ram: RamData;
}

const MAX_HISTORY = 60;

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
    <div className="bg-gray-800 rounded-lg p-4 flex flex-col gap-3">
      <span className="text-sm font-semibold text-gray-300">RAM</span>
      <div className="text-4xl font-bold text-white">
        {ram.usage_percent.toFixed(1)}<span className="text-xl text-gray-400">%</span>
      </div>
      <div className="text-xs text-gray-500">
        {fmtGb(ram.used_bytes)} / {fmtGb(ram.total_bytes)} GB
      </div>
      <div className="h-10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sparkData}>
            <Line
              type="monotone"
              dataKey="v"
              stroke="#8b5cf6"
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
