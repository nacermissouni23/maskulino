"use client";
import { useState } from "react";
import { PackageSearch, Truck } from "lucide-react";
import { trackOrder } from "@/lib/actions/storefront";

const STEPS = [
  { t: "Commande confirmée", s: "Appel ou WhatsApp validé" },
  { t: "Colis expédié", s: "Pris en charge par le transporteur" },
  { t: "En transit", s: "En route vers votre wilaya" },
  { t: "Livré — payez en espèces", s: "Vérifiez puis payez à la réception" },
];

const RANK: Record<string, number> = {
  a_confirmer: 0, confirmee: 1, en_preparation: 2, expediee: 2, en_livraison: 3, livree: 4,
};

type Found = {
  number: string; status: string; total: number; wilaya: string | null;
  carrier: string | null; tracking: string;
  items: { name: string; size: string; color: string; qty: number }[];
};

export default function TrackPage() {
  const [id, setId] = useState("");
  const [busy, setBusy] = useState(false);
  const [miss, setMiss] = useState(false);
  const [found, setFound] = useState<Found | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !id.trim()) return;
    setBusy(true);
    setMiss(false);
    setFound(null);
    const res = await trackOrder(id);
    setBusy(false);
    if (!res.ok) setMiss(true);
    else setFound(res.order as unknown as Found);
  }

  const done = found ? (RANK[found.status] ?? 0) : 0;
  const dead = found && (found.status === "annulee" || found.status === "retournee");

  return (
    <div className="container-x py-10 md:py-14 max-w-xl">
      <p className="eyebrow text-center">Livraison Yalidine / ZR Express</p>
      <h1 className="section-title text-center mt-2">Suivre ma commande</h1>
      <p dir="rtl" lang="ar" className="text-center font-medium text-stone-600 mt-1">تتبع طلبي</p>
      <p className="section-sub text-center">Saisissez votre n° MSK-xxxx (ex : MSK-1051) · <span dir="rtl" lang="ar">أدخل رقم الطلب</span></p>
      <form onSubmit={submit} className="card-soft p-3 flex gap-2 mt-6">
        <input value={id} onChange={(e) => setId(e.target.value)} placeholder="MSK-1051 · رقم الطلب" dir="auto" className="flex-1 min-w-0 h-12 bg-[#f5f3ee] rounded-[10px] px-4 uppercase text-sm font-medium outline-none placeholder:font-light" />
        <button disabled={busy} className="btn-fluid disabled:opacity-50 shrink-0">{busy ? "…" : <><span>Suivre</span> <span dir="rtl" lang="ar">· تتبع</span></>}</button>
      </form>
      {miss && (
        <div className="card-soft p-6 mt-4 text-center">
          <p className="font-semibold text-sm">Commande introuvable</p>
          <p className="text-xs font-light text-stone-500 mt-1">Vérifiez le numéro (ex : MSK-1051).</p>
        </div>
      )}
      {found && (
        <div className="card-soft p-6 md:p-7 mt-4">
          <p className="flex items-center gap-3 font-semibold"><span className="w-10 h-10 rounded-xl bg-[#efe9d8] text-[#7a5a28] flex items-center justify-center shrink-0"><PackageSearch size={18} /></span> {found.number} <span className="font-light text-stone-500 text-sm">— {found.wilaya ?? ""}</span></p>
          {dead ? (
            <p className="text-sm font-medium text-[#c0452f] bg-[#fdf0ec] border border-[#f3d4c8] p-3.5 rounded-xl mt-5">
              {found.status === "annulee" ? "Cette commande a été annulée." : "Cette commande a été retournée."}
            </p>
          ) : (
            <div className="mt-6">
              {STEPS.map((s, i) => (
                <div key={s.t} className="flex gap-3.5">
                  <span className="flex flex-col items-center">
                    <span className={`w-5 h-5 rounded-full border-[3px] ${i < done ? "bg-[#20744d] border-[#cfe3d3]" : i === done && done < 4 ? "bg-[#e8a33d] border-[#f3e2c2]" : "bg-stone-100 border-stone-200"}`} />
                    {i < 3 && <span className={`w-0.5 h-9 ${i < done ? "bg-[#20744d]" : "bg-stone-200"}`} />}
                  </span>
                  <div className="pb-5">
                    <p className={`text-sm ${i <= done ? "font-semibold" : "font-light text-stone-400"}`}>{s.t}</p>
                    <p className="text-xs font-light text-stone-400">{s.s}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs font-light bg-[#f5f3ee] border border-[#e8e3d8] p-3.5 rounded-xl flex gap-2 leading-relaxed"><Truck size={15} className="shrink-0 mt-0.5" /> Transporteur : {found.carrier ?? "—"}{found.tracking ? ` · ${found.tracking}` : ""} • Préparez le montant exact en espèces ({found.total.toLocaleString("fr-DZ")} DA). <a className="font-semibold underline underline-offset-4" href="https://wa.me/213781510418">WhatsApp</a></p>
        </div>
      )}
    </div>
  );
}
