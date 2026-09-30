"use server";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { getShopContext, getShopCategories, getShopProducts } from "@/lib/storefront";

export async function getShopCategoriesAction() {
  return getShopCategories();
}

export type HeroProduct = {
  slug: string; name: string; price: number; oldPrice?: number; image: string; units: number;
};

/** Produit du hero : le plus vendu (commandes livrées réelles).
 *  Si rien n'est vendu : le produit en ligne au plus gros stock. */
export async function getHeroProduct(): Promise<HeroProduct | null> {
  const admin = createAdminClient();
  try {
    const { data: items } = await admin.from("order_items")
      .select("product_id,qty,orders!inner(status,is_demo)")
      .eq("orders.status", "livree").eq("orders.is_demo", false)
      .not("product_id", "is", null).limit(2000);
    const sales = new Map<string, number>();
    for (const it of ((items ?? []) as { product_id: string; qty: number }[])) {
      sales.set(it.product_id, (sales.get(it.product_id) ?? 0) + it.qty);
    }
    if (sales.size > 0) {
      const topId = [...sales.entries()].sort((a, b) => b[1] - a[1])[0][0];
      const { data: p } = await admin.from("products")
        .select("slug,name,price,old_price,principal_image_url")
        .eq("id", topId).eq("status", "en_ligne").maybeSingle();
      if (p) {
        const pr = p as { slug: string; name: string; price: number; old_price: number | null; principal_image_url: string };
        return {
          slug: pr.slug, name: pr.name, price: pr.price,
          oldPrice: pr.old_price ?? undefined, image: pr.principal_image_url,
          units: sales.get(topId) ?? 0,
        };
      }
    }
  } catch { /* fallback stock */ }
  const all = await getShopProducts().catch(() => []);
  if (!all.length) return null;
  const top = [...all].sort((a, b) => b.totalStock - a.totalStock)[0];
  return { slug: top.slug, name: top.name, price: top.price, oldPrice: top.oldPrice, image: top.image, units: 0 };
}

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
