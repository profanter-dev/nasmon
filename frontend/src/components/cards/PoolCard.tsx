import type { PoolData } from "../../types/dashboard";
import { StatusBadge } from "../StatusBadge";

interface Props {
  pool: PoolData;
}

function fmtTib(bytes: number) {
  return (bytes / 1099511627776).toFixed(2);
}

export function PoolCard({ pool }: Props) {
  const pct = pool.usage_percent;
  const barColor = pct > 90 ? "bg-red-500" : pct > 75 ? "bg-yellow-500" : "bg-green-500";

  return (
    <div className="bg-gray-800 rounded-lg p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-300">{pool.name}</span>
        <StatusBadge status={pool.status} />
      </div>
      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full ${barColor} rounded-full`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <div className="flex justify-between text-xs text-gray-400">
        <span>{fmtTib(pool.used_bytes)} TiB used</span>
        <span>{fmtTib(pool.total_bytes - pool.used_bytes)} TiB free</span>
      </div>
    </div>
  );
}
