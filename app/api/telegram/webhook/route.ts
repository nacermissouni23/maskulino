import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** Telegram Bot API webhook: binds /start to the stored username (one-tap connect). */
export async function POST(req: Request) {
  const secret = new URL(req.url).searchParams.get("secret");
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const update = await req.json().catch(() => null);
  const msg = update?.message;
  const chatId = msg?.chat?.id ? String(msg.chat.id) : null;
  const text: string = msg?.text ?? "";
  if (!chatId) return NextResponse.json({ ok: true });
  const admin = createAdminClient();
  if (text.startsWith("/start")) {
    const username = msg?.from?.username ?? "";
    await admin.from("telegram_chats").upsert(
      { chat_id: chatId, username, active: true },
      { onConflict: "chat_id" }
    );
    const token = process.env.TELEGRAM_BOT_TOKEN!;
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: "✅ Alertes Maskulino activées — tu recevras chaque commande ici." }),
    }).catch(() => undefined);
  }
  return NextResponse.json({ ok: true });
}
