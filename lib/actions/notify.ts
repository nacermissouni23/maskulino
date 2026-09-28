"use server";
import webpush from "web-push";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

function vapid() {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? "mailto:contact@maskulino.dz",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
}

export async function savePushSubscription(sub: unknown, label: string) {
  const parsed = z.object({ endpoint: z.string().url().max(500), keys: z.object({ p256dh: z.string(), auth: z.string() }) })
    .safeParse(sub);
  if (!parsed.success) return { ok: false as const };
  const admin = createAdminClient();
  const { error } = await admin.from("push_subscriptions").upsert({
    endpoint: parsed.data.endpoint, p256dh: parsed.data.keys.p256dh,
    auth: parsed.data.keys.auth, label: label.slice(0, 40),
  }, { onConflict: "endpoint" });
  return { ok: !error };
}

export async function sendTestPush() {
  vapid();
  const admin = createAdminClient();
  const { data } = await admin.from("push_subscriptions").select("endpoint,p256dh,auth");
  let sent = 0;
  for (const s of ((data ?? []) as { endpoint: string; p256dh: string; auth: string }[])) {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        JSON.stringify({ title: "Notifications activées ✅", body: "Tu recevras chaque commande ici.", url: "/imad29052005/orders" })
      );
      sent++;
    } catch (e: unknown) {
      if ((e as { statusCode?: number }).statusCode === 410 || (e as { statusCode?: number }).statusCode === 404) {
        await admin.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
      }
    }
  }
  return { ok: true as const, sent };
}

export async function pushTargets() {
  const admin = createAdminClient();
  const { data: subs } = await admin.from("push_subscriptions").select("id,label,created_at");
  const { data: tg } = await admin.from("telegram_chats").select("username,active").limit(1).maybeSingle();
  return {
    devices: ((subs ?? []) as { id: string; label: string }[]).length,
    telegram: (tg as { username: string; active: boolean } | null)?.username ?? "",
    telegramActive: (tg as { username: string; active: boolean } | null)?.active ?? false,
  };
}

export async function setTelegramUsername(username: string) {
  const u = username.trim().replace(/^@/, "").slice(0, 40);
  if (!u) return { ok: false as const };
  const admin = createAdminClient();
  const { data } = await admin.from("telegram_chats").select("id,chat_id").limit(1).maybeSingle();
  if (data) await admin.from("telegram_chats").update({ username: u }).eq("id", (data as { id: string }).id);
  else await admin.from("telegram_chats").insert({ chat_id: "pending", username: u, active: false });
  return { ok: true as const, connectUrl: `https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT ?? "MaskulinoOrdersBot"}?start=bind` };
}

export async function sendTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { ok: false as const, code: "NO_BOT" };
  const admin = createAdminClient();
  const { data } = await admin.from("telegram_chats").select("chat_id").eq("active", true);
  let sent = 0;
  for (const c of ((data ?? []) as { chat_id: string }[])) {
    if (c.chat_id === "pending") continue;
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: c.chat_id, text }),
    });
    if (r.ok) sent++;
  }
  return { ok: true as const, sent };
}

export async function sendTestTelegram() {
  return sendTelegram("✅ Alertes Maskulino activées — test OK. Tu recevras chaque commande ici.");
}
