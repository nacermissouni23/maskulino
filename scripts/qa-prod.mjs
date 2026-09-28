// Prod smoke: full money path + cleanup. Run: node scripts/qa-prod.mjs
import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";

const trim = (s) => s.replace(/^\uFEFF/, "").trim();
const URL = "https://iwidrvkeczoowsagracz.supabase.co";
const anonKey = trim(readFileSync(`${process.env.TEMP}/prodanon.txt`, "utf8"));
const svcKey = trim(readFileSync(`${process.env.TEMP}/prodsvc.txt`, "utf8"));
const anon = createClient(URL, anonKey);
const svc = createClient(URL, svcKey, { auth: { persistSession: false } });

let pass = 0, fail = 0;
const ok = (n, c, x = "") => { if (c) { pass++; console.log(`PASS ${n}`); } else { fail++; console.log(`FAIL ${n} ${x}`); } };

const v = (await anon.from("product_variants").select("id,stock").gt("stock", 5).limit(1).maybeSingle()).data;
ok("variant found", !!v);
const idem = `prod-qa-${Date.now()}`;
const order = await anon.rpc("create_order", {
  p_name: "QA Prod", p_phone: "0550123456", p_wilaya: 16, p_commune: "Bab Ezzouar",
  p_address: "", p_landmark: "", p_delivery: "domicile", p_carrier: "yalidine",
  p_items: [{ variant_id: v.id, qty: 1 }], p_source: "direct",
  p_campaign: null, p_promo: null, p_idempotency: idem, p_ip: "127.0.0.1",
});
ok("prod create_order", !order.error, order.error?.message ?? "");
const num = order.data?.number;
const oid = (await svc.from("orders").select("id").eq("number", num).single()).data.id;
const before = (await svc.from("product_variants").select("stock").eq("id", v.id).single()).data.stock;
await svc.rpc("transition_order", { p_order_id: oid, p_to: "confirmee", p_meta: {} });
const after = (await svc.from("product_variants").select("stock").eq("id", v.id).single()).data.stock;
ok("prod confirm decrements", after === before - 1, `${before}->${after}`);
await svc.rpc("transition_order", { p_order_id: oid, p_to: "annulee", p_meta: {} });
const restored = (await svc.from("product_variants").select("stock").eq("id", v.id).single()).data.stock;
ok("prod cancel restores", restored === before);
const pub = await anon.rpc("get_public_tracking", { p_number: num, p_ip: "127.0.0.1" });
ok("prod public tracking", !!pub.data && pub.data.number === num);
// cleanup: leave prod pristine
await svc.from("orders").delete().eq("id", oid);
await svc.from("customers").delete().eq("phone", "0550123456");
const gone = await svc.from("orders").select("id").eq("number", num).maybeSingle();
ok("prod cleaned", !gone.data);
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
