// src/hooks/useImageAPI.js
const API = import.meta.env.VITE_API_BASE || "http://localhost:3000";

function normalize(listOrObj) {
  if (!listOrObj) return [];
  if (Array.isArray(listOrObj)) return listOrObj;
  // admite {items:[]}, {images:[]} o similares
  if (Array.isArray(listOrObj.items)) return listOrObj.items;
  if (Array.isArray(listOrObj.images)) return listOrObj.images;
  return [];
}

export function useImageAPI(robotId) {
  const list = async (limit = 9) => {
    const res = await fetch(`${API}/api/images?robotId=${encodeURIComponent(robotId)}&limit=${limit}`);
    const json = await res.json().catch(() => ({}));
    const arr = normalize(json);
    // homogeneizar campos para SnapshotCard/Gallery
    return arr.map(it => ({
      ...it,
      url: it.url || it.path || it.imageUrl || it.data || "",
    }));
  };

  const listAll = async () => {
    const res = await fetch(`${API}/api/images?robotId=${encodeURIComponent(robotId)}`);
    const json = await res.json().catch(() => ({}));
    const arr = normalize(json);
    return arr.map(it => ({
      ...it,
      url: it.url || it.path || it.imageUrl || it.data || "",
    }));
  };

  return { list, listAll };
}
