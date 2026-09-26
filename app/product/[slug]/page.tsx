import { notFound } from "next/navigation";
import Link from "next/link";
import { PRODUCTS } from "@/lib/data";
import ProductDetailClient from "./ProductDetailClient";
import ProductCard from "@/components/ProductCard";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = PRODUCTS.find((x) => x.slug === slug);
  if (!p) return notFound();
  const related = PRODUCTS.filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, 4);
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <p className="text-xs font-light text-gray-400"><Link href="/" className="hover:text-black">Accueil</Link> / <Link href="/shop" className="hover:text-black">Boutique</Link> / <span className="font-medium text-gray-600">{p.name}</span></p>
      <ProductDetailClient slug={p.slug} />
      <h2 className="section-title mt-16">Vous aimerez aussi</h2>
      <p className="section-sub">Sélection dans la même catégorie</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
        {related.map((r) => <ProductCard key={r.slug} p={r} />)}
      </div>
    </div>
  );
}
