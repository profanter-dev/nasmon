import { useEffect } from "react";
import type { ServiceStatus } from "../types/dashboard";

interface Props {
  service: ServiceStatus | null;
  onClose: () => void;
}

const dotColor: Record<string, string> = {
  green: "bg-emerald-400 shadow-[0_0_10px_2px_rgba(52,211,153,0.6)]",
  yellow: "bg-amber-400 shadow-[0_0_10px_2px_rgba(251,191,36,0.6)]",
  red: "bg-red-400 shadow-[0_0_10px_2px_rgba(248,113,113,0.6)]",
  grey: "bg-slate-500",
};

export function ServiceDrawer({ service, onClose }: Props) {
  useEffect(() => {
    if (!service) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [service, onClose]);

  if (!service) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed z-50 bottom-0 left-0 right-0 lg:bottom-auto lg:top-0 lg:left-auto lg:right-0 lg:h-full lg:w-[26rem] bg-[#0a0e1a]/95 backdrop-blur-xl border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col max-h-[80vh] lg:max-h-full overflow-y-auto shadow-2xl fade-in rounded-t-2xl lg:rounded-none">
        <div className="sticky top-0 flex items-center justify-between p-5 border-b border-white/8 bg-[#0a0e1a]/90 backdrop-blur-xl">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotColor[service.status] ?? "bg-slate-500"}`} />
            <span className="font-semibold text-white truncate">{service.name}</span>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:text-white hover:bg-white/8 transition-colors"
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="p-5 flex flex-col gap-1 text-sm">
          <Row label="Stack" value={service.stack} />
          <Row label="State" value={service.container_state} />
          <Row label="Restarts" value={String(service.restart_count)} />
          {service.started_at && (
            <Row label="Since" value={new Date(service.started_at).toLocaleString()} />
          )}
          <Row label="Image" value={service.image} mono />

          <div className="mt-4 pt-4 border-t border-white/8">
            <div className="text-[0.65rem] font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Health
            </div>
            {service.alerts.length === 0 ? (
              <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs text-emerald-300">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                No issues detected
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {service.alerts.map((alert, i) => (
                  <div
                    key={i}
                    className={`rounded-lg border p-3 text-xs ${
                      alert.level === "error"
                        ? "bg-red-500/10 border-red-500/25 text-red-200"
                        : "bg-amber-500/10 border-amber-500/25 text-amber-200"
                    }`}
                  >
                    <div className="font-semibold uppercase tracking-wide mb-1 opacity-80">
                      {alert.level} · {alert.source}
                    </div>
                    <div>{alert.message}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-3 py-1.5">
      <span className="text-slate-500 shrink-0">{label}</span>
      <span
        className={`text-slate-200 text-right truncate ${mono ? "font-mono text-xs" : "font-medium"}`}
      >
        {value}
      </span>
    </div>
  );
}
