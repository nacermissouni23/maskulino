"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Phone, Clock } from "lucide-react";
import { useShopSettings } from "@/lib/shop-settings";

function FacebookIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TiktokIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

export default function Footer() {
  const path = usePathname();
  const { settings } = useShopSettings();
  if (path.startsWith("/imad29052005")) return null;

  const socials = [
    { label: "Facebook", href: settings.facebook, Icon: FacebookIcon },
    { label: "Instagram", href: settings.instagram, Icon: InstagramIcon },
    { label: "TikTok", href: settings.tiktok, Icon: TiktokIcon },
  ].filter((s) => s.href.trim() !== "");

  return (
    <footer className="bg-[#1c1b18] text-stone-300 mt-0">
      <div className="container-x py-12 md:py-16 grid gap-10 md:grid-cols-4">
        <div>
          <p className="font-display font-extrabold text-white text-xl tracking-[0.12em] uppercase">{settings.name}</p>
          <p className="text-sm mt-4 font-light leading-relaxed text-stone-400">
            Vêtements pour homme pensés pour l'Algérie. Tissus épais, prix honnêtes en dinars, paiement à la livraison dans les 58 wilayas.
          </p>
          {socials.length > 0 && (
            <div className="flex gap-2 mt-5">
              {socials.map(({ label, href, Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          )}
        </div>
        <div>
          <p className="text-white font-semibold text-sm tracking-wide mb-4">Boutique</p>
          <ul className="space-y-2.5 text-sm font-light text-stone-400">
            <li><Link href="/shop" className="hover:text-white">Tous les articles</Link></li>
            <li><Link href="/shop?cat=hoodies" className="hover:text-white">Sweats à capuche</Link></li>
            <li><Link href="/shop?cat=ensembles" className="hover:text-white">Ensembles</Link></li>
            <li><Link href="/shop?cat=jeans" className="hover:text-white">Jeans</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-white font-semibold text-sm tracking-wide mb-4">Aide</p>
          <ul className="space-y-2.5 text-sm font-light text-stone-400">
            <li>Paiement à la livraison — 58 wilayas</li>
            <li>Livraison en 2 à 5 jours</li>
            <li><Link href="/contact" className="hover:text-white underline underline-offset-4">Contact et retours</Link></li>
          </ul>
        </div>
        <div className="text-sm space-y-2.5 font-light text-stone-400">
          <p className="text-white font-semibold tracking-wide mb-4">Contact</p>
          <p className="flex gap-2 items-center"><Phone size={16} /> {settings.phone}</p>
          <p className="flex gap-2 items-center"><MapPin size={16} /> {settings.address}</p>
          <p className="flex gap-2 items-center"><Clock size={16} /> {settings.hours}</p>
          <p className="text-xs mt-3 bg-white/10 rounded-xl p-3 leading-relaxed">Confirmation WhatsApp en moins de 4 h. Vous payez en espèces à la réception.</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x py-5 text-xs font-light text-stone-500 flex flex-col md:flex-row justify-between gap-2">
          <span>© 2026 {settings.name} — Tous droits réservés.</span>
        </div>
      </div>
    </footer>
  );
}
