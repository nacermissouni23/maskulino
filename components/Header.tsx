"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Search, ShoppingBag, Menu, X, Phone, Truck } from "lucide-react";
import { useCart } from "./CartProvider";

const NAV = [
  { href: "/", label: "Accueil" },
  { href: "/shop", label: "Boutique" },
  { href: "/about", label: "À propos" },
  { href: "/news", label: "Actualités" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const path = usePathname();
  if (path.startsWith("/admin")) return null;
  return (
    <>
      <div className="bg-[#14142b] text-white text-[11px] md:text-xs">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-center md:justify-between gap-2">
          <p className="flex items-center gap-2 font-medium tracking-wide">
            <Truck size={14} className="text-[#6fc3f0]" />
            <span className="font-light">Paiement à la livraison — Livraison 58 wilayas</span>
          </p>
          <a href="tel:+213770000000" className="hidden md:flex items-center gap-2 font-light hover:text-white">
            <Phone size={14} /> 0770 00 00 00 — 9h à 20h
          </a>
        </div>
      </div>

      <header className="sticky top-0 z-40 backdrop-blur bg-[#fbfbff]/90 border-b border-[#eceafa]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="leading-none">
            <span className="font-display font-extrabold text-xl tracking-[0.14em]">MASKULINO</span>
            <span className="block text-[9px] font-semibold tracking-[0.32em] bg-[#14142b] text-white px-1.5 py-0.5 w-fit mt-1 rounded">
              MODE DZ
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-[12px] font-medium tracking-wide text-[#3c3e5a]">
            {NAV.map((n) => (
              <Link
                key={n.label}
                href={n.href}
                className={`transition hover:text-black ${path === n.href ? "text-black font-semibold underline underline-offset-8 decoration-[#6c4dff] decoration-2" : ""}`}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 md:gap-2">
            <Link href="/shop" aria-label="Rechercher" className="p-2.5 rounded-full hover:bg-[#eceafa] transition">
              <Search size={19} />
            </Link>
            <Link href="/cart" aria-label="Panier" className="relative p-2.5 rounded-full hover:bg-[#eceafa] transition">
              <ShoppingBag size={19} />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[11px] font-semibold flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
            <Link href="/admin" className="hidden md:inline-flex btn-fluid !py-2.5 !px-5 ml-2">
              Admin
            </Link>
            <button onClick={() => setOpen(!open)} className="md:hidden p-2" aria-label="Menu">
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="md:hidden border-t border-[#eceafa] bg-white px-4 py-3 grid gap-1 text-sm font-medium">
            {NAV.map((n) => (
              <Link key={n.label} href={n.href} onClick={() => setOpen(false)} className="py-2.5 border-b border-gray-50 font-medium">
                {n.label}
              </Link>
            ))}
            <Link href="/track-order" onClick={() => setOpen(false)} className="py-2.5 text-[#6c4dff] font-semibold">
              Suivre ma commande
            </Link>
            <Link href="/admin" onClick={() => setOpen(false)} className="py-2.5 font-light text-gray-500">
              Espace admin
            </Link>
          </nav>
        )}
      </header>
    </>
  );
}
