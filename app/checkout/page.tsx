"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { WILAYAS, formatDA } from "@/lib/data";
import { ShieldCheck } from "lucide-react";

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const [f, setF] = useState({ name: "", phone: "", wilaya: 16, commune: "", address: "", ship: "home" as "home" | "stopdesk", promo: "" });
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
  const wil = useMemo(() => WILAYAS.find((w) => w.code === Number(f.wilaya))!, [f.wilaya]);
  const ship = f.ship === "home" ? wil.home : wil.stopdesk;
  const discount = f.promo.trim().toUpperCase() === "DZ10" ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal - discount + (items.length ? ship : 0);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length) return setErr("Votre panier est vide.");
    if (f.name.trim().length < 3) return setErr("Veuillez saisir votre nom complet.");
    if (!/^(05|06|07)\d{8}$/.test(f.phone.replace(/[\s-]/g, ""))) return setErr("Téléphone invalide — exemple : 0550123456.");
    if (!f.commune.trim()) return setErr("Veuillez saisir votre commune.");
    setErr(""); setDone(true); clear();
  };

  if (done)
    return (
      <div className="container-x py-14 md:py-20 max-w-xl">
        <div className="card-soft p-8 md:p-10 text-center">
          <p className="w-14 h-14 rounded-full bg-[#20744d] text-white font-bold text-2xl flex items-center justify-center mx-auto">✓</p>
          <h1 className="font-display font-bold text-3xl mt-4">Commande confirmée !</h1>
          <p className="text-sm font-light text-stone-600 mt-3 leading-relaxed">Merci {f.name}. Nous vous appellerons au <span className="font-semibold text-stone-900">{f.phone}</span> en moins de 4 h. Total en espèces : <span className="font-bold text-stone-900">{formatDA(total)}</span> ({f.ship === "home" ? "à domicile" : "au bureau"} — {wil.name}).</p>
          <div className="flex flex-wrap gap-2.5 justify-center mt-7">
            <Link href="/track-order" className="btn-fluid">Suivre ma commande</Link>
            <Link href="/shop" className="btn-ghost">Continuer mes achats</Link>
          </div>
        </div>
      </div>
    );

  return (
    <div className="container-x py-8 md:py-12 max-w-6xl">
      <p className="eyebrow">Dernière étape</p>
      <h1 className="section-title mt-2">Finaliser la commande</h1>
      <p className="section-sub">Simple : nom, téléphone, wilaya, commune. Paiement en espèces à la réception.</p>
      <div className="grid lg:grid-cols-[1fr_360px] gap-5 mt-6 md:mt-8 items-start">
        <form onSubmit={submit} className="card-soft p-5 md:p-8 space-y-4">
          <div className="grid sm:grid-cols-2 gap-3.5">
            <label className="text-xs font-semibold">Nom complet *<input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="input-soft mt-1.5" placeholder="Ex : Yacine Benali" /></label>
            <label className="text-xs font-semibold">Téléphone *<input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} inputMode="tel" className="input-soft mt-1.5" placeholder="0550 00 00 00" /></label>
            <label className="text-xs font-semibold">Wilaya *
              <select value={f.wilaya} onChange={(e) => setF({ ...f, wilaya: Number(e.target.value) })} className="input-soft mt-1.5">
                {WILAYAS.map((w) => <option key={w.code} value={w.code}>{w.name}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold">Commune *<input value={f.commune} onChange={(e) => setF({ ...f, commune: e.target.value })} className="input-soft mt-1.5" placeholder="Ex : Bab Ezzouar" /></label>
            <label className="text-xs font-semibold sm:col-span-2">Adresse / point de repère<input value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} className="input-soft mt-1.5" placeholder="Rue, arrêt de bus, mosquée…" /></label>
          </div>
          <div>
            <p className="text-xs font-semibold mb-1.5">Mode de livraison</p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setF({ ...f, ship: "home" })} className={`py-3.5 rounded-[10px] border-[1.5px] text-xs font-semibold transition ${f.ship === "home" ? "border-[#1c1b18] bg-[#1c1b18] text-white" : "border-[#e8e3d8] hover:border-stone-400"}`}>À domicile — {formatDA(wil.home)}</button>
              <button type="button" onClick={() => setF({ ...f, ship: "stopdesk" })} className={`py-3.5 rounded-[10px] border-[1.5px] text-xs font-semibold transition ${f.ship === "stopdesk" ? "border-[#1c1b18] bg-[#1c1b18] text-white" : "border-[#e8e3d8] hover:border-stone-400"}`}>Au bureau — {formatDA(wil.stopdesk)}</button>
            </div>
          </div>
          <label className="text-xs font-semibold block">Code promo (DZ10 = -10 %)
            <input value={f.promo} onChange={(e) => setF({ ...f, promo: e.target.value })} className="input-soft mt-1.5 uppercase" placeholder="DZ10" />
          </label>
          {err && <p className="text-xs font-medium text-[#c0452f] bg-[#fdf0ec] border border-[#f3d4c8] p-2.5 rounded-[10px]">{err}</p>}
          <button className="btn-fluid w-full !py-4">Confirmer — {formatDA(total)}</button>
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
