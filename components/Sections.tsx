"use client";
import { useMemo, useState } from "react";
import { Minus, Plus, ShieldCheck, Truck, RefreshCcw, Headset } from "lucide-react";
import { WILAYAS, formatDA, type Product } from "@/lib/data";

export function TrustBar() {
  const items = [
    { icon: ShieldCheck, t: "Paiement à la livraison", s: "Payez à la réception" },
    { icon: Truck, t: "58 wilayas", s: "2 à 5 jours, Yalidine" },
    { icon: RefreshCcw, t: "Échange sous 7 jours", s: "Taille échangée gratuitement" },
    { icon: Headset, t: "WhatsApp en 4 h", s: "Confirmation rapide" },
  ];
  return (
    <div className="max-w-7xl mx-auto px-4 -mt-6 relative z-10">
      <div className="card-soft grid grid-cols-2 md:grid-cols-4 divide-x divide-[#f0efff] overflow-hidden">
        {items.map((it, i) => (
          <div key={i} className="p-4 md:p-5 flex items-center gap-3">
            <span className="w-11 h-11 rounded-2xl bg-[#eef0ff] text-[#5b6cff] flex items-center justify-center shrink-0">
              <it.icon size={19} />
            </span>
            <span>
              <span className="block text-xs md:text-sm font-semibold">{it.t}</span>
              <span className="block text-[11px] font-light text-gray-500 mt-0.5">{it.s}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function QtyStepper({ qty, setQty }: { qty: number; setQty: (n: number) => void }) {
  return (
    <div className="flex items-center border-[1.5px] border-gray-200 rounded-xl h-12 bg-white">
      <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} className="px-3.5 h-full hover:text-[#6c4dff]" aria-label="Diminuer"><Minus size={16} /></button>
      <span className="w-8 text-center font-semibold">{qty}</span>
      <button type="button" onClick={() => setQty(Math.min(10, qty + 1))} className="px-3.5 h-full hover:text-[#6c4dff]" aria-label="Augmenter"><Plus size={16} /></button>
    </div>
  );
}

export function QuickOrderForm({ product }: { product: Product }) {
  const [form, setForm] = useState({ name: "", phone: "", wilaya: 16, commune: "", address: "", size: product.sizes[1] ?? product.sizes[0], qty: 1, ship: "home" as "home" | "stopdesk" });
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const wilaya = useMemo(() => WILAYAS.find((w) => w.code === Number(form.wilaya))!, [form.wilaya]);
  const shipCost = form.ship === "home" ? wilaya.home : wilaya.stopdesk;
  const total = product.price * form.qty + shipCost;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const phoneOk = /^(05|06|07)\d{8}$/.test(form.phone.replace(/[\s-]/g, ""));
    if (form.name.trim().length < 3) return setErr("Veuillez saisir votre nom complet.");
    if (!phoneOk) return setErr("Numéro invalide — exemple : 0550123456 (05 / 06 / 07 + 10 chiffres).");
    if (!form.commune.trim()) return setErr("Veuillez saisir votre commune.");
    setErr("");
    setDone(true);
    (window as unknown as { fbq?: (...a: unknown[]) => void }).fbq?.("track", "Purchase", { value: total, currency: "DZD" });
  };

  if (done)
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
        <p className="text-3xl">✅</p>
        <p className="font-semibold text-lg mt-2">Merci {form.name} ! Commande bien reçue.</p>
        <p className="text-sm font-light text-gray-600 mt-2 leading-relaxed">Nous allons vous appeler sur le <span className="font-semibold text-gray-900">{form.phone}</span> en moins de 4 h pour confirmer. Total à payer en espèces : <span className="font-bold text-gray-900">{formatDA(total)}</span></p>
        <p className="text-xs font-light text-gray-500 mt-2">N° de suivi : MSK-{Math.floor(8000 + Math.random() * 999)} — Suivez-le sur la page Suivi.</p>
        <button onClick={() => setDone(false)} className="text-xs font-medium underline underline-offset-4 mt-3">Passer une nouvelle commande</button>
      </div>
    );

  return (
    <form onSubmit={submit} className="bg-white border border-[#eceafa] rounded-2xl p-5 md:p-6 space-y-4 shadow-[0_12px_34px_rgba(80,80,160,0.08)]">
      <div>
        <p className="font-title font-semibold text-lg">Commander — paiement à la livraison</p>
        <p className="text-xs font-light text-gray-500 mt-1">Remplissez le formulaire, on vous confirme par téléphone ou WhatsApp. Aucun prépaiement.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <p className="text-xs font-semibold mb-1.5">Taille</p>
          <div className="flex gap-1.5 flex-wrap">
            {product.sizes.map((s) => (
              <button type="button" key={s} onClick={() => setForm({ ...form, size: s })} className={`min-w-11 px-3 h-10 text-xs font-semibold border-[1.5px] rounded-xl transition ${form.size === s ? "bg-[#14142b] text-white border-[#14142b]" : "bg-white border-gray-200 hover:border-gray-400"}`}>{s}</button>
            ))}
          </div>
        </div>
        <label className="text-xs font-semibold">Nom complet *
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex : Yacine Benali" className="input-soft mt-1.5" />
        </label>
        <label className="text-xs font-semibold">Téléphone *
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} inputMode="tel" placeholder="0550 00 00 00" className="input-soft mt-1.5" />
        </label>
        <label className="text-xs font-semibold">Wilaya *
          <select value={form.wilaya} onChange={(e) => setForm({ ...form, wilaya: Number(e.target.value) })} className="input-soft mt-1.5">
            {WILAYAS.map((w) => <option key={w.code} value={w.code}>{w.name} — {formatDA(w.home)}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold">Commune *
          <input value={form.commune} onChange={(e) => setForm({ ...form, commune: e.target.value })} placeholder="Ex : Bab Ezzouar" className="input-soft mt-1.5" />
        </label>
        <label className="text-xs font-semibold col-span-2">Adresse / point de repère
          <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Rue, arrêt de bus, mosquée…" className="input-soft mt-1.5" />
        </label>
        <div className="col-span-2 grid grid-cols-2 gap-2">
          {(["home", "stopdesk"] as const).map((k) => (
            <button type="button" key={k} onClick={() => setForm({ ...form, ship: k })} className={`min-h-13 py-3 rounded-xl border-[1.5px] text-xs font-semibold transition ${form.ship === k ? "border-[#6c4dff] bg-[#f3f0ff] text-[#3d2dbb]" : "border-gray-200"}`}>
              {k === "home" ? `À domicile — ${formatDA(wilaya.home)}` : `Au bureau — ${formatDA(wilaya.stopdesk)}`}
            </button>
          ))}
        </div>
        <div className="col-span-2 flex items-center justify-between gap-3">
          <QtyStepper qty={form.qty} setQty={(qty) => setForm({ ...form, qty })} />
          <div className="text-right">
            <p className="font-light text-gray-500 text-xs">Produit + livraison</p>
            <p className="font-bold text-xl">{formatDA(total)}</p>
          </div>
        </div>
      </div>
      {err && <p className="text-xs font-medium text-red-600 bg-red-50 border border-red-100 p-2.5 rounded-xl">{err}</p>}
      <button className="btn-fluid w-full !py-4 !text-[13px]">Confirmer la commande</button>
      <p className="text-[11px] font-light text-center text-gray-500">Ne payez qu'à la réception • Échange sous 7 jours • Confirmation en moins de 4 h</p>
    </form>
  );
}
