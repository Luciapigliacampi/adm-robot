import { useEffect, useRef, useState, useCallback } from "react";

const WS_URL = import.meta.env.VITE_WS_URL;

export default function useAdminWS() {
  const wsRef = useRef(null);
  const hbRef = useRef(null);
  const retryRef = useRef(0);
  const closedRef = useRef(false);

  const [connected, setConnected] = useState(false);
  const [latencyMs, setLatencyMs] = useState(null);

  const [telemetry, setTelemetry] = useState(null); // {battery, mode, status, mast, power, v, dist...}
  const [snapshot, setSnapshot] = useState(null);   // {url, ts, description}
  const [steps, setSteps] = useState([]);           // opcional para tabla de tareas
  const [series, setSeries] = useState([]);         // [{t, battery}]

  const send = useCallback((obj) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj));
  }, []);

  useEffect(() => {
    function open() {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        retryRef.current = 0;
        // ping
        hbRef.current = setInterval(() => {
          const t0 = Date.now();
          send({ type: "ping", t0 });
        }, 10000);
      };

      ws.onmessage = (ev) => {
        let msg; try { msg = JSON.parse(ev.data); } catch { return; }
        switch (msg.type) {
          case "pong":
            if (msg.t0) setLatencyMs(Date.now() - msg.t0);
            break;
          case "robot_status": {
            setTelemetry(msg);
            setSeries((prev) => {
              const next = [...prev, { t: Date.now(), battery: msg.battery }];
              return next.slice(-120); // ~ últimos 120 puntos
            });
            break;
          }
          case "image": {
            // backend debería emitir {type:'image', url, timestamp, description}
            setSnapshot({ url: msg.url, ts: msg.timestamp, description: msg.description });
            break;
          }
          case "steps":
            setSteps(msg.items || []);
            break;
          default:
            break;
        }
      };

      ws.onclose = () => {
        setConnected(false);
        if (hbRef.current) clearInterval(hbRef.current);
        if (!closedRef.current) {
          const tries = Math.min(retryRef.current + 1, 6);
          retryRef.current = tries;
          const delay = Math.pow(2, tries) * 500 + Math.random() * 300;
          setTimeout(open, delay);
        }
      };

      ws.onerror = () => { try { ws.close(); } catch {} };
    }

    open();
    return () => {
      closedRef.current = true;
      if (hbRef.current) clearInterval(hbRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [send]);

  return { connected, latencyMs, telemetry, snapshot, steps, series };
}
