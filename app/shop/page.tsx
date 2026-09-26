import { Suspense } from "react";
import ShopPage from "./ShopClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm">Chargement boutique…</div>}>
      <ShopPage />
    </Suspense>
  );
}
