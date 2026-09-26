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
    <div className="container-x py-8 md:py-12">
      <p className="text-xs font-light text-stone-400"><Link href="/" className="hover:text-black">Accueil</Link> / <Link href="/shop" className="hover:text-black">Boutique</Link> / <span className="font-medium text-stone-600">{p.name}</span></p>
      <ProductDetailClient slug={p.slug} />
      <h2 className="section-title mt-14 md:mt-20">Vous aimerez aussi</h2>
      <p className="section-sub">Sélection dans la même catégorie</p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mt-5 md:mt-6">
        {related.map((r) => <ProductCard key={r.slug} p={r} />)}
      </div>
    </div>
  );
}
