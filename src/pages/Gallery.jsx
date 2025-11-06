import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Image, XCircle, Loader2 } from 'lucide-react';
import useImageAPI from '../hooks/useImageAPI';
import ImageModal from '../components/ImageModal';
import { getRobotAlias } from '../config/robotAliases';
import { isSimulatedRobot } from '../services/robots';

// Array de URLs de imágenes de ejemplo para robots simulados
const DUMMY_IMAGES = [
  'https://picsum.photos/seed/a/800/600',
  'https://picsum.photos/seed/b/800/600',
  'https://picsum.photos/seed/c/800/600',
  'https://picsum.photos/seed/d/800/600',
  'https://picsum.photos/seed/e/800/600',
  'https://picsum.photos/seed/f/800/600',
  'https://picsum.photos/seed/g/800/600',
];

export default function Gallery() {
  const { robotId } = useParams();
  const robotAlias = getRobotAlias(robotId);
  const isSimulated = isSimulatedRobot(robotId);

  // Usa useImageAPI para obtener imágenes (el hook ya sabe cómo obtener la lista completa)
  const { 
    images: realImages, 
    isLoading: isImagesLoading, 
    error: imagesError 
  } = useImageAPI(robotId);

  const [selectedImage, setSelectedImage] = useState(null);

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

  // Define las imágenes a mostrar: reales o simuladas
  const images = isSimulated 
    ? DUMMY_IMAGES.map((url, index) => ({ 
        id: `dummy-${index}`, 
        url: url, 
        timestamp: new Date().toISOString() 
      }))
    : realImages;
  
  const isLoading = isSimulated ? false : isImagesLoading;

  return (
    <main className="main">
      <div className="header">
        <h1 className="robot-title">Galería de Imágenes: {robotAlias}</h1>
      </div>

      <div className="card full-width-images">
        <div className="card-title">Historial Completo de Imágenes</div>
        
        {isLoading && (
          <div className="placeholder-full loading">
            <Loader2 size={32} className="spin" />
            <p>Cargando imágenes...</p>
          </div>
        )}

        {imagesError && (
          <div className="placeholder-full">
            <XCircle size={32} color="var(--err)" />
            <p>Error al cargar las imágenes: {imagesError.message}</p>
          </div>
        )}

        {!isLoading && images && images.length > 0 ? (
          <div className="image-grid">
            {images.map((img, index) => (
              <div 
                key={img.id || index} 
                className="image-item" 
                onClick={() => setSelectedImage(img)}
                style={{ cursor: 'pointer' }}
              >
                <div className="image-box">
                  <img src={img.url} alt={`Captura ${index}`} />
                </div>
                <div className="image-caption">
                  <Image size={16} />
                  <span className="description">
                    {img.timestamp ? new Date(img.timestamp).toLocaleString() : `Imagen #${index + 1}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : !isLoading && (
          <div className="placeholder-full">
            <Image size={48} color="var(--muted)" />
            <p>No se encontraron imágenes para este robot.</p>
          </div>
        )}
      </div>

      {selectedImage && (
        <ImageModal 
          image={selectedImage} 
          onClose={() => setSelectedImage(null)} 
        />
      )}
    </main>
  );
}