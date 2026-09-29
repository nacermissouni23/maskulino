import "server-only";
import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

let configured = false;

function vapid() {
  const pub = process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
  const priv = process.env.VAPID_PRIVATE_KEY || "";
  const subject = process.env.VAPID_SUBJECT || "mailto:contact@maskulino.dz";
  return { pub, priv, subject };
}

export function pushConfigured() {
  const { pub, priv } = vapid();
  return pub.length > 20 && priv.length > 10;
}

function ensure() {
  if (configured) return true;
  const { pub, priv, subject } = vapid();
  if (!pub || !priv) return false;
  webpush.setVapidDetails(subject, pub, priv);
  configured = true;
  return true;
}

export type OrderPush = {
  number: string;
  client: string;
  phone: string;
  total: number;
  items: { name: string; size: string; color: string; qty: number; unit_price: number }[];
};

export function orderPushPayload(o: OrderPush) {
  const lines = o.items.map(
    (it) => `• ${it.qty}× ${it.name} (${it.size} · ${it.color}) — ${(it.qty * it.unit_price).toLocaleString("fr-DZ")} DA`
  );
  return {
    title: `Nouvelle commande ${o.number} 🛍`,
    body: [`${o.client} · ${o.phone}`, ...lines, `Total : ${o.total.toLocaleString("fr-DZ")} DA`].join("\n"),
    url: `/imad29052005/orders?order=${encodeURIComponent(o.number)}`,
    orderId: o.number,
  };
}

async function fanOut(payload: unknown) {
  if (!ensure()) return { ok: false as const, code: "NO_VAPID" };
  const admin = createAdminClient();
  const { data } = await admin.from("push_subscriptions").select("endpoint,p256dh,auth");
  const subs = ((data ?? []) as { endpoint: string; p256dh: string; auth: string }[]);
  let sent = 0;
  for (const s of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        JSON.stringify(payload),
        { TTL: 60 * 60 * 24 }
      );
      sent++;
    } catch (e: unknown) {
      const status = (e as { statusCode?: number })?.statusCode;
      if (status === 404 || status === 410) {
        await admin.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
      }
    }
  }
  return { ok: true as const, sent, devices: subs.length };
}

export async function sendOrderPush(o: OrderPush) {
  return fanOut(orderPushPayload(o));
}

export async function sendTestPush() {
  return fanOut({
    title: "Alertes Maskulino activées ✅",
    body: "Son + vibration à chaque commande, même navigateur fermé.",
    url: "/imad29052005/orders",
    orderId: "test",
  });
}
