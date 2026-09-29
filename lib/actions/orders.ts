"use server";
import { z } from "zod";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { STATUS_DB, STATUS_LABEL, dbOrderToAdmin } from "@/lib/db-types";
import type { AdminOrder, AdminOrderStatus } from "@/lib/admin-data";

const phoneRe = /^0(5|6|7)[0-9]{8}$/;
const normPhone = (p: string) => {
  const d = (p || "").replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("213")) return "0" + d.slice(3);
  return d;
};

const createOrderSchema = z.object({
  name: z.string().trim().min(3).max(80),
  phone: z.string().transform(normPhone).refine((v) => phoneRe.test(v), "BAD_PHONE"),
  wilaya: z.number().int().min(1).max(69),
  commune: z.string().trim().min(1).max(80),
  address: z.string().trim().max(200).default(""),
  landmark: z.string().trim().max(200).default(""),
  delivery: z.enum(["domicile", "stopdesk"]),
  carrier: z.string().min(1).max(40),
  items: z.array(z.object({ variant_id: z.string().uuid(), qty: z.number().int().min(1).max(10) })).min(1).max(20),
  source: z.enum(["facebook", "instagram", "tiktok", "whatsapp", "direct", "autre"]).default("direct"),
  campaign: z.string().max(80).default(""),
  promo: z.string().max(20).default(""),
  idempotency: z.string().max(64).default(""),
});

export async function createOrder(input: unknown) {
  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, code: "INVALID_INPUT" };
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("create_order", {
    p_name: parsed.data.name,
    p_phone: parsed.data.phone,
    p_wilaya: parsed.data.wilaya,
    p_commune: parsed.data.commune,
    p_address: parsed.data.address,
    p_landmark: parsed.data.landmark,
    p_delivery: parsed.data.delivery,
    p_carrier: parsed.data.carrier,
    p_items: parsed.data.items,
    p_source: parsed.data.source,
    p_campaign: parsed.data.campaign || null,
    p_promo: parsed.data.promo || null,
    p_idempotency: parsed.data.idempotency || null,
    p_ip: ip,
  });
  if (error) {
    const msg = error.message ?? "";
    const code = msg.includes("RUPTURE")
      ? `RUPTURE:${msg.split(":").slice(1).join(":")}`
      : ["BAD_PHONE", "BAD_NAME", "EMPTY_CART", "BAD_VARIANT", "BAD_QTY", "NOT_SELLABLE", "NON_COUVERT", "RATE_LIMITED"].find((c) => msg.includes(c)) ?? "FAILED";
    return { ok: false as const, code };
  }
  return { ok: true as const, number: data.number as string, total: data.total as number };
}

const ORDER_SELECT = `
  id, number, customer_phone, customer_name, wilaya_code, commune, address, landmark,
  subtotal, discount, delivery_fee, total, delivery_type, carrier_id, tracking,
  source, campaign_id, status, payment_status, note, created_at,
  wilayas ( name ), campaigns ( name ),
  order_items ( name, size, color, qty, unit_price, products ( principal_image_url ) ),
  order_events ( from_status, to_status, meta, created_at )
`;

export async function listOrders(limit = 200): Promise<AdminOrder[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders").select(ORDER_SELECT).eq("is_demo", false)
    .order("created_at", { ascending: false }).limit(limit);
  if (error || !data) return [];
  return (data as never[]).map((o) => dbOrderToAdmin(o as never as Parameters<typeof dbOrderToAdmin>[0]));
}

async function orderIdByNumber(admin: ReturnType<typeof createAdminClient>, number: string) {
  const { data } = await admin.from("orders").select("id").eq("number", number).maybeSingle();
  return (data as { id: string } | null)?.id ?? null;
}

const moveSchema = z.object({
  orderNumber: z.string().max(20),
  to: z.enum(["À confirmer", "Confirmée", "En préparation", "Expédiée", "En livraison", "Livrée", "Annulée", "Retournée"] as [AdminOrderStatus, ...AdminOrderStatus[]]),
  carrier: z.string().max(40).optional(),
  tracking: z.string().max(60).optional(),
  note: z.string().max(500).optional(),
});

