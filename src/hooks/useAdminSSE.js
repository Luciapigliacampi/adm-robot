import { useEffect, useRef, useState, useCallback } from "react";

const API = import.meta.env.VITE_API_BASE;
const ENABLE_SENSORS = import.meta.env.VITE_ENABLE_SENSORS === "1";
const SENSORS_PATH   = import.meta.env.VITE_SENSORS_PATH || "/api/sensors";
const FAKE_TLM       = import.meta.env.VITE_FAKE_TELEMETRY === "1";

export default function useAdminSSE(robotId = "R1") {
  const isDemo = typeof robotId === "string" && robotId.startsWith("demo-");

  const [connected, setConnected]   = useState(false);
  const [latencyMs, setLatencyMs]   = useState(null);
  const [telemetry, setTelemetry]   = useState(null);
  const [snapshot, setSnapshot]     = useState(null);
  const [series, setSeries]         = useState([]);
  const [logs, setLogs]             = useState([]);

  const statusES = useRef(null);
  const mainES   = useRef(null);
  const tickId   = useRef(null);

  const push = useCallback((setter, item, max = 200) => {
    setter((prev) => [item, ...prev].slice(0, max));
  }, []);

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  // DEMO
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
      const next = { ...t, dist: Number(t.dist || 0) + Number(t.v || 0) * 2 };
      return next;
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
      if (last.speed    != null && t.v    == null) t.v    = last.speed;
      if (last.distance != null && t.dist == null) t.dist = last.distance;
      if (last.battery  != null && t.battery == null) t.battery = last.battery;
      return t;
    } catch {
      return baseTlm;
    }
  }, [robotId]);

  // REAL
  useEffect(() => {
    if (isDemo) return;

    statusES.current = new EventSource(`${API}/api/status/stream`);
    let lastTick = Date.now();

    statusES.current.onmessage = async (e) => {
      try {
        const data = JSON.parse(e.data) || {};
        let tlm = {
          status:  data.status,
          mode:    data.mode,
          battery: data.battery ?? data.batt ?? null,
          v:       data.speed   ?? data.v    ?? null,
          dist:    data.distance?? data.dist ?? null,
          timestamp: data.timestamp ?? Date.now(),
        };

        if (data?.snapshotUrl || data?.image?.url) {
          setSnapshot({
            url: data.snapshotUrl ?? data.image.url,
            description: data?.image?.description ?? "",
            ts: Date.now(),
          });
        }

        tlm = await enrichWithSensors(tlm);
        tlm = applyFakeTelemetry({ ...(telemetry || {}), ...tlm });

        setTelemetry((prev) => {
          const next = { ...(prev || {}), ...tlm };
          if (typeof next.dist === "number") {
            setSeries((s) => [...(Array.isArray(s) ? s.slice(-49) : []), { x: Date.now(), y: next.dist }]);
          }
          return next;
        });

        const now = Date.now();
        setLatencyMs(Math.max(0, now - lastTick - 2000));
        lastTick = now;
        setConnected(true);
      } catch {}
    };

    statusES.current.onerror = () => setConnected(false);

    // STREAM principal (eventos)
    mainES.current = new EventSource(`${API}/api/stream`);
    const on = (n, h) => mainES.current.addEventListener(n, h);
    const off = (n, h) => mainES.current.removeEventListener(n, h);

    const safe = (s) => { try { return JSON.parse(s); } catch { return null; } };

    const onEvent = (type) => (e) => {
      push(setLogs, { type, data: safe(e.data), ts: Date.now() });
    };

    const onNewImage = (e) => {
      const d = safe(e.data);
      push(setLogs, { type: "new_image", data: d, ts: Date.now() });
      if (d?.url)
        setSnapshot({ url: d.url, description: d.description || "", ts: Date.now() });
    };

    on("robot_connected", onEvent("robot_connected"));
    on("robot_disconnected", onEvent("robot_disconnected"));
    on("ack_received", onEvent("ack_received"));
    on("robot_error", onEvent("robot_error"));
    on("new_image", onNewImage);

    tickId.current = setInterval(bumpFakeDistance, 2000);

    return () => {
      clearInterval(tickId.current);
      try { statusES.current?.close(); } catch {}
      try { mainES.current?.close(); } catch {}
      if (mainES.current) {
        off("robot_connected", onEvent("robot_connected"));
        off("robot_disconnected", onEvent("robot_disconnected"));
        off("ack_received", onEvent("ack_received"));
        off("robot_error", onEvent("robot_error"));
        off("new_image", onNewImage);
      }
    };
  }, [robotId, isDemo, enrichWithSensors, applyFakeTelemetry, bumpFakeDistance]);

  return { connected, latencyMs, telemetry, snapshot, series, logs };
}
