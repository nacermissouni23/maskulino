/* Maskulino push service worker: order alerts only. */
self.addEventListener("push", (event) => {
  let data = { title: "Nouvelle commande", body: "", url: "/imad29052005/orders" };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch { /* keep defaults */ }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: data.url,
      renotify: true,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/imad29052005/orders";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if ("focus" in c) { c.focus(); if ("navigate" in c) return c.navigate(url); return; }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
