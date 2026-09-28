import { createClient } from "@/lib/supabase/server";

/** Boutique-facing product: variants flattened for the size/color pickers. */
export type ShopProduct = {
  id: string;
  slug: string;
  name: string;
  category: string; // slug, for ?cat= filters
  categoryName: string;
  price: number;
  oldPrice?: number;
  desc: string;
  image: string;
  gallery: { src: string; color: string }[];
  sizes: string[];
  colors: string[];
  stock: Record<string, Record<string, number>>; // size -> color -> qty
  variantId: Record<string, Record<string, string>>; // size -> color -> uuid
  totalStock: number;
};

export type ShopContext = {
  carriers: { id: string; nom: string }[];
  prices: Record<string, Record<number, { home: number; stopdesk: number | null; couvert: boolean }>>;
  wilayas: { code: number; name: string }[];
};

type Row = {
  id: string; slug: string; name: string; description: string; price: number;
  old_price: number | null; principal_image_url: string;
  categories: { name: string; slug: string } | null;
  product_images: { path: string; color: string; position: number }[];
  product_variants: { id: string; size: string; color: string; stock: number }[];
};

function mapRow(r: Row): ShopProduct {
  const imgs = [...(r.product_images ?? [])].sort((a, b) => a.position - b.position);
  const gallery = imgs.length ? imgs.map((i) => ({ src: i.path, color: i.color })) : [{ src: r.principal_image_url, color: "" }];
  const sizes: string[] = [];
  const colors: string[] = [];
  const stock: ShopProduct["stock"] = {};
  const variantId: ShopProduct["variantId"] = {};
  let total = 0;
  for (const v of r.product_variants ?? []) {
    if (!sizes.includes(v.size)) sizes.push(v.size);
    if (!colors.includes(v.color)) colors.push(v.color);
    (stock[v.size] ??= {})[v.color] = v.stock;
    (variantId[v.size] ??= {})[v.color] = v.id;
    total += v.stock;
  }
  return {
    id: r.id, slug: r.slug, name: r.name,
    category: r.categories?.slug ?? "", categoryName: r.categories?.name ?? "",
    price: r.price, oldPrice: r.old_price ?? undefined, desc: r.description,
    image: r.principal_image_url || gallery[0]?.src || "",
    gallery, sizes, colors, stock, variantId, totalStock: total,
  };
}

const SELECT = `id,slug,name,description,price,old_price,principal_image_url,
  categories ( name, slug ),
  product_images ( path, color, position ),
  product_variants ( id, size, color, stock )`;

export async function getShopProducts(): Promise<ShopProduct[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("products").select(SELECT)
    .eq("status", "en_ligne").order("name").limit(100);
  return ((data ?? []) as unknown as Row[]).map(mapRow);
}

export async function getShopProduct(slug: string): Promise<ShopProduct | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("products").select(SELECT)
    .eq("slug", slug).eq("status", "en_ligne").maybeSingle();
  if (!data) return null;
  return mapRow(data as unknown as Row);
}

export async function getShopContext(): Promise<ShopContext> {
  const supabase = await createClient();
  const [{ data: carriers }, { data: prices }, { data: wilayas }, { data: cats }] = await Promise.all([
    supabase.from("carriers").select("id,name").eq("active", true).order("name"),
    supabase.from("carrier_prices").select("carrier_id,wilaya_code,home,stopdesk,covered").eq("covered", true),
    supabase.from("wilayas").select("code,name").order("code"),
    supabase.from("categories").select("name,slug").order("name"),
  ]);
  const table: ShopContext["prices"] = {};
  for (const r of ((prices ?? []) as { carrier_id: string; wilaya_code: number; home: number; stopdesk: number | null; covered: boolean }[])) {
    (table[r.carrier_id] ??= {})[r.wilaya_code] = { home: r.home, stopdesk: r.stopdesk, couvert: r.covered };
  }
  void cats;
  return {
    carriers: ((carriers ?? []) as { id: string; name: string }[]).map((c) => ({ id: c.id, nom: c.name })),
    prices: table,
    wilayas: ((wilayas ?? []) as { code: number; name: string }[]),
  };
}

export async function getShopCategories(): Promise<{ slug: string; name: string }[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("name,slug").order("name");
  return ((data ?? []) as { name: string; slug: string | null }[]).map((c) => ({
    slug: c.slug ?? c.name.toLowerCase(), name: c.name,
  }));
}

export async function coveredWilayaCount(): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase.from("carrier_prices").select("wilaya_code")
    .eq("covered", true);
  return new Set(((data ?? []) as { wilaya_code: number }[]).map((r) => r.wilaya_code)).size;
}
