"use client";
import { useMemo, useRef, useState } from "react";
import { Minus, Plus, ShieldCheck, Truck, RefreshCcw, Headset } from "lucide-react";
import { formatDA } from "@/lib/data";
import { COMMUNES } from "@/lib/communes";
import { useShipping } from "@/lib/shipping";
import { createOrder } from "@/lib/actions/orders";
import { FieldLabel } from "@/components/bilingual";
import type { ShopProduct, ShopContext } from "@/lib/storefront";

export function TrustBar({ wilayaCount }: { wilayaCount?: number }) {
  const { carriers, prices } = useShipping();
  const localCount = useMemo(() => {
    const covered = new Set<number>();
    for (const c of carriers) {
      if (!c.actif) continue;
      const table = prices[c.id];
      if (!table) continue;
      for (const [code, p] of Object.entries(table)) {
        if (p.couvert) covered.add(Number(code));
      }
    }
    return covered.size;
  }, [carriers, prices]);
  const count = wilayaCount ?? localCount;
  const items = [
    { icon: ShieldCheck, t: "Paiement à la livraison" },
    { icon: Truck, t: `${count} wilayas` },
    { icon: RefreshCcw, t: "Échange sous 7 jours" },
    { icon: Headset, t: "Confirmation en 4 h" },
  ];
  return (
    <div className="container-x">
      <div className="card-soft grid grid-cols-2 lg:grid-cols-4 md:divide-x divide-[#e8e3d8] overflow-hidden">
        {items.map((it, i) => (
          <div key={i} className="p-4 md:p-5 flex items-center gap-3">
            <span className="w-11 h-11 rounded-xl bg-[#efe9d8] text-[#7a5a28] flex items-center justify-center shrink-0">
              <it.icon size={19} />
            </span>
            <span className="block text-xs md:text-sm font-semibold">{it.t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function QtyStepper({ qty, setQty }: { qty: number; setQty: (n: number) => void }) {
  return (
    <div className="flex items-center border-[1.5px] border-[#e8e3d8] rounded-[10px] h-12 bg-white">
      <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} className="px-3.5 h-full hover:text-[#a06a2c]" aria-label="Diminuer"><Minus size={16} /></button>
      <span className="w-8 text-center font-semibold">{qty}</span>
      <button type="button" onClick={() => setQty(Math.min(10, qty + 1))} className="px-3.5 h-full hover:text-[#a06a2c]" aria-label="Augmenter"><Plus size={16} /></button>
    </div>
  );
}

export function QuickOrderForm({ product, shipping, onColorChange }: {
  product: ShopProduct;
  shipping: ShopContext;
  onColorChange?: (color: string) => void;
}) {
  const [articles, setArticles] = useState<{ size: string; color: string }[]>([{ size: "", color: "" }]);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    wilaya: 16,
    commune: "",
    address: "",
    carrierId: "",
    ship: "home" as "home" | "stopdesk",
  });
  const [done, setDone] = useState<{ number: string; total: number } | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const idemRef = useRef<string>("");

  const stockOf = (s: string, c: string) => product.stock[s]?.[c] ?? 0;

  // Réservation visuelle (sans écriture DB) : ce que les AUTRES articles ont déjà
  // pris est soustrait. Rien n'est sauvegardé tant que la commande n'est pas
  // confirmée — si le client quitte la page, tout redevient disponible.
  function takenByOthers(s: string, c: string, ai: number) {
    let n = 0;
    for (let j = 0; j < articles.length; j++) {
      if (j !== ai && articles[j].size === s && articles[j].color === c) n++;
    }
    return n;
  }
  const availFor = (ai: number, s: string, c: string) => stockOf(s, c) - takenByOthers(s, c, ai);
  // Une taille à 0 partout est CACHÉE (jamais affichée au client).
  function visibleSizes(ai: number) {
    return product.sizes.filter((s) => product.colors.some((c) => availFor(ai, s, c) > 0));
  }
  // Une couleur à 0 pour la taille choisie est CACHÉE elle aussi.
  function visibleColors(ai: number, size: string) {
    if (size) return product.colors.filter((c) => availFor(ai, size, c) > 0);
    return product.colors.filter((c) => product.sizes.some((s) => availFor(ai, s, c) > 0));
  }
  const activeCarriers = shipping.carriers;
  const prices = shipping.prices;
  const WILAYAS = shipping.wilayas.length ? shipping.wilayas : [{ code: 16, name: "16 - Alger" }];

  const carrierId = form.carrierId || activeCarriers[0]?.id || "";
  const wilayaBase = useMemo(() => WILAYAS.find((w) => w.code === Number(form.wilaya))!, [WILAYAS, form.wilaya]);
  const table = prices[carrierId]?.[Number(form.wilaya)];
  const homePrice = table?.home ?? 600;
  const stopdeskPrice = table?.stopdesk ?? null;
  const stopdeskAvailable = stopdeskPrice !== null;
  const ship = !stopdeskAvailable ? "home" : form.ship;
  const shipCost = ship === "home" ? homePrice : (stopdeskPrice ?? homePrice);
  const total = product.price * articles.length + shipCost;
  const carrierName = activeCarriers.find((c) => c.id === carrierId)?.nom ?? "";
  void wilayaBase;

  function pickSize(ai: number, s: string) {
    setArticles((arts) => arts.map((a, j) => (j === ai ? { ...a, size: s } : a)));
  }

  function pickColor(ai: number, c: string) {
    setArticles((arts) => arts.map((a, j) => (j === ai ? { ...a, color: c } : a)));
    onColorChange?.(c);
  }

  function addArticle() {
    if (articles.length >= 5) return;
    setArticles((arts) => [...arts, { size: "", color: "" }]);
  }

  function removeArticle() {
    if (articles.length <= 1) return;
    setArticles((arts) => arts.slice(0, -1));
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const phoneOk = /^(05|06|07)\d{8}$/.test(form.phone.replace(/[\s-]/g, ""));
    for (let k = 0; k < articles.length; k++) {
      const label = articles.length > 1 ? `Article ${k + 1} : ` : "";
      if (!articles[k].size) return setErr(`${label}Choisissez votre taille.`);
      if (!articles[k].color) return setErr(`${label}Choisissez votre couleur.`);
    }
    if (form.name.trim().length < 3) return setErr("Veuillez saisir votre nom complet.");
    if (!phoneOk) return setErr("Numéro invalide — exemple : 0550123456 (05 / 06 / 07 + 10 chiffres).");
    if (!form.commune) return setErr("Sélectionnez votre commune dans la liste.");
    if (!carrierId) return setErr("Aucun transporteur disponible pour le moment.");
    // Stock rule: same combo count across articles must not exceed live stock.
    const counts: Record<string, number> = {};
    for (const a of articles) {
      const key = `${a.size}|||${a.color}`;
      counts[key] = (counts[key] ?? 0) + 1;
      const left = stockOf(a.size, a.color);
      if (counts[key] > left) {
        return setErr(left <= 0
          ? `Épuisé : ${a.size} · ${a.color} — choisissez une autre couleur ou taille.`
          : `Plus que ${left} disponible${left > 1 ? "s" : ""} pour ${a.size} · ${a.color}.`);
      }
    }
    const items = articles.map((a) => ({
      variant_id: product.variantId[a.size]?.[a.color] ?? "",
      qty: 1,
    }));
    if (items.some((i) => !i.variant_id)) return setErr("Variante indisponible — choisissez une autre couleur ou taille.");
    setErr("");
    setBusy(true);
    if (!idemRef.current && typeof crypto !== "undefined" && "randomUUID" in crypto) {
      idemRef.current = crypto.randomUUID();
    }
    const res = await createOrder({
      name: form.name, phone: form.phone, wilaya: Number(form.wilaya),
      commune: form.commune, address: form.address, landmark: "",
      delivery: ship === "home" ? "domicile" : "stopdesk",
      carrier: carrierId, items, source: "direct", campaign: "", promo: "",
      idempotency: idemRef.current || `${Date.now()}`,
    });
    setBusy(false);
    if (!res.ok) {
      if (res.code.startsWith("RUPTURE")) {
        const [, s, c] = res.code.split(":");
        return setErr(`Épuisé : ${s} · ${c} — choisissez une autre couleur ou taille.`);
      }
      if (res.code === "NON_COUVERT") return setErr("Livraison indisponible vers cette wilaya avec ce transporteur.");
      if (res.code === "RATE_LIMITED") return setErr("Trop de tentatives — réessayez dans une heure.");
      return setErr("Commande impossible pour le moment — réessayez.");
    }
    setDone({ number: res.number, total: res.total });
    (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq?.("track", "Purchase", { value: res.total, currency: "DZD" });
  };

  if (done)
    return (
      <div className="bg-[#eef5ef] border border-[#cfe3d3] rounded-2xl p-6 text-center">
        <p className="w-12 h-12 rounded-full bg-[#20744d] text-white font-bold text-xl flex items-center justify-center mx-auto">✓</p>
        <p className="font-semibold text-lg mt-3">Merci <span dir="auto" className="name-auto inline-block">{form.name}</span> ! Commande bien reçue.</p>
        <p dir="rtl" lang="ar" className="text-sm font-medium text-stone-600 mt-1">شكراً! تم استلام طلبك بنجاح</p>
        <p className="text-sm font-light text-stone-600 mt-2 leading-relaxed">
          {product.name} — {articles.map((a) => `${a.size} · ${a.color}`).join(" | ")} · {carrierName} ({ship === "home" ? "À domicile · باب الدار" : "Stop Desk · المكتب"}).
          Nous allons vous appeler sur le <span className="font-semibold text-stone-900" dir="ltr">{form.phone}</span> en moins de 4 h pour confirmer.
          Total à payer en espèces : <span className="font-bold text-stone-900">{formatDA(done.total)}</span>
        </p>
        <p className="text-xs font-light text-stone-500 mt-2">N° de suivi : {done.number} — Suivez-le sur la page Suivi.</p>
        <button onClick={() => { setDone(null); idemRef.current = ""; }} className="text-xs font-medium underline underline-offset-4 mt-3">Passer une nouvelle commande</button>
      </div>
    );

  const soldOut = visibleSizes(0).length === 0;

  return (
    <form onSubmit={submit} className="bg-white border border-[#e8e3d8] rounded-2xl p-5 md:p-6 space-y-4 shadow-[0_10px_28px_rgba(28,27,24,0.06)]">
      <div>
        <p className="font-title font-semibold text-lg">Commander — paiement à la livraison</p>
        <p dir="rtl" lang="ar" className="text-sm font-medium text-stone-600 mt-1">اطلب الآن — الدفع عند الاستلام</p>
        <p className="text-xs font-light text-stone-500 mt-1">Remplissez le formulaire, on vous confirme par téléphone ou WhatsApp. Aucun prépaiement.</p>
      </div>
      {soldOut && (
        <p className="text-xs font-medium text-[#c0452f] bg-[#fdf0ec] border border-[#f3d4c8] p-2.5 rounded-[10px]">Produit épuisé pour le moment — <span dir="rtl" lang="ar">نفد المخزون حالياً</span></p>
      )}
      <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-3">
        {articles.map((a, ai) => {
          const sizes = visibleSizes(ai);
          const colors = visibleColors(ai, a.size);
          return (
          <div key={ai} className="min-[480px]:col-span-2">
            {articles.length > 1 && <p className="text-xs font-semibold mb-1.5">Article {ai + 1}</p>}
            <p className="text-xs font-semibold mb-1.5"><FieldLabel fr="1 · Taille *" ar="المقاس" /></p>
            {sizes.length === 0 ? (
              <p className="text-xs font-light text-stone-500 bg-[#f5f3ee] border border-[#e8e3d8] rounded-[10px] p-3">Tailles épuisées — <span dir="rtl" lang="ar">المقاسات نفدت</span></p>
            ) : (
            <div className="flex gap-1.5 flex-wrap">
              {sizes.map((s) => (
                <button type="button" key={s} onClick={() => pickSize(ai, s)} className={`min-w-11 px-3 h-10 text-xs font-semibold border-[1.5px] rounded-[10px] transition ${a.size === s ? "bg-[#1c1b18] text-white border-[#1c1b18]" : "bg-white border-[#e8e3d8] hover:border-stone-400"}`}>{s}</button>
              ))}
            </div>
            )}
            <p className="text-xs font-semibold mb-1.5 mt-3"><FieldLabel fr="2 · Couleur *" ar="اللون" /></p>
            {colors.length === 0 ? (
              <p className="text-xs font-light text-stone-500 bg-[#f5f3ee] border border-[#e8e3d8] rounded-[10px] p-3">Couleurs épuisées pour cette taille — <span dir="rtl" lang="ar">الألوان نفدت لهذا المقاس</span></p>
            ) : (
            <div className="flex gap-1.5 flex-wrap">
              {colors.map((c) => (
                <button type="button" key={c} onClick={() => pickColor(ai, c)} className={`min-w-11 px-3 h-10 text-xs font-semibold border-[1.5px] rounded-[10px] transition ${a.color === c ? "bg-[#1c1b18] text-white border-[#1c1b18]" : "bg-white border-[#e8e3d8] hover:border-stone-400"}`}>{c}</button>
              ))}
            </div>
            )}
          </div>
          );
        })}
        <div className="min-[480px]:col-span-2 flex items-center gap-3">
          <div className="flex items-center border-[1.5px] border-[#e8e3d8] rounded-[10px] h-11 bg-white">
            <button type="button" onClick={removeArticle} disabled={articles.length <= 1} className="px-3.5 h-full hover:text-[#a06a2c] disabled:opacity-30" aria-label="Retirer un article"><Minus size={16} /></button>
            <span className="w-20 text-center text-xs font-semibold whitespace-nowrap">{articles.length} article{articles.length > 1 ? "s" : ""}</span>
            <button type="button" onClick={addArticle} disabled={articles.length >= 5} className="px-3.5 h-full hover:text-[#a06a2c] disabled:opacity-30" aria-label="Ajouter un article"><Plus size={16} /></button>
          </div>
          <p className="text-[11px] font-light text-stone-500">Ajoutez un autre article avec une taille / couleur différente. <span dir="rtl" lang="ar">يمكنك إضافة قطعة أخرى</span></p>
        </div>
        <p className="min-[480px]:col-span-2 text-xs font-semibold"><FieldLabel fr="3 · Vos informations" ar="معلوماتك" /></p>
        <label className="text-xs font-semibold min-w-0 block"><FieldLabel fr="Nom complet *" ar="الاسم الكامل" />
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex : Yacine Benali · مثال: ياسين" dir="auto" className="input-soft mt-1.5" />
        </label>
        <label className="text-xs font-semibold min-w-0 block"><FieldLabel fr="Téléphone *" ar="رقم الهاتف" />
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} inputMode="tel" dir="ltr" placeholder="0550 00 00 00" className="input-soft mt-1.5" />
        </label>
        <label className="text-xs font-semibold min-w-0 block"><FieldLabel fr="Wilaya *" ar="الولاية" />
          <select value={form.wilaya} onChange={(e) => setForm({ ...form, wilaya: Number(e.target.value), commune: "" })} className="input-soft mt-1.5">
            {WILAYAS.map((w) => {
              const p = prices[carrierId]?.[w.code];
              return <option key={w.code} value={w.code}>{w.code} - {w.name} — {formatDA(p?.home ?? homePrice)}</option>;
            })}
          </select>
        </label>
        <label className="text-xs font-semibold min-w-0 block"><FieldLabel fr="Commune *" ar="البلدية" />
          <select value={form.commune} onChange={(e) => setForm({ ...form, commune: e.target.value })} className="input-soft mt-1.5">
            <option value="">Sélectionnez… · اختر…</option>
            {(COMMUNES[Number(form.wilaya)] ?? []).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold min-[480px]:col-span-2 block"><FieldLabel fr="Adresse / point de repère" ar="العنوان" />
          <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Rue, arrêt de bus, mosquée… · الشارع، المسجد…" dir="auto" className="input-soft mt-1.5" />
        </label>
        <div className="min-[480px]:col-span-2">
          <p className="text-xs font-semibold mb-1.5"><FieldLabel fr="4 · Livraison *" ar="طريقة التوصيل" /></p>
          {activeCarriers.length === 0 ? (
            <p className="text-xs font-light text-stone-500 bg-[#f5f3ee] border border-[#e8e3d8] rounded-[10px] p-3">Aucun transporteur disponible pour le moment.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {activeCarriers.map((c) => (
                <button type="button" key={c.id} onClick={() => setForm({ ...form, carrierId: c.id })} className={`py-3 rounded-[10px] border-[1.5px] text-xs font-semibold transition ${carrierId === c.id ? "border-[#1c1b18] bg-[#1c1b18] text-white" : "border-[#e8e3d8] hover:border-stone-400"}`}>
                  {c.nom}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="min-[480px]:col-span-2 grid grid-cols-2 gap-2">
          <button type="button" onClick={() => setForm({ ...form, ship: "home" })} className={`py-3 px-2 rounded-[10px] border-[1.5px] text-xs font-semibold transition leading-tight ${ship === "home" ? "border-[#1c1b18] bg-[#1c1b18] text-white" : "border-[#e8e3d8] hover:border-stone-400"}`}>
            <span className="block">À domicile — {formatDA(homePrice)}</span>
            <span dir="rtl" lang="ar" className="block font-medium mt-0.5 opacity-90">باب الدار</span>
          </button>
          <button type="button" disabled={!stopdeskAvailable} onClick={() => setForm({ ...form, ship: "stopdesk" })} className={`py-3 px-2 rounded-[10px] border-[1.5px] text-xs font-semibold transition disabled:opacity-40 leading-tight ${ship === "stopdesk" ? "border-[#1c1b18] bg-[#1c1b18] text-white" : "border-[#e8e3d8] hover:border-stone-400"}`}>
            {stopdeskAvailable ? (
              <><span className="block">Stop Desk — {formatDA(stopdeskPrice!)}</span>
              <span dir="rtl" lang="ar" className="block font-medium mt-0.5 opacity-90">المكتب</span></>
            ) : "Stop Desk — indisponible"}
          </button>
        </div>
        <div className="min-[480px]:col-span-2 flex items-center justify-between gap-3">
          <div>
            <p className="font-light text-stone-500 text-xs">{articles.length} article{articles.length > 1 ? "s" : ""} × {formatDA(product.price)}</p>
          </div>
          <div className="text-right">
            <p className="font-light text-stone-500 text-xs">Produit + livraison · <span dir="rtl" lang="ar">المجموع</span></p>
            <p className="font-bold text-xl">{formatDA(total)}</p>
          </div>
        </div>
      </div>
      {err && <p className="text-xs font-medium text-[#c0452f] bg-[#fdf0ec] border border-[#f3d4c8] p-2.5 rounded-[10px]">{err}</p>}
      <button disabled={busy} className="btn-fluid w-full !py-4 !text-[13px] disabled:opacity-50">{busy ? "Envoi…" : <><span>Confirmer la commande</span><span dir="rtl" lang="ar" className="font-medium">· تأكيد الطلب</span></>}</button>
    </form>
  );
}
