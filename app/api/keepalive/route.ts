import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Daily heartbeat: a real Postgres read so Free-tier projects never idle-pause. */
export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.KEEPALIVE_SECRET ?? "dev"}`) {
    const url = new URL(req.url);
    if (url.searchParams.get("key") !== (process.env.KEEPALIVE_SECRET ?? "dev")) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  }
  try {
    const supabase = await createClient();
    await supabase.from("shop_settings").select("id").eq("id", 1).maybeSingle();
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
