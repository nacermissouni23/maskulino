"use client";
import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { formatDA, type Product } from "@/lib/data";

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
  return (
    <div className="card-soft overflow-hidden group hover:shadow-[0_16px_40px_rgba(28,27,24,0.12)] hover:-translate-y-0.5 transition">
      <Link href={`/product/${p.slug}`} className="block relative aspect-[3/4] bg-[#ece7d9] overflow-hidden rounded-t-[16px]">
        <Image src={p.image} alt={p.name} fill className="object-cover group-hover:scale-105 transition duration-500" sizes="(max-width:768px) 50vw, 25vw" />
      </Link>
      <div className="p-3.5 md:p-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/product/${p.slug}`} className="font-title font-semibold text-[13px] md:text-sm leading-snug line-clamp-2 hover:underline underline-offset-4">
            {p.name}
          </Link>
          <span className="text-right shrink-0">
            <span className="price-bold text-sm whitespace-nowrap">{formatDA(p.price)}</span>
            {p.oldPrice && <span className="block text-[11px] font-light text-stone-400 line-through">{formatDA(p.oldPrice)}</span>}
          </span>
        </div>
        <Link href={`/product/${p.slug}`} className="mt-3 w-full h-11 rounded-[10px] bg-[#1c1b18] text-white text-[11px] font-semibold tracking-[0.1em] flex items-center justify-center hover:bg-black active:scale-[0.98] transition uppercase">
          Commander
        </Link>
      </div>
    </div>
  );
}
