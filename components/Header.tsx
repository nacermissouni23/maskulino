"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, MessageCircle } from "lucide-react";
import { useShopSettings, whatsappLink } from "@/lib/shop-settings";

const NAV = [
  { href: "/", label: "Accueil" },
  { href: "/shop", label: "Boutique" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const { settings } = useShopSettings();
  const [open, setOpen] = useState(false);
  const path = usePathname();
  if (path.startsWith("/imad29052005")) return null;
  return (
      <header className="sticky top-0 z-40 bg-[#f5f3ee]/90 backdrop-blur border-b border-[#e8e3d8]">
        <div className="container-x h-[68px] flex items-center justify-between gap-4">
          <Link href="/" className="leading-none">
            <span className="font-display font-extrabold text-xl tracking-[0.12em] uppercase">{settings.name}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-[#3d3a33]">
            {NAV.map((n) => (
              <Link
                key={n.label}
                href={n.href}
                className={`transition hover:text-black ${path === n.href ? "text-black font-semibold underline underline-offset-8 decoration-[#a06a2c] decoration-2" : ""}`}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={whatsappLink(settings, `Salam ${settings.name}, j'ai une question sur une taille`)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Discuter sur WhatsApp"
              className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:scale-105 transition"
            >
              <MessageCircle size={18} />
            </a>
            <button onClick={() => setOpen(!open)} className="md:hidden p-2" aria-label="Menu">
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="md:hidden border-t border-[#e8e3d8] bg-white px-4 py-3 grid gap-1 text-sm font-medium">
            {NAV.map((n) => (
              <Link key={n.label} href={n.href} onClick={() => setOpen(false)} className="py-2.5 border-b border-stone-100 font-medium">
                {n.label}
              </Link>
            ))}
          </nav>
        )}
      </header>
  );
}