export async function moveOrder(input: unknown) {
  const parsed = moveSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, code: "INVALID_INPUT" };
  const admin = createAdminClient();
  const id = await orderIdByNumber(admin, parsed.data.orderNumber);
  if (!id) return { ok: false as const, code: "NOT_FOUND" };
  const meta: Record<string, string> = {};
  if (parsed.data.carrier) meta.carrier_id = parsed.data.carrier === "Yalidine" ? "yalidine" : parsed.data.carrier === "ZR Express" ? "zr" : parsed.data.carrier;
  if (parsed.data.tracking !== undefined) meta.tracking = parsed.data.tracking;
  if (parsed.data.note) meta.note = parsed.data.note;
  const { error } = await admin.rpc("transition_order", {
    p_order_id: id,
    p_to: STATUS_DB[parsed.data.to],
    p_meta: meta,
  });
  if (error) {
    const msg = error.message ?? "";
    return { ok: false as const, code: msg.includes("RUPTURE") ? `RUPTURE:${msg.split(":").slice(1).join(":")}` : "FAILED" };
  }
  await admin.from("admin_actions").insert({ action: "move_order", detail: { to: parsed.data.to, order: parsed.data.orderNumber } });
  return { ok: true as const };
}

export async function saveDelivery(orderNumber: string, carrierId: string, tracking: string) {
  const admin = createAdminClient();
  const id = await orderIdByNumber(admin, orderNumber);
  if (!id) return { ok: false as const };
  const { data: cur } = await admin.from("orders").select("status").eq("id", id).maybeSingle();
  const st = (cur as { status: string } | null)?.status ?? "a_confirmer";
  const { error } = await admin.from("orders").update({ carrier_id: carrierId || null, tracking: tracking.trim() }).eq("id", id);
  if (error) return { ok: false as const };
  await admin.from("order_events").insert({ order_id: id, from_status: st, to_status: st, meta: { detail: `${carrierId} · ${tracking}`.trim() } });
  return { ok: true };
}

export async function saveOrderNote(orderNumber: string, note: string) {
  const admin = createAdminClient();
  const id = await orderIdByNumber(admin, orderNumber);
  if (!id) return { ok: false as const };
  const { error } = await admin.from("orders").update({ note: note.slice(0, 500) }).eq("id", id);
  return { ok: !error };
}

export async function adjustStock(productId: string, size: string, color: string, stock: number, reason: string) {
  const parsed = z.object({
    productId: z.string().uuid(), size: z.string().min(1).max(10), color: z.string().min(1).max(40),
    stock: z.number().int().min(0).max(9999), reason: z.string().max(40),
  }).safeParse({ productId, size, color, stock, reason });
  if (!parsed.success) return { ok: false as const };
  const admin = createAdminClient();
  const { data: v } = await admin.from("product_variants").select("id")
    .eq("product_id", productId).eq("size", size).eq("color", color).maybeSingle();
  if (!v) return { ok: false as const };
  const { error } = await admin.rpc("adjust_stock", {
    p_variant_id: (v as { id: string }).id, p_new_stock: stock, p_reason: reason,
  });
  return { ok: !error };
}

export async function saveCustomerNote(phone: string, note: string) {
  const admin = createAdminClient();
  const { error } = await admin.from("customers").update({ note: note.slice(0, 500) }).eq("phone", phone);
  return { ok: !error };
}

