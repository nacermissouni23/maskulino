"use server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { dbProductToAdmin } from "@/lib/db-types";
import type { AdminProduct } from "@/lib/admin-data";

const BUCKET = "product-images";

export async function listProductsAdmin(): Promise<AdminProduct[]> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("products")
    .select(`id, slug, name, description, price, old_price, status, principal_image_url, updated_at,
      categories ( name ),
      product_images ( path, color, position ),
      product_variants ( size, color, stock, alert_threshold )`)
    .order("updated_at", { ascending: false }).limit(200);
  if (error || !data) return [];
  return (data as never[]).map((p) => dbProductToAdmin(p as never as Parameters<typeof dbProductToAdmin>[0]));
}

/** Storefront: only sellable carries through RLS (anon-safe). */
export async function listProductsPublic() {
  const supabase = await createClient();
  const { data } = await supabase.from("products")
    .select(`id, slug, name, description, price, old_price, status, principal_image_url,
      categories ( name ),
      product_images ( path, color, position ),
      product_variants ( size, color, stock, alert_threshold )`)
    .eq("status", "en_ligne").order("name").limit(100);
  return (data ?? []) as never[];
}

const imageSchema = z.object({ src: z.string().max(2000000), color: z.string().max(40).default("") });
const variantSchema = z.object({
  size: z.string().min(1).max(10), color: z.string().min(1).max(40),
  stock: z.number().int().min(0).max(9999),
});
const saveSchema = z.object({
  id: z.string().max(40).nullable().default(null),
  name: z.string().trim().min(2).max(120),
  desc: z.string().trim().max(5000).default(""),
  categorie: z.string().trim().min(1).max(60),
  prix: z.number().int().min(1).max(1000000),
  ancienPrix: z.number().int().min(0).max(1000000).nullable().default(null),
  statut: z.enum(["En ligne", "Brouillon", "Rupture"]),
  images: z.array(imageSchema).max(10).default([]),
  variants: z.array(variantSchema).max(200).default([]),
});

function slugify(name: string) {
  return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || `p-${Date.now()}`;
}

