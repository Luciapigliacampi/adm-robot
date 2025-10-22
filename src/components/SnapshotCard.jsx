import React from "react";
import { Camera, QrCode, ArrowRight, Waypoints, Loader2, RefreshCw } from "lucide-react";

const getIconAndClass = (type) => {
    switch (type) {
        case 'qr': return { Icon: QrCode, color: 'var(--ok)' };
        case 'sign': return { Icon: ArrowRight, color: 'var(--warn)' };
        case 'sse': return { Icon: Camera, color: 'var(--accent)' };
        default: return { Icon: Waypoints, color: 'var(--muted)' };
    }
}

export default function SnapshotCard({ images = [], isLoading, error, refetch }) {
    
    return (
        <div className="card full-width-images">
            <div className="card-title">
                Historial de Imágenes & Análisis de Objetos ({images.length} capturas)
                {error && <span className="error-message">Error: {error}</span>}
                {/* Botón de Refrescar (solo se habilita si no está cargando) */}
                <button className="refresh-btn" onClick={refetch} disabled={isLoading} title="Recargar Historial">
                    <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                </button>
            </div>
            
            {isLoading && (
                <div className="placeholder-full loading">
                    <Loader2 size={48} className="animate-spin" color="var(--accent)" />
                    <p className="muted">Cargando historial de imágenes desde la base de datos...</p>
                </div>
            )}

            {!isLoading && images.length === 0 ? (
                <div className="placeholder-full">
                    <Camera size={48} color="var(--muted)" /> 
                    <p className="muted">No hay imágenes capturadas para este robot.</p>
                </div>
            ) : (
                <div className="image-grid">
                    {images.map((img, index) => {
                        const { Icon, color } = getIconAndClass(img.type);

                        return (
                            <div key={index} className="image-item">
                                <div className="image-box">
                                    <img 
                                        src={img.url} 
                                        alt={img.description} 
                                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/800x600/4a5568/ffffff?text=Error"; }}
                                    />
                                </div>
                                <div className="image-caption">
                                    <Icon size={16} color={color} style={{ minWidth: 16 }}/>
                                    <span className="description">{img.description}</span>
                                    <span className="timestamp muted small">
                                        {new Date(img.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
