"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/CartProvider";
import { formatDA } from "@/lib/data";
import { useShopSettings, whatsappLink } from "@/lib/shop-settings";
import { useShipping } from "@/lib/shipping";
import { getActivePromos } from "@/lib/actions/storefront";

export default function CartPage() {
  const { items, setQty, remove, subtotal, clear } = useCart();
  const { settings } = useShopSettings();
  const { carriers, prices } = useShipping();
  const [promos, setPromos] = useState<{ code: string; type: string; value: number }[]>([]);
  useEffect(() => {
    getActivePromos().then(setPromos).catch(() => undefined);
  }, []);
  const wa = whatsappLink(settings, "Salam, je veux commander");
  // Fourchette réelle des frais domicile, calculée depuis les transporteurs actifs.
  const fees: number[] = [];
  for (const c of carriers) {
    if (!c.actif) continue;
    const table = prices[c.id];
    if (!table) continue;
    for (const p of Object.values(table)) if (p.couvert) fees.push(p.home);
  }
  const feeTxt = fees.length ? `${formatDA(Math.min(...fees))} à ${formatDA(Math.max(...fees))}` : null;
  const totalQty = items.reduce((s, i) => s + i.qty, 0);
  return (
    <div className="container-x py-8 md:py-12 max-w-5xl">
      <p className="eyebrow">Votre sélection · <span dir="rtl" lang="ar">السلة</span></p>
      <h1 className="section-title mt-2">Panier ({totalQty} article{totalQty > 1 ? "s" : ""})</h1>
      {items.length === 0 ? (
        <div className="card-soft text-center py-14 md:py-20 mt-6 md:mt-8">
          <span className="w-16 h-16 rounded-2xl bg-[#efe9d8] flex items-center justify-center mx-auto"><ShoppingBag size={26} className="text-[#7a5a28]" /></span>
          <p className="font-semibold text-lg mt-4">Votre panier est vide</p>
          <p className="text-sm font-light text-stone-500 mt-1">Découvrez nos sweats, ensembles et jeans.</p>
          <Link href="/shop" className="btn-fluid mt-6">Voir la boutique</Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_330px] gap-5 mt-6 md:mt-8 items-start">
          <div className="space-y-3">
            {items.map((it) => (
              <div key={it.slug + it.size} className="card-soft p-3.5 md:p-4 flex gap-3.5">
                <span className="relative w-20 h-24 shrink-0 rounded-xl overflow-hidden bg-[#ece7d9]">
                  <Image src={it.image} alt={it.name} fill className="object-cover" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-snug">{it.name}</p>
                  <p className="text-xs font-light text-stone-500 mt-0.5">Taille : {it.size} • Paiement à la livraison</p>
                  <div className="flex items-center justify-between mt-2.5">
                    <span className="flex items-center border-[1.5px] border-[#e8e3d8] rounded-[10px] h-10">
                      <button onClick={() => setQty(it.slug, it.size, it.qty - 1)} className="px-3 font-semibold" aria-label="Diminuer">−</button>
                      <span className="w-6 text-center text-sm font-semibold">{it.qty}</span>
                      <button onClick={() => setQty(it.slug, it.size, it.qty + 1)} className="px-3 font-semibold" aria-label="Augmenter">+</button>
                    </span>
                    <p className="price-bold text-sm">{formatDA(it.price * it.qty)}</p>
                  </div>
                </div>
                <button onClick={() => remove(it.slug, it.size)} aria-label="Supprimer" className="text-stone-300 hover:text-[#c0452f] h-fit transition"><Trash2 size={17} /></button>
              </div>
            ))}
            <button onClick={clear} className="text-xs font-medium underline underline-offset-4 text-stone-500">Vider le panier</button>
          </div>
          <div className="card-soft p-6 lg:sticky lg:top-24">
            <p className="font-title font-semibold">Résumé</p>
            <p className="text-xs font-light text-stone-500">Hors livraison (selon wilaya)</p>
            <p className="price-bold text-[26px] mt-2">{formatDA(subtotal)}</p>
            <div className="text-xs mt-4 space-y-2 bg-[#f5f3ee] border border-[#e8e3d8] p-3.5 rounded-xl font-normal leading-relaxed">
              {promos.length > 0 && promos[0].code ? (
                <p>Code <span className="font-bold">{promos[0].code}</span> = {promos[0].type === "pourcentage" ? `- ${promos[0].value} %` : `- ${formatDA(promos[0].value)}`} (vu sur Facebook)</p>
              ) : (
                <p>Nos codes promo sont partagés sur Facebook</p>
              )}
              <p>Livraison calculée à l'étape suivante{feeTxt ? ` : ${feeTxt}` : ""}</p>
              <p>Paiement en espèces à la réception</p>
            </div>
            <Link href="/checkout" className="btn-fluid w-full mt-5">Commander <ArrowRight size={15} /></Link>
            <a href={wa} target="_blank" rel="noopener noreferrer" className="block text-center text-xs font-semibold mt-3 text-[#20744d] hover:underline underline-offset-4">ou commander via WhatsApp →</a>
          </div>
        </div>
      )}
    </div>
  );
}
