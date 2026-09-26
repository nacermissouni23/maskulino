"use client";
import { useState } from "react";
import { PackageSearch, Truck } from "lucide-react";

const STEPS = [
  { t: "Commande confirmée", s: "Appel ou WhatsApp validé" },
  { t: "Colis expédié", s: "Pris en charge par le transporteur" },
  { t: "En transit", s: "En route vers votre wilaya" },
  { t: "Livré — payez en espèces", s: "Vérifiez puis payez à la réception" },
];

export default function TrackPage() {
  const [id, setId] = useState("");
  const [show, setShow] = useState(false);
  return (
    <div className="container-x py-10 md:py-14 max-w-xl">
      <p className="eyebrow text-center">Livraison Yalidine / ZR Express</p>
      <h1 className="section-title text-center mt-2">Suivre ma commande</h1>
      <p className="section-sub text-center">Saisissez votre n° MSK-xxxx ou votre téléphone (ex : 0550123456)</p>
      <form onSubmit={(e) => { e.preventDefault(); setShow(true); }} className="card-soft p-3 flex gap-2 mt-6">
        <input value={id} onChange={(e) => setId(e.target.value)} placeholder="MSK-8421" className="flex-1 h-12 bg-[#f5f3ee] rounded-[10px] px-4 uppercase text-sm font-medium outline-none placeholder:font-light" />
        <button className="btn-fluid">Suivre</button>
      </form>
      {show && (
        <div className="card-soft p-6 md:p-7 mt-4">
          <p className="flex items-center gap-3 font-semibold"><span className="w-10 h-10 rounded-xl bg-[#efe9d8] text-[#7a5a28] flex items-center justify-center"><PackageSearch size={18} /></span> {id || "MSK-8421"} <span className="font-light text-stone-500 text-sm">— en transit vers Alger</span></p>
          <div className="mt-6">
            {STEPS.map((s, i) => (
              <div key={s.t} className="flex gap-3.5">
                <span className="flex flex-col items-center">
                  <span className={`w-5 h-5 rounded-full border-[3px] ${i <= 2 ? "bg-[#20744d] border-[#cfe3d3]" : "bg-stone-100 border-stone-200"}`} />
                  {i < 3 && <span className={`w-0.5 h-9 ${i < 2 ? "bg-[#20744d]" : "bg-stone-200"}`} />}
                </span>
                <div className="pb-5">
                  <p className={`text-sm ${i <= 2 ? "font-semibold" : "font-light text-stone-400"}`}>{s.t}</p>
                  <p className="text-xs font-light text-stone-400">{s.s}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs font-light bg-[#f5f3ee] border border-[#e8e3d8] p-3.5 rounded-xl flex gap-2 leading-relaxed"><Truck size={15} className="shrink-0 mt-0.5" /> Transporteur : Yalidine • Arrivée estimée sous 2 jours • Préparez le montant exact en espèces. <a className="font-semibold underline underline-offset-4" href="https://wa.me/213770000000">WhatsApp</a></p>
        </div>
      )}
    </div>
  );
}
