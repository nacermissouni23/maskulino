import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/** Called by the Supabase DB webhook on orders INSERT. Fans out Telegram alerts. */
export async function POST(req: Request) {
  if (req.headers.get("x-webhook-secret") !== process.env.PUSH_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  const r = body?.record ?? {};
  const title = `Nouvelle commande ${r.number ?? ""}`;

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (token) {
    const admin = createAdminClient();
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
