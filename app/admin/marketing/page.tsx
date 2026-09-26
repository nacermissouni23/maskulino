import { Target, RefreshCcw, Palette, Tag } from "lucide-react";

const CARDS = [
  { icon: Target, t: "Pixel Meta + API Conversions", items: ["Évènements : vue produit, ajout panier, commande, achat en DA", "Évènement clic-WhatsApp (sinon des ventes restent invisibles)", "ROAS encaissé = ROAS Meta × 70 % × 75 % ≈ ×0,52", "Seuil de rentabilité : ROAS affiché ≥ 4,5×"] },
  { icon: RefreshCcw, t: "Séquence de relance", items: ["Panier abandonné 7 j — 40 % du budget — « Plus que quelques pièces »", "Ajout panier 7 j — 35 % — vidéo + avis clients", "Vue produit 14 j — 25 % — best-sellers", "WhatsApp à +2 h : 25 à 35 % récupérés — coût ~50 DA"] },
  { icon: Palette, t: "Visuels qui convertissent", items: ["Vidéos clients 15-30 s, déballage + essayage réel", "Prix en dinars affiché à l'écran, preuve en direct", "Appel à l'action « Commander — paiement à la livraison »", "Exclure le Sud au démarrage, 3-4 visuels neufs par mois"] },
  { icon: Tag, t: "Promotions actives", items: ["DZ10 = -10 % (vu sur Facebook)", "Pack 2+1 sur les ensembles", "Livraison offerte sur Alger (retours faibles : 15 %)"] },
];

export default function AdminMarketing() {
  return (
    <div>
      <p className="eyebrow">Acquisition Algérie</p>
      <h1 className="section-title mt-1">Marketing et publicité</h1>
      <p className="section-sub">Facebook et TikTok : clics à 0,10 – 0,20 $, 25-34 ans les plus rentables, relance +35 %.</p>
      <div className="grid md:grid-cols-2 gap-4 mt-6 items-start">
        {CARDS.map((c) => (
          <div key={c.t} className="card-soft p-6">
            <p className="font-title font-semibold flex items-center gap-2.5"><span className="w-9 h-9 rounded-xl bg-[#eef0ff] text-[#5b6cff] flex items-center justify-center"><c.icon size={16} /></span>{c.t}</p>
            <ul className="text-[13px] font-light text-gray-600 mt-4 space-y-2 leading-relaxed">
              {c.items.map((i) => <li key={i} className="flex gap-2"><span className="text-[#6c4dff] font-bold">•</span>{i}</li>)}
            </ul>
            {c.t.startsWith("Promotions") && <button className="btn-dark mt-4 !py-2.5">+ Nouvelle promo</button>}
          </div>
        ))}
      </div>
    </div>
  );
}
