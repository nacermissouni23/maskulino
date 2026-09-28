"use client";
import { useState } from "react";
import Image from "next/image";
import { formatDA } from "@/lib/data";
import { QuickOrderForm } from "@/components/Sections";
import type { ShopProduct, ShopContext } from "@/lib/storefront";

export default function ProductDetailClient({ product, shipping }: { product: ShopProduct; shipping: ShopContext }) {
  const p = product;
  const images = p.gallery.length > 0 ? p.gallery.map((g) => g.src) : [p.image];
  const [activeImg, setActiveImg] = useState(0);

  // La fiche affiche la photo liée à la couleur choisie (lien saisi dans l'admin).
  function onColorChange(color: string) {
    const i = p.gallery.findIndex((g) => g.color === color);
    setActiveImg(i >= 0 ? i : 0);
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 mt-6 md:mt-8 items-start">
      <div>
        <div className="relative aspect-[3/4] rounded-[20px] bg-[#ece7d9] overflow-hidden border border-[#e8e3d8]">
          <Image src={images[activeImg] ?? p.image} alt={p.name} fill className="object-cover" priority />
        </div>
        {images.length > 1 && (
          <div className="grid grid-cols-4 gap-2 mt-3">
            {images.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveImg(i)}
                aria-label={`Voir la photo ${i + 1}`}
                className={`relative aspect-square rounded-xl overflow-hidden border-[1.5px] transition ${activeImg === i ? "border-[#1c1b18]" : "border-[#e8e3d8] hover:border-stone-400"}`}
              >
                <Image src={src} alt={`${p.name} — photo ${i + 1}`} fill className="object-cover" sizes="15vw" />
              </button>
            ))}
          </div>
        )}
      </div>
      <div>
        <p className="eyebrow">{p.categoryName}</p>
        <h1 className="font-display font-bold text-[28px] md:text-[36px] leading-tight mt-2">{p.name}</h1>
        <p className="mt-4 flex items-baseline gap-2.5">
          <span className="price-bold text-[26px]">{formatDA(p.price)}</span>
          {p.oldPrice && <span className="line-through text-stone-400 font-light">{formatDA(p.oldPrice)}</span>}
        </p>
        <p className="text-sm font-light text-stone-600 mt-4 leading-relaxed max-w-lg">{p.desc}</p>
        <div className="mt-7 max-w-lg"><QuickOrderForm product={p} shipping={shipping} onColorChange={onColorChange} /></div>
      </div>
    </div>
  );
}
