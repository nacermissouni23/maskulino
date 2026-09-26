"use client";
import Link from "next/link";
import Image from "next/image";
import { Star, Plus } from "lucide-react";
import { formatDA, type Product } from "@/lib/data";
import { useCart } from "./CartProvider";

export function Stars({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5 text-[#e8a33d]" aria-label={`Note ${value}/5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={12} fill={i <= Math.round(value) ? "currentColor" : "none"} className={i <= Math.round(value) ? "" : "text-stone-300"} />
      ))}
    </span>
  );
}

export default function ProductCard({ p }: { p: Product }) {
  const { add } = useCart();
  return (
    <div className="card-soft overflow-hidden group hover:shadow-[0_16px_40px_rgba(28,27,24,0.12)] hover:-translate-y-0.5 transition">
      <Link href={`/product/${p.slug}`} className="block relative aspect-[3/4] bg-[#ece7d9] overflow-hidden rounded-t-[16px]">
        <Image src={p.image} alt={p.name} fill className="object-cover group-hover:scale-105 transition duration-500" sizes="(max-width:768px) 50vw, 25vw" />
        {p.badge && (
          <span className={`absolute top-2.5 left-2.5 text-[10px] font-semibold tracking-wide px-2.5 py-1 text-white rounded-full ${p.badge === "NOUVEAU" ? "bg-[#1c1b18]" : p.badge === "TOP VENTE" || p.badge === "PACK" ? "bg-[#a06a2c]" : "bg-[#c0452f]"}`}>
            {p.badge}
          </span>
        )}
        <span className="absolute bottom-2.5 left-2.5 text-[10px] font-medium bg-white/95 px-2.5 py-1 rounded-full shadow">Paiement à la livraison</span>
      </Link>
      <div className="p-3.5 md:p-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/product/${p.slug}`} className="font-title font-semibold text-[13px] md:text-sm leading-snug line-clamp-2 hover:underline underline-offset-4">
            {p.name}
          </Link>
          <span className="price-bold text-sm whitespace-nowrap">{formatDA(p.price)}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="flex items-center gap-1.5">
            <Stars value={p.rating} />
            <span className="text-[11px] font-light text-stone-500">({p.reviews})</span>
          </span>
          {p.oldPrice && <span className="text-[11px] font-light text-stone-400 line-through">{formatDA(p.oldPrice)}</span>}
        </div>
        <button onClick={() => add(p, p.sizes[1] ?? p.sizes[0], 1)} className="mt-3 w-full h-11 rounded-[10px] bg-[#1c1b18] text-white text-[11px] font-semibold tracking-[0.1em] flex items-center justify-center gap-1.5 hover:bg-black active:scale-[0.98] transition uppercase">
          <Plus size={15} /> Ajouter au panier
        </button>
      </div>
    </div>
  );
}
