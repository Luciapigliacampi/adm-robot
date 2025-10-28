// Versión simple: muestra notificación cuando llega un push desde el servidor.
self.addEventListener("push", (event) => {
  try {
    const data = event.data?.json() || {};
    const title = data.title || "Notificación";
    const body = data.body || "";
    event.waitUntil(
      self.registration.showNotification(title, {
        body,
        icon: "/icon-192.png",        // agrega un icono en public/ si querés
        badge: "/icon-192.png",
        data: data.data || {},
      })
    );
  } catch (e) {
    event.waitUntil(
      self.registration.showNotification("Notificación", { body: "Nuevo evento" })
    );
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification?.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
