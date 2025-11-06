// src/pages/Gallery.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ImageModal from "../components/ImageModal";
import { useImageAPI } from "../hooks/useImageAPI";

export default function Gallery() {
  const { robotId } = useParams();
  const api = useImageAPI(robotId);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const items = await api.listAll();
        setImages(items);
      } finally {
        setLoading(false);
      }
    })();
  }, [robotId]);

  return (
    <main className="main full-width-images">
      <div className="card">
        <div className="card-title">Historial de Imágenes</div>
        {loading ? (
          <div className="placeholder-full loading">Cargando…</div>
        ) : images.length === 0 ? (
          <div className="placeholder-full">Sin imágenes</div>
        ) : (
          <div className="image-grid">
            {images.map((i, idx) => (
              <div className="image-item" key={i._id || idx} onClick={() => setSel(i)}>
                <div className="image-box">
                  <img src={i.url} alt={i.label || ""} />
                </div>
                <div className="image-caption">
                  <span className="description">{i.label || "Captura"}</span>
                  <span className="muted small">{new Date(i.createdAt || i.ts || Date.now()).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {sel && <ImageModal image={sel} onClose={() => setSel(null)} />}
    </main>
  );
}
