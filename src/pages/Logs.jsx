// src/pages/Logs.jsx
import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_BASE;

export default function Logs() {
  const [items, setItems] = useState([]);
  const [history, setHistory] = useState([]);

  // Carga “histórico” simulado (puede venir de tu API si lo agregan)
  useEffect(() => {
    // Simulación simple de histórico (errores/avisos, etc.)
    const now = Date.now();
    const mock = Array.from({ length: 20 }).map((_, i) => ({
      ts: now - i * 60_000,
      type: i % 5 === 0 ? "robot_error" : i % 3 === 0 ? "ack_received" : "info",
      data: i % 5 === 0 ? { message: "Reconexion de motor" } : { msg: "Tick" },
    }));
    setHistory(mock);
  }, []);

  // Suscripción SSE en vivo
  useEffect(() => {
    const es = new EventSource(`${API}/api/stream`);

    const safe = (s) => {
      try { return JSON.parse(s); } catch { return s; }
    };
    const push = (type) => (e) => {
      setItems((prev) => [{ type, data: safe(e.data), ts: Date.now() }, ...prev].slice(0, 200));
    };

    es.addEventListener("robot_connected",    push("robot_connected"));
    es.addEventListener("robot_disconnected", push("robot_disconnected"));
    es.addEventListener("ack_received",       push("ack_received"));
    es.addEventListener("robot_error",        push("robot_error"));
    es.addEventListener("new_image",          push("new_image"));

    es.onerror = () => { /* opcional: mostrar estado desconectado */ };

    return () => es.close();
  }, []);

  return (
    <div className="main" style={{ display: "grid", gap: 16 }}>
      <h2>Registros</h2>

      {/* Histórico (simulado) */}
      <div className="card">
        <div className="card-title">Histórico (últimos 20)</div>
        <div className="table">
          <div className="tr head" style={{ display:'grid', gridTemplateColumns:'120px 1fr 140px', gap:12 }}>
            <div>Tipo</div>
            <div>Detalle</div>
            <div>Hora</div>
          </div>
          {history.length === 0 ? (
            <div className="muted" style={{ padding: 8 }}>Sin histórico</div>
          ) : history.map((l, i) => (
            <div key={i} className="tr" style={{ display:'grid', gridTemplateColumns:'120px 1fr 140px', gap:12, padding:'6px 0', borderTop:'1px solid rgba(0,0,0,.06)' }}>
              <div>{l.type}</div>
              <div><pre style={{ margin:0, whiteSpace:'pre-wrap' }}>{JSON.stringify(l.data)}</pre></div>
              <div>{new Date(l.ts).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Eventos en vivo (SSE) */}
      <div className="card">
        <div className="card-title">Eventos en vivo</div>
        <div className="table">
          <div className="tr head" style={{ display:'grid', gridTemplateColumns:'120px 1fr 140px', gap:12 }}>
            <div>Tipo</div>
            <div>Detalle</div>
            <div>Hora</div>
          </div>
          {items.length === 0 ? (
            <div className="muted" style={{ padding: 8 }}>Sin eventos</div>
          ) : items.map((l, i) => (
            <div key={i} className="tr" style={{ display:'grid', gridTemplateColumns:'120px 1fr 140px', gap:12, padding:'6px 0', borderTop:'1px solid rgba(0,0,0,.06)' }}>
              <div>{l.type}</div>
              <div><pre style={{ margin:0, whiteSpace:'pre-wrap' }}>{JSON.stringify(l.data)}</pre></div>
              <div>{new Date(l.ts).toLocaleTimeString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
