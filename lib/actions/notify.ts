"use server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

export async function pushTargets() {
  const admin = createAdminClient();
  const { data: tg } = await admin.from("telegram_chats").select("username,active").limit(1).maybeSingle();
  return {
    telegram: (tg as { username: string; active: boolean } | null)?.username ?? "",
    telegramActive: (tg as { username: string; active: boolean } | null)?.active ?? false,
  };
}

export async function setTelegramUsername(username: string) {
  const u = username.trim().replace(/^@/, "").slice(0, 40);
  if (!u) return { ok: false as const };
  const admin = createAdminClient();
  const { data } = await admin.from("telegram_chats").select("id").limit(1).maybeSingle();
  if (data) await admin.from("telegram_chats").update({ username: u }).eq("id", (data as { id: string }).id);
  else await admin.from("telegram_chats").insert({ chat_id: "pending", username: u, active: false });
  return { ok: true as const, connectUrl: `https://t.me/${process.env.NEXT_PUBLIC_TELEGRAM_BOT ?? "maskulino_notif_bot"}?start=bind` };
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
