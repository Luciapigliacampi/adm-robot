// src/pages/Logs.jsx
import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_BASE;

export default function Logs(){
  const [items, setItems] = useState([]);
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
