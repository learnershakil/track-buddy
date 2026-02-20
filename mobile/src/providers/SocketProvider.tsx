import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { CONFIG } from "@/constants/config";

interface SocketContextType {
  isConnected: boolean;
  emit:        (event: string, data?: unknown) => void;
}

const SocketContext = createContext<SocketContextType>({
  isConnected: false,
  emit:        () => {},
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const wsRef       = useRef<WebSocket | null>(null);
  const [isConnected, setConnected] = useState(false);

  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket(CONFIG.WS_URL);
      ws.onopen    = () => setConnected(true);
      ws.onclose   = () => { setConnected(false); setTimeout(connect, 3000); };
      ws.onerror   = () => ws.close();
      wsRef.current = ws;
    };
    connect();
    return () => wsRef.current?.close();
  }, []);

  const emit = (event: string, data?: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ event, data }));
    }
  };

  return (
    <SocketContext.Provider value={{ isConnected, emit }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
