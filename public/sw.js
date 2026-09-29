/* Maskulino admin push service worker — background order alerts.
 * Shows order notifications even when the tab/browser is closed or the phone is locked.
 * Payload from /api/push/* : { title, body, url, orderId, phone, wa, actions }
 */
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Nouvelle commande", body: (event.data && event.data.text()) || "" };
  }
  const title = data.title || "Nouvelle commande 🛍";
  const body = data.body || "Une nouvelle commande est arrivée.";
  const tag = data.orderId ? String(data.orderId) : "maskulino-order";
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      tag,
      icon: "/icon.svg",
      badge: "/icon.svg",
      requireInteraction: true,
      silent: false,
      vibrate: [250, 120, 250, 120, 400],
      renotify: true,
      actions: Array.isArray(data.actions) ? data.actions.slice(0, 2) : [],
      data: {
        url: data.url || "/imad29052005/orders",
        orderId: data.orderId || null,
        phone: data.phone || "",
        wa: data.wa || "",
      },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const d = event.notification.data || {};
  let url = d.url || "/imad29052005/orders";
  // Action buttons: call opens the dialer with the number ready, WhatsApp jumps to the chat.
  if (event.action === "call" && d.phone) url = "tel:" + d.phone;
  else if (event.action === "whatsapp" && d.wa) url = d.wa;
  event.waitUntil(
    (async () => {
      if (url.startsWith("tel:")) {
        // Dialer: no existing tab can handle it — just open it.
        try {
          await self.clients.openWindow(url);
        } catch {
          /* ignore */
        }
        return;
      }
      const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const c of all) {
        try {
          const u = new URL(c.url);
          if (u.pathname.startsWith("/imad29052005")) {
            await c.navigate(url);
            return c.focus();
          }
        } catch {
          /* ignore */
        }
      }
      return self.clients.openWindow(url);
    })()
  );
});
