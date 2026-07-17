import type { ProcessData } from "../types/dashboard";

interface Props {
  title: string;
  processes: ProcessData[];
  accent?: string;
}

export function ProcessTable({ title, processes, accent = "#38bdf8" }: Props) {
  return (
    <div className="glass p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="h-2 w-2 rounded-full" style={{ background: accent }} />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          {title}
        </h3>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-slate-500 text-left text-[0.65rem] uppercase tracking-wide">
            <th className="pb-2 font-medium">Process</th>
            <th className="pb-2 font-medium tnum text-right">PID</th>
            <th className="pb-2 font-medium tnum text-right">CPU %</th>
            <th className="pb-2 font-medium tnum text-right">RAM MB</th>
          </tr>
        </thead>
        <tbody>
          {processes.map((p) => (
            <tr
              key={p.pid}
              className="text-slate-300 border-t border-white/6 hover:bg-white/4 transition-colors"
            >
              <td className="py-1.5 pr-2 truncate max-w-[10rem] font-medium">{p.name}</td>
              <td className="py-1.5 pr-2 text-slate-500 tnum text-right">{p.pid}</td>
              <td className="py-1.5 pr-2 tnum text-right">{p.cpu_percent.toFixed(1)}</td>
              <td className="py-1.5 tnum text-right">{p.ram_mb.toFixed(0)}</td>
            </tr>
          ))}
          {processes.length === 0 && (
            <tr>
              <td colSpan={4} className="py-4 text-center text-slate-500 text-xs">
                No data
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
