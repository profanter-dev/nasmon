interface Props {
  connected: boolean;
  truenasConnected: boolean;
}

export function ConnectionStatus({ connected, truenasConnected }: Props) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 rounded-full border border-white/8 bg-white/5 px-2.5 py-1 text-xs">
        <span
          className={`h-2 w-2 rounded-full ${
            connected ? "bg-emerald-400 live-dot" : "bg-amber-400 animate-pulse"
          }`}
        />
        <span className={connected ? "text-emerald-300" : "text-amber-300"}>
          {connected ? "Live" : "Reconnecting"}
        </span>
      </div>
      {!truenasConnected && (
        <div className="flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-xs">
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          <span className="text-amber-300 hidden sm:inline">TrueNAS offline</span>
          <span className="text-amber-300 sm:hidden">NAS</span>
        </div>
      )}
    </div>
  );
}
