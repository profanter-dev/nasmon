import { useState } from "react";
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
import { FanCard } from "./components/cards/FanCard";
import type { HddData, NvmeData, ServiceStatus } from "./types/dashboard";

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

  const hddEntries = snapshot.hdds.map((d: HddData) => ({ type: "hdd" as const, data: d }));
  const nvmeEntries = snapshot.nvmes.map((d: NvmeData) => ({ type: "nvme" as const, data: d }));
  const allDisks = [...hddEntries, ...nvmeEntries];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <ConnectionStatus connected={connected} truenasConnected={snapshot.truenas_connected} />

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <CpuCard cpu={snapshot.cpu} />
        <RamCard ram={snapshot.ram} />
        <NetworkCard interfaces={snapshot.network} />

        {snapshot.pools.map((pool) => (
          <PoolCard key={pool.name} pool={pool} />
        ))}

        {allDisks.map((disk) => (
          <DiskCard key={disk.data.device} disk={disk} />
        ))}

        <FanCard fans={snapshot.fans} />

        <ServicesCard services={snapshot.services} onSelect={setSelectedService} />
      </div>

      <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProcessTable title="Top CPU Processes" processes={snapshot.top_cpu_processes} />
        <ProcessTable title="Top RAM Processes" processes={snapshot.top_ram_processes} />
      </div>

      <ServiceDrawer service={selectedSvc} onClose={() => setSelectedService(null)} />
    </div>
  );
}
