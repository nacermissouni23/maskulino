// Generates supabase seed migrations from the researched datasets.
// Run: node scripts/emit-seeds.mjs
import { writeFileSync } from "fs";

const esc = (s) => String(s ?? "").replace(/'/g, "''");

const WILAYAS = [
  [1,"Adrar",null],[2,"Chlef",null],[3,"Laghouat",null],[4,"Oum El Bouaghi",null],
  [5,"Batna",null],[6,"Béjaïa",null],[7,"Biskra",null],[8,"Béchar",null],
  [9,"Blida",null],[10,"Bouira",null],[11,"Tamanrasset",null],[12,"Tébessa",null],
  [13,"Tlemcen",null],[14,"Tiaret",null],[15,"Tizi Ouzou",null],[16,"Alger",null],
  [17,"Djelfa",null],[18,"Jijel",null],[19,"Sétif",null],[20,"Saïda",null],
  [21,"Skikda",null],[22,"Sidi Bel Abbès",null],[23,"Annaba",null],[24,"Guelma",null],
  [25,"Constantine",null],[26,"Médéa",null],[27,"Mostaganem",null],[28,"M'Sila",null],
  [29,"Mascara",null],[30,"Ouargla",null],[31,"Oran",null],[32,"El Bayadh",null],
  [33,"Illizi",null],[34,"Bordj Bou Arréridj",null],[35,"Boumerdès",null],[36,"El Tarf",null],
  [37,"Tindouf",null],[38,"Tissemsilt",null],[39,"El Oued",null],[40,"Khenchela",null],
  [41,"Souk Ahras",null],[42,"Tipaza",null],[43,"Mila",null],[44,"Aïn Defla",null],
  [45,"Naâma",null],[46,"Aïn Témouchent",null],[47,"Ghardaïa",null],[48,"Relizane",null],
  [49,"Timimoun",null],[50,"Bordj Badji Mokhtar",null],[51,"Ouled Djellal",null],[52,"Béni Abbès",null],
  [53,"In Salah",null],[54,"In Guezzam",null],[55,"Touggourt",null],[56,"Djanet",null],
  [57,"El M'Ghair",null],[58,"El Meniaa",null],[59,"Aflou",3],[60,"Barika",5],[61,"El Kantara",7],
  [62,"Bir El Ater",12],[63,"El Aricha",13],[64,"Ksar Chellala",14],[65,"Aïn Ouessara",17],
  [66,"Messaad",17],[67,"Ksar El Boukhari",26],[68,"Bou Saâda",28],[69,"El Abiodh Sidi Cheikh",32],
];

// [home, stopdesk|null] — researched 2025-2026 grids (colis ≤ 5 kg)
const YALIDINE = {1:[1100,600],2:[690,400],3:[900,500],4:[850,400],5:[850,400],6:[790,400],7:[950,500],8:[1000,600],9:[600,400],10:[690,400],11:[1100,600],12:[850,400],13:[600,400],14:[700,400],15:[690,400],16:[500,400],17:[900,500],18:[790,400],19:[750,400],20:[790,400],21:[690,400],22:[600,400],23:[800,400],24:[850,450],25:[800,400],26:[690,400],27:[600,400],28:[800,400],29:[650,400],30:[900,500],31:[450,250],32:[900,500],33:[1300,600],34:[790,400],35:[690,350],36:[850,500],37:[1300,600],38:[750,400],39:[950,550],40:[800,400],41:[800,500],42:[690,350],43:[690,400],44:[690,400],45:[900,500],46:[600,400],47:[990,500],48:[690,400],49:[1700,1100],50:[1100,600],51:[900,600],52:[1100,600],53:[900,null],54:[990,500],55:[990,500],56:[1700,1100],57:[1000,750],58:[1700,1100],59:[900,500],60:[850,400],61:[950,500],62:[850,400],63:[600,400],64:[700,400],65:[900,500],66:[900,500],67:[690,400],68:[800,400],69:[900,500]};
const ZR = {1:[1300,900],2:[850,450],3:[900,550],4:[800,450],5:[800,450],6:[800,450],7:[900,550],8:[900,650],9:[600,450],10:[700,450],11:[1400,1000],12:[800,500],13:[900,500],14:[800,450],15:[700,450],16:[400,300],17:[900,550],18:[800,450],19:[750,450],20:[900,null],21:[800,450],22:[800,450],23:[800,450],24:[800,450],25:[800,450],26:[750,450],27:[800,450],28:[800,500],29:[800,450],30:[900,600],31:[800,450],32:[900,600],34:[750,450],35:[700,450],36:[800,450],38:[850,null],39:[900,600],40:[800,null],41:[800,450],42:[700,450],43:[800,300],44:[850,450],45:[900,600],46:[800,450],47:[850,600],48:[800,450],49:[900,null],50:[900,null],51:[900,550],53:[900,null],54:[1200,null],55:[900,600],57:[1400,null],58:[1400,null]};

const CATEGORIES = ["T-shirts","Chemises","Pantalons","Jeans","Hoodies & Sweats","Vestes & Manteaux","Ensembles","Chaussures","Accessoires"];
const CAT_SLUG = { hoodies:"Hoodies & Sweats", tshirts:"T-shirts", chemises:"Chemises", jeans:"Jeans", ensembles:"Ensembles", vestes:"Vestes & Manteaux" };

const U = (id) => `https://images.unsplash.com/${id}?w=800&q=80`;
const PRODUCTS = [
  { slug:"hoodie-oversize-noir", name:"Sweat à capuche oversize noir premium", category:"hoodies", price:3490, oldPrice:4490, sizes:["M","L","XL","XXL"], colors:["Noir","Gris","Beige"], image:U("photo-1556821840-3a63f95609a7"), gallery:[U("photo-1556821840-3a63f95609a7"),U("photo-1509942774463-acf339cf87d5")], desc:"Sweat épais 400 g, coton dense, coupe oversize.", stock:34 },
  { slug:"tshirt-essentiel-blanc", name:"Lot de 2 t-shirts essentiels blancs", category:"tshirts", price:1890, oldPrice:2490, sizes:["S","M","L","XL","XXL"], colors:["Blanc","Noir"], image:U("photo-1521572163474-6864f9cf17ab"), gallery:[U("photo-1521572163474-6864f9cf17ab")], desc:"Lot de 2 t-shirts 100 % coton.", stock:120 },
  { slug:"chemise-oxford-bleu", name:"Chemise Oxford bleu ciel", category:"chemises", price:2790, oldPrice:null, sizes:["M","L","XL"], colors:["Bleu","Blanc"], image:U("photo-1596755094514-f87e34085b2c"), gallery:[U("photo-1596755094514-f87e34085b2c")], desc:"Chemise Oxford élégante.", stock:45 },
  { slug:"jean-slim-stretch", name:"Jean slim stretch brut", category:"jeans", price:3290, oldPrice:3990, sizes:["30","31","32","33","34","36"], colors:["Brut","Noir"], image:U("photo-1542272604-787c3835535d"), gallery:[U("photo-1542272604-787c3835535d")], desc:"Denim stretch confortable.", stock:60 },
  { slug:"ensemble-survetement", name:"Ensemble de survêtement 2 pièces", category:"ensembles", price:4490, oldPrice:5990, sizes:["M","L","XL","XXL"], colors:["Noir","Gris","Vert"], image:U("photo-1611312449408-fcece27cdbb7"), gallery:[U("photo-1611312449408-fcece27cdbb7")], desc:"Veste zippée + pantalon cargo.", stock:28 },
  { slug:"veste-bomber", name:"Veste bomber matelassée", category:"vestes", price:5990, oldPrice:7990, sizes:["M","L","XL","XXL"], colors:["Noir","Kaki"], image:U("photo-1551028719-00167b16eac5"), gallery:[U("photo-1551028719-00167b16eac5")], desc:"Bomber chaud et doublé.", stock:15 },
  { slug:"pull-col-ronde", name:"Pull à col rond beige", category:"hoodies", price:2890, oldPrice:null, sizes:["M","L","XL"], colors:["Beige","Marron"], image:U("photo-1610384104075-e05c8cf200c3"), gallery:[U("photo-1610384104075-e05c8cf200c3")], desc:"Pull doux en maille fine.", stock:50 },
  { slug:"pantalon-cargo", name:"Pantalon cargo kaki", category:"jeans", price:2990, oldPrice:null, sizes:["30","32","34","36"], colors:["Kaki","Noir"], image:U("photo-1624378439575-d8705ad7ae80"), gallery:[U("photo-1624378439575-d8705ad7ae80")], desc:"Cargo 6 poches.", stock:70 },
];

// ---- 0002 base ----
let s2 = `-- Seed: geo, carriers, categories, settings, promos. Safe to re-run (upserts).\n`;
s2 += `insert into wilayas (code, name, parent_code) values\n` +
  WILAYAS.map(([c,n,p]) => `(${c},'${esc(n)}',${p ?? "null"})`).join(",\n") +
  `\non conflict (code) do update set name = excluded.name, parent_code = excluded.parent_code;\n\n`;
s2 += `insert into carriers (id, name, active, custom) values
('yalidine','Yalidine',true,false),('zr','ZR Express',true,false)
on conflict (id) do update set name = excluded.name;\n\n`;
const priceRows = [];
for (const code of Object.keys(YALIDINE)) {
  const [h, sd] = YALIDINE[code];
  priceRows.push(`('yalidine',${code},${h},${sd ?? "null"},true)`);
  if (ZR[code]) priceRows.push(`('zr',${code},${ZR[code][0]},${ZR[code][1] ?? "null"},true)`);
  else priceRows.push(`('zr',${code},${h},${sd ?? "null"},false)`);
}
s2 += `insert into carrier_prices (carrier_id, wilaya_code, home, stopdesk, covered) values\n` +
  priceRows.join(",\n") +
  `\non conflict (carrier_id, wilaya_code) do update set home = excluded.home, stopdesk = excluded.stopdesk, covered = excluded.covered;\n\n`;
s2 += CATEGORIES.map((c,i) => `insert into categories (name, sort) values ('${esc(c)}',${i+1}) on conflict (name) do nothing;`).join("\n") + "\n\n";
s2 += `insert into shop_settings (id, name, phone, whatsapp, domain, facebook, instagram, tiktok, address, hours) values
(1,'Maskulino','0770 00 00 00','https://wa.me/213770000000','maskulino.dz','','','','Didouche Mourad, Alger','Sam – Jeu : 10h – 20h | Ven : 15h – 20h')
on conflict (id) do nothing;\n\n`;
s2 += `insert into promotions (code, name, type, value, scope, active) values
('DZ10','Promo DZ10','pourcentage',10,'tous',true)
on conflict (code) do update set active = excluded.active;\n`;
writeFileSync("supabase/migrations/0002_seed_base.sql", s2);

// ---- 0003 catalog ----
let s3 = `-- Seed: catalog (idempotent by slug). Re-run safe.\n`;
for (const p of PRODUCTS) {
  const cat = CAT_SLUG[p.category];
  s3 += `insert into products (slug, name, description, category_id, price, old_price, status, principal_image_url)
select '${p.slug}','${esc(p.name)}','${esc(p.desc)}',c.id,${p.price},${p.oldPrice ?? "null"},'en_ligne','${p.image}'
from categories c where c.name = '${esc(cat)}'
on conflict (slug) do update set name = excluded.name, description = excluded.description,
  price = excluded.price, old_price = excluded.old_price, principal_image_url = excluded.principal_image_url;\n`;
  p.gallery.forEach((g,i) => {
    s3 += `insert into product_images (product_id, path, color, position)
select id, '${g}', '', ${i} from products where slug = '${p.slug}'
on conflict do nothing;\n`;
  });
  const combos = p.sizes.flatMap((s) => p.colors.map((c) => [s,c]));
  const per = Math.floor(p.stock / combos.length);
  let rest = p.stock - per * combos.length;
  for (const [s,c] of combos) {
    const q = per + (rest-- > 0 ? 1 : 0);
    s3 += `insert into product_variants (product_id, size, color, stock)
select id, '${esc(s)}', '${esc(c)}', ${q} from products where slug = '${p.slug}'
on conflict (product_id, size, color) do nothing;\n`;
  }
  s3 += "\n";
}
writeFileSync("supabase/migrations/0003_seed_catalog.sql", s3);

// ---- 0004 demo (DEV ONLY — do not apply on prod) ----
const DEMOS = [
  { n:"MSK-1048", name:"Yasmine B.", phone:"0550123456", wil:"Alger", com:"Bab Ezzouar", item:["T-Shirt Oversize Noir","L","Noir",2,2900], fee:400, total:6200, src:"instagram", camp:"Rentree-Sep", st:"a_confirmer", date:"2026-09-27 10:24" },
  { n:"MSK-1047", name:"Mohamed L.", phone:"0661457890", wil:"Oran", com:"Bir El Djir", item:["Ensemble survêtement 2 pièces","XL","Noir",1,4490], fee:500, total:4990, src:"facebook", camp:"Pack-Automne", st:"a_confirmer", date:"2026-09-27 09:12" },
  { n:"MSK-1046", name:"Amine K.", phone:"0770221144", wil:"Sétif", com:"El Eulma", item:["Hoodie Oversize Noir","M","Gris",1,3490], fee:300, total:3790, src:"tiktok", camp:"Hoodie-Video3", st:"confirmee", date:"2026-09-27 08:40" },
  { n:"MSK-1044", name:"Riyad M.", phone:"0555990011", wil:"Ouargla", com:"Centre", item:["Jean slim stretch brut","32","Brut",1,3290], fee:800, total:4090, src:"whatsapp", camp:null, st:"en_preparation", date:"2026-09-26 16:40" },
  { n:"MSK-1041", name:"Walid S.", phone:"0662334455", wil:"Constantine", com:"Ali Mendjeli", item:["Chemise Oxford bleu","L","Bleu",1,2790], fee:350, total:3140, src:"facebook", camp:"Rentree-Sep", st:"expediee", date:"2026-09-26 11:02", carrier:"yalidine", tracking:"YD123456789" },
  { n:"MSK-1039", name:"Sofiane T.", phone:"0551887766", wil:"Blida", com:"Centre", item:["Pantalon cargo kaki","32","Kaki",1,2990], fee:250, total:3240, src:"instagram", camp:"Cargo-Reel", st:"en_livraison", date:"2026-09-25 15:20", carrier:"zr", tracking:"ZR987654" },
  { n:"MSK-1035", name:"Karim D.", phone:"0771112233", wil:"Alger", com:"Draria", item:["Lot 2 t-shirts blancs","XL","Blanc",1,1890], fee:400, total:2290, src:"direct", camp:null, st:"livree", date:"2026-09-24 12:00", carrier:"yalidine", tracking:"YD111222333" },
  { n:"MSK-1031", name:"Nassim H.", phone:"0550000001", wil:"Tamanrasset", com:"Centre", item:["Veste bomber matelassée","L","Noir",1,5990], fee:900, total:6890, src:"tiktok", camp:"Bomber-Test", st:"retournee", date:"2026-09-24 09:00", carrier:"yalidine", tracking:"YD555666" },
  { n:"MSK-1028", name:"Bilal F.", phone:"0662001122", wil:"Annaba", com:"Centre", item:["Pull col rond beige","M","Beige",1,2890], fee:600, total:3490, src:"facebook", camp:"Rentree-Sep", st:"annulee", date:"2026-09-23 17:00" },
];
const SRCMAP = { instagram:"instagram", facebook:"facebook", tiktok:"tiktok", whatsapp:"whatsapp", direct:"direct" };
const WIL = { "Alger":16, "Oran":31, "Sétif":19, "Ouargla":30, "Constantine":25, "Blida":9, "Tamanrasset":11, "Annaba":23 };
let s4 = `-- DEMO ONLY. Do NOT apply on prod. Wipe with: delete from orders where is_demo = true; + matching customers.\n`;
s4 += `insert into campaigns (name, channel, product_slug, spend, visits) values
('Rentree-Sep','facebook','',45000,8400),('Pack-Automne','whatsapp','',0,900),
('Hoodie-Video3','tiktok','',28000,12000),('Cargo-Reel','instagram','',18000,5200),
('Bomber-Test','tiktok','',0,800) on conflict do nothing;\n\n`;
for (const d of DEMOS) {
  const [iname, size, color, qty, up] = d.item;
  const sub = qty * up;
  s4 += `insert into customers (phone, name, wilaya_code, commune, orders_count) values
('${d.phone}','${esc(d.name)}',${WIL[d.wil]},'${esc(d.com)}',1)
on conflict (phone) do nothing;\n`;
  s4 += `insert into orders (number, customer_phone, customer_name, wilaya_code, commune, subtotal, discount, delivery_fee, total, delivery_type, carrier_id, tracking, source, campaign_id, status, is_demo, created_at)
values ('${d.n}','${d.phone}','${esc(d.name)}',${WIL[d.wil]},'${esc(d.com)}',${sub},0,${d.fee},${d.total},'domicile',${d.carrier ? `'${d.carrier}'` : "null"},'${d.tracking ?? ""}','${SRCMAP[d.src]}',
${d.camp ? `(select id from campaigns where name = '${d.camp}')` : "null"},'${d.st}',true,'${d.date}')
on conflict (number) do nothing;\n`;
  s4 += `insert into order_items (order_id, name, size, color, qty, unit_price)
select id, '${esc(iname)}','${esc(size)}','${esc(color)}',${qty},${up} from orders where number = '${d.n}'
on conflict do nothing;\n`;
  s4 += `insert into order_events (order_id, from_status, to_status)
select id, null, '${d.st}' from orders where number = '${d.n}' on conflict do nothing;\n\n`;
}
s4 += `select setval('order_number_seq', 1050);\n`;
writeFileSync("supabase/migrations/0004_seed_demo.sql", s4);
console.log("wrote 0002/0003/0004");
