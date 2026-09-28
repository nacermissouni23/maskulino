"use client";
import { Phone, MapPin, Clock, MessageCircle } from "lucide-react";
import { useShopSettings, whatsappLink } from "@/lib/shop-settings";

function FacebookIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TiktokIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

export default function ContactPage() {
  const { settings } = useShopSettings();
  const wa = whatsappLink(settings, `Salam ${settings.name}, j'ai une question`);

  const socials = [
    { label: "Facebook", href: settings.facebook, Icon: FacebookIcon },
    { label: "Instagram", href: settings.instagram, Icon: InstagramIcon },
    { label: "TikTok", href: settings.tiktok, Icon: TiktokIcon },
  ].filter((s) => s.href.trim() !== "");

  return (
    <div className="container-x py-10 md:py-14 max-w-4xl">
      <p className="eyebrow">On vous répond en moins de 4 h</p>
      <h1 className="section-title mt-2">Contactez-nous</h1>
      <p className="section-sub">Une question ? Écrivez-nous directement sur WhatsApp.</p>

      <div className="card-soft p-6 space-y-4 text-sm mt-6 md:mt-8">
        <p className="font-title font-semibold text-base">Nos coordonnées</p>
        <p className="flex gap-3 font-light">
          <span className="w-9 h-9 rounded-xl bg-[#efe9d8] flex items-center justify-center shrink-0"><Phone size={16} className="text-[#7a5a28]" /></span>
          <span><span className="font-medium">Téléphone / WhatsApp</span><br />{settings.phone} (9h – 20h)</span>
        </p>
        <p className="flex gap-3 font-light">
          <span className="w-9 h-9 rounded-xl bg-[#efe9d8] flex items-center justify-center shrink-0"><MapPin size={16} className="text-[#7a5a28]" /></span>
          <span><span className="font-medium">Boutique</span><br />{settings.address}</span>
        </p>
        <p className="flex gap-3 font-light">
          <span className="w-9 h-9 rounded-xl bg-[#efe9d8] flex items-center justify-center shrink-0"><Clock size={16} className="text-[#7a5a28]" /></span>
          <span><span className="font-medium">Horaires</span><br />{settings.hours}</span>
        </p>

        {socials.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {socials.map(({ label, href, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 h-10 px-4 rounded-[10px] border-[1.5px] border-[#e8e3d8] bg-white text-xs font-semibold hover:border-stone-400 transition">
                <Icon size={14} /> {label}
              </a>
            ))}
          </div>
        )}

        <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-fluid w-full !py-4 !text-[13px] text-center flex items-center justify-center gap-2">
          <MessageCircle size={16} /> Discuter sur WhatsApp
        </a>
      </div>
    </div>
  );
}
