"use server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// ---------- carriers & prices ----------
export type CarrierRow = { id: string; nom: string; actif: boolean; custom: boolean };
export type PriceRow = { home: number; stopdesk: number | null; couvert: boolean };

export async function getCarriers(): Promise<CarrierRow[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("carriers").select("id,name,active,custom").order("name");
  return ((data ?? []) as { id: string; name: string; active: boolean; custom: boolean }[])
    .map((c) => ({ id: c.id, nom: c.name, actif: c.active, custom: c.custom }));
}

export async function getPrices(): Promise<Record<string, Record<number, PriceRow>>> {
  const admin = createAdminClient();
  const { data } = await admin.from("carrier_prices").select("carrier_id,wilaya_code,home,stopdesk,covered");
  const out: Record<string, Record<number, PriceRow>> = {};
  for (const r of ((data ?? []) as { carrier_id: string; wilaya_code: number; home: number; stopdesk: number | null; covered: boolean }[])) {
    (out[r.carrier_id] ??= {})[r.wilaya_code] = { home: r.home, stopdesk: r.stopdesk, couvert: r.covered };
  }
  return out;
}

export async function getPublicPrices() {
  const supabase = await createClient();
  const { data: carriers } = await supabase.from("carriers").select("id,name").eq("active", true);
  const { data: prices } = await supabase.from("carrier_prices")
    .select("carrier_id,wilaya_code,home,stopdesk,covered").eq("covered", true);
  return { carriers: (carriers ?? []) as { id: string; name: string }[], prices: (prices ?? []) as never[] };
}

export async function addCarrierDb(nom: string) {
  const n = nom.trim().slice(0, 40);
  if (!n) return { ok: false as const };
  const id = `c${Date.now().toString(36)}`;
  const admin = createAdminClient();
  const { error } = await admin.from("carriers").insert({ id, name: n, active: true, custom: true });
  if (error) return { ok: false as const };
  const { data: wilayas } = await admin.from("wilayas").select("code");
  const base = await admin.from("carrier_prices").select("wilaya_code,home,stopdesk").eq("carrier_id", "yalidine");
  const baseMap = new Map(((base.data ?? []) as { wilaya_code: number; home: number; stopdesk: number | null }[]).map((r) => [r.wilaya_code, r]));
  const rows = ((wilayas ?? []) as { code: number }[]).map((w) => ({
    carrier_id: id, wilaya_code: w.code,
    home: baseMap.get(w.code)?.home ?? 600, stopdesk: baseMap.get(w.code)?.stopdesk ?? 350, covered: true,
  }));
  await admin.from("carrier_prices").insert(rows);
  return { ok: true as const, id };
}

export async function toggleCarrierDb(id: string) {
  const admin = createAdminClient();
  const { data } = await admin.from("carriers").select("active").eq("id", id).single();
  if (!data) return { ok: false as const };
  const { error } = await admin.from("carriers").update({ active: !(data as { active: boolean }).active }).eq("id", id);
  return { ok: !error };
}

export async function deleteCarrierDb(id: string) {
  if (id === "yalidine" || id === "zr") return { ok: false as const };
  const admin = createAdminClient();
  const { error } = await admin.from("carriers").delete().eq("id", id);
  return { ok: !error };
}

export async function savePricesDb(carrierId: string, rows: Record<number, PriceRow>) {
  const admin = createAdminClient();
  const payload = Object.entries(rows).map(([code, p]) => ({
    carrier_id: carrierId, wilaya_code: Number(code),
    home: Math.max(0, p.home || 0), stopdesk: p.stopdesk == null ? null : Math.max(0, p.stopdesk),
    covered: !!p.couvert,
  }));
  const { error } = await admin.from("carrier_prices").upsert(payload, { onConflict: "carrier_id,wilaya_code" });
  await admin.from("admin_actions").insert({ action: "save_prices", detail: { carrier: carrierId } });
  return { ok: !error };
}

export async function getWilayas(): Promise<{ code: number; name: string }[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("wilayas").select("code,name").order("code");
  return ((data ?? []) as { code: number; name: string }[]);
}

// ---------- shop settings ----------
const settingsSchema = z.object({
  name: z.string().max(60), phone: z.string().max(30), whatsapp: z.string().max(120),
  domain: z.string().max(80), facebook: z.string().max(120), instagram: z.string().max(120),
  tiktok: z.string().max(120), address: z.string().max(120), hours: z.string().max(120),
  hero_title: z.string().max(120).optional(), hero_subtitle: z.string().max(500).optional(),
  pixel_id: z.string().max(30).optional(),
});

export async function getShopSettings() {
  const supabase = await createClient();
  const { data } = await supabase.from("shop_settings").select("*").eq("id", 1).maybeSingle();
  return (data ?? null) as null | Record<string, string>;
}

export async function saveShopSettings(input: unknown) {
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const };
  const admin = createAdminClient();
  const { error } = await admin.from("shop_settings").update(parsed.data).eq("id", 1);
  if (!error) return { ok: true as const };
  // Colonnes hero_*/pixel_id absentes (migrations non appliquées) : on sauve le reste.
  if (/hero_|pixel_id/.test(String(error.message ?? ""))) {
    const { hero_title, hero_subtitle, pixel_id, ...rest } = parsed.data;
    void hero_title; void hero_subtitle; void pixel_id;
    const { error: e2 } = await admin.from("shop_settings").update(rest).eq("id", 1);
    return { ok: !e2 };
  }
  return { ok: false as const };
}

// ---------- campaigns & promos ----------
export async function listCampaigns() {
  const admin = createAdminClient();
  const { data } = await admin.from("campaigns").select("*").order("created_at", { ascending: false });
  return (data ?? []) as never[];
}

export async function saveCampaign(input: { id?: string; nom: string; canal: string; produit: string; depense: number }) {
  const admin = createAdminClient();
  const row = { name: input.nom.slice(0, 80), channel: input.canal, product_slug: input.produit.slice(0, 80), spend: Math.max(0, input.depense || 0) };
  const { error } = input.id
    ? await admin.from("campaigns").update(row).eq("id", input.id)
    : await admin.from("campaigns").insert(row);
  return { ok: !error };
}

export async function listPromos() {
  const admin = createAdminClient();
  const { data } = await admin.from("promotions").select("*").order("created_at", { ascending: false });
  return (data ?? []) as never[];
}

export async function savePromo(input: { nom: string; type: string; valeur: string; debut: string; fin: string; actif: boolean }) {
  const admin = createAdminClient();
  const num = parseInt((input.valeur || "").replace(/\D/g, ""), 10) || 0;
  const { error } = await admin.from("promotions").insert({
    name: input.nom.slice(0, 80),
    type: input.type === "Montant fixe" ? "montant" : "pourcentage",
    value: num, scope: "tous", active: input.actif,
  });
  return { ok: !error };
}

export async function campaignStats() {
  const admin = createAdminClient();
  const { data: orders } = await admin.from("orders")
    .select("campaign_id,status,total").eq("is_demo", false).not("campaign_id", "is", null);
  const agg: Record<string, { commandes: number; confirmees: number; livrees: number; caLivre: number }> = {};
  for (const o of ((orders ?? []) as { campaign_id: string; status: string; total: number }[])) {
    const a = (agg[o.campaign_id] ??= { commandes: 0, confirmees: 0, livrees: 0, caLivre: 0 });
    a.commandes++;
    if (o.status !== "a_confirmer" && o.status !== "annulee") a.confirmees++;
    if (o.status === "livree") { a.livrees++; a.caLivre += o.total; }
  }
  return agg;
}
