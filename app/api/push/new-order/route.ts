import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOrderPush } from "@/lib/push-server";

/** Called by the Supabase DB webhook on orders INSERT.
 * Fans out Telegram + Web Push (background alerts, browser off / phone locked). */
export async function POST(req: Request) {
  if (req.headers.get("x-webhook-secret") !== process.env.PUSH_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = await req.json().catch(() => ({}));
  const r = body?.record ?? {};
  const title = `Nouvelle commande ${r.number ?? ""}`;

  const admin = createAdminClient();
  let items: { name: string; size: string; color: string; qty: number; unit_price: number }[] = [];
  try {
    if (r?.id) {
      const { data } = await admin.from("order_items")
        .select("name,size,color,qty,unit_price").eq("order_id", r.id);
      items = ((data ?? []) as typeof items);
    }
  } catch { /* keep header-only */ }
  const lines = items.map(
    (it) => `• ${it.qty}× ${it.name} (${it.size} · ${it.color}) — ${(it.qty * it.unit_price).toLocaleString("fr-DZ")} DA`
  );

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (token) {
    const { data: chats } = await admin.from("telegram_chats").select("chat_id").eq("active", true);
    const totalStr = typeof r.total === "number" ? r.total.toLocaleString("fr-DZ") : (r.total ?? "");
    const text = [`🛍 ${title}`, `${r.customer_name ?? ""} · ${r.customer_phone ?? ""}`, ...lines, `Total: ${totalStr} DA`].join("\n");
    for (const c of ((chats ?? []) as { chat_id: string }[])) {
      if (c.chat_id === "pending") continue;
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ chat_id: c.chat_id, text }),
      }).catch(() => undefined);
    }
  }

  // Background push to every subscribed admin device (works browser closed).
  try {
    if (r.number) {
      await sendOrderPush({
        number: String(r.number),
        client: String(r.customer_name ?? ""),
        phone: String(r.customer_phone ?? ""),
        total: Number(r.total ?? 0),
        items,
      });
    }
  } catch { /* telegram already sent; push is best-effort */ }

  return NextResponse.json({ ok: true });
}
