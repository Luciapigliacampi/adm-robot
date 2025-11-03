import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useImageAPI } from "../hooks/useImageAPI";
import ImageModal from "../components/ImageModal";

export default function Gallery() {
  const api = useImageAPI();
  const { robotId } = useParams();
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  const limit = 24;

  const fetchPage = async (p = 1) => {
    setLoading(true);
    try {
      const { total, images } = await api.list({ page: p, limit });
      const arr = Array.isArray(images) ? images : [];
const filtered = arr.filter(i => !i.robotId || i.robotId === (robotId || "R1"));
      setTotal(total || filtered.length || arr.length || 0);
      setImages(filtered.length ? filtered : arr);
    } catch (e) {
      console.error(e);
      alert("No se pudo cargar la galería.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPage(page); }, [page]);

  const openModal = (img) => { setSelected(img); setOpen(true); };
  const closeModal = () => setOpen(false);

  const onAnalyze = async (url) => {
    await api.analyze(url);
    // refrescar el seleccionado con la nueva description
    if (selected?._id) {
      const fresh = await api.byId(selected._id);
      setSelected(fresh);
    }
    // refrescar grilla
    fetchPage(page);
  };

  const onScanQR = async (url) => {
    await api.scanQrUrl(url);
    if (selected?._id) {
      const fresh = await api.byId(selected._id);
      setSelected(fresh);
    }
    fetchPage(page);
  };

  const pages = Math.max(1, Math.ceil((total || 0) / limit));

  return (
    <div className="main" style={{ display: "grid", gap: 16 }}>
      <h2>Galería de imágenes</h2>

      {/* Controles */}
      <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>{total} imágenes</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Anterior</button>
          <div style={{ alignSelf: "center" }}>Página {page} / {pages}</div>
          <button className="btn" disabled={page >= pages} onClick={() => setPage((p) => Math.min(pages, p + 1))}>Siguiente</button>
        </div>
      </div>

      {/* Grilla */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 12,
        }}
      >
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card" style={{ height: 160, background: "linear-gradient(90deg,#eee,#f6f6f6,#eee)", animation: "pulse 1.1s infinite linear" }} />
          ))
        ) : images.length === 0 ? (
          <div className="card" style={{ gridColumn: "1 / -1" }}>No hay imágenes.</div>
        ) : (
          images.map((img) => (
            <button
              key={img._id || img.url}
              className="card"
              onClick={() => openModal(img)}
              style={{
                border: "0",
                padding: 8,
                display: "grid",
                gap: 8,
                textAlign: "left",
                cursor: "pointer",
              }}
              title={img.description || ""}
            >
              <div style={{ borderRadius: 12, overflow: "hidden", aspectRatio: "4 / 3", background: "#0b1220" }}>
                <img src={img.url} alt={img.description || "captura"} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
              <div style={{ fontSize: 12, opacity: .75, display: "flex", justifyContent: "space-between" }}>
                <span>{img.type || "—"}</span>
                <span>{img.timestamp ? new Date(img.timestamp).toLocaleString() : "—"}</span>
              </div>
              <div style={{ fontSize: 13, minHeight: 18 }} className="muted">{img.description || "sin descripción"}</div>
            </button>
          ))
        )}
      </div>

      {/* Modal */}
      <ImageModal
        open={open}
        onClose={closeModal}
        image={selected}
        onAnalyze={onAnalyze}
        onScanQR={onScanQR}
      />
    </div>
  );
}