export async function getAnalytics() {
  const admin = createAdminClient();
  const { data: orders } = await admin.from("orders")
    .select("id,number,total,status,source,carrier_id,wilaya_code,created_at,campaign_id,order_items(name,qty,unit_price)")
    .eq("is_demo", false).order("created_at", { ascending: false }).limit(2000);
  const list = ((orders ?? []) as {
    number: string; total: number; status: string; source: string; carrier_id: string | null;
    wilaya_code: number | null; created_at: string; campaign_id: string | null;
    order_items: { name: string; qty: number; unit_price: number }[];
  }[]);
  const { data: wilayas } = await admin.from("wilayas").select("code,name");
  const { data: carriers } = await admin.from("carriers").select("id,name");
  const { data: campaigns } = await admin.from("campaigns").select("id,name,channel,spend,visits");
  const wname = new Map(((wilayas ?? []) as { code: number; name: string }[]).map((w) => [w.code, w.name.replace(/^\d+\s*-\s*/, "")]));
  const cname = new Map(((carriers ?? []) as { id: string; name: string }[]).map((c) => [c.id, c.name]));
  const camps = new Map(((campaigns ?? []) as { id: string; name: string; channel: string; spend: number; visits: number }[]).map((c) => [c.id, c]));

  const confirmed = (s: string) => s !== "a_confirmer" && s !== "annulee";
  const n = list.length;
  const kpi = {
    commandes: n,
    confirmation: n ? Math.round((list.filter((o) => confirmed(o.status)).length / n) * 100) : 0,
    livraison: (() => { const exp = list.filter((o) => ["expediee", "en_livraison", "livree"].includes(o.status)).length; const liv = list.filter((o) => o.status === "livree").length; return exp ? Math.round((liv / exp) * 100) : 0; })(),
    retour: n ? Math.round((list.filter((o) => o.status === "retournee").length / n) * 100) : 0,
    panier: (() => { const liv = list.filter((o) => o.status === "livree"); return liv.length ? Math.round(liv.reduce((a, o) => a + o.total, 0) / liv.length) : 0; })(),
    calivre: list.filter((o) => o.status === "livree").reduce((a, o) => a + o.total, 0),
  };

  const byProduct = new Map<string, { c: number; conf: number; liv: number; ret: number; ca: number }>();
  for (const o of list) for (const it of o.order_items) {
    const a = byProduct.get(it.name) ?? { c: 0, conf: 0, liv: 0, ret: 0, ca: 0 };
    a.c++;
    if (confirmed(o.status)) a.conf++;
    if (o.status === "livree") { a.liv++; a.ca += it.qty * it.unit_price; }
    if (o.status === "retournee") a.ret++;
    byProduct.set(it.name, a);
  }
  const byWilaya = new Map<string, { c: number; conf: number; exp: number; liv: number; ret: number; ca: number }>();
  for (const o of list) {
    const w = wname.get(o.wilaya_code ?? -1) ?? "—";
    const a = byWilaya.get(w) ?? { c: 0, conf: 0, exp: 0, liv: 0, ret: 0, ca: 0 };
    a.c++;
    if (confirmed(o.status)) a.conf++;
    if (["expediee", "en_livraison", "livree"].includes(o.status)) a.exp++;
    if (o.status === "livree") { a.liv++; a.ca += o.total; }
    if (o.status === "retournee") a.ret++;
    byWilaya.set(w, a);
  }
  const byCarrier = new Map<string, { exp: number; liv: number; ret: number; ca: number }>();
  for (const o of list) {
    if (!o.carrier_id) continue;
    const c = cname.get(o.carrier_id) ?? o.carrier_id;
    const a = byCarrier.get(c) ?? { exp: 0, liv: 0, ret: 0, ca: 0 };
    if (["expediee", "en_livraison", "livree"].includes(o.status)) a.exp++;
    if (o.status === "livree") { a.liv++; a.ca += o.total; }
    if (o.status === "retournee") a.ret++;
    byCarrier.set(c, a);
  }
  const bySource = new Map<string, { c: number; conf: number; liv: number; ca: number }>();
  for (const o of list) {
    const a = bySource.get(o.source) ?? { c: 0, conf: 0, liv: 0, ca: 0 };
    a.c++;
    if (confirmed(o.status)) a.conf++;
    if (o.status === "livree") { a.liv++; a.ca += o.total; }
    bySource.set(o.source, a);
  }
  const byCamp = new Map<string, { canal: string; dep: number; vis: number; c: number; conf: number; liv: number; ca: number }>();
  for (const o of list) {
    if (!o.campaign_id || !camps.get(o.campaign_id)) continue;
    const cp = camps.get(o.campaign_id)!;
    const a = byCamp.get(cp.name) ?? { canal: cp.channel, dep: cp.spend, vis: cp.visits, c: 0, conf: 0, liv: 0, ca: 0 };
    a.c++;
    if (confirmed(o.status)) a.conf++;
    if (o.status === "livree") { a.liv++; a.ca += o.total; }
    byCamp.set(cp.name, a);
  }
  const daily = new Map<string, { c: number; l: number }>();
  for (const o of list) {
    const d = (o as { created_at: string }).created_at.slice(0, 10);
    const a = daily.get(d) ?? { c: 0, l: 0 };
    a.c++;
    if (o.status === "livree") a.l++;
    daily.set(d, a);
  }
  const days = [...daily.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-30);
  return {
    kpi, daily: days.map(([d, a]) => ({ d, ...a })),
    campaigns: [...byCamp.entries()].map(([nom, a]) => ({ nom, ...a })),
    products: [...byProduct.entries()].map(([p, a]) => ({ p, ...a })).sort((a, b) => b.ca - a.ca).slice(0, 20),
    wilayas: [...byWilaya.entries()].map(([w, a]) => ({ w, ...a })).sort((a, b) => b.c - a.c).slice(0, 20),
    carriers: [...byCarrier.entries()].map(([c, a]) => ({ c, ...a })),
    sources: [...bySource.entries()].map(([s, a]) => ({ s, ...a })),
  };
}

