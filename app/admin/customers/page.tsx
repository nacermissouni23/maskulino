import { ShieldCheck, Crown } from "lucide-react";

export default function AdminCustomers() {
  return (
    <div>
      <p className="eyebrow">Fidélisation et anti-fraude</p>
      <h1 className="section-title mt-1">Clients et blacklist</h1>
      <p className="section-sub">Historique par téléphone — bloquez après 3 retours ou fausse adresse.</p>
      <div className="grid lg:grid-cols-2 gap-4 mt-5 md:mt-6 items-start">
        <div className="card-soft p-6">
          <p className="font-title font-semibold flex items-center gap-2"><span className="w-9 h-9 rounded-xl bg-[#efe9d8] flex items-center justify-center"><Crown size={16} className="text-[#7a5a28]" /></span> Meilleurs clients</p>
          <p className="text-xs font-light text-stone-400 mt-1">Livraison offerte pour les VIP</p>
          <ul className="text-sm mt-4 space-y-2.5">
            {[
              ["Yacine B. — 0550…", "5 livraisons", "VIP"],
              ["Mohamed L. — 0661…", "3 livraisons", "Fidèle"],
              ["Amine K. — 0770…", "2 livraisons", "Régulier"],
            ].map(([n, d, b]) => (
              <li key={n} className="flex justify-between items-center gap-2 bg-[#f5f3ee] border border-[#e8e3d8] rounded-xl px-3.5 py-3">
                <span><span className="font-medium block">{n}</span><span className="font-light text-xs text-stone-500">{d}</span></span>
                <span className="text-[11px] font-semibold text-[#20744d] bg-[#e7efe9] px-2.5 py-1 rounded-full">{b}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card-soft p-6 !border-[#f3d4c8]">
          <p className="font-title font-semibold text-[#c0452f] flex items-center gap-2"><span className="w-9 h-9 rounded-xl bg-[#fbeae4] flex items-center justify-center"><ShieldCheck size={16} /></span> Blacklist (37 numéros)</p>
          <p className="text-xs font-light text-stone-400 mt-1">Retours abusifs et fausses adresses</p>
          <ul className="text-sm mt-4 space-y-2.5">
            {[
              ["0550 00 00 00", "3 faux retours"],
              ["0662 33 44 55", "Refus systématique"],
            ].map(([n, d]) => (
              <li key={n} className="flex justify-between items-center gap-2 bg-[#fdf6f2] border border-[#f3d4c8] rounded-xl px-3.5 py-3">
                <span><span className="font-medium block">{n}</span><span className="font-light text-xs text-stone-500">{d}</span></span>
                <button className="text-xs font-medium underline underline-offset-4 text-stone-500">Retirer</button>
              </li>
            ))}
          </ul>
          <p className="text-[11px] font-light text-stone-500 bg-[#f5f3ee] border border-[#e8e3d8] rounded-xl p-3 mt-4 leading-relaxed">Règle auto : même adresse + noms différents → exiger un prépaiement avant expédition.</p>
        </div>
      </div>
    </div>
  );
}
