import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { XCircle } from "lucide-react";
import { useImageAPI } from "../hooks/useImageAPI";
import { isSimulatedRobot } from "../services/robots";
import { getRobotAlias } from "../config/robotAliases";

// Array de semillas de imágenes (no URLs finales)
const DUMMY_SEEDS = ["a", "b", "c", "d", "e", "f", "g"];

export default function Gallery() {
  const { robotId } = useParams();
  const api = useImageAPI(robotId);
  const robotAlias = getRobotAlias(robotId) || robotId;

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(null);

  // Filtros
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // 🛑 Placeholder si no hay robot seleccionado
  if (!robotId) {
    return (
      <main className="main">
        <div className="placeholder-full">
          <XCircle size={48} color="var(--warn)" />
          <h1>Selecciona un Robot</h1>
          <p>Debes seleccionar un robot del Dashboard para ver su historial de imágenes.</p>
        </div>
      </main>
    );
  }

  // 🌐 Carga de datos (real o simulado)
  useEffect(() => {
    if (!robotId) return;

    let cancelled = false;
    const isSimulated = isSimulatedRobot(robotId);

    (async () => {
      try {
        setLoading(true);
        let items = [];

        if (isSimulated) {
          // Usa el robotId en el seed para una lista estable por robot
          const seedSuffix = encodeURIComponent(String(robotId));
          items = DUMMY_SEEDS.map((seed, index) => ({
            _id: `dummy-${robotId}-${index}`,
            url: `https://picsum.photos/seed/${seed}${seedSuffix}/800/600`,
            label: `Simulada: ${robotAlias}`,
            description: `Imagen simulada de control de calidad #${index + 1}`,
            timestamp: new Date(Date.now() - index * 3600000).toISOString(),
          }));
        } else {
          items = await api.listAll();
        }

        const ordered = [...items].sort(
          (a, b) =>
            new Date(b.timestamp || b.createdAt || b.ts || 0) -
            new Date(a.timestamp || a.createdAt || a.ts || 0)
        );

        if (!cancelled) setImages(ordered);
      } catch (err) {
        console.error("Error al cargar imágenes:", err);
        if (!cancelled) setImages([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [robotId, api, robotAlias]);

  // Selecciona la primera imagen disponible al cargar / actualizar
  useEffect(() => {
    if (!sel && images.length > 0) setSel(images[0]);
    if (sel && images.length > 0 && !images.some((i) => (i._id || i.id) === (sel._id || sel.id))) {
      setSel(images[0]);
    }
  }, [images, sel]);

  const filteredImages = images.filter((i) => {
    const label = (i.label || "").toLowerCase();
    const desc = (i.description || "").toLowerCase();
    const matchesSearch =
      label.includes(search.toLowerCase()) || desc.includes(search.toLowerCase());
    const matchesDate = dateFilter
      ? new Date(i.timestamp || i.createdAt || i.ts || 0).toISOString().slice(0, 10) === dateFilter
      : true;
    return matchesSearch && matchesDate;
  });

  return (
    <main className="main full-width-images">
      <div className="header">
        <h1 className="robot-title">Galería de Imágenes: {robotAlias}</h1>
      </div>
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
                border: "1px solid var(--border)",
                borderRadius: 6,
                fontSize: 14,
                background: "var(--panel)",
                color: "var(--text)",
              }}
            />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{
                width: "100%",
                padding: "6px 10px",
                border: "1px solid var(--border)",
                borderRadius: 6,
                fontSize: 14,
                background: "var(--panel)",
                color: "var(--text)",
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
                const ts = new Date(i.timestamp || i.createdAt || i.ts || Date.now()).toLocaleString();
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
                      background:
                        sel && (sel._id || sel.id) === (i._id || i.id)
                          ? "rgba(139, 92, 246, 0.15)"
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
                        src={i.url}
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
                      <div className="description" style={{ fontSize: 14, marginBottom: 4 }}>
                        {i.label || "Captura"}
                      </div>
                      <div className="muted small" style={{ fontSize: 12, color: "var(--muted)" }}>
                        {ts}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Panel derecho: Imagen seleccionada */}
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
                src={sel.url}
                alt={sel.label || "Imagen seleccionada"}
                style={{
                  width: "500px",
                  height: "auto",
                  objectFit: "contain",
                  borderRadius: 8,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  marginBottom: 24,
                }}
              />
              <div>
                <h2 style={{ marginBottom: 8, fontSize: 22, fontWeight: 600 }}>
                  {sel.description || "Captura sin descripción"}
                </h2>
                <p style={{ fontSize: 16, color: "var(--muted)", margin: 0 }}>
                  {new Date(sel.timestamp || sel.createdAt || sel.ts || Date.now()).toLocaleString()}
                </p>
              </div>
            </>
          ) : loading ? (
            <div className="placeholder-full loading">Cargando…</div>
          ) : (
            <div className="placeholder-full">Seleccione una imagen del historial</div>
          )}
        </div>
      </div>
    </main>
  );
}
