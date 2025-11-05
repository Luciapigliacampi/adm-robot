// src/hooks/useAdminWS.js (ejemplo)
import { useEffect, useRef, useState } from "react";

const FAKE = String(import.meta.env.VITE_FAKE_TELEMETRY || "1") === "1";

function lcg(seed) { // generador determinista
  let s = seed >>> 0;
  return () => (s = (1664525 * s + 1013904223) >>> 0) / 2**32;
}

function seedFrom(robotId) {
  let h = 2166136261;
  const str = String(robotId || "R1");
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export default function useAdminWS(robotId = "R1") {
  const [connected, setConnected] = useState(FAKE ? true : false);
  const [latencyMs, setLatency] = useState(FAKE ? 42 : null);
  const [telemetry, setTelemetry] = useState(null);   // {battery, v, dist, ...}
  const [snapshot, setSnapshot] = useState(null);     // string URL/base64
  const [logs, setLogs] = useState([]);
  const [series, setSeries] = useState(() => {
    // restaurar del localStorage para consistencia
    const key = `series:${robotId}`;
    try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
  });

  const timerRef = useRef(null);

  useEffect(() => {
    if (!FAKE) {
      // TODO: conectar SSE/WS reales
      setConnected(true);
      return;
    }

    const rand = lcg(seedFrom(robotId));

    // si la serie está vacía, generamos 30 puntos "mensuales"
    setSeries((old) => {
      if (old && old.length) return old;
      const base = Math.round(40 + rand() * 40); // batería base
      const arr = Array.from({ length: 30 }, (_, i) => ({
        // aceptado por SimpleLineChart (y ahora por tu componente)
        y: Math.max(5, Math.min(100, base + Math.round(Math.sin(i/6)*10 + (rand()-0.5)*6))),
        ts: Date.now() - (30 - i) * 24 * 3600 * 1000,
      }));
      localStorage.setItem(`series:${robotId}`, JSON.stringify(arr));
      return arr;
    });

    // Estado inicial
    const initBattery = Math.round(60 + rand() * 30);
    const initSpeed   = +(0.5 + rand() * 1.5).toFixed(2);
    const initDist    = Math.round(rand() * 5000);
    setTelemetry({ battery: initBattery, v: initSpeed, dist: initDist, mode: "manual", state: "ok" });

    // Update cada 3s con ruido leve
    timerRef.current = setInterval(() => {
      setTelemetry((t) => {
        const nb = Math.max(5, Math.min(100, (t?.battery ?? initBattery) + Math.round((rand() - 0.55) * 2)));
        const nv = +(Math.max(0, (t?.v ?? initSpeed) + (rand() - 0.5) * 0.2)).toFixed(2);
        const nd = (t?.dist ?? initDist) + Math.round(nv * (3 + rand())); // m recorridos
        return { ...(t || {}), battery: nb, v: nv, dist: nd };
      });

      setSeries((s) => {
        const nb = Math.max(5, Math.min(100, (s.at(-1)?.y ?? initBattery) + Math.round((rand() - 0.55) * 2)));
        const next = [...s, { y: nb, ts: Date.now() }].slice(-120);
        localStorage.setItem(`series:${robotId}`, JSON.stringify(next));
        return next;
      });

      setLatency(20 + Math.round(rand() * 60));
      // snapshot fake (opcional): setSnapshot('/some/static.jpg') ó base64 si querés
    }, 3000);

    return () => clearInterval(timerRef.current);
  }, [robotId]);

  return { connected, latencyMs, telemetry, snapshot, logs, series };
}
