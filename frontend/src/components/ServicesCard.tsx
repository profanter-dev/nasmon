import type { ServiceStatus } from "../types/dashboard";

interface Props {
  services: ServiceStatus[];
  onSelect: (name: string) => void;
}

const dotColor: Record<string, string> = {
  green: "bg-emerald-400 shadow-[0_0_8px_1px_rgba(52,211,153,0.6)]",
  yellow: "bg-amber-400 shadow-[0_0_8px_1px_rgba(251,191,36,0.6)]",
  red: "bg-red-400 shadow-[0_0_8px_1px_rgba(248,113,113,0.6)]",
  grey: "bg-slate-500",
};

export function ServicesCard({ services, onSelect }: Props) {
  if (services.length === 0) return null;

  return (
    <div className="glass p-4 col-span-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
        {services.map((svc) => (
          <button
            key={svc.name}
            onClick={() => onSelect(svc.name)}
            className="group flex flex-col items-start gap-1 rounded-xl border border-white/6 bg-white/4 hover:bg-white/8 hover:border-white/14 px-3 py-2.5 text-left transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-2 w-full min-w-0">
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${dotColor[svc.status] ?? "bg-slate-500"}`}
              />
              <span className="text-sm font-medium text-slate-100 truncate">{svc.name}</span>
            </div>
            <span className="text-[0.65rem] text-slate-500 ml-4 truncate w-full">
              {svc.stack}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
