"use server";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { getShopContext } from "@/lib/storefront";

export async function getShopContextAction() {
  return getShopContext();
}

export async function getActivePromos() {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data } = await supabase.from("promotions")
    .select("code,type,value").eq("active", true).not("code", "is", null);
  return ((data ?? []) as { code: string; type: string; value: number }[]);
}

/** Resolve legacy cart lines (slug+size) to variant ids for createOrder. */
export async function resolveCart(items: { slug: string; size: string; qty: number }[]) {
  const admin = createAdminClient();
  const out: { variant_id: string; qty: number }[] = [];
  for (const it of items.slice(0, 20)) {
    const { data: prod } = await admin.from("products").select("id")
      .eq("slug", it.slug).eq("status", "en_ligne").maybeSingle();
    if (!prod) return { ok: false as const, code: `INDISPONIBLE` };
    const { data: vars } = await admin.from("product_variants")
      .select("id,color,stock").eq("product_id", (prod as { id: string }).id).eq("size", it.size);
    const cands = ((vars ?? []) as { id: string; color: string; stock: number }[])
      .filter((v) => v.stock >= Math.min(it.qty, 10));
    if (!cands.length) return { ok: false as const, code: "RUPTURE" };
    out.push({ variant_id: cands[0].id, qty: Math.min(Math.max(it.qty, 1), 10) });
  }
  return { ok: true as const, items: out };
}

export async function trackOrder(number: string) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const admin = createAdminClient();
  try {
    const { data, error } = await admin.rpc("get_public_tracking", {
      p_number: number.trim(), p_ip: ip,
    });
    if (error || !data) return { ok: false as const };
    return { ok: true as const, order: data as never };
  } catch {
    return { ok: false as const };
  }
}
