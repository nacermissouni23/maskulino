import { Suspense } from "react";
import ShopPage from "./ShopClient";
import { getShopProducts, getShopCategories } from "@/lib/storefront";

export default async function Page() {
  const [products, categories] = await Promise.all([getShopProducts(), getShopCategories()]);
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm">Chargement boutique…</div>}>
      <ShopPage initial={products} categories={categories} />
    </Suspense>
  );
}
