"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Phone, Clock, Globe, AtSign, Music2 } from "lucide-react";

export default function Footer() {
  const path = usePathname();
  if (path.startsWith("/admin")) return null;
  return (
    <footer className="bg-[#1c1b18] text-stone-300 mt-0">
      <div className="container-x py-12 md:py-16 grid gap-10 md:grid-cols-4">
        <div>
          <p className="font-display font-extrabold text-white text-xl tracking-[0.12em]">MASKULINO</p>
          <p className="text-[10px] font-semibold tracking-[0.3em] bg-white text-black px-1.5 py-0.5 w-fit mt-1 rounded">MODE DZ</p>
          <p className="text-sm mt-4 font-light leading-relaxed text-stone-400">
            Vêtements pour homme pensés pour l'Algérie. Tissus épais, prix honnêtes en dinars, paiement à la livraison dans les 58 wilayas.
          </p>
          <div className="flex gap-2 mt-5">
            {[Globe, AtSign, Music2].map((Icon, i) => (
              <a key={i} href="#" aria-label="Réseau social" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
        <div>
          <p className="text-white font-semibold text-sm tracking-wide mb-4">Boutique</p>
          <ul className="space-y-2.5 text-sm font-light text-stone-400">
            <li><Link href="/shop" className="hover:text-white">Tous les articles</Link></li>
            <li><Link href="/shop?cat=hoodies" className="hover:text-white">Sweats à capuche</Link></li>
            <li><Link href="/shop?cat=ensembles" className="hover:text-white">Ensembles</Link></li>
            <li><Link href="/shop?cat=jeans" className="hover:text-white">Jeans</Link></li>
            <li><Link href="/track-order" className="hover:text-white">Suivre ma commande</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-white font-semibold text-sm tracking-wide mb-4">Aide</p>
          <ul className="space-y-2.5 text-sm font-light text-stone-400">
            <li>Paiement à la livraison — 58 wilayas</li>
            <li>Livraison en 2 à 5 jours</li>
            <li>Échange de taille gratuit sous 7 jours</li>
            <li><Link href="/contact" className="hover:text-white underline underline-offset-4">Contact et retours</Link></li>
          </ul>
        </div>
        <div className="text-sm space-y-2.5 font-light text-stone-400">
          <p className="text-white font-semibold tracking-wide mb-4">Contact</p>
          <p className="flex gap-2 items-center"><Phone size={16}/> 0770 00 00 00</p>
          <p className="flex gap-2 items-center"><MapPin size={16}/> Alger, Algérie — Didouche Mourad</p>
          <p className="flex gap-2 items-center"><Clock size={16}/> Sam – Jeu : 10h – 20h | Ven : 15h – 20h</p>
          <p className="text-xs mt-3 bg-white/10 rounded-xl p-3 leading-relaxed">Confirmation WhatsApp en moins de 4 h. Vous payez en espèces à la réception.</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-x py-5 text-xs font-light text-stone-500 flex flex-col md:flex-row justify-between gap-2">
          <span>© 2026 Maskulino — Tous droits réservés.</span>
          <span>Yalidine / ZR Express / Maystro • Paiement à la livraison</span>
        </div>
      </div>
    </footer>
  );
}
