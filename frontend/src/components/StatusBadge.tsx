interface Props {
  status: string;
  smartHealthy?: boolean | null;
}

const base =
  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.65rem] font-semibold uppercase tracking-wide border";

const poolColors: Record<string, string> = {
  ONLINE: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  SCRUB: "bg-sky-500/15 text-sky-300 border-sky-500/25",
  RESILVER: "bg-sky-500/15 text-sky-300 border-sky-500/25",
  DEGRADED: "bg-amber-500/15 text-amber-300 border-amber-500/25",
  FAULTED: "bg-red-500/15 text-red-300 border-red-500/25",
};

function Dot({ className }: { className: string }) {
  return <span className={`h-1.5 w-1.5 rounded-full ${className}`} />;
}

export function StatusBadge({ status, smartHealthy }: Props) {
  if (smartHealthy !== undefined) {
    if (smartHealthy === true)
      return (
        <span className={`${base} bg-emerald-500/15 text-emerald-300 border-emerald-500/25`}>
          <Dot className="bg-emerald-400" /> OK
        </span>
      );
    if (smartHealthy === false)
      return (
        <span className={`${base} bg-red-500/15 text-red-300 border-red-500/25`}>
          <Dot className="bg-red-400" /> Alert
        </span>
      );
    return (
      <span className={`${base} bg-slate-500/15 text-slate-400 border-slate-500/25`}>
        <Dot className="bg-slate-400" /> Unknown
      </span>
    );
  }

  const cls = poolColors[status] ?? "bg-slate-500/15 text-slate-400 border-slate-500/25";
  return <span className={`${base} ${cls}`}>{status}</span>;
}
