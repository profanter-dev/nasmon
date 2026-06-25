import type { ProcessData } from "../types/dashboard";

interface Props {
  title: string;
  processes: ProcessData[];
}

export function ProcessTable({ title, processes }: Props) {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-3">{title}</h3>
      <table className="w-full text-xs">
        <thead>
          <tr className="text-gray-500 text-left">
            <th className="pb-2 font-medium">Name</th>
            <th className="pb-2 font-medium">PID</th>
            <th className="pb-2 font-medium">CPU %</th>
            <th className="pb-2 font-medium">RAM MB</th>
          </tr>
        </thead>
        <tbody>
          {processes.map((p) => (
            <tr key={p.pid} className="text-gray-300 border-t border-gray-700">
              <td className="py-1 pr-2 truncate max-w-[8rem]">{p.name}</td>
              <td className="py-1 pr-2 text-gray-500">{p.pid}</td>
              <td className="py-1 pr-2">{p.cpu_percent.toFixed(1)}</td>
              <td className="py-1">{p.ram_mb.toFixed(0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
