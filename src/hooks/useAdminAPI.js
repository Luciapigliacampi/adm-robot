const API = import.meta.env.VITE_API_BASE;

async function j(path, { method = "GET", body, headers } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(headers || {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.headers.get("content-type")?.includes("application/json")
    ? res.json()
    : {};
}

export default function useAdminAPI() {
  return {
    // Users & Roles
    listUsers: ({ q = "", page = 1, limit = 20 } = {}) =>
      j(`/api/users?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`),
    updateUserRole: (id, role) =>
      j(`/api/users/${id}/role`, { method: "PATCH", body: { role } }),

    // Config
    getConfig: () => j(`/api/config`),
    saveConfig: (data) => j(`/api/config`, { method: "PATCH", body: data }),
  };
}
