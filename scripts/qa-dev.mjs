// QA gate against dev (uses .env.local keys). Run: node scripts/qa-dev.mjs
import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8").replace(/^\uFEFF/, "").split("\n").filter(Boolean)
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1).replace(/\r$/, "")]; })
);
const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const anon = createClient(URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const svc = createClient(URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

let pass = 0, fail = 0;
const ok = (name, cond, extra = "") => {
  if (cond) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name} ${extra}`); }
};

// 1. seed counts
const wilayas = await anon.from("wilayas").select("code", { count: "exact" });
ok("wilayas=69", wilayas.count === 69, `got ${wilayas.count}`);
const prods = await anon.from("products").select("id");
ok("anon sees sellable products", (prods.data ?? []).length === 8, `got ${(prods.data ?? []).length}`);
const cats = await anon.from("categories").select("id", { count: "exact" });
ok("categories=9", cats.count === 9, `got ${cats.count}`);
const prices = await anon.from("carrier_prices").select("carrier_id", { count: "exact" }).eq("covered", true);
ok("covered prices>100", (prices.count ?? 0) > 100, `got ${prices.count}`);

// 2. RLS deny checks
const oAnon = await anon.from("orders").select("id").limit(1);
ok("anon cannot read orders", (oAnon.data ?? []).length === 0);
const cAnon = await anon.from("customers").select("phone").limit(1);
ok("anon cannot read customers", (cAnon.data ?? []).length === 0);
const evAnon = await anon.from("order_events").select("id").limit(1);
ok("anon cannot read events", (evAnon.data ?? []).length === 0);

// 3. pick a real variant
const v = await anon.from("product_variants").select("id,stock,size,color,product_id").gt("stock", 5).limit(1).maybeSingle();
const variant = v.data;
ok("variant found", !!variant);
const prod = await anon.from("products").select("price").eq("id", variant.product_id).single();

// 4. create order (anon RPC)
const idem = `qa-${Date.now()}`;
const order = await anon.rpc("create_order", {
  p_name: "QA Testeur", p_phone: "0550123456", p_wilaya: 16, p_commune: "Bab Ezzouar",
  p_address: "Rue test", p_landmark: "", p_delivery: "domicile", p_carrier: "yalidine",
  p_items: [{ variant_id: variant.id, qty: 1 }], p_source: "direct",
  p_campaign: null, p_promo: "DZ10", p_idempotency: idem, p_ip: "127.0.0.1",
});
ok("create_order ok", !order.error, order.error?.message ?? "");
const num = order.data?.number;
const expectedTotal = Math.round(prod.data.price * 0.9) + 500; // -10% + Alger home
ok("total math (promo+fee)", order.data?.total === expectedTotal, `got ${order.data?.total} want ${expectedTotal}`);

// 5. idempotency
const dup = await anon.rpc("create_order", {
  p_name: "QA Testeur", p_phone: "0550123456", p_wilaya: 16, p_commune: "Bab Ezzouar",
  p_address: "", p_landmark: "", p_delivery: "domicile", p_carrier: "yalidine",
  p_items: [{ variant_id: variant.id, qty: 1 }], p_source: "direct",
  p_campaign: null, p_promo: null, p_idempotency: idem, p_ip: "127.0.0.1",
});
ok("idempotent duplicate", dup.data?.duplicate === true && dup.data?.number === num);

// 6. rupture (no mutation)
const rup = await anon.rpc("create_order", {
  p_name: "QA Testeur", p_phone: "0550123456", p_wilaya: 16, p_commune: "X",
  p_address: "", p_landmark: "", p_delivery: "domicile", p_carrier: "yalidine",
  p_items: [{ variant_id: variant.id, qty: 9999 }], p_source: "direct",
  p_campaign: null, p_promo: null, p_idempotency: `qa-rup-${Date.now()}`, p_ip: "127.0.0.1",
});
ok("rupture refused", !!rup.error && rup.error.message.includes("RUPTURE"));

// 7. bad phone
const bp = await anon.rpc("create_order", {
  p_name: "QA Testeur", p_phone: "0123", p_wilaya: 16, p_commune: "X",
  p_address: "", p_landmark: "", p_delivery: "domicile", p_carrier: "yalidine",
  p_items: [{ variant_id: variant.id, qty: 1 }], p_source: "direct",
  p_campaign: null, p_promo: null, p_idempotency: `qa-bp-${Date.now()}`, p_ip: "127.0.0.1",
});
ok("bad phone refused", !!bp.error);

// 8. stock before confirm
const before = await svc.from("product_variants").select("stock").eq("id", variant.id).single();
const oid = (await svc.from("orders").select("id").eq("number", num).single()).data.id;

// 9. confirm -> decrement
const conf = await svc.rpc("transition_order", { p_order_id: oid, p_to: "confirmee", p_meta: {} });
ok("confirm ok", !conf.error, conf.error?.message ?? "");
const after = await svc.from("product_variants").select("stock").eq("id", variant.id).single();
ok("stock decremented by 1", after.data.stock === before.data.stock - 1, `${before.data.stock} -> ${after.data.stock}`);

// 10. double confirm is idempotent (no double decrement)
await svc.rpc("transition_order", { p_order_id: oid, p_to: "confirmee", p_meta: {} });
const again = await svc.from("product_variants").select("stock").eq("id", variant.id).single();
ok("no double decrement", again.data.stock === after.data.stock);

// 11. cancel -> restore
await svc.rpc("transition_order", { p_order_id: oid, p_to: "annulee", p_meta: {} });
const restored = await svc.from("product_variants").select("stock").eq("id", variant.id).single();
ok("cancel restores stock", restored.data.stock === before.data.stock);
const cust = await svc.from("customers").select("cancelled_count").eq("phone", "0550123456").single();
ok("customer counter", cust.data.cancelled_count >= 1);

// 12. tracking lookups
const tr = await svc.rpc("get_order_tracking", { p_number: num, p_phone: "0550123456" });
ok("tracking ok w/ phone", !!tr.data && tr.data.number === num);
const trBad = await svc.rpc("get_order_tracking", { p_number: num, p_phone: "0661000000" });
ok("tracking denied w/o phone", trBad.data === null);
const pub = await svc.rpc("get_public_tracking", { p_number: num, p_ip: "127.0.0.1" });
ok("public tracking limited", !!pub.data && !("customer_phone" in pub.data) && !("address" in pub.data));
const pubBad = await svc.rpc("get_public_tracking", { p_number: "MSK-0000", p_ip: "127.0.0.1" });
ok("public tracking miss", pubBad.data === null);

// 13. storage bucket reachable
const { data: buckets } = await svc.storage.listBuckets();
ok("product-images bucket", (buckets ?? []).some((b) => b.id === "product-images"));

// 14. movements audit
const mov = await svc.from("stock_movements").select("id", { count: "exact" }).eq("variant_id", variant.id);
ok("movements logged", (mov.count ?? 0) >= 2, `got ${mov.count}`);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
