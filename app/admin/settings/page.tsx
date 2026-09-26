import { WILAYAS, formatDA } from "@/lib/data";
import { Truck, Store } from "lucide-react";

export default function AdminSettings() {
  return (
    <div>
      <p className="eyebrow">Logistique Yalidine / ZR Express</p>
      <h1 className="section-title mt-1">Wilayas et réglages</h1>
      <p className="section-sub">Affichez le prix de livraison avant l'adresse — sinon 28 % d'abandons.</p>
      <div className="card-soft p-6 mt-6">
        <p className="font-title font-semibold flex items-center gap-2"><Truck size={16} className="text-[#5b6cff]" /> Frais par wilaya — domicile / bureau</p>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2 mt-4 max-h-[420px] overflow-auto pr-1">
          {WILAYAS.slice(0, 30).map((w) => (
            <div key={w.code} className="border border-gray-100 bg-[#fafaff] rounded-xl p-2.5 text-xs flex justify-between gap-2">
              <span className="font-medium">{w.name}</span>
              <span className="font-light text-gray-500 whitespace-nowrap">{formatDA(w.home)} / {formatDA(w.stopdesk)}</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] font-light text-gray-500 mt-3">+ 28 autres wilayas configurées. Wilayas du Sud : confirmation téléphonique obligatoire.</p>
      </div>
      <div className="card-soft p-6 mt-4">
        <p className="font-title font-semibold flex items-center gap-2"><Store size={16} className="text-[#5b6cff]" /> Réglages de la boutique</p>
        <ul className="text-[13px] font-light text-gray-600 mt-3 space-y-2 leading-relaxed">
          <li>• <span className="font-medium text-gray-800">Devise :</span> dinar (DA) • <span className="font-medium text-gray-800">Langue :</span> français • <span className="font-medium text-gray-800">Téléphone :</span> 0770 00 00 00</li>
          <li>• <span className="font-medium text-gray-800">Transporteurs :</span> Yalidine (automatique), ZR Express, Maystro • Reversement J+3 à J+14</li>
          <li>• <span className="font-medium text-gray-800">Retours :</span> échange sous 7 jours, photo avant expédition, blacklist active</li>
        </ul>
      </div>
    </div>
  );
}
