// src/services/robots.js
const API = import.meta.env.VITE_API_BASE;
const FALLBACK_DB_ID = import.meta.env.VITE_ROBOT_ID || null;

/**
 * Intenta traer robots de la API.
 * Debe devolver objetos con: { dbId, name, status, battery }
 */
export async function fetchRobotsFromApi() {

  // 1) Intento real
  try {
    // Ajusta el endpoint si tu backend usa otro (por ejemplo /api/robots/list)
    const res = await fetch(`${API}/api/robots`, { cache: "no-store" });
    if (!res.ok) throw new Error("robots not ok");
    const data = await res.json();

    const arr = Array.isArray(data) ? data : (Array.isArray(data?.robots) ? data.robots : []);
    return arr.map((r) => ({
      dbId: r._id || r.id || r.dbId,
      name: r.name || r.alias || "Robot",
      status: r.status || "Desconocido",
      battery: r.battery ?? null,
    }));
  } catch {
    // Fallback: 1 robot real si tenés VITE_ROBOT_ID
    if (FALLBACK_DB_ID) {
      return [{
        dbId: FALLBACK_DB_ID,
        name: "LiftCore-R1 (Fábrica A)",
        status: "En espera",
        battery: 92,
      }];
    }
    return [];
  }
}