export async function getTracking(number: string, phone: string) {
  const admin = createAdminClient();
  const { data } = await admin.rpc("get_order_tracking", { p_number: number.trim(), p_phone: phone });
  return data as null | {
    number: string; status: string; total: number; wilaya: number | null;
    carrier: string | null; tracking: string; created_at: string;
    items: { name: string; size: string; color: string; qty: number; unit_price: number }[];
    events: { from: string | null; to: string; meta: Record<string, string>; at: string }[];
  };
}

export async function listCustomers() {
  const admin = createAdminClient();
  const { data: customers } = await admin.from("customers").select("*,wilayas(name)").order("total_spent", { ascending: false }).limit(200);
  const { data: orders } = await admin.from("orders").select("customer_phone,number,total,status").eq("is_demo", false).order("created_at", { ascending: false }).limit(500);
  const lastByPhone = new Map<string, { number: string; total: number; status: string }>();
  for (const o of ((orders ?? []) as { customer_phone: string; number: string; total: number; status: string }[])) {
    if (!lastByPhone.has(o.customer_phone)) lastByPhone.set(o.customer_phone, o);
  }
  return ((customers ?? []) as never[]).map((c) => {
    const cc = c as unknown as { phone: string; name: string; commune: string; address: string; note: string; orders_count: number; delivered_count: number; cancelled_count: number; returns_count: number; total_spent: number; wilayas: { name: string } | null };
    const last = lastByPhone.get(cc.phone);
    return {
      name: cc.name, phone: cc.phone, wilaya: (cc.wilayas?.name ?? "").replace(/^\d+\s*-\s*/, ""), commune: cc.commune, adresse: cc.address,
      commandes: cc.orders_count, livrees: cc.delivered_count, annulees: cc.cancelled_count,
      retours: cc.returns_count, depense: cc.total_spent,
      derniere: last ? `${last.number} · ${last.total.toLocaleString("fr-DZ")} DA · ${STATUS_LABEL[last.status] ?? last.status}` : "—",
      note: cc.note,
    };
  });
}

