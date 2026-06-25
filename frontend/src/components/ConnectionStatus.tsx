interface Props {
  connected: boolean;
  truenasConnected: boolean;
}

export function ConnectionStatus({ connected, truenasConnected }: Props) {
  return (
    <div className="fixed top-3 right-3 flex flex-col items-end gap-1 z-50">
      <div className="flex items-center gap-1.5 rounded-full bg-gray-800 px-3 py-1 text-xs">
        <span
          className={`h-2 w-2 rounded-full ${connected ? "bg-green-400" : "bg-yellow-400 animate-pulse"}`}
        />
        <span className={connected ? "text-green-400" : "text-yellow-400"}>
          {connected ? "Live" : "Reconnecting…"}
        </span>
      </div>
      {!truenasConnected && (
        <div className="flex items-center gap-1.5 rounded-full bg-gray-800 px-3 py-1 text-xs">
          <span className="h-2 w-2 rounded-full bg-yellow-400" />
          <span className="text-yellow-400">TrueNAS Offline</span>
        </div>
      )}
    </div>
  );
}
