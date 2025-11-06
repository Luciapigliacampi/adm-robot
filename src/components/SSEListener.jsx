// src/components/SSEListener.jsx
import { useEffect } from "react";
import { toast } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function SSEListener() {
  useEffect(() => {
    const src = new EventSource(`${API_BASE}/api/stream`);

    src.onopen = () => {
      console.log("✅ Conectado al stream SSE");
      toast.info("🔌 Conectado al stream SSE");
    };

    src.onerror = (e) => {
      console.error("❌ Error SSE", e);
      toast.error("❌ Error en la conexión SSE");
    };

    // Escuchar *todos* los eventos conocidos del backend
    const eventNames = [
      "robot_connected",
      "robot_disconnected",
      "ack_received",
      "robot_error",
      "new_image",
      "telemetry",
      "obstacle_detected",
      "ping",
    ];

    eventNames.forEach((eventName) => {
      src.addEventListener(eventName, (e) => {
        let data;
        try {
          data = JSON.parse(e.data);
        } catch {
          data = e.data;
        }

        console.log(`📡 Evento recibido: ${eventName}`, data);

        toast(
          <div>
            <strong>{eventName}</strong>
            <br />
            <small>{JSON.stringify(data)}</small>
          </div>,
          { type: eventName.includes("error") ? "error" : "info" }
        );
      });
    });

    return () => {
      console.log("🔕 Cerrando conexión SSE");
      src.close();
    };
  }, []);

  return null; // No renderiza nada visible
}
