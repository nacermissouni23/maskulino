import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

/** Stores one browser push subscription per device (endpoint is unique). */

const bodySchema = z.object({
  endpoint: z.string().url().max(2000),
  p256dh: z.string().min(10).max(500),
  auth: z.string().min(5).max(500),
  label: z.string().max(120).default(""),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const admin = createAdminClient();
  const { error } = await admin.from("push_subscriptions").upsert(
    {
      endpoint: parsed.data.endpoint,
      p256dh: parsed.data.p256dh,
      auth: parsed.data.auth,
      label: parsed.data.label,
    },
    { onConflict: "endpoint" }
  );
  if (error) return NextResponse.json({ error: "save_failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { endpoint } = (await req.json().catch(() => ({}))) as { endpoint?: string };
  if (!endpoint) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const admin = createAdminClient();
  await admin.from("push_subscriptions").delete().eq("endpoint", endpoint);
  return NextResponse.json({ ok: true });
}

/** How many devices currently receive background alerts. */
export async function GET() {
  const admin = createAdminClient();
  const { count } = await admin.from("push_subscriptions").select("id", { count: "exact", head: true });
  return NextResponse.json({ count: count ?? 0 });
}
