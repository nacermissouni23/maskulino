"use client";
import { useState } from "react";
import Image from "next/image";
import { PRODUCTS, formatDA } from "@/lib/data";
import { Stars } from "@/components/ProductCard";
import { useCart } from "@/components/CartProvider";
import { QtyStepper, QuickOrderForm } from "@/components/Sections";
import Link from "next/link";

export default function ProductDetailClient({ slug }: { slug: string }) {
  const p = PRODUCTS.find((x) => x.slug === slug)!;
  const { add } = useCart();
  const [size, setSize] = useState(p.sizes[1] ?? p.sizes[0]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 mt-6 md:mt-8 items-start">
      <div>
        <div className="relative aspect-[3/4] rounded-[20px] bg-[#ece7d9] overflow-hidden border border-[#e8e3d8]">
          <Image src={p.image} alt={p.name} fill className="object-cover" priority />
          {p.badge && <span className="absolute top-4 left-4 bg-[#1c1b18] text-white text-[11px] font-semibold tracking-wide px-3 py-1.5 rounded-full">{p.badge}</span>}
        </div>
        <div className="grid grid-cols-4 gap-2 mt-3 text-[11px] font-medium text-center">
          {["Photo réelle", "Vidéo disponible", "Guide des tailles", "Échange 7 jours"].map((t) => (
            <span key={t} className="bg-white border border-[#e8e3d8] rounded-xl px-1 py-2.5">{t}</span>
          ))}
        </div>
      </div>
      <div>
        <p className="eyebrow">{p.category}</p>
        <h1 className="font-display font-bold text-[28px] md:text-[36px] leading-tight mt-2">{p.name}</h1>
        <div className="flex items-center gap-2 mt-3">
          <Stars value={p.rating} />
          <span className="text-xs font-light text-stone-500">{p.rating} • {p.reviews} avis vérifiés</span>
        </div>
        <p className="mt-4 flex items-baseline gap-2.5">
          <span className="price-bold text-[26px]">{formatDA(p.price)}</span>
          {p.oldPrice && <span className="line-through text-stone-400 font-light">{formatDA(p.oldPrice)}</span>}
        </p>
        <p className="text-xs font-medium text-[#20744d] bg-[#eef5ef] border border-[#cfe3d3] rounded-xl px-3.5 py-2.5 mt-4 w-fit">En stock ({p.stock}) — Expédition en 24 h depuis Alger • 58 wilayas</p>
        <p className="text-sm font-light text-stone-600 mt-4 leading-relaxed max-w-lg">{p.desc}</p>
        <p className="label-bold mt-6 mb-2.5">Taille — guide : M = 170 cm, L = 175, XL = 180, XXL = 185+</p>
        <div className="flex gap-2 flex-wrap">
          {p.sizes.map((s) => (
            <button key={s} onClick={() => setSize(s)} className={`min-w-12 h-12 px-3.5 border-[1.5px] rounded-[10px] text-sm font-semibold transition ${size === s ? "bg-[#1c1b18] text-white border-[#1c1b18]" : "bg-white border-[#e8e3d8] hover:border-stone-400"}`}>{s}</button>
          ))}
        </div>
        <div className="flex gap-2.5 mt-5 max-w-lg">
          <QtyStepper qty={qty} setQty={setQty} />
          <button onClick={() => { add(p, size, qty); setAdded(true); setTimeout(() => setAdded(false), 2000); }} className="btn-fluid flex-1">
            {added ? "Ajouté ✓" : "Ajouter au panier"}
          </button>
        </div>
        <Link href="/cart" className="block text-xs font-semibold mt-3 underline underline-offset-4">Voir le panier →</Link>
        <div className="mt-7 max-w-lg"><QuickOrderForm product={{ ...p }} /></div>
      </div>
    </div>
  );
}
