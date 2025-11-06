// src/services/robots.js
const API = import.meta.env.VITE_API_BASE || "";
const FALLBACK_DB_ID = import.meta.env.VITE_ROBOT_ID || null;

export const robotsById = {
  R1:   { id: "R1", simulated: false },
  SIM1: { id: "SIM1", simulated: true  },
  SIM2: { id: "SIM2", simulated: true  },
};

export function isSimulatedRobot(robotId) {
  if (!robotId) return false;
  const idStr = String(robotId);
  const fromId = /^sim/i.test(idStr);
  const fromCatalog = Boolean(robotsById?.[idStr]?.simulated);
  return fromId || fromCatalog;
}

async function fetchFirstOk(urls) {
  for (const u of urls) {
    try {
      const res = await fetch(u, { cache: "no-store" });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // probar siguiente
    }
  }
  throw new Error("no-robots-endpoint");
}

/**
 * Devuelve objetos { dbId, name, status, battery }
 */
export async function fetchRobotsFromApi() {
  try {
    const base = API || ""; // permite proxy vite si no hay API
    const candidates = [
      `${base}/api/robots`,
      `${base}/api/robots/list`,
      `${base}/robots`,
      `${base}/robots/list`,
    ];

    const data = await fetchFirstOk(candidates);

    const arr = Array.isArray(data)
      ? data
      : (Array.isArray(data?.robots) ? data.robots : []);

    return arr.map((r) => ({
      dbId:    r._id || r.id || r.dbId,
      name:    r.name || r.alias || "Robot",
      status:  r.status || "Desconocido",
      battery: r.battery ?? null,
    }));
  } catch {
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
