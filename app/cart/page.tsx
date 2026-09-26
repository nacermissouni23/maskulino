"use client";
import Link from "next/link";
import Image from "next/image";
import { Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { formatDA } from "@/lib/data";

export default function CartPage() {
  const { items, setQty, remove, subtotal, clear } = useCart();
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <p className="eyebrow">Votre sélection</p>
      <h1 className="section-title mt-2">Panier ({items.reduce((s, i) => s + i.qty, 0)} article{items.reduce((s, i) => s + i.qty, 0) > 1 ? "s" : ""})</h1>
      {items.length === 0 ? (
        <div className="card-soft text-center py-16 mt-6">
          <span className="w-16 h-16 rounded-3xl bg-[#f3f0ff] flex items-center justify-center mx-auto"><ShoppingBag size={26} className="text-[#6c4dff]" /></span>
          <p className="font-semibold text-lg mt-4">Votre panier est vide</p>
          <p className="text-sm font-light text-gray-500 mt-1">Découvrez nos sweats, ensembles et jeans.</p>
          <Link href="/shop" className="btn-fluid mt-6">Voir la boutique</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-[1fr_320px] gap-5 mt-6 items-start">
          <div className="space-y-3">
            {items.map((it) => (
              <div key={it.slug + it.size} className="card-soft p-3.5 flex gap-3.5">
                <span className="relative w-20 h-24 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                  <Image src={it.image} alt={it.name} fill className="object-cover" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-snug">{it.name}</p>
                  <p className="text-xs font-light text-gray-500 mt-0.5">Taille : {it.size} • Paiement à la livraison</p>
                  <div className="flex items-center justify-between mt-2.5">
                    <span className="flex items-center border-[1.5px] border-gray-200 rounded-xl h-10">
                      <button onClick={() => setQty(it.slug, it.size, it.qty - 1)} className="px-3 font-semibold" aria-label="Diminuer">−</button>
                      <span className="w-6 text-center text-sm font-semibold">{it.qty}</span>
                      <button onClick={() => setQty(it.slug, it.size, it.qty + 1)} className="px-3 font-semibold" aria-label="Augmenter">+</button>
                    </span>
                    <p className="price-bold text-sm">{formatDA(it.price * it.qty)}</p>
                  </div>
                </div>
                <button onClick={() => remove(it.slug, it.size)} aria-label="Supprimer" className="text-gray-300 hover:text-red-500 h-fit transition"><Trash2 size={17} /></button>
              </div>
            ))}
            <button onClick={clear} className="text-xs font-medium underline underline-offset-4 text-gray-500">Vider le panier</button>
          </div>
          <div className="card-soft p-6 md:sticky md:top-24">
            <p className="font-title font-semibold">Résumé</p>
            <p className="text-xs font-light text-gray-500">Hors livraison (selon wilaya)</p>
            <p className="price-bold text-[26px] mt-2">{formatDA(subtotal)}</p>
            <div className="text-xs mt-4 space-y-2 bg-[#f6f5ff] border border-[#eceafa] p-3.5 rounded-2xl font-normal">
              <p>Code <span className="font-bold">DZ10</span> = -10 % (vu sur Facebook)</p>
              <p>Livraison calculée à l'étape suivante : 250 à 900 DA</p>
              <p>Paiement en espèces à la réception</p>
            </div>
            <Link href="/checkout" className="btn-fluid w-full mt-5">Commander <ArrowRight size={15} /></Link>
            <a href="https://wa.me/213770000000" className="block text-center text-xs font-semibold mt-3 text-emerald-600 hover:underline underline-offset-4">ou commander via WhatsApp →</a>
          </div>
        </div>
      )}
    </div>
  );
}
