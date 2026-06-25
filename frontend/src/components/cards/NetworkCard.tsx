import type { NetworkInterfaceData } from "../../types/dashboard";

interface Props {
  interfaces: NetworkInterfaceData[];
}

function fmtMbs(bytes: number) {
  return (bytes / 1048576).toFixed(2);
}

export function NetworkCard({ interfaces }: Props) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 flex flex-col gap-2">
      <span className="text-sm font-semibold text-gray-300">Network</span>
      {interfaces.map((iface) => (
        <div key={iface.name} className="flex items-center justify-between text-xs">
          <span className="text-gray-400 w-20 truncate">{iface.name}</span>
          <span className="text-green-400">↑ {fmtMbs(iface.bytes_sent_per_sec)} MB/s</span>
          <span className="text-blue-400">↓ {fmtMbs(iface.bytes_recv_per_sec)} MB/s</span>
        </div>
      ))}
      {interfaces.length === 0 && <span className="text-xs text-gray-500">No interfaces</span>}
    </div>
  );
}
