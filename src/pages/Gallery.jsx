// src/pages/Gallery.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useImageAPI } from "../hooks/useImageAPI";

export default function Gallery() {
  const { robotId } = useParams();
  const api = useImageAPI(robotId);

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(null);

  // 🔎 Filtros
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Carga y orden por fecha (desc)
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const items = await api.listAll();
        const ordered = [...(Array.isArray(items) ? items : [])].sort(
          (a, b) =>
            new Date(b.timestamp || b.createdAt || b.ts || 0) -
            new Date(a.timestamp || a.createdAt || a.ts || 0)
        );
        setImages(ordered);
      } catch (err) {
        console.error("Error al cargar imágenes:", err);
        setImages([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [robotId]);

  // Aplica filtros
  const filteredImages = useMemo(() => {
    const q = search.trim().toLowerCase();
    return images.filter((i) => {
      const label = (i.label || "").toLowerCase();
      const desc = (i.description || "").toLowerCase();
      const matchesSearch = q ? label.includes(q) || desc.includes(q) : true;
      const matchesDate = dateFilter
        ? new Date(i.timestamp || i.createdAt || i.ts || 0)
            .toISOString()
            .slice(0, 10) === dateFilter
        : true;
      return matchesSearch && matchesDate;
    });
  }, [images, search, dateFilter]);

  // Selección inicial / mantener selección válida
  useEffect(() => {
    if (!sel && filteredImages.length > 0) {
      setSel(filteredImages[0]);
    } else if (
      sel &&
      filteredImages.length > 0 &&
      !filteredImages.some((i) => (i._id || i.id) === (sel._id || sel.id))
    ) {
      setSel(filteredImages[0]);
    }
  }, [filteredImages, sel]);

  return (
    <main className="main full-width-images">
      <div
        className="card"
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          gap: 16,
          alignItems: "stretch",
        }}
      >
        {/* Panel izquierdo: historial + filtros */}
        <div
          style={{
            width: 320,
            minWidth: 300,
            maxWidth: "45%",
            overflowY: "auto",
            paddingRight: 8,
            height: "90vh",
          }}
        >
          <div className="card-title">Historial de Imágenes</div>

          {/* Filtros */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginBottom: 12,
              padding: "0 8px",
            }}
          >
            <input
              type="text"
              placeholder="Buscar por descripción..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "6px 10px",
                border: "1px solid #ccc",
                borderRadius: 6,
                fontSize: 14,
              }}
            />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{
                width: "100%",
                padding: "6px 10px",
                border: "1px solid #ccc",
                borderRadius: 6,
                fontSize: 14,
              }}
            />
          </div>

          {loading ? (
            <div className="placeholder-full loading">Cargando…</div>
          ) : filteredImages.length === 0 ? (
            <div className="placeholder-full">Sin imágenes</div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                alignItems: "center",
              }}
            >
              {filteredImages.map((i, idx) => {
                const key = i._id || i.id || idx;
                const when = new Date(
                  i.timestamp || i.createdAt || i.ts || Date.now()
                ).toLocaleString();
                const isSelected =
                  sel && (sel._id || sel.id) === (i._id || i.id);
                return (
                  <div
                    className="image-item"
                    key={key}
                    onClick={() => setSel(i)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      width: 280,
                      cursor: "pointer",
                      padding: 8,
                      borderRadius: 6,
                      background: isSelected
                        ? "rgba(0,0,0,0.08)"
                        : "transparent",
                      transition: "background 0.2s",
                    }}
                  >
                    <div
                      style={{
                        width: 280,
                        height: 160,
                        overflow: "hidden",
                        borderRadius: 6,
                      }}
                    >
                      <img
                        src={i.url || i.imageUrl || i.path || i.src}
                        alt={i.label || ""}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        loading="lazy"
                      />
                    </div>
                    <div style={{ width: "100%", marginTop: 8 }}>
                      <div
                        className="description"
                        style={{ fontSize: 14, marginBottom: 4 }}
                      >
                        {i.label || "Captura"}
                      </div>
                      <div
                        className="muted small"
                        style={{ fontSize: 12, color: "#666" }}
                      >
                        {when}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Panel derecho: imagen seleccionada */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: 32,
            marginLeft: "120px",
            marginRight: "60px",
          }}
        >
          {sel ? (
            <>
              <img
                src={sel.url || sel.imageUrl || sel.path || sel.src}
                alt={sel.label || "Imagen seleccionada"}
                style={{
                  width: "500px",
                  maxWidth: "100%",
                  height: "auto",
                  objectFit: "contain",
                  borderRadius: 8,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  marginBottom: 24,
                }}
              />
              <div>
                <h2 style={{ marginBottom: 8, fontSize: 22, fontWeight: 600 }}>
                  {sel.description || sel.label || "Captura sin descripción"}
                </h2>
                <p style={{ fontSize: 16, color: "#555", margin: 0 }}>
                  {new Date(
                    sel.timestamp || sel.createdAt || sel.ts || Date.now()
                  ).toLocaleString()}
                </p>
              </div>
            </>
          ) : loading ? (
            <div className="placeholder-full loading">Cargando…</div>
          ) : (
            <div className="placeholder-full">
              Seleccione una imagen del historial
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
