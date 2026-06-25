import type { ServiceStatus } from "../types/dashboard";

interface Props {
  services: ServiceStatus[];
  onSelect: (name: string) => void;
}

const dotColor: Record<string, string> = {
  green: "text-green-400",
  yellow: "text-yellow-400",
  red: "text-red-400",
  grey: "text-gray-500",
};

export function ServicesCard({ services, onSelect }: Props) {
  if (services.length === 0) return null;

  return (
    <div className="bg-gray-800 rounded-lg p-4 col-span-full">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {services.map((svc) => (
          <button
            key={svc.name}
            onClick={() => onSelect(svc.name)}
            className="flex flex-col items-start gap-0.5 rounded-lg bg-gray-700 hover:bg-gray-600 px-3 py-2 text-left transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <span className={`text-base leading-none ${dotColor[svc.status] ?? "text-gray-500"}`}>●</span>
              <span className="text-xs font-medium text-gray-200 truncate">{svc.name}</span>
            </div>
            <span className="text-[10px] text-gray-500 ml-5">{svc.stack}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
