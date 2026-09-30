"use client";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, Search } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useCoveredWilayaCount } from "@/lib/shipping";
import type { ShopProduct } from "@/lib/storefront";

function toCard(p: ShopProduct) {
  return {
    slug: p.slug, name: p.name, category: p.category, price: p.price,
    oldPrice: p.oldPrice, rating: 5, reviews: 0, sizes: p.sizes, colors: p.colors,
    image: p.image, gallery: p.gallery.map((g) => g.src), desc: p.desc, stock: p.totalStock,
  };
}

export default function ShopPage({ initial, categories }: {
  initial: ShopProduct[];
  categories: { slug: string; name: string }[];
}) {
  const params = useSearchParams();
  const initialCat = params.get("cat") ?? "all";
  const wilayas = useCoveredWilayaCount();
  const [cat, setCat] = useState(initialCat);
  const [sort, setSort] = useState("pop");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    let l = [...initial];
    if (cat !== "all") l = l.filter((p) => p.category === cat);
    if (q) l = l.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
    if (sort === "cheap") l.sort((a, b) => a.price - b.price);
    if (sort === "exp") l.sort((a, b) => b.price - a.price);
    if (sort === "rate") l.sort((a, b) => b.totalStock - a.totalStock);
    return l;
  }, [initial, cat, sort, q]);

  return (
    <div className="container-x py-8 md:py-12">
      <p className="eyebrow">Catalogue</p>
      <h1 className="section-title mt-2">La boutique</h1>
      <p className="section-sub">Paiement à la livraison • {wilayas > 0 ? `${wilayas} wilayas` : "toutes wilayas"} • Livraison en 2 à 5 jours</p>

      <div className="card-soft p-3 flex gap-2 mt-6 md:mt-8 sticky top-[68px] z-10">
        <label className="flex-1 flex items-center gap-2 bg-[#f5f3ee] rounded-[10px] px-3">
          <Search size={16} className="text-stone-400 shrink-0" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un sweat, un ensemble… · ابحث…" dir="auto" className="flex-1 h-11 bg-transparent outline-none text-sm font-normal placeholder:font-light" />
        </label>
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-11 border-[1.5px] border-[#e8e3d8] rounded-[10px] px-3 text-sm font-medium bg-white shrink-0" aria-label="Trier">
          <option value="pop">Populaires</option>
          <option value="cheap">Prix croissant</option>
          <option value="exp">Prix décroissant</option>
          <option value="rate">Mieux notés</option>
        </select>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mt-4 pb-1">
        <button onClick={() => setCat("all")} className={`px-5 h-10 text-xs font-semibold rounded-full whitespace-nowrap border-[1.5px] transition ${cat === "all" ? "bg-[#1c1b18] text-white border-[#1c1b18]" : "bg-white border-[#e8e3d8]"}`}>Tout</button>
        {categories.map((c) => (
          <button key={c.slug} onClick={() => setCat(c.slug)} className={`px-5 h-10 text-xs font-semibold rounded-full whitespace-nowrap border-[1.5px] transition ${cat === c.slug ? "bg-[#1c1b18] text-white border-[#1c1b18]" : "bg-white border-[#e8e3d8]"}`}>{c.name}</button>
        ))}
      </div>

      <p className="text-xs font-light text-stone-500 mt-4 flex items-center gap-1.5"><SlidersHorizontal size={13}/> {list.length} article{list.length > 1 ? "s" : ""} — photos optimisées pour la 3G</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mt-4 md:mt-5">
        {list.map((p) => <ProductCard key={p.slug} p={toCard(p)} />)}
      </div>
      {list.length === 0 && (
        <div className="card-soft text-center py-16 mt-4">
          <p className="font-semibold">Aucun article trouvé</p>
          <p className="text-sm font-light text-stone-500 mt-1">Essayez « sweat » ou « ensemble ».</p>
        </div>
      )}
    </div>
  );
}
