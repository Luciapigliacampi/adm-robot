// src/pages/Logs.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // 👈 Importar para obtener el robotId

const API = import.meta.env.VITE_API_BASE;

export default function Logs() {
  const { robotId } = useParams(); // 👈 Obtener el ID del robot seleccionado
  const [items, setItems] = useState([]);
  const [history, setHistory] = useState([]);

  // Carga logs históricos: real para el robot principal, simulado para otros
  useEffect(() => {
    // Suponemos que el robot real tiene el ID "R1" o el ID de la BD
    // En RobotSelector.jsx, los robots simulados son R2 y R3, y el real es R1.
    const isSimulated = robotId && robotId !== "R1"; 

    if (isSimulated) {
      // 🟢 SIMULACIÓN para robots R2, R3 (Logs también simulados)
      const now = Date.now();
      const mock = Array.from({ length: 20 }).map((_, i) => ({
        ts: now - i * 60_000,
        type: i % 5 === 0 ? "robot_error" : i % 3 === 0 ? "ack_received" : "info",
        // Personalizamos el mensaje simulado
        data: i % 5 === 0 ? { message: `Simulacion: Reconexion de motor en ${robotId}` } : { msg: `Simulacion: Tick en ${robotId}` },
      }));
      setHistory(mock);
    } else {
      // 🚀 REAL: Carga del robot principal (R1 o el ID real)
      (async () => {
        try {
          // Llama al endpoint real. Se agrega robotId para que el backend filtre (práctica recomendada)
          const fetchUrl = `${API}/api/logs${robotId ? `?robotId=${robotId}` : ''}`;
          const res = await fetch(fetchUrl);
          const data = await res.json();
          
          if (Array.isArray(data?.logs)) {
            // Mapea los datos del backend (l.timestamp, l.level, l.message)
            setHistory(data.logs.slice(0, 20).map(l => ({
              ts: new Date(l.timestamp).getTime(),
              type: l.level || 'info',
              data: l.message || JSON.stringify(l.robotStatus || l.data),
            })));
          } else {
            setHistory([]);
          }
        } catch (e) {
          console.error(`Error cargando logs históricos para ${robotId}:`, e);
          setHistory([]);
        }
      })();
    }
  }, [robotId]); // 👈 Dependencia en robotId para recargar al cambiar de robot

  // Suscripción SSE en vivo (Mantenemos la suscripción global, aunque idealmente
  // el backend debería enviar eventos filtrados por el robot seleccionado).
  useEffect(() => {
    // Si tienes un backend capaz de filtrar el stream, usa un path como
    // `/api/stream?robotId=${robotId}` y agrega robotId a las dependencias.
    // Por ahora, usamos el stream general:
    const es = new EventSource(`${API}/api/stream`); 

    const safe = (s) => {
      try { return JSON.parse(s); } catch { return s; }
    };
    const push = (type) => (e) => {
      // Aquí se debería filtrar `e.data` por robotId si el stream no está filtrado
      setItems((prev) => [{ type, data: safe(e.data), ts: Date.now() }, ...prev].slice(0, 200));
    };

    es.addEventListener("robot_connected",    push("robot_connected"));
    es.addEventListener("robot_disconnected", push("robot_disconnected"));
    es.addEventListener("ack_received",       push("ack_received"));
    es.addEventListener("robot_error",        push("robot_error"));
    es.addEventListener("new_image",          push("new_image"));

    es.onerror = () => { /* opcional: mostrar estado desconectado */ };

    return () => es.close();
  }, []); // El SSE no depende de robotId para mantener la conexión constante.

  return (
    <div className="main" style={{ display: "grid", gap: 16 }}>
      <h2>Registros</h2>

      {/* Histórico (simulado/real) */}
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