"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { formatDA } from "@/lib/data";
import { COMMUNES } from "@/lib/communes";
import { ShieldCheck } from "lucide-react";
import { createOrder } from "@/lib/actions/orders";
import { getShopContextAction, getActivePromos, resolveCart } from "@/lib/actions/storefront";
import { FieldLabel } from "@/components/bilingual";
import type { ShopContext } from "@/lib/storefront";

const FALLBACK: ShopContext = {
  carriers: [{ id: "yalidine", nom: "Yalidine" }],
  prices: { yalidine: { 16: { home: 500, stopdesk: 400, couvert: true } } },
  wilayas: [{ code: 16, name: "16 - Alger" }],
};

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const [f, setF] = useState({ name: "", phone: "", wilaya: 16, commune: "", address: "", ship: "home" as "home" | "stopdesk", promo: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ number: string; total: number } | null>(null);
  const [ctx, setCtx] = useState<ShopContext>(FALLBACK);
  const [promos, setPromos] = useState<{ code: string; type: string; value: number }[]>([]);
  const idemRef = useRef("");

  useEffect(() => {
    getShopContextAction().then(setCtx).catch(() => undefined);
    getActivePromos().then(setPromos).catch(() => undefined);
  }, []);

  const wil = ctx.wilayas.find((w) => w.code === Number(f.wilaya)) ?? ctx.wilayas[0] ?? FALLBACK.wilayas[0];
  const table = ctx.prices["yalidine"]?.[Number(f.wilaya)];
  const ship = f.ship === "home" ? (table?.home ?? 500) : (table?.stopdesk ?? table?.home ?? 500);
  const promo = promos.find((p) => p.code.toUpperCase() === f.promo.trim().toUpperCase());
  const discount = promo ? (promo.type === "pourcentage" ? Math.round(subtotal * promo.value / 100) : Math.min(promo.value, subtotal)) : 0;
  const total = subtotal - discount + (items.length ? ship : 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!items.length) return setErr("Votre panier est vide.");
    if (f.name.trim().length < 3) return setErr("Veuillez saisir votre nom complet.");
    if (!/^(05|06|07)\d{8}$/.test(f.phone.replace(/[\s-]/g, ""))) return setErr("Téléphone invalide — exemple : 0550123456.");
    if (!f.commune) return setErr("Sélectionnez votre commune dans la liste.");
    setErr("");
    setBusy(true);
    const resolved = await resolveCart(items.map((i) => ({ slug: i.slug, size: i.size, qty: i.qty })));
    if (!resolved.ok) {
      setBusy(false);
      return setErr(resolved.code === "RUPTURE"
        ? "Un article n'est plus en stock — modifiez votre panier."
        : "Un article n'est plus disponible — modifiez votre panier.");
    }
    if (!idemRef.current && typeof crypto !== "undefined" && "randomUUID" in crypto) {
      idemRef.current = crypto.randomUUID();
    }
    const res = await createOrder({
      name: f.name, phone: f.phone, wilaya: Number(f.wilaya), commune: f.commune,
      address: f.address, landmark: "", delivery: f.ship === "home" ? "domicile" : "stopdesk",
      carrier: "yalidine", items: resolved.items, source: "direct", campaign: "",
      promo: f.promo.trim(), idempotency: idemRef.current || `${Date.now()}`,
    });
    setBusy(false);
    if (!res.ok) {
      if (res.code.startsWith("RUPTURE")) return setErr("Un article vient de s'épuiser — modifiez votre panier.");
      if (res.code === "RATE_LIMITED") return setErr("Trop de tentatives — réessayez dans une heure.");
      return setErr("Commande impossible pour le moment — réessayez.");
    }
    clear();
    setDone({ number: res.number, total: res.total });
  };

  if (done)
    return (
      <div className="container-x py-14 md:py-20 max-w-xl">
        <div className="card-soft p-8 md:p-10 text-center">
          <p className="w-14 h-14 rounded-full bg-[#20744d] text-white font-bold text-2xl flex items-center justify-center mx-auto">✓</p>
          <h1 className="font-display font-bold text-3xl mt-4">Commande confirmée !</h1>
          <p dir="rtl" lang="ar" className="font-medium text-stone-600 mt-1">شكراً! تم استلام طلبك</p>
          <p className="text-sm font-light text-stone-600 mt-3 leading-relaxed">Merci <span dir="auto" className="name-auto inline-block font-medium">{f.name}</span>. Nous vous appellerons au <span className="font-semibold text-stone-900" dir="ltr">{f.phone}</span> en moins de 4 h. Total en espèces : <span className="font-bold text-stone-900">{formatDA(done.total)}</span> ({f.ship === "home" ? "à domicile · باب الدار" : "au bureau · المكتب"} — {wil.name}).</p>
          <p className="text-xs font-light text-stone-500 mt-2">N° de suivi : {done.number} — Suivez-le sur la page Suivi.</p>
          <div className="flex flex-wrap gap-2.5 justify-center mt-7">
            <Link href="/track-order" className="btn-fluid">Suivre ma commande</Link>
            <Link href="/shop" className="btn-ghost">Continuer mes achats</Link>
          </div>
        </div>
      </div>
    );

  return (
    <div className="container-x py-8 md:py-12 max-w-6xl">
      <p className="eyebrow">Dernière étape · <span dir="rtl" lang="ar">الخطوة الأخيرة</span></p>
      <h1 className="section-title mt-2">Finaliser la commande</h1>
      <p dir="rtl" lang="ar" className="font-medium text-stone-600 mt-1">أكمل طلبك — الدفع عند الاستلام</p>
      <p className="section-sub">Simple : nom, téléphone, wilaya, commune. Paiement en espèces à la réception.</p>
      <div className="grid lg:grid-cols-[1fr_360px] gap-5 mt-6 md:mt-8 items-start">
        <form onSubmit={submit} className="card-soft p-5 md:p-8 space-y-4">
          <div className="grid sm:grid-cols-2 gap-3.5">
            <label className="text-xs font-semibold block"><FieldLabel fr="Nom complet *" ar="الاسم الكامل" /><input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} dir="auto" className="input-soft mt-1.5" placeholder="Ex : Yacine Benali · مثال: ياسين" /></label>
            <label className="text-xs font-semibold block"><FieldLabel fr="Téléphone *" ar="رقم الهاتف" /><input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} inputMode="tel" dir="ltr" className="input-soft mt-1.5" placeholder="0550 00 00 00" /></label>
            <label className="text-xs font-semibold min-w-0 block"><FieldLabel fr="Wilaya *" ar="الولاية" />
              <select value={f.wilaya} onChange={(e) => setF({ ...f, wilaya: Number(e.target.value), commune: "" })} className="input-soft mt-1.5">
                {ctx.wilayas.map((w) => <option key={w.code} value={w.code}>{w.name}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold min-w-0 block"><FieldLabel fr="Commune *" ar="البلدية" />
              <select value={f.commune} onChange={(e) => setF({ ...f, commune: e.target.value })} className="input-soft mt-1.5">
                <option value="">Sélectionnez… · اختر…</option>
                {(COMMUNES[Number(f.wilaya)] ?? []).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold sm:col-span-2 block"><FieldLabel fr="Adresse / point de repère" ar="العنوان" /><input value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} dir="auto" className="input-soft mt-1.5" placeholder="Rue, arrêt de bus, mosquée… · الشارع، المسجد…" /></label>
          </div>
          <div>
            <p className="text-xs font-semibold mb-1.5"><FieldLabel fr="Mode de livraison" ar="طريقة التوصيل" /></p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setF({ ...f, ship: "home" })} className={`py-3 px-2 rounded-[10px] border-[1.5px] text-xs font-semibold transition leading-tight ${f.ship === "home" ? "border-[#1c1b18] bg-[#1c1b18] text-white" : "border-[#e8e3d8] hover:border-stone-400"}`}><span className="block">À domicile — {formatDA(table?.home ?? 500)}</span><span dir="rtl" lang="ar" className="block font-medium mt-0.5 opacity-90">باب الدار</span></button>
              <button type="button" onClick={() => setF({ ...f, ship: "stopdesk" })} className={`py-3 px-2 rounded-[10px] border-[1.5px] text-xs font-semibold transition leading-tight ${f.ship === "stopdesk" ? "border-[#1c1b18] bg-[#1c1b18] text-white" : "border-[#e8e3d8] hover:border-stone-400"}`}><span className="block">Au bureau — {formatDA(table?.stopdesk ?? table?.home ?? 500)}</span><span dir="rtl" lang="ar" className="block font-medium mt-0.5 opacity-90">المكتب</span></button>
            </div>
          </div>
          <label className="text-xs font-semibold block"><FieldLabel fr="Code promo (DZ10 = -10 %)" ar="رمز التخفيض" />
            <input value={f.promo} onChange={(e) => setF({ ...f, promo: e.target.value })} className="input-soft mt-1.5 uppercase" placeholder="DZ10" />
          </label>
          {err && <p className="text-xs font-medium text-[#c0452f] bg-[#fdf0ec] border border-[#f3d4c8] p-2.5 rounded-[10px]">{err}</p>}
          <button disabled={busy} className="btn-fluid w-full !py-4 disabled:opacity-50">{busy ? "Envoi…" : <>Confirmer — {formatDA(total)} <span dir="rtl" lang="ar">· تأكيد</span></>}</button>
          <p className="flex items-center justify-center gap-1.5 text-[11px] font-light text-stone-500"><ShieldCheck size={13} className="text-[#20744d]" /> Vous ne payez qu'à la réception du colis</p>
        </form>
        <aside className="card-soft p-6 lg:sticky lg:top-24">
          <p className="font-title font-semibold">Votre commande ({items.reduce((s, i) => s + i.qty, 0)})</p>
          <div className="mt-3 space-y-2">
            {items.map((i) => <p key={i.slug + i.size} className="flex justify-between gap-2 text-xs"><span className="font-normal">{i.qty}× {i.name} <span className="font-light text-stone-400">({i.size})</span></span><span className="font-semibold whitespace-nowrap">{formatDA(i.qty * i.price)}</span></p>)}
            {items.length === 0 && <p className="text-xs font-light text-stone-400">Panier vide pour le moment.</p>}
          </div>
          <div className="border-t border-dashed border-[#e8e3d8] mt-4 pt-4 space-y-1.5 text-sm">
            <p className="flex justify-between font-light"><span>Sous-total</span><span className="font-medium">{formatDA(subtotal)}</span></p>
            <p className="flex justify-between font-light text-[#20744d]"><span>Remise</span><span className="font-medium">−{formatDA(discount)}</span></p>
            <p className="flex justify-between font-light"><span>Livraison ({wil.name})</span><span className="font-medium">{formatDA(ship)}</span></p>
            <p className="flex justify-between price-bold text-lg pt-2"><span>Total en espèces</span><span>{formatDA(total)}</span></p>
          </div>
        </aside>
      </div>
    </div>
  );
}
