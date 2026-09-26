"use client";
import { useState } from "react";
import { Phone, MapPin, Clock, Send } from "lucide-react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <div className="container-x py-10 md:py-14 max-w-4xl">
      <p className="eyebrow">On vous répond en moins de 4 h</p>
      <h1 className="section-title mt-2">Contactez-nous</h1>
      <p className="section-sub">Question taille, échange, suivi de colis — écrivez-nous.</p>
      <div className="grid md:grid-cols-2 gap-4 md:gap-5 mt-6 md:mt-8 items-start">
        <div className="card-soft p-6 space-y-4 text-sm">
          <p className="font-title font-semibold text-base">Nos coordonnées</p>
          <p className="flex gap-3 font-light"><span className="w-9 h-9 rounded-xl bg-[#efe9d8] flex items-center justify-center shrink-0"><Phone size={16} className="text-[#7a5a28]" /></span><span><span className="font-medium">Téléphone / WhatsApp</span><br />0770 00 00 00 (9h – 20h)</span></p>
          <p className="flex gap-3 font-light"><span className="w-9 h-9 rounded-xl bg-[#efe9d8] flex items-center justify-center shrink-0"><MapPin size={16} className="text-[#7a5a28]" /></span><span><span className="font-medium">Boutique</span><br />Didouche Mourad, Alger</span></p>
          <p className="flex gap-3 font-light"><span className="w-9 h-9 rounded-xl bg-[#efe9d8] flex items-center justify-center shrink-0"><Clock size={16} className="text-[#7a5a28]" /></span><span><span className="font-medium">Horaires</span><br />Sam – Jeu : 10h – 20h<br />Ven : 15h – 20h</span></p>
          <div className="bg-[#f5f3ee] border border-[#e8e3d8] rounded-xl p-3.5 text-xs font-light leading-relaxed">
            Retours : échange de taille gratuit sous 7 jours, article non porté.<br />
            Livraison : Yalidine / ZR Express en 2 à 5 jours, paiement en espèces.
          </div>
        </div>
        {sent ? (
          <div className="card-soft p-8 text-center">
            <p className="w-14 h-14 rounded-full bg-[#20744d] text-white font-bold text-2xl flex items-center justify-center mx-auto">✓</p>
            <p className="font-semibold text-lg mt-3">Message envoyé !</p>
            <p className="text-sm font-light text-stone-500 mt-1.5">On vous répond sur WhatsApp en moins de 4 h.</p>
            <button onClick={() => setSent(false)} className="label-bold text-[#1c1b18] mt-4 underline underline-offset-4">Envoyer un autre message</button>
          </div>
        ) : (
          <form className="card-soft p-6 space-y-3" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
            <p className="font-title font-semibold">Envoyer un message</p>
            <input required placeholder="Votre nom" className="input-soft" />
            <input required placeholder="Votre téléphone (ex : 0550123456)" className="input-soft" />
            <textarea required placeholder="Votre message — taille, échange, suivi…" rows={4} className="input-soft !h-auto py-3 resize-none" />
            <button className="btn-fluid w-full"><Send size={14} /> Envoyer via WhatsApp</button>
          </form>
        )}
      </div>
      <div className="card-soft mt-4 md:mt-5 p-5 md:p-6">
        <p className="font-semibold text-sm">Questions fréquentes</p>
        <ul className="text-sm font-light text-stone-600 mt-2.5 space-y-2 leading-relaxed">
          <li>• <span className="font-medium text-stone-800">Délais ?</span> 1 à 5 jours selon la wilaya.</li>
          <li>• <span className="font-medium text-stone-800">Modifier ou annuler ?</span> Possible avant expédition au 0770 00 00 00.</li>
          <li>• <span className="font-medium text-stone-800">Échange ?</span> Gardez l'emballage, échange gratuit sous 7 jours.</li>
          <li>• <span className="font-medium text-stone-800">Paiement ?</span> En espèces, préparez le montant exact.</li>
        </ul>
      </div>
    </div>
  );
}
