"use client";

/** Browser-side Web Push helpers for admin background alerts. */

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export function pushSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function getPushState(): Promise<{
  permission: NotificationPermission | "unsupported";
  subscribed: boolean;
}> {
  if (!pushSupported()) return { permission: "unsupported", subscribed: false };
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription().catch(() => null);
    return { permission: Notification.permission, subscribed: !!sub };
  } catch {
    return { permission: Notification.permission, subscribed: false };
  }
}

/** Register /sw.js, ask permission, subscribe with VAPID key, save on server. */
export async function subscribeForOrders(): Promise<{ ok: boolean; code?: string }> {
  if (!pushSupported()) return { ok: false, code: "UNSUPPORTED" };
  const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapid) return { ok: false, code: "NO_VAPID_KEY" };

  const perm = await Notification.requestPermission().catch(() => "default" as NotificationPermission);
  if (perm !== "granted") return { ok: false, code: "DENIED" };

  const reg =
    (await navigator.serviceWorker.getRegistration().catch(() => null)) ??
    (await navigator.serviceWorker.register("/sw.js", { scope: "/" }));

  // If the browser already holds a subscription (same device), reuse it.
  let sub = await reg.pushManager.getSubscription().catch(() => null);
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapid),
    });
  }
  const json = sub.toJSON();
  const res = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      endpoint: sub.endpoint,
      p256dh: json.keys?.p256dh ?? "",
      auth: json.keys?.auth ?? "",
      label: navigator.userAgent.slice(0, 120),
    }),
  }).catch(() => null);
  if (!res || !res.ok) return { ok: false, code: "SAVE_FAILED" };
  try {
    localStorage.setItem("maskulino.notif.granted", "1");
  } catch {
    /* ignore */
  }
  return { ok: true };
}

export async function unsubscribeOrders() {
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription().catch(() => null);
    if (sub) {
      await fetch("/api/push/subscribe", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ endpoint: sub.endpoint }),
      }).catch(() => null);
      await sub.unsubscribe().catch(() => undefined);
    }
  } catch {
    /* ignore */
  }
  try {
    localStorage.removeItem("maskulino.notif.granted");
  } catch {
    /* ignore */
  }
}
