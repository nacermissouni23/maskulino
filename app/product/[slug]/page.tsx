import { notFound } from "next/navigation";
import Link from "next/link";
import { getShopProduct, getShopContext } from "@/lib/storefront";
import ProductDetailClient from "./ProductDetailClient";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [p, shipping] = await Promise.all([getShopProduct(slug), getShopContext()]);
  if (!p) return notFound();
  return (
    <div className="container-x py-8 md:py-12">
      <p className="text-xs font-light text-stone-400"><Link href="/" className="hover:text-black">Accueil</Link> / <Link href="/shop" className="hover:text-black">Boutique</Link> / <span className="font-medium text-stone-600">{p.name}</span></p>
      <ProductDetailClient product={p} shipping={shipping} />
    </div>
  );
}
