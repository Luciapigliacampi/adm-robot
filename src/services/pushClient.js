const API = import.meta.env.VITE_API_BASE;
const VAPID_PUBLIC = import.meta.env.VITE_PUSH_PUBLIC_KEY; // setear en .env si vas a usar Web Push

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) output[i] = raw.charCodeAt(i);
  return output;
}

export async function registerSW() {
  if (!("serviceWorker" in navigator)) return null;
  const reg = await navigator.serviceWorker.register("/sw.js");
  return reg;
}

export async function subscribePush(registration) {
  if (!registration) return null;
  if (!("PushManager" in window)) return null;
  if (!VAPID_PUBLIC) {
    console.warn("VITE_PUSH_PUBLIC_KEY no configurada. Saltando Web Push.");
    return null;
  }
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const sub = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC),
  });

  // Enviá la subscription a tu backend
  await fetch(`${API}/api/push/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sub),
  });

  return sub;
}
