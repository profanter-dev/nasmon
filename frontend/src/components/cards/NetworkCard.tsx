import type { NetworkInterfaceData } from "../../types/dashboard";

interface Props {
  interfaces: NetworkInterfaceData[];
}

const ACCENT = "#34d399";

function fmtMbs(bytes: number) {
  return (bytes / 1048576).toFixed(2);
}

export function NetworkCard({ interfaces }: Props) {
  return (
    <div
      className="glass glass-hover glass-accent p-5 flex flex-col gap-3"
      style={{ ["--accent" as string]: ACCENT }}
    >
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Network
      </span>

      <div className="flex flex-col gap-2.5">
        {interfaces.map((iface) => (
          <div key={iface.name} className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-slate-300 truncate min-w-0">
              {iface.name}
            </span>
            <div className="flex items-center gap-3 shrink-0 tnum">
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19V5M6 11l6-6 6 6" />
                </svg>
                {fmtMbs(iface.bytes_sent_per_sec)}
                <span className="text-slate-500 text-[0.65rem]">MB/s</span>
              </span>
              <span className="flex items-center gap-1 text-xs text-sky-400">
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M6 13l6 6 6-6" />
                </svg>
                {fmtMbs(iface.bytes_recv_per_sec)}
                <span className="text-slate-500 text-[0.65rem]">MB/s</span>
              </span>
            </div>
          </div>
        ))}
        {interfaces.length === 0 && (
          <span className="text-sm text-slate-500">No interfaces</span>
        )}
      </div>
    </div>
  );
}
