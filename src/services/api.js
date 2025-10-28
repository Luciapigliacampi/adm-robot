// ...ya tenés API_BASE definido en este archivo...
const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

// GET /api/robots  → lista todos los robots (cuando el backend lo tenga)
export async function getRobots() {
  try {
    const r = await fetch(`${API_BASE}/api/robots`, { cache: "no-store" });
    if (!r.ok) throw new Error("robots not ok");
    const data = await r.json();
    // normaliza a {_id, name}
    return (Array.isArray(data) ? data : []).map(x => ({
      _id: x._id || x.id,
      name: x.name || x.model || "Robot",
    })).filter(r => r._id);
  } catch {
    return []; // si falla, devolvemos lista vacía
  }
}
