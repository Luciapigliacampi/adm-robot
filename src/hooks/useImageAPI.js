const API = import.meta.env.VITE_API_BASE;

async function j(path, { method = "GET", body, headers } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(headers || {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json().catch(() => ({}));
}

export function useImageAPI() {
  const list = async ({ page = 1, limit = 24 } = {}) =>
    j(`/api/images?page=${page}&limit=${limit}`);

  const analyze = async (url) =>
    j(`/api/images/analyze`, { method: "POST", body: { url } });

  const scanQrUrl = async (url) =>
    j(`/api/images/scan-qr/url`, { method: "POST", body: { url } });

  const byId = async (id) => j(`/api/images/${id}`);

  return { list, analyze, scanQrUrl, byId };
}
