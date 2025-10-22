import { useEffect, useRef, useState, useCallback } from "react";

const API_BASE = "http://localhost:3000"; 
const SSE_BASE_URL = `${API_BASE}/api/status/stream`;

// Hook que recibe el robotId seleccionado
export default function useAdminSSE(robotId) {
  const esRef = useRef(null);
  const hbRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [latencyMs, setLatencyMs] = useState(null);

  const [telemetry, setTelemetry] = useState(null); 
  const [snapshot, setSnapshot] = useState(null); 
  
  // Excluidos del panel, pero mantenidos para estructura
  const [series] = useState([]); 
  const [logs] = useState([]); 

  const measureLatency = useCallback(async () => {
    if (!robotId) return;
    const t0 = Date.now();
    try {
      await fetch(`${API_BASE}/health`, { cache: "no-store" });
      setLatencyMs(Date.now() - t0);
    } catch {
      setLatencyMs(null);
    }
  }, [robotId]);

  useEffect(() => {
    // No conectarse si no hay robot seleccionado
    if (!robotId) return;
    
    // Conectamos a la URL específica del robot
    // NOTA: El back-end debe leer el query parameter "robotId"
    const sseUrl = `${SSE_BASE_URL}?robotId=${robotId}`;
    const es = new EventSource(sseUrl, { withCredentials: false });
    esRef.current = es;
    
    // Limpiamos los estados al cambiar de robot
    setTelemetry(null);
    setSnapshot(null);

    const onOpen = () => { 
      setConnected(true); 
      measureLatency(); 
    };

    const onError = () => { 
      setConnected(false); 
    };

    const onTelemetry = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        
        // Asumimos que la telemetría incluye el robotId, si no, se procesa
        if (data.robotId === robotId || !data.robotId) { 
            setTelemetry(data);
            
            // Simulación de instantánea (si la telemetría incluye URL)
            if (data.snapshotUrl) {
                setSnapshot({
                    url: data.snapshotUrl,
                    description: data.imageDesc || data.currentTask || 'Imagen capturada',
                    ts: data.timestamp || Date.now(),
                });
            }
        }
      } catch (e) {
        console.error("Error parsing telemetry:", e);
      }
    };

    es.addEventListener("open", onOpen);
    es.addEventListener("error", onError);
    es.addEventListener("telemetry", onTelemetry);

    // Medir latencia cada 10s
    const id = setInterval(measureLatency, 10000);

    return () => {
      if (id) clearInterval(id);
      es.removeEventListener("open", onOpen);
      es.removeEventListener("error", onError);
      es.removeEventListener("telemetry", onTelemetry);
      try { es.close(); } catch {}
    };
  }, [robotId, measureLatency]);

  return { connected, latencyMs, telemetry, snapshot, series, logs }; 
}