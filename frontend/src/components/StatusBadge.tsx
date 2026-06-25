interface Props {
  status: string;
  smartHealthy?: boolean | null;
}

const poolColors: Record<string, string> = {
  ONLINE: "bg-green-500/20 text-green-400",
  SCRUB: "bg-blue-500/20 text-blue-400",
  RESILVER: "bg-blue-500/20 text-blue-400",
  DEGRADED: "bg-yellow-500/20 text-yellow-400",
  FAULTED: "bg-red-500/20 text-red-400",
};

export function StatusBadge({ status, smartHealthy }: Props) {
  if (smartHealthy !== undefined) {
    if (smartHealthy === true)
      return <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">OK</span>;
    if (smartHealthy === false)
      return <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400">Alert</span>;
    return <span className="px-2 py-0.5 rounded text-xs bg-gray-500/20 text-gray-400">Unknown</span>;
  }

  const cls = poolColors[status] ?? "bg-gray-500/20 text-gray-400";
  return <span className={`px-2 py-0.5 rounded text-xs ${cls}`}>{status}</span>;
}
