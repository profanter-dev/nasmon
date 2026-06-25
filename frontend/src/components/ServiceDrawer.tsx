import type { ServiceStatus } from "../types/dashboard";

interface Props {
  service: ServiceStatus | null;
  onClose: () => void;
}

const dotColor: Record<string, string> = {
  green: "text-green-400",
  yellow: "text-yellow-400",
  red: "text-red-400",
  grey: "text-gray-500",
};

export function ServiceDrawer({ service, onClose }: Props) {
  if (!service) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40 lg:bg-transparent"
        onClick={onClose}
      />
      <div className="fixed z-50 bottom-0 left-0 right-0 lg:bottom-auto lg:top-0 lg:left-auto lg:right-0 lg:h-full lg:w-96 bg-gray-900 border-t lg:border-t-0 lg:border-l border-gray-700 flex flex-col max-h-[70vh] lg:max-h-full overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <span className={`text-lg ${dotColor[service.status] ?? "text-gray-500"}`}>●</span>
            <span className="font-semibold text-white">{service.name}</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl leading-none">×</button>
        </div>
        <div className="p-4 flex flex-col gap-3 text-sm">
          <Row label="Stack" value={service.stack} />
          <Row label="State" value={service.container_state} />
          <Row label="Restarts" value={String(service.restart_count)} />
          {service.started_at && <Row label="Since" value={new Date(service.started_at).toLocaleString()} />}
          <Row label="Image" value={service.image} mono />

          <div className="border-t border-gray-700 pt-3">
            {service.alerts.length === 0 ? (
              <p className="text-green-400 text-xs">No issues detected</p>
            ) : (
              <div className="flex flex-col gap-2">
                {service.alerts.map((alert, i) => (
                  <div
                    key={i}
                    className={`rounded p-2 text-xs ${alert.level === "error" ? "bg-red-900/40 text-red-300" : "bg-yellow-900/40 text-yellow-300"}`}
                  >
                    <div className="font-semibold uppercase mb-0.5">[{alert.level}] {alert.source}</div>
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
    <div className="flex justify-between gap-2">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className={`text-gray-200 text-right truncate ${mono ? "font-mono text-xs" : ""}`}>{value}</span>
    </div>
  );
}
