import type { FanData } from "../../types/dashboard";

interface Props {
  fans: FanData[];
}

export function FanCard({ fans }: Props) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 flex flex-col gap-2">
      <span className="text-sm font-semibold text-gray-300">Fans</span>
      {fans.map((fan, i) => (
        <div key={i} className="flex items-center justify-between text-xs">
          <span className="text-gray-400">{fan.label}</span>
          {fan.rpm !== null ? (
            <span className="text-white">{fan.rpm} RPM</span>
          ) : (
            <span className="px-2 py-0.5 rounded bg-gray-600 text-gray-400">Driver not loaded</span>
          )}
        </div>
      ))}
    </div>
  );
}
