// src/pages/AdminDashboard.jsx
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import useAdminSSE from "../hooks/useAdminSSE";
import SimpleLineChart from "../components/SimpleLineChart";
import KpiCard from "../components/KpiCard";
import SnapshotCard from "../components/SnapshotCard";

// ---- Helpers básicos para notificaciones nativas ----
const canNotify = () => typeof window !== "undefined" && "Notification" in window;

async function ensurePermission() {
  if (!canNotify()) return { ok: false, reason: "unsupported" };
  if (Notification.permission === "granted") return { ok: true };
  if (Notification.permission === "denied") return { ok: false, reason: "denied" };
  const res = await Notification.requestPermission();
  return { ok: res === "granted", reason: res };
}

function showNative({ title, body }) {
  if (!canNotify() || Notification.permission !== "granted") return false;
  try {
    new Notification(title, {
      body,
      icon: "/icons/icon-192.png", // si no existe, quita esta línea
      badge: "/icons/icon-192.png",
    });
    return true;
  } catch (e) {
    return false;
  }
}

export default function AdminDashboard() {
const { robotId } = useParams();     
  const { connected, latencyMs, telemetry, snapshot, series, logs } = useAdminSSE("R1");

  const battery = telemetry?.battery ?? null;
  const speed   = telemetry?.v ?? null;
  const dist    = telemetry?.dist ?? null;
  const mode    = telemetry?.mode ?? "—";
  const state   = telemetry?.status ?? "—";

   useAdminSSE(robotId); 

  // Pide permiso una vez (si el navegador lo soporta)
  useEffect(() => {
    ensurePermission();
  }, []);

  const onTestNotify = async () => {
    const { ok, reason } = await ensurePermission();
    if (!ok) {
      alert(
        reason === "unsupported"
          ? "Este navegador no soporta notificaciones o la página no está en HTTPS/localhost."
          : "Las notificaciones están bloqueadas para este sitio. Habilitalas en el candado de la barra de direcciones."
      );
      return;
    }
    const done = showNative({ title: "Prueba", body: "Hola desde Notification API 👋" });
    if (!done) alert("No se pudo mostrar la notificación (ver permisos del sitio).");
  };

  return (
    <div className="main" style={{ display: "grid", gap: 16 }}>
      <h2>Panel de administración</h2>

      {/* Botón para probar notificaciones */}
      <button className="btn" onClick={onTestNotify}>
        Probar notificación
      </button>

      {/* Visual de estado SSE */}
      <div className="card">
        <b>SSE:</b> {connected ? "Conectado" : "Desconectado"} · Latencia aprox: {latencyMs ?? "—"} ms
      </div>

      {/* KPIs */}
      <div
        className="grid kpis"
        style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}
      >
        <KpiCard
          title="Conexión"
          value={connected ? "Conectado" : "Desconectado"}
          hint={latencyMs != null ? `${latencyMs} ms` : "—"}
          ok={connected}
        />
        <KpiCard title="Batería" value={battery != null ? `${battery}%` : "—"} unit="" />
        <KpiCard title="Velocidad" value={speed != null ? speed : "—"} unit="m/s" />
        <KpiCard title="Distancia" value={dist != null ? dist : "—"} unit="m" />
      </div>

      {/* Snapshot + Telemetría */}
      <div className="grid" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 12 }}>
        <SnapshotCard snapshot={snapshot} />
        <div className="card">
          <div className="card-title">Telemetría</div>
          <div className="muted small">
            Modo: <b>{mode}</b> · Estado: <b>{state}</b>
          </div>
          <div style={{ marginTop: 12 }}>
            <SimpleLineChart data={series} width={380} height={120} />
          </div>
        </div>
      </div>

      {/* Logs */}
      <div className="card">
        <div className="card-title">Eventos recientes</div>
        <div className="table">
          <div className="tr head">
            <div>Tipo</div>
            <div>Detalle</div>
            <div>Hora</div>
          </div>
          {logs.length === 0 ? (
            <div className="muted" style={{ padding: 8 }}>
              Sin eventos
            </div>
          ) : (
            logs.slice(0, 20).map((l, i) => (
              <div className="tr" key={i}>
                <div>{l.type || l.level || "log"}</div>
                <div>
                  <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                    {typeof l.data === "string" ? l.data : JSON.stringify(l.data ?? l.msg)}
                  </pre>
                </div>
                <div>{new Date(l.ts || Date.now()).toLocaleTimeString()}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