export async function saveProduct(input: unknown) {
  const parsed = saveSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, code: "INVALID_INPUT" };
  const v = parsed.data;
  const admin = createAdminClient();

  const { data: cat } = await admin.from("categories").select("id").eq("name", v.categorie).maybeSingle();
  let categoryId: string | null = (cat as { id: string } | null)?.id ?? null;
  if (!categoryId) {
    const { data: created } = await admin.from("categories").insert({ name: v.categorie }).select("id").single();
    categoryId = (created as { id: string } | null)?.id ?? null;
  }

  let productId = v.id;
  const slug = slugify(v.name);
  if (productId) {
    const { error } = await admin.from("products").update({
      name: v.name, description: v.desc, category_id: categoryId, price: v.prix,
      old_price: v.ancienPrix && v.ancienPrix > v.prix ? v.ancienPrix : null,
      status: v.statut === "En ligne" ? "en_ligne" : v.statut === "Rupture" ? "rupture" : "brouillon",
      updated_at: new Date().toISOString(),
    }).eq("id", productId);
    if (error) return { ok: false as const, code: "SAVE_FAILED" };
  } else {
    let trySlug = slug;
    for (let i = 0; i < 5; i++) {
      const { data, error } = await admin.from("products").insert({
        slug: trySlug, name: v.name, description: v.desc, category_id: categoryId,
        price: v.prix, old_price: v.ancienPrix && v.ancienPrix > v.prix ? v.ancienPrix : null,
        status: v.statut === "En ligne" ? "en_ligne" : "brouillon",
      }).select("id").single();
      if (!error && data) { productId = (data as { id: string }).id; break; }
      trySlug = `${slug}-${Date.now().toString(36)}${i}`;
    }
    if (!productId) return { ok: false as const, code: "SAVE_FAILED" };
  }

  // Images: upload data-URLs, keep existing paths, delete removed ones.
  const { data: existing } = await admin.from("product_images").select("id, path").eq("product_id", productId);
  const existingPaths = new Set(((existing ?? []) as { path: string }[]).map((r) => r.path));
  const finalPaths: { path: string; color: string }[] = [];
  for (const img of v.images.slice(0, 10)) {
    if (img.src.startsWith("data:")) {
      const m = img.src.match(/^data:(image\/\w+);base64,(.+)$/);
      if (!m) continue;
      const ext = m[1].includes("png") ? "png" : m[1].includes("webp") ? "webp" : "jpg";
      const path = `products/${productId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await admin.storage.from(BUCKET).upload(path, Buffer.from(m[2], "base64"), {
        contentType: m[1], upsert: false,
      });
      if (error) continue;
      const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path);
      finalPaths.push({ path: pub.publicUrl, color: img.color });
    } else if (img.src) {
      finalPaths.push({ path: img.src, color: img.color });
    }
  }
  for (const old of existingPaths) {
    if (!finalPaths.some((f) => f.path === old) && old.includes("/product-images/")) {
      const key = old.split("/product-images/")[1];
      if (key) await admin.storage.from(BUCKET).remove([key]);
    }
  }
  await admin.from("product_images").delete().eq("product_id", productId);
  if (finalPaths.length) {
    await admin.from("product_images").insert(finalPaths.map((f, i) => ({
      product_id: productId, path: f.path, color: f.color, position: i,
    })));
  }
  await admin.from("products").update({
    principal_image_url: finalPaths[0]?.path ?? "",
  }).eq("id", productId);

  // Variants: full replace from the editor matrix (editor always sends complete state).
  await admin.from("product_variants").delete().eq("product_id", productId);
  if (v.variants.length) {
    await admin.from("product_variants").insert(v.variants.map((x) => ({
      product_id: productId, size: x.size, color: x.color, stock: x.stock, alert_threshold: 5,
    })));
  }
  await admin.from("admin_actions").insert({ action: "save_product", detail: { id: productId, name: v.name } });
  return { ok: true as const, id: productId };
}

export async function setProductStatus(id: string, statut: "En ligne" | "Brouillon") {
  if (!z.string().uuid().safeParse(id).success) return { ok: false as const };
  const admin = createAdminClient();
  const { error } = await admin.from("products").update({
    status: statut === "En ligne" ? "en_ligne" : "brouillon",
  }).eq("id", id);
  return { ok: !error };
}

/** Delete a product with its variants/images. Order history is preserved
 *  (order_items keeps its name/size/color/qty snapshot, links set null).
 *  Refuses only when an order still in the confirmation pipeline
 *  (confirmée → en livraison) references it — deleting its variants would
 *  corrupt the stock restore on cancel/return. Delivered / cancelled /
 *  returned / to-confirm orders are history only and don't block. */
export async function deleteProduct(id: string) {
  if (!z.string().uuid().safeParse(id).success) return { ok: false as const, code: "BAD_ID" };
  const admin = createAdminClient();
  const { data: prod } = await admin.from("products").select("id,name").eq("id", id).maybeSingle();
  if (!prod) return { ok: false as const, code: "NOT_FOUND" };
  const { data: refs } = await admin.from("order_items").select("id,orders!inner(number)")
    .eq("product_id", id).in("orders.status", ["confirmee", "en_preparation", "expediee", "en_livraison"]).limit(1);
  if (refs && refs.length > 0) return { ok: false as const, code: "HAS_ORDERS" };
  // Remove stored images from the bucket (keep external URLs untouched).
  const { data: imgs } = await admin.from("product_images").select("path").eq("product_id", id);
  const keys = ((imgs ?? []) as { path: string }[])
    .map((r) => (r.path.includes("/product-images/") ? r.path.split("/product-images/")[1] : null))
    .filter((k): k is string => !!k);
  if (keys.length) await admin.storage.from(BUCKET).remove(keys);
  const { error } = await admin.from("products").delete().eq("id", id);
  if (error) return { ok: false as const, code: "DELETE_FAILED" };
  await admin.from("admin_actions").insert({
    action: "delete_product",
    detail: { id, name: (prod as { name: string }).name },
  });
  return { ok: true as const };
}

export async function listCategories(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("name").order("sort").order("name");
  return ((data ?? []) as { name: string }[]).map((r) => r.name);
}

export async function addCategory(name: string) {
  const n = name.trim().slice(0, 60);
  if (!n) return { ok: false as const };
  const admin = createAdminClient();
  const { error } = await admin.from("categories").insert({ name: n });
  return { ok: !error };
}

export async function renameCategory(oldName: string, name: string) {
  const n = name.trim().slice(0, 60);
  if (!n) return { ok: false as const };
  const admin = createAdminClient();
  const { error } = await admin.from("categories").update({ name: n }).eq("name", oldName);
  return { ok: !error };
}

export async function deleteCategory(name: string) {
  const admin = createAdminClient();
  const { error } = await admin.from("categories").delete().eq("name", name);
  return { ok: !error };
}
