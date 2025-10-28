// src/services/robots.js
const API = import.meta.env.VITE_API_BASE || "http://localhost:3000";
const DB_ROBOT_ID = import.meta.env.VITE_ROBOT_ID || "68faa22f17d51b1089c1f1d5";

/**
 * Normaliza robots venidos del backend a la forma que usa el selector.
 * Acepta campos típicos: _id, id, name, alias, status, battery
 */
function normalize(robot) {
  const id = robot._id || robot.id || "unknown";
  return {
    id,                          // usamos el _id como id de navegación
    dbId: id,                    // guardamos explícito el id de Mongo
    name: robot.name || robot.alias || "Robot",
    status: robot.status || "En espera",
    battery: Number.isFinite(robot.battery) ? robot.battery : 100,
  };
}

/**
 * Intenta pedir robots reales; si falla, devuelve 3 mockeados
 * (1 atado al ID real de Mongo, 2 de ejemplo).
 */
export async function fetchRobotsFromApi() {

  // 1) Intento real
  try {
    const res = await fetch(`${API}/api/robots`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      const arr = Array.isArray(data) ? data : data?.robots || [];
      if (arr.length) return arr.map(normalize);
    }
  } catch {
    // silencio y caemos al mock
  }

  // 2) Fallback: 3 robots (uno usando el ID real de la DB)
  return [
    {
      id: DB_ROBOT_ID,           // navegaremos con este id
      dbId: DB_ROBOT_ID,         // por si luego querés persistir alias
      name: "LiftCore-R1 (Fábrica A)",
      status: "En espera",
      battery: 92,
    },
    {
      id: "R2",
      name: "LiftCore-R2 (Almacén B)",
      status: "En ruta",
      battery: 65,
    },
    {
      id: "R3",
      name: "ForkBot-3 (Taller)",
      status: "Inactivo",
      battery: 40,
    },
  ];
}
