// Weekly logical backup over PostgREST (no direct PG needed).
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY. Output: maskulino-backup-<date>.json
const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error("missing env");
  process.exit(1);
}
const H = { apikey: KEY, Authorization: `Bearer ${KEY}` };
const TABLES = ["categories", "products", "product_images", "product_variants", "stock_movements",
  "wilayas", "carriers", "carrier_prices", "customers", "campaigns", "promotions",
  "orders", "order_items", "order_events", "shop_settings", "push_subscriptions",
  "telegram_chats", "admin_actions"];
const out = { date: new Date().toISOString(), tables: {} };
for (const t of TABLES) {
  const rows = [];
  let from = 0;
  const size = 1000;
  for (;;) {
    const r = await fetch(`${URL}/rest/v1/${t}?select=*&offset=${from}&limit=${size}`, { headers: { ...H, Prefer: "count=none" } });
    if (!r.ok) {
      console.error(`FAILED ${t}: ${r.status}`);
      process.exit(1);
    }
    const batch = await r.json();
    rows.push(...batch);
    if (batch.length < size) break;
    from += size;
  }
  out.tables[t] = rows;
  console.log(`${t}: ${rows.length}`);
}
const { writeFileSync } = await import("fs");
const name = `maskulino-backup-${new Date().toISOString().slice(0, 10)}.json`;
writeFileSync(name, JSON.stringify(out));
console.log(`wrote ${name}`);
// NOTE restore: re-insert rows per table (parents before children), then in the
// Supabase SQL editor run: select setval('order_number_seq', (select max(...)));
