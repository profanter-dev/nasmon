import { useEffect, useRef, useState } from "react";
import type { DashboardSnapshot } from "../types/dashboard";

interface UseDashboardResult {
  snapshot: DashboardSnapshot | null;
  connected: boolean;
}

export function useDashboard(): UseDashboardResult {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
  const [connected, setConnected] = useState(false);
  const backoffRef = useRef(1000);
  const wsRef = useRef<WebSocket | null>(null);
  const unmountedRef = useRef(false);

  useEffect(() => {
    unmountedRef.current = false;

    function connect() {
      if (unmountedRef.current) return;

      const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
      const url = `${proto}//${window.location.host}/ws`;
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        backoffRef.current = 1000;
      };

      ws.onmessage = (evt: MessageEvent<string>) => {
        try {
          const data = JSON.parse(evt.data) as DashboardSnapshot;
          setSnapshot(data);
        } catch {
          // ignore malformed
        }
      };

      ws.onclose = () => {
        setConnected(false);
        if (!unmountedRef.current) {
          const delay = backoffRef.current;
          backoffRef.current = Math.min(backoffRef.current * 2, 30000);
          setTimeout(connect, delay);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      unmountedRef.current = true;
      wsRef.current?.close();
    };
  }, []);

  return { snapshot, connected };
}
