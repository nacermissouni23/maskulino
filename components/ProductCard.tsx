"use client";
import Link from "next/link";
import Image from "next/image";
import { Star, Plus } from "lucide-react";
import { formatDA, type Product } from "@/lib/data";
import { useCart } from "./CartProvider";

export function Stars({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5 text-amber-400" aria-label={`Note ${value}/5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={12} fill={i <= Math.round(value) ? "currentColor" : "none"} className={i <= Math.round(value) ? "" : "text-gray-300"} />
      ))}
    </span>
  );
}

export default function ProductCard({ p }: { p: Product }) {
  const { add } = useCart();
  return (
    <div className="card-soft overflow-hidden group hover:shadow-[0_18px_44px_rgba(80,80,160,0.14)] hover:-translate-y-0.5 transition">
      <Link href={`/product/${p.slug}`} className="block relative aspect-[3/4] bg-[#eef3ff] overflow-hidden rounded-t-[18px]">
        <Image src={p.image} alt={p.name} fill className="object-cover group-hover:scale-105 transition duration-500" sizes="(max-width:768px) 50vw, 25vw" />
        {p.badge && (
          <span className={`absolute top-2.5 left-2.5 text-[10px] font-semibold tracking-wider px-2.5 py-1 text-white rounded-full ${p.badge === "NOUVEAU" ? "bg-[#14142b]" : p.badge === "TOP VENTE" ? "bg-emerald-500" : "bg-red-500"}`}>
            {p.badge}
          </span>
        )}
        <span className="absolute bottom-2.5 left-2.5 text-[10px] font-medium bg-white/95 px-2.5 py-1 rounded-full shadow">Paiement à la livraison</span>
      </Link>
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/product/${p.slug}`} className="font-title font-semibold text-[13px] md:text-sm leading-snug line-clamp-2 hover:text-[#6c4dff]">
            {p.name}
          </Link>
          <span className="price-bold text-sm whitespace-nowrap">{formatDA(p.price)}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="flex items-center gap-1.5">
            <Stars value={p.rating} />
            <span className="text-[11px] font-light text-gray-500">({p.reviews})</span>
          </span>
          {p.oldPrice && <span className="text-[11px] font-light text-gray-400 line-through">{formatDA(p.oldPrice)}</span>}
        </div>
        <button onClick={() => add(p, p.sizes[1] ?? p.sizes[0], 1)} className="mt-3 w-full h-11 rounded-xl bg-[#14142b] text-white text-[11px] font-semibold tracking-[0.12em] flex items-center justify-center gap-1.5 hover:bg-black active:scale-[0.98] transition uppercase">
          <Plus size={15} /> Ajouter au panier
        </button>
      </div>
    </div>
  );
}
