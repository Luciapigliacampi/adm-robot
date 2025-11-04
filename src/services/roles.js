// Lee roles desde lo que ya guarda tu app cuando valida el token contra tu backend.
// Soporta tanto `userData.role`, `userData.roles` como `userRole` legacy.
export function getRoles() {
  try {
    const arr = [];
    const raw = localStorage.getItem("userData");
    if (raw) {
      const ud = JSON.parse(raw);
      if (ud?.role)  arr.push(ud.role);
      if (Array.isArray(ud?.roles)) arr.push(...ud.roles);
    }
    const single = localStorage.getItem("userRole");
    if (single) arr.push(single);
    return [...new Set(arr.filter(Boolean).map(r => String(r).toLowerCase()))];
  } catch {
    return [];
  }
}

export const isAdmin    = () => getRoles().includes("admin");
export const isOperario = () => getRoles().includes("operario");
