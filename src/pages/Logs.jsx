// src/pages/Logs.jsx
import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_BASE;

useEffect(() => {
    const es = new EventSource(`${API}/api/stream`);
    const push = (type) => (e) => setItems(prev => [{ type, data: safe(e.data), ts: Date.now() }, ...prev].slice(0,200));
    es.addEventListener("robot_connected",   push("robot_connected"));
    es.addEventListener("robot_disconnected",push("robot_disconnected"));
    es.addEventListener("ack_received",      push("ack_received"));
    es.addEventListener("robot_error",       push("robot_error"));
    es.addEventListener("new_image",         push("new_image"));
    es.onerror = () => {}; // opcional
    return () => es.close();
  }, []);

export default function Logs(){
  const [items, setItems] = useState([]);
  const [history, setHistory] = useState([]);
  // mini simulador de histórico (10 puntos)
  useEffect(() => {
    const baseB = 70 + Math.random()*20;
    const baseV = 0.2 + Math.random()*0.3;
    const baseD = 10  + Math.random()*20;
    const rows = Array.from({length:10}, (_,i) => ({
      ts: Date.now() - (10-i)*3600*1000,
      battery: Math.max(5, Math.round(baseB - (10-i))),
      speedKmh: +(baseV + i*0.05).toFixed(2),
      distanceKmTotal: +(baseD + i*0.3).toFixed(1),
    }));
    setHistory(rows);
  }, []);
  useEffect(() => {
    const es = new EventSource(`${API}/api/stream`);
    const add = (type) => (e) => setItems((prev) => [{ type, data: safe(e.data), ts: Date.now() }, ...prev].slice(0, 200));
    es.addEventListener('robot_error', add('robot_error'));
    es.addEventListener('robot_connected', add('robot_connected'));
    es.addEventListener('robot_disconnected', add('robot_disconnected'));
    es.addEventListener('ack_received', add('ack_received'));
    return () => es.close();
  }, []);
  return (
    <div className="main" style={{ display:'grid', gap:12 }}>
      <h2>Registros</h2>

<div className="card">
        <div className="muted" style={{ marginBottom:8 }}>Histórico (batería / km / velocidad)</div>
        <table className="table">
          <thead><tr><th>Fecha</th><th>Batería %</th><th>Vel. km/h</th><th>Dist. km</th></tr></thead>
          <tbody>
            {history.map((r,i)=>(
              <tr key={i}>
                <td>{new Date(r.ts).toLocaleString()}</td>
                <td>{r.battery}</td>
                <td>{r.speedKmh}</td>
                <td>{r.distanceKmTotal}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="tr head" style={{display:'grid', gridTemplateColumns:'160px 1fr 160px', fontWeight:700, padding:'8px 0'}}>
          <div>Tipo</div><div>Detalle</div><div>Hora</div>
        </div>
        {items.length === 0 ? (
          <div className="muted" style={{ padding: 8 }}>Sin eventos</div>
        ) : items.map((l, i) => (
          <div key={i} className="tr" style={{display:'grid', gridTemplateColumns:'160px 1fr 160px', padding:'6px 0', borderTop:'1px solid rgba(0,0,0,.06)'}}>
            <div>{l.type}</div>
            <div><pre style={{ margin:0, whiteSpace:'pre-wrap' }}>{JSON.stringify(l.data)}</pre></div>
            <div>{new Date(l.ts).toLocaleTimeString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
function safe(s){ try { return JSON.parse(s); } catch { return s; } }