export async function getDashboardStats() {
  const admin = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);
  const [{ count: toConfirm }, { data: recent }, { data: deliveredToday }, { data: lowVars }, { data: topItems }] = await Promise.all([
    admin.from("orders").select("id", { count: "exact", head: true }).eq("status", "a_confirmer").eq("is_demo", false),
    admin.from("orders").select(ORDER_SELECT).eq("is_demo", false).order("created_at", { ascending: false }).limit(8),
    admin.from("orders").select("id,total").eq("status", "livree").eq("is_demo", false).gte("created_at", `${today}T00:00:00`),
    admin.from("product_variants").select("id,size,color,stock,alert_threshold,products!inner(name,status)").eq("products.status", "en_ligne"),
    admin.from("order_items").select("name,qty,unit_price,orders!inner(status)").eq("orders.status", "livree").eq("orders.is_demo", false).limit(500),
  ]);
  const ordersToday = await admin.from("orders").select("id", { count: "exact", head: true }).eq("is_demo", false).gte("created_at", `${today}T00:00:00`);
  const ca = ((deliveredToday ?? []) as { total: number }[]).reduce((a, o) => a + o.total, 0);
  const low = ((lowVars ?? []) as unknown as { size: string; color: string; stock: number; alert_threshold: number; products: { name: string } }[])
    .filter((v) => v.stock <= v.alert_threshold)
    .map((v) => ({ label: `${v.products.name} · ${v.size} · Stock : ${v.stock}` }))
    .slice(0, 6);
  const agg = new Map<string, { u: number; ca: number }>();
  for (const it of ((topItems ?? []) as { name: string; qty: number; unit_price: number }[])) {
    const a = agg.get(it.name) ?? { u: 0, ca: 0 };
    a.u += it.qty; a.ca += it.qty * it.unit_price;
    agg.set(it.name, a);
  }
  const top = [...agg.entries()].map(([p, a]) => ({ p, u: a.u, ca: a.ca }))
    .sort((a, b) => b.u - a.u).slice(0, 5);
  return {
    toConfirm: toConfirm ?? 0,
    ordersToday: ordersToday.count ?? 0,
    deliveredToday: ((deliveredToday ?? []) as unknown[]).length,
    ca,
    low,
    top,
    recent: ((recent ?? []) as never[]).map((o) => dbOrderToAdmin(o as never as Parameters<typeof dbOrderToAdmin>[0])),
  };
}

/** Lightweight poll for the admin "new orders" pill (Realtime needs auth; we poll). */
export async function latestOrderInfo() {
  const anon = await createClient();
  void anon;
  const admin = createAdminClient();
  const { data } = await admin.from("orders").select("id,number,created_at")
    .eq("is_demo", false).order("created_at", { ascending: false }).limit(1).maybeSingle();
  const { count } = await admin.from("orders").select("id", { count: "exact", head: true })
    .eq("status", "a_confirmer").eq("is_demo", false);
  return { latestId: (data as { id: string } | null)?.id ?? null, toConfirm: count ?? 0 };
}

/**
 * Single-row poll for admin browser alerts: the newest order with ALL details
 * (client name, phone, items with size/color/qty, total) + the à-confirmer count.
 * The admin page itself turns this into a local Notification + sound + vibration —
 * no push service, no device tokens to store.
 */
export async function latestOrderFull() {
  const admin = createAdminClient();
  const [{ data }, { count }] = await Promise.all([
    admin.from("orders").select(ORDER_SELECT).eq("is_demo", false)
      .order("created_at", { ascending: false }).limit(1).maybeSingle(),
    admin.from("orders").select("id", { count: "exact", head: true })
      .eq("status", "a_confirmer").eq("is_demo", false),
  ]);
  if (!data) return { latestId: null as string | null, toConfirm: count ?? 0, order: null as AdminOrder | null };
  const order = dbOrderToAdmin(data as never as Parameters<typeof dbOrderToAdmin>[0]);
  return { latestId: (data as { id: string }).id, toConfirm: count ?? 0, order };
}
