import { useState } from "react";

export default function ImageModal({ open, onClose, image, onAnalyze, onScanQR }) {
  const [busy, setBusy] = useState(false);
  if (!open || !image) return null;

  const handle = async (fn) => {
    try {
      setBusy(true);
      await fn(image.url);
    } catch (e) {
      console.error(e);
      alert("Ocurrió un error. Revisá la consola.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} className="card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <h3 style={{ margin: 0 }}>Imagen</h3>
          <button className="btn" onClick={onClose}>Cerrar</button>
        </div>

        <div style={{ marginTop: 12 }}>
          {/* Imagen */}
          <div style={{ borderRadius: 12, overflow: "hidden", background: "#0b1220" }}>
            <img src={image.url} alt="captura" style={{ width: "100%", display: "block", maxHeight: 420, objectFit: "contain" }} />
          </div>

          {/* Metadatos */}
          <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
            <div><b>Tipo:</b> {image.type || "—"}</div>
            <div><b>Descripción IA:</b> {image.description || "—"}</div>
            <div><b>Fecha:</b> {image.timestamp ? new Date(image.timestamp).toLocaleString() : "—"}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button className="btn" disabled={busy} onClick={() => handle(onAnalyze)}>
            {busy ? "Analizando…" : "Analizar con IA"}
          </button>
          <button className="btn" disabled={busy} onClick={() => handle(onScanQR)}>
            {busy ? "Leyendo…" : "Leer QR"}
          </button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed", inset: 0, background: "rgba(0,0,0,.45)", display: "grid",
  placeItems: "center", zIndex: 1000,
};
const modalStyle = { width: "min(92vw, 980px)" };
