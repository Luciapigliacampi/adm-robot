// src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import useAdminSSE from "../hooks/useAdminSSE";
import SimpleLineChart from "../components/SimpleLineChart";
import KpiCard from "../components/KpiCard";
import SnapshotCard from "../components/SnapshotCard";
import { useImageAPI } from "../hooks/useImageAPI";
import {isAdmin} from "../services/roles";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";



export default function AdminDashboard() {
  const { robotId } = useParams();
  console.log("robotId en AdminDashboard:", robotId);
  const { connected, latencyMs, telemetry, snapshot, series, logs } = useAdminSSE(robotId || "R1");

  const api = useImageAPI(robotId);
  const [thumbs, setThumbs] = useState([]);

  const battery = telemetry?.battery ?? null;
  const speed   = telemetry?.v ?? null;
  const dist    = telemetry?.dist ?? null;
  const mode    = telemetry?.mode ?? "—";
  const state   = telemetry?.status ?? "—";


 useEffect(() => {
  (async () => {
    try {
      const api = useImageAPI(robotId || "R1");
      const images = await api.listAll();
      if (Array.isArray(images) && images.length > 0) {
        // ordenar por timestamp descendente (más nuevas primero)
        const last3 = [...images]
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
          .slice(0, 3);
        setThumbs(last3);
      } else {
        setThumbs([]);
      }
    } catch (err) {
      console.error("Error al traer imágenes:", err);
      setThumbs([]);
    }
  })();
}, [robotId]);


  return (
    <div className="main" style={{ display: "grid", gap: 16 }}>
      {/* --- HEADER con botón solo para admin --- */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <h2 style={{ margin: 0 }}>Panel de administración</h2>
        {isAdmin() && (
          <Link
            to={`http://localhost:5173`}
            className="btn primary"
            style={{ marginLeft: "auto" }}
          >
            Ir al Control Remoto
          </Link>
        )}
      </div>

      {/* Botón para probar notificaciones */}
 <button
        className="btn"
        onClick={() => toast.success("✅ Notificación funcionando!")}
      >
        Probar notificación
      </button>
      {/* SSE state */}
      <div className="card">
        <b>SSE:</b> {connected ? "Conectado" : "Desconectado"} · Latencia aprox: {latencyMs ?? "—"} ms
      </div>

      {/* KPIs */}
      <div className="grid kpis" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <KpiCard title="Conexión" value={connected ? "Conectado" : "Desconectado"} hint={latencyMs != null ? `${latencyMs} ms` : "—"} ok={connected} />
        <KpiCard title="Batería"  value={battery != null ? battery : "—"} unit="%" />
        <KpiCard title="Velocidad" value={speed   != null ? speed   : "—"} unit="m/s" />
        <KpiCard title="Distancia" value={dist    != null ? dist    : "—"} unit="m" />
      </div>

      {/* Imágenes recientes */}
      <div className="card">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
          <div className="muted">Imágenes recientes</div>
          <Link className="link" to={`/dashboard/${robotId}/images`}>Ver más</Link>
        </div>
        <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(3, 300px)", // 🔹 cada imagen 120x120
    justifyContent: "center",
    gap: 10,
    justifyContent: "space-between",
  }}
>
          {thumbs.map((i,idx) => (
            <div
  key={i._id || idx}
  style={{
    width: "100%",
    aspectRatio: "1 / 1",   // 🔥 mantiene cuadrado
    overflow: "hidden",
    borderRadius: 8,
  }}
>
  <img
    src={i.url || i.path || i.imageUrl}
    alt={i.label || ""}
    style={{
      width: "100%",
      height: "100%",
      objectFit: "cover",
    }}
  />
</div>
          ))}
          {thumbs.length === 0 && <div className="muted">Sin imágenes</div>}
        </div>
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
            <div>Tipo</div><div>Detalle</div><div>Hora</div>
          </div>
          {Array.isArray(logs) && logs.length > 0 ? (
            logs.slice(0, 20).map((l, i) => (
              <div className="tr" key={i}>
                <div>{l.type || l.level || "log"}</div>
                <div><pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{typeof l.data === "string" ? l.data : JSON.stringify(l.data ?? l.msg)}</pre></div>
                <div>{new Date(l.ts || Date.now()).toLocaleTimeString()}</div>
              </div>
            ))
          ) : (
            <div className="muted" style={{ padding: 8 }}>Sin eventos</div>
          )}
        </div>
      </div>
    </div>
  );
}
