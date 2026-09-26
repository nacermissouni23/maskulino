import Image from "next/image";
import { PRODUCTS, formatDA } from "@/lib/data";
import { Plus } from "lucide-react";

export default function AdminProducts() {
  return (
    <div>
      <div className="flex flex-wrap justify-between items-end gap-3">
        <div>
          <p className="eyebrow">Catalogue</p>
          <h1 className="section-title mt-1">Produits et stock</h1>
          <p className="section-sub">Tailles M → XXL, photos réelles + vidéo, packs, codes promo.</p>
        </div>
        <button className="btn-fluid !py-3 flex items-center gap-1.5"><Plus size={15} /> Ajouter un produit</button>
      </div>
      <div className="grid md:grid-cols-2 gap-3 mt-6">
        {PRODUCTS.map((p) => (
          <div key={p.slug} className="card-soft p-4 flex gap-3.5">
            <span className="relative w-16 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
              <Image src={p.image} alt={p.name} fill className="object-cover" />
            </span>
            <div className="flex-1 min-w-0 text-sm">
              <p className="font-semibold leading-snug">{p.name}</p>
              <p className="text-xs font-light text-gray-500 mt-0.5">{p.category} • {p.sizes.join(" / ")} • {p.rating} ({p.reviews} avis)</p>
              <p className="price-bold mt-1">{formatDA(p.price)}</p>
              <p className={`text-xs font-medium mt-0.5 ${p.stock < 30 ? "text-red-500" : "text-emerald-600"}`}>Stock : {p.stock}{p.stock < 30 ? " — réassort urgent" : " — disponible"}</p>
            </div>
            <div className="flex flex-col gap-1.5 shrink-0">
              <button className="h-9 px-3.5 border-[1.5px] border-gray-200 rounded-xl text-xs font-semibold hover:border-gray-400">Modifier</button>
              <button className="h-9 px-3.5 border-[1.5px] border-gray-200 rounded-xl text-xs font-semibold hover:border-gray-400">Pack</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
