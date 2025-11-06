// src/pages/AdminDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import useAdminSSE from "../hooks/useAdminSSE";
import KpiCard from "../components/KpiCard";
import { useImageAPI } from "../hooks/useImageAPI";
import { isAdmin } from "../services/roles";

export default function AdminDashboard() {
  const { robotId } = useParams();
  const rid = robotId || "R1";

  // SSE (estado + telemetría + snapshot + logs)
  const { connected, latencyMs, telemetry, snapshot, logs } = useAdminSSE(rid);

  // KPIs
  const battery = telemetry?.battery ?? null;
  const speed   = telemetry?.v ?? null;
  const dist    = telemetry?.dist ?? null;

  // Imágenes recientes (3)
  const api = useImageAPI(rid);
  const [thumbs, setThumbs] = useState([]);

  // --- Carga inicial desde API (3 más recientes) ---
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const list = await api.listAll();
        const ordered = (Array.isArray(list) ? list : [])
          .sort(
            (a, b) =>
              new Date(b.timestamp || b.createdAt || b.ts || 0) -
              new Date(a.timestamp || a.createdAt || a.ts || 0)
          )
          .slice(0, 3)
          .map((i) => ({
            _id: i._id || i.id || crypto.randomUUID(),
            url: i.url || i.path || i.imageUrl || i.src,
            label: i.label || i.description || "Captura",
            ts: new Date(i.timestamp || i.createdAt || i.ts || Date.now()).getTime(),
          }));
        if (!cancel) setThumbs(ordered);
      } catch {
        if (!cancel) setThumbs([]);
      }
    })();
    return () => { cancel = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rid]);

  // --- En vivo: si llega snapshot.url por SSE, lo inserto arriba y mantengo 3 ---
  useEffect(() => {
    if (!snapshot?.url) return;
    setThumbs((prev) => {
      const next = [
        {
          _id: `live-${Date.now()}`,
          url: snapshot.url,
          label: snapshot.description || "Nueva captura",
          ts: Date.now(),
        },
        ...prev.filter((p) => p.url !== snapshot.url),
      ];
      return next.slice(0, 3);
    });
  }, [snapshot?.url, snapshot?.description]);

  // Datos compactos (solo para encabezado de eventos)
  const telemHeader = useMemo(
    () => ({
      mode: telemetry?.mode ?? "—",
      status: telemetry?.status ?? "unknown",
    }),
    [telemetry]
  );

  // Filas a mostrar en la tabla (preferir logs del SSE;
  // si no hay, invento una fila con la última telemetría para que no quede vacío)
  const eventRows = useMemo(() => {
    if (Array.isArray(logs) && logs.length > 0) return logs;
    if (!telemetry) return [];
    return [
      {
        type: "telemetry",
        data: {
          v: telemetry.v ?? null,
          dist: telemetry.dist ?? null,
          battery: telemetry.battery ?? null,
        },
        ts: Date.now(),
      },
    ];
  }, [logs, telemetry]);

  return (
    <div className="main" style={{ display: "grid", gap: 16 }}>
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <h2 style={{ margin: 0 }}>Panel de administración</h2>
        {isAdmin() && (
          <Link to={`https://control-robot-ten.vercel.app/`} className="btn primary" style={{ marginLeft: "auto" }}>
            Ir al Control Remoto
          </Link>
        )}
      </div>

      {/* KPIs */}
      <div className="grid kpis" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        <KpiCard
          title="Conexión"
          value={connected ? "Conectado" : "Desconectado"}
          hint={latencyMs != null ? `${latencyMs} ms` : "—"}
          ok={connected}
        />
        <KpiCard title="Batería" value={battery != null ? battery : "—"} unit="%" />
        <KpiCard title="Velocidad" value={speed != null ? speed : "—"} unit="m/s" />
        <KpiCard title="Distancia" value={dist != null ? dist : "—"} unit="m" />
      </div>

      {/* IMÁGENES RECIENTES */}
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div className="muted">Imágenes recientes</div>
          <Link className="link" to={`/dashboard/${rid}/images`}>Ver más</Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 300px)",
            gap: 10,
            justifyContent: "space-between",
          }}
        >
          {thumbs.map((i) => (
            <div
              key={i._id}
              style={{ width: "100%", aspectRatio: "1 / 1", overflow: "hidden", borderRadius: 8 }}
            >
              <img
                src={i.url}
                alt={i.label || ""}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                loading="lazy"
              />
            </div>
          ))}
          {thumbs.length === 0 && <div className="muted">Sin imágenes</div>}
        </div>
      </div>

      {/* EVENTOS RECIENTES */}
      <div className="card">
        <div className="card-title">Eventos recientes</div>

        {/* Encabezado: SOLO modo y estado */}
        <div
          className="muted small"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 8,
            padding: "8px 0 12px",
            borderBottom: "1px solid var(--border)",
            marginBottom: 8,
          }}
        >
          <div>Modo: <b>{telemHeader.mode}</b></div>
          <div>Estado: <b>{telemHeader.status}</b></div>
        </div>

        <div className="table">
          <div className="tr head">
            <div>Tipo</div>
            <div>Detalle</div>
            <div>Hora</div>
          </div>

          {eventRows.length > 0 ? (
            eventRows.slice(0, 20).map((l, i) => (
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
          ) : (
            <div className="muted" style={{ padding: 8 }}>Sin eventos</div>
          )}
        </div>
      </div>
    </div>
  );
}
