// src/components/SnapshotCard.jsx
import React from "react";

/**
 * Acepta:
 *  - images: array de imágenes [{ url | path | imageUrl | data }, ...]
 *  - snapshot: una sola imagen (string u objeto) -> se convierte en [snapshot]
 *  - isLoading: muestra estado de carga
 *  - error: mensaje/objeto de error
 *  - refetch: función opcional para reintentar carga
 */
export default function SnapshotCard({ images, snapshot, isLoading = false, error = null, refetch }) {
  // Normalizamos a una lista única
  const list = images ?? (snapshot ? [snapshot] : []);

  // Helper para obtener el src de cada item (acepta distintos formatos)
  const getSrc = (item) => {
    if (!item) return "";
    if (typeof item === "string") return item; // URL/base64 directa
    return item.url || item.path || item.imageUrl || item.data || "";
  };

  return (
    <div className="card">
      <div className="card-title" style={{ marginBottom: 8 }}>Últimas capturas</div>

      {/* Estados */}
      {isLoading && (
        <div className="muted" style={{ padding: 8 }}>
          Cargando…
        </div>
      )}

      {!isLoading && error && (
        <div style={{ padding: 8, color: "tomato", display: "flex", alignItems: "center", gap: 8 }}>
          <span>Error al cargar imágenes</span>
          {refetch && (
            <button className="btn" onClick={refetch} style={{ padding: "6px 10px" }}>
              Reintentar
            </button>
          )}
        </div>
      )}

      {!isLoading && !error && (!list || list.length === 0) && (
        <div className="muted" style={{ padding: 8 }}>
          Sin imágenes
        </div>
      )}

      {/* Grid de imágenes */}
      {!isLoading && !error && list && list.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {list.slice(0, 3).map((it, idx) => {
            const src = getSrc(it);
            if (!src) return <div key={idx} className="muted" style={{ padding: 8 }}>Sin datos</div>;
            return (
              <img
                key={it?._id || idx}
                src={src}
                alt={it?.label || "snapshot"}
                style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 8 }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
