import { useState, useEffect, useCallback } from 'react';
const API_BASE = import.meta.env.VITE_API_BASE;

export const useImageAPI = (robotId) => {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchImages = useCallback(async () => {
    if (!robotId) { setImages([]); return; }
    setIsLoading(true); setError(null);
    try {
      // Opción Mongo:
      const res = await fetch(`${API_BASE}/api/robot/image?robotId=${encodeURIComponent(robotId)}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Error al cargar imágenes');
      const data = await res.json();
      setImages((data.images || []).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)));

      // Opción simulada (si preferís usar el webhook en memoria):
      // const res = await fetch(`${API_BASE}/api/webhook/images`, { cache: 'no-store' });
      // const data = await res.json();
      // setImages((data.storedImages || []).sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)));

    } catch (e) {
      console.error('Fetch Images Error:', e);
      setError('No se pudieron cargar las imágenes históricas.');
    } finally {
      setIsLoading(false);
    }
  }, [robotId]);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  return { images, isLoading, error, refetch: fetchImages };
};
