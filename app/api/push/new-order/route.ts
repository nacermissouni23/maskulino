import { NextResponse } from "next/server";
import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

/** Called by the Supabase DB webhook on orders INSERT. Fans out Web Push + Telegram. */
export async function POST(req: Request) {
  if (req.headers.get("x-webhook-secret") !== process.env.PUSH_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  const r = body?.record ?? {};
  const title = `Nouvelle commande ${r.number ?? ""}`;
  const payload = JSON.stringify({
    title,
    body: `${r.customer_name ?? ""} · ${r.total ?? ""} DA`,
    url: `/imad29052005/orders`,
  });

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? "mailto:contact@maskulino.dz",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  const admin = createAdminClient();
  const { data: subs } = await admin.from("push_subscriptions").select("endpoint,p256dh,auth");
  for (const s of ((subs ?? []) as { endpoint: string; p256dh: string; auth: string }[])) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload);
    } catch (e: unknown) {
      const sc = (e as { statusCode?: number }).statusCode;
      if (sc === 410 || sc === 404) await admin.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
    }
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (token) {
    const { data: chats } = await admin.from("telegram_chats").select("chat_id").eq("active", true);
    const text = `🛍 ${title}\n${r.customer_name ?? ""} · ${r.customer_phone ?? ""}\nTotal: ${r.total ?? ""} DA`;
    for (const c of ((chats ?? []) as { chat_id: string }[])) {
      if (c.chat_id === "pending") continue;
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ chat_id: c.chat_id, text }),
      }).catch(() => undefined);
    }
  }
  return NextResponse.json({ ok: true });
}
