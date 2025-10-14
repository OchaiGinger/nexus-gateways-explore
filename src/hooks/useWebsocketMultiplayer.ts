// src/hooks/useWebsocketMultiplayer.ts
import { useEffect, useRef, useState } from "react";

type RemotePlayer = {
  userId: string;
  position: [number, number, number];
  rotationY?: number;
  color?: string;
  avatar?: string; // optional path to glb or model id
  updatedAt?: number;
};

const WS_URL = (process.env.NODE_ENV === "production")
  ? "wss://your-production-server.example/ws"
  : "ws://localhost:8080/ws"; // <- update this to your WS server

export function useWebsocketMultiplayer(opts: { roomType: string; localPosition: { x:number,y:number,z:number }}) {
  const { roomType, localPosition } = opts;
  const wsRef = useRef<WebSocket | null>(null);
  const [otherPlayers, setOtherPlayers] = useState<Map<string, RemotePlayer>>(new Map());
  const localIdRef = useRef<string>(typeof window !== "undefined" && (window as any).__LOCAL_PLAYER_ID ? (window as any).__LOCAL_PLAYER_ID : (crypto && (crypto as any).randomUUID ? (crypto as any).randomUUID() : `p_${Math.random().toString(36).slice(2,9)}`));
  // store on window so reload keeps same id in dev
  if (typeof window !== "undefined") (window as any).__LOCAL_PLAYER_ID = localIdRef.current;

  // Simple avatar/color
  const localColor = `#${Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0')}`;

  useEffect(() => {
    const ws = new WebSocket(`${WS_URL}?room=${encodeURIComponent(roomType)}&id=${localIdRef.current}`);
    wsRef.current = ws;

    ws.addEventListener("open", () => {
      // announce ourselves
      ws.send(JSON.stringify({
        type: "player:join",
        payload: {
          userId: localIdRef.current,
          color: localColor,
          position: localPosition,
          avatar: null,
        }
      }));
    });

    ws.addEventListener("message", (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        switch (msg.type) {
          case "player:list": {
            // initial snapshot
            const map = new Map<string, RemotePlayer>();
            (msg.payload as RemotePlayer[]).forEach(p => {
              if (p.userId !== localIdRef.current) map.set(p.userId, { ...p, updatedAt: Date.now() });
            });
            setOtherPlayers(map);
            break;
          }
          case "player:update": {
            const p: RemotePlayer = msg.payload;
            if (p.userId === localIdRef.current) break;
            setOtherPlayers(prev => {
              const m = new Map(prev);
              m.set(p.userId, { ...p, updatedAt: Date.now() });
              return m;
            });
            break;
          }
          case "player:leave": {
            const id: string = msg.payload.userId;
            setOtherPlayers(prev => {
              const m = new Map(prev);
              m.delete(id);
              return m;
            });
            break;
          }
          case "chat:message": {
            // let consumer handle chat events via a custom event
            const detail = msg.payload;
            window.dispatchEvent(new CustomEvent("ws:chat:message", { detail }));
            break;
          }
          default:
            // unknown
            break;
        }
      } catch (err) {
        console.error("ws parse error", err);
      }
    });

    ws.addEventListener("close", () => {
      wsRef.current = null;
    });

    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        // gracefully announce leaving
        wsRef.current.send(JSON.stringify({ type: "player:leave", payload: { userId: localIdRef.current } }));
        wsRef.current.close();
      }
    };
  }, [roomType]);

  // update our position regularly (throttle)
  useEffect(() => {
    const t = setInterval(() => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
      wsRef.current.send(JSON.stringify({
        type: "player:update",
        payload: {
          userId: localIdRef.current,
          position: localPosition,
          color: localColor,
        }
      }));
    }, 100); // 10Hz updates
    return () => clearInterval(t);
  }, [localPosition]);

  function sendDirectMessage(toUserId: string, text: string) {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({
      type: "chat:message",
      payload: {
        from: localIdRef.current,
        to: toUserId,
        text,
        timestamp: Date.now(),
      },
    }));
  }

  return {
    localId: localIdRef.current,
    otherPlayers,
    sendDirectMessage,
  };
}
