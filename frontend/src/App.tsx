import { useState } from "react";
import type { ReactNode } from "react";
import { useDashboard } from "./hooks/useDashboard";
import { ConnectionStatus } from "./components/ConnectionStatus";
import { ProcessTable } from "./components/ProcessTable";
import { ServicesCard } from "./components/ServicesCard";
import { ServiceDrawer } from "./components/ServiceDrawer";
import { CpuCard } from "./components/cards/CpuCard";
import { RamCard } from "./components/cards/RamCard";
import { NetworkCard } from "./components/cards/NetworkCard";
import { PoolCard } from "./components/cards/PoolCard";
import { DiskCard } from "./components/cards/DiskCard";
import type { HddData, NvmeData, ServiceStatus } from "./types/dashboard";

type DiskEntry = { type: "hdd"; data: HddData } | { type: "nvme"; data: NvmeData };

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 pb-2 mb-3 border-b border-gray-700">
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const { snapshot, connected } = useDashboard();
  const [selectedService, setSelectedService] = useState<string | null>(null);

  if (!snapshot) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-400">
        Connecting…
      </div>
    );
  }

  const selectedSvc: ServiceStatus | null =
    selectedService
      ? (snapshot.services.find((s) => s.name === selectedService) ?? null)
      : null;

  const disksByPool = new Map<string, DiskEntry[]>();
  const unassignedDisks: DiskEntry[] = [];

  for (const d of snapshot.hdds) {
    const entry: DiskEntry = { type: "hdd", data: d };
    if (d.pool) {
      const arr = disksByPool.get(d.pool) ?? [];
      arr.push(entry);
      disksByPool.set(d.pool, arr);
    } else {
      unassignedDisks.push(entry);
    }
  }
  for (const d of snapshot.nvmes) {
    const entry: DiskEntry = { type: "nvme", data: d };
    if (d.pool) {
      const arr = disksByPool.get(d.pool) ?? [];
      arr.push(entry);
      disksByPool.set(d.pool, arr);
    } else {
      unassignedDisks.push(entry);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <ConnectionStatus connected={connected} truenasConnected={snapshot.truenas_connected} />

      <div className="p-4 space-y-8">
        <Section title="System">
          <CpuCard cpu={snapshot.cpu} />
          <RamCard ram={snapshot.ram} />
          <NetworkCard interfaces={snapshot.network} />
        </Section>

        {snapshot.pools.map((pool) => (
          <Section key={pool.name} title={pool.name}>
            <PoolCard pool={pool} />
            {(disksByPool.get(pool.name) ?? []).map((disk) => (
              <DiskCard key={disk.data.device} disk={disk} />
            ))}
          </Section>
        ))}

        {unassignedDisks.length > 0 && (
          <Section title="Other Disks">
            {unassignedDisks.map((disk) => (
              <DiskCard key={disk.data.device} disk={disk} />
            ))}
          </Section>
        )}

        {snapshot.services.length > 0 && (
          <Section title="Services">
            <ServicesCard services={snapshot.services} onSelect={setSelectedService} />
          </Section>
        )}
      </div>

      <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProcessTable title="Top CPU Processes" processes={snapshot.top_cpu_processes} />
        <ProcessTable title="Top RAM Processes" processes={snapshot.top_ram_processes} />
      </div>

      <ServiceDrawer service={selectedSvc} onClose={() => setSelectedService(null)} />
    </div>
  );
}
