// src/hooks/useAdminSSE.js
import { useEffect, useRef, useState, useCallback } from "react";

const API = import.meta.env.VITE_API_BASE || "";

// Feature flags (.env)
const ENABLE_SENSORS = import.meta.env.VITE_ENABLE_SENSORS === "1";
const SENSORS_PATH   = import.meta.env.VITE_SENSORS_PATH || "/api/sensors";
const FAKE_TLM       = import.meta.env.VITE_FAKE_TELEMETRY === "1";

export default function useAdminSSE(robotId = "R1") {
  const isDemo = typeof robotId === "string" && robotId.startsWith("demo-");

  const [connected, setConnected] = useState(false);
  const [latencyMs, setLatencyMs] = useState(null);
  const [telemetry, setTelemetry] = useState(null);
  const [snapshot, setSnapshot]   = useState(null);
  const [series, setSeries]       = useState([]);
  const [logs, setLogs]           = useState([]);

  const statusES = useRef(null); // stream de estado/telemetría/snapshot
  const mainES   = useRef(null); // stream de eventos varios
  const tickId   = useRef(null); // intervalo para fake distance

  // helpers
  const push = useCallback((setter, item, max = 200) => {
    setter((prev) => [item, ...prev].slice(0, max));
  }, []);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const safe = (s) => { try { return JSON.parse(s); } catch { return null; } };

  // ------------------------------------------------------------
  // DEMO: genera telemetría falsa sin abrir SSE
  // ------------------------------------------------------------
  useEffect(() => {
    if (!isDemo) return;

    setConnected(true);
    setLatencyMs(5);

    let i = 0;
    const timer = setInterval(() => {
      const now = Date.now();
      const fakeBattery = Math.max(10, 100 - ((now / 1000) % 90));
      const fakeSpeed   = Math.abs(Math.sin(now / 1500)).toFixed(2);
      const fakeDist    = (i += Number(fakeSpeed));

      setTelemetry({
        battery: Number(fakeBattery.toFixed(1)),
        v: Number(fakeSpeed),
        dist: Number(fakeDist.toFixed(1)),
        mode: "manual",
        status: "idle",
      });

      setSeries((s) => [...s.slice(-59), { x: now, y: Number(fakeDist.toFixed(1)) }]);
    }, 800);

    return () => clearInterval(timer);
  }, [isDemo, robotId]);

  // Opcional: ruido leve para hacer “vivo” el gráfico en entorno real
  const applyFakeTelemetry = useCallback((base) => {
    if (!FAKE_TLM) return base;
    const prevB = Number.isFinite(base?.battery) ? base.battery : 72;
    const prevV = Number.isFinite(base?.v) ? base.v : 0.15;
    const prevD = Number.isFinite(base?.dist) ? base.dist : 0;

    const v = clamp(prevV + (Math.random() - 0.5) * 0.08, 0, 0.5);
    const battery = clamp(prevB + (Math.random() - 0.55) * 0.8, 5, 100);
    const dist = prevD;

    return { ...base, v, battery, dist };
  }, []);

  const bumpFakeDistance = useCallback(() => {
    if (!FAKE_TLM) return;
    setTelemetry((t) => {
      if (!t) return t;
      return { ...t, dist: Number(t.dist || 0) + Number(t.v || 0) * 2 };
    });
  }, []);

  const enrichWithSensors = useCallback(async (baseTlm) => {
    try {
      if (!ENABLE_SENSORS) return baseTlm;
      const path = SENSORS_PATH.replace(":robotId", robotId);
      const res = await fetch(`${API}${path}`);
      if (!res.ok) return baseTlm;
      const data = await res.json();
      const last = Array.isArray(data?.readings) ? data.readings[0] : data?.last || null;
      if (!last) return baseTlm;
      const t = { ...baseTlm };
      if (last.speed    != null && t.v       == null) t.v       = last.speed;
      if (last.distance != null && t.dist    == null) t.dist    = last.distance;
      if (last.battery  != null && t.battery == null) t.battery = last.battery;
      return t;
    } catch {
      return baseTlm;
    }
  }, [robotId]);

  // ------------------------------------------------------------
  // REAL: abre SSEs y procesa eventos
  // ------------------------------------------------------------
  useEffect(() => {
    if (isDemo) return;

    // --- STATUS / TELEMETRY / SNAPSHOT ---
    statusES.current = new EventSource(`${API}/api/status/stream`);
    let lastTick = Date.now();

    statusES.current.onmessage = async (e) => {
      try {
        const data = JSON.parse(e.data) || {};

        // map básico con alias comunes
        let tlm = {
          status:   data.status,
          mode:     data.mode,
          battery:  data.battery  ?? data.batt ?? null,
          v:        data.speed    ?? data.v    ?? null,
          dist:     data.distance ?? data.dist ?? null,
          timestamp: data.timestamp ?? Date.now(),
        };

        // fallbacks para snapshot (toma cualquiera que venga)
        const snapUrl =
          data.snapshotUrl ||
          data?.image?.url ||
          data?.imageUrl ||
          data?.url ||
          null;

        if (snapUrl) {
          setSnapshot({
            url: snapUrl,
            description: data?.image?.description || data?.description || "",
            ts: Date.now(),
          });
        }

        // enriquecer con sensores (opcional) + telemetría fake (opcional)
        tlm = await enrichWithSensors(tlm);
        tlm = applyFakeTelemetry({ ...(telemetry || {}), ...tlm });

        // actualizar telemetría y serie
        setTelemetry((prev) => {
          const next = { ...(prev || {}), ...tlm };
          if (typeof next.dist === "number") {
            setSeries((s) => [
              ...(Array.isArray(s) ? s.slice(-49) : []),
              { x: Date.now(), y: next.dist },
            ]);
          }
          return next;
        });

        // latencia aproximada (suponiendo tick ~2s)
        const now = Date.now();
        setLatencyMs(Math.max(0, now - lastTick - 2000));
        lastTick = now;
        setConnected(true);
      } catch {
        // noop
      }
    };

    statusES.current.onerror = () => setConnected(false);

    // --- MAIN EVENTS ---
    mainES.current = new EventSource(`${API}/api/stream`);

    const h_robot_connected = (e) => push(setLogs, { type: "robot_connected", data: safe(e.data), ts: Date.now() });
    const h_robot_disconnected = (e) => push(setLogs, { type: "robot_disconnected", data: safe(e.data), ts: Date.now() });
    const h_ack_received = (e) => push(setLogs, { type: "ack_received", data: safe(e.data), ts: Date.now() });
    const h_robot_error = (e) => push(setLogs, { type: "robot_error", data: safe(e.data), ts: Date.now() });

    const h_new_image = (e) => {
      const d = safe(e.data);
      push(setLogs, { type: "new_image", data: d, ts: Date.now() });
      if (d?.url || d?.imageUrl || d?.path || d?.src) {
        const url = d.url || d.imageUrl || d.path || d.src;
        setSnapshot({ url, description: d?.description || "", ts: Date.now() });
      }
    };

    mainES.current.addEventListener("robot_connected", h_robot_connected);
    mainES.current.addEventListener("robot_disconnected", h_robot_disconnected);
    mainES.current.addEventListener("ack_received", h_ack_received);
    mainES.current.addEventListener("robot_error", h_robot_error);
    mainES.current.addEventListener("new_image", h_new_image);

    // fake distance tick (si aplica)
    tickId.current = setInterval(bumpFakeDistance, 2000);

    // cleanup
    return () => {
      clearInterval(tickId.current);
      try { statusES.current?.close(); } catch {}
      try { mainES.current?.close(); } catch {}
      mainES.current?.removeEventListener("robot_connected", h_robot_connected);
      mainES.current?.removeEventListener("robot_disconnected", h_robot_disconnected);
      mainES.current?.removeEventListener("ack_received", h_ack_received);
      mainES.current?.removeEventListener("robot_error", h_robot_error);
      mainES.current?.removeEventListener("new_image", h_new_image);
    };
  }, [robotId, isDemo, enrichWithSensors, applyFakeTelemetry, bumpFakeDistance]); // deps correctas

  return { connected, latencyMs, telemetry, snapshot, series, logs };
}
