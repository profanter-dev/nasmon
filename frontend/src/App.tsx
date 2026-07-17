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
    <section className="fade-in">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-slate-400">
          {title}
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-white/12 to-transparent" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {children}
      </div>
    </section>
  );
}

export default function App() {
  const { snapshot, connected } = useDashboard();
  const [selectedService, setSelectedService] = useState<string | null>(null);

  if (!snapshot) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-slate-400">
        <div className="h-10 w-10 rounded-full border-2 border-white/15 border-t-sky-400 animate-spin" />
        <span className="text-sm tracking-wide">Connecting to nasmon…</span>
      </div>
    );
  }

  const selectedSvc: ServiceStatus | null = selectedService
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
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#060810]/70 border-b border-white/8">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-sky-500/30 to-violet-500/30 border border-white/10 shadow-lg shadow-sky-500/10">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-sky-300" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="5" rx="1.5" />
                <rect x="3" y="12" width="18" height="5" rx="1.5" />
                <circle cx="7" cy="6.5" r="0.6" fill="currentColor" />
                <circle cx="7" cy="14.5" r="0.6" fill="currentColor" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold tracking-tight leading-none">nasmon</h1>
              <p className="text-[0.68rem] text-slate-500 leading-none mt-1 hidden sm:block">
                NAS monitoring
              </p>
            </div>
          </div>
          <ConnectionStatus connected={connected} truenasConnected={snapshot.truenas_connected} />
        </div>
      </header>

      <main className="mx-auto max-w-[1600px] px-4 sm:px-6 py-6 space-y-8">
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

        <section className="fade-in">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Processes
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-white/12 to-transparent" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ProcessTable title="Top CPU" processes={snapshot.top_cpu_processes} accent="#38bdf8" />
            <ProcessTable title="Top RAM" processes={snapshot.top_ram_processes} accent="#a78bfa" />
          </div>
        </section>
      </main>

      <ServiceDrawer service={selectedSvc} onClose={() => setSelectedService(null)} />
    </div>
  );
}
