"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, Package, Users, Megaphone, Settings, Store, ShieldAlert } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Commandes", icon: ShoppingCart },
  { href: "/admin/products", label: "Produits et stock", icon: Package },
  { href: "/admin/customers", label: "Clients et blacklist", icon: Users },
  { href: "/admin/marketing", label: "Marketing et pixel", icon: Megaphone },
  { href: "/admin/settings", label: "Wilayas et réglages", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <div className="max-w-7xl mx-auto px-0 md:px-4 py-0 md:py-8 grid md:grid-cols-[240px_1fr] gap-0 md:gap-6 min-h-[85vh]">
      <aside className="bg-[#14142b] text-white md:rounded-[20px] p-4 md:p-6 md:sticky md:top-24 h-fit">
        <p className="font-display font-extrabold tracking-[0.12em]">MASKULINO <span className="text-[10px] font-semibold bg-white text-black px-2 py-0.5 ml-1 rounded-full">ADMIN</span></p>
        <p className="text-[11px] font-light text-white/60 mt-1.5 leading-relaxed">Pilotage du paiement à la livraison : confirmation, transporteurs, retours.</p>
        <nav className="flex md:grid gap-1.5 mt-5 overflow-x-auto no-scrollbar">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs whitespace-nowrap transition ${path === n.href ? "bg-white text-black font-semibold" : "bg-white/10 font-normal hover:bg-white/20"}`}>
              <n.icon size={15} /> {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:block mt-5 text-[11px] bg-white/10 rounded-2xl p-4 space-y-1.5 font-light">
          <p className="flex items-center gap-1.5 font-medium"><ShieldAlert size={13}/> Blacklist : 37 numéros</p>
          <p>Confirmer en moins de 4 h = -40 % de retours</p>
          <Link href="/" className="flex items-center gap-1.5 font-medium underline underline-offset-4 pt-1"><Store size={13}/> Voir la boutique</Link>
        </div>
      </aside>
      <div className="p-4 md:p-1">{children}</div>
    </div>
  );
}
