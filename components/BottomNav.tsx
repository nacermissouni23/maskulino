"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingBag, Package } from "lucide-react";
import { useCart } from "./CartProvider";

export default function BottomNav() {
  const { count } = useCart();
  const path = usePathname();
  if (path.startsWith("/admin")) return null;
  const items = [
    { href: "/", icon: Home, label: "Accueil" },
    { href: "/shop", icon: LayoutGrid, label: "Boutique" },
    { href: "/cart", icon: ShoppingBag, label: "Panier", badge: count },
    { href: "/track-order", icon: Package, label: "Suivi" },
  ];
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-[#e8e3d8] pb-safe">
      <div className="grid grid-cols-4">
        {items.map((it) => (
          <Link key={it.label} href={it.href} className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] ${path === it.href ? "text-[#1c1b18] font-semibold" : "text-stone-500 font-normal"}`}>
            <span className="relative">
              <it.icon size={20} strokeWidth={path === it.href ? 2.4 : 1.8} />
              {!!it.badge && it.badge > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-0.5 rounded-full bg-[#a06a2c] text-white text-[10px] font-semibold flex items-center justify-center">{it.badge}</span>
              )}
            </span>
            {it.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
