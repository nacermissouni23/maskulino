"use client";
import { useEffect, useState } from "react";
import { fmtDA } from "@/lib/admin-data";
import { getAnalytics } from "@/lib/actions/orders";
import { listCampaigns } from "@/lib/actions/settings";

type Data = Awaited<ReturnType<typeof getAnalytics>>;

const TH = "py-2 font-medium whitespace-nowrap";
const THR = "py-2 font-medium text-right whitespace-nowrap";
const TD = "py-2.5 whitespace-nowrap";
const TDR = "py-2.5 text-right whitespace-nowrap";

const SRC_LABEL: Record<string, string> = {
  facebook: "Facebook", instagram: "Instagram", tiktok: "TikTok",
  whatsapp: "WhatsApp", direct: "Direct", autre: "Autre",
};

export default function AdminAnalytics() {
  const [periode, setPeriode] = useState("30 jours");
  const [compare, setCompare] = useState(true);
  const [metric, setMetric] = useState<string>("Commandes");
  const [d, setD] = useState<Data | null>(null);
  const [spendByChannel, setSpendByChannel] = useState<Record<string, number>>({});

  useEffect(() => {
    getAnalytics().then(setD).catch(() => undefined);
    listCampaigns().then((cs) => {
      const m: Record<string, number> = {};
      for (const c of cs as { channel: string; spend: number }[]) {
        m[c.channel] = (m[c.channel] ?? 0) + c.spend;
      }
      setSpendByChannel(m);
    }).catch(() => undefined);
  }, []);

  const days = (d?.daily ?? []).slice(periode === "7 jours" ? -7 : -30);
  const arr = metric === "Livrées" ? days.map((x) => x.l) : days.map((x) => x.c);
  const W = 560, H = 170, P = 24;
  const max = Math.max(2, ...arr) + 2;
  const px = (i: number) => (arr.length < 2 ? W / 2 : P + (i * (W - P * 2)) / (arr.length - 1));
  const py = (v: number) => H - P - (v / max) * (H - P * 2);
  const line = arr.map((v, i) => `${i === 0 ? "M" : "L"}${px(i)},${py(v)}`).join(" ");

  const spend = Object.values(spendByChannel).reduce((a, v) => a + v, 0);
  const livTotal = (d?.carriers ?? []).reduce((a, c) => a + c.liv, 0);
  const topCarrier = [...(d?.carriers ?? [])].sort((a, b) => b.liv - a.liv)[0];
  const KPI: [string, string][] = d ? [
    ["Commandes", String(d.kpi.commandes)],
    ["Taux de confirmation", `${d.kpi.confirmation}%`],
    ["Taux de livraison", `${d.kpi.livraison}%`],
    ["Taux de retour", `${d.kpi.retour}%`],
    ["Panier moyen (hors livraison)", fmtDA(d.kpi.panier)],
    ["Coût / livrée", livTotal && spend ? fmtDA(Math.round(spend / livTotal)) : "—"],
    ["ROAS livré (hors livraison)", spend ? `${(d.kpi.calivre / spend).toFixed(1)}×` : "—"],
    ["Top transporteur", topCarrier ? `${topCarrier.c} · ${livTotal ? Math.round((topCarrier.liv / livTotal) * 100) : 0}%` : "—"],
  ] : [];

  return (
    <div>
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="section-title">Analytics</h1>
          <p className="section-sub">Pourquoi les résultats arrivent — pas seulement ce qui demande action. Tous les montants CA = produits uniquement, hors livraison.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1.5">
            {["7 jours", "30 jours", "90 jours"].map((p) => (
              <button key={p} onClick={() => setPeriode(p)} className={`h-9 px-3.5 rounded-full text-xs border transition ${periode === p ? "bg-[#1c1b18] text-white border-[#1c1b18] font-semibold" : "bg-white border-[#e8e3d8]"}`}>{p}</button>
            ))}
          </div>
          <button onClick={() => setCompare(!compare)} className={`h-9 px-3.5 rounded-full text-xs border font-semibold transition ${compare ? "bg-white border-[#1c1b18]" : "bg-white border-[#e8e3d8] text-stone-400"}`}>
            Comparer {compare ? "· oui" : "· non"}
          </button>
        </div>
      </div>

      {!d ? (
        <div className="card-soft p-8 mt-4 text-center text-sm font-light text-stone-500">Chargement…</div>
      ) : (
      <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-3 mt-4 items-stretch">
        {KPI.map(([l, v]) => (
          <div key={l} className="card-soft p-4 flex flex-col justify-between min-h-[96px]">
            <p className="label-bold !text-[10px] text-stone-500 leading-tight">{l}</p>
            <p className="font-display font-bold text-lg md:text-xl mt-2">{v}</p>
          </div>
        ))}
      </div>

      <div className="card-soft p-4 md:p-5 mt-3">
        <p className="font-title font-semibold text-sm">Évolution · {periode}{compare ? " · vs période précédente" : ""}</p>
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          {["Commandes", "Livrées"].map((m) => (
            <button key={m} onClick={() => setMetric(m)} className={`h-8 px-3 rounded-full text-xs border whitespace-nowrap ${metric === m ? "bg-[#1c1b18] text-white border-[#1c1b18] font-semibold" : "bg-white border-[#e8e3d8]"}`}>{m}</button>
          ))}
        </div>
        {arr.length === 0 ? (
          <p className="text-xs font-light text-stone-400 py-8 text-center">Pas encore de données.</p>
        ) : (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-40 mt-1">
          {[0.25, 0.5, 0.75].map((f) => <line key={f} x1={P} x2={W - P} y1={H * f} y2={H * f} stroke="#e8e3d8" />)}
          <path d={line} fill="none" stroke={metric === "Livrées" ? "#20744d" : "#1c1b18"} strokeWidth={2.4} strokeLinecap="round" />
          {arr.map((v, i) => <circle key={i} cx={px(i)} cy={py(v)} r={3.5} fill={metric === "Livrées" ? "#20744d" : "#1c1b18"} />)}
        </svg>
        )}
      </div>

      <div className="card-soft p-4 md:p-5 mt-3">
        <p className="font-title font-semibold text-sm">Produits</p>
        <div className="mt-1">
          <table className="w-full text-xs">
            <thead><tr className="text-left text-stone-400 border-b border-[#e8e3d8]"><th className={TH}>Produit</th><th className={THR}>Commandes</th><th className={`${THR} hidden md:table-cell`}>Confirmées</th><th className={THR}>Livrées</th><th className={`${THR} hidden md:table-cell`}>Retours</th><th className={THR}>CA livré</th></tr></thead>
            <tbody>{d.products.map((r) => <tr key={r.p} className="border-b border-stone-100 last:border-0"><td className={`${TD} font-medium max-w-[130px] truncate`}>{r.p}</td><td className={TDR}>{r.c}</td><td className={`${TDR} hidden md:table-cell`}>{r.conf}</td><td className={`${TDR} font-semibold text-[#20744d]`}>{r.liv}</td><td className={`${TDR} hidden md:table-cell`}>{r.ret}</td><td className={`${TDR} font-bold`}>{fmtDA(r.ca)}</td></tr>)}
            {d.products.length === 0 && <tr><td colSpan={6} className="py-6 text-center font-light text-stone-400">Aucune donnée.</td></tr>}</tbody>
          </table>
        </div>
      </div>

      <div className="card-soft p-4 md:p-5 mt-3">
        <p className="font-title font-semibold text-sm">Wilayas</p>
        <div className="mt-1">
          <table className="w-full text-xs">
            <thead><tr className="text-left text-stone-400 border-b border-[#e8e3d8]"><th className={TH}>Wilaya</th><th className={THR}>Commandes</th><th className={`${THR} hidden md:table-cell`}>Confirmées</th><th className={`${THR} hidden md:table-cell`}>Expédiées</th><th className={THR}>Livrées</th><th className={`${THR} hidden md:table-cell`}>Retours</th><th className={THR}>CA livré</th></tr></thead>
            <tbody>{d.wilayas.map((r) => <tr key={r.w} className="border-b border-stone-100 last:border-0"><td className={`${TD} font-medium`}>{r.w}</td><td className={TDR}>{r.c}</td><td className={`${TDR} hidden md:table-cell`}>{r.conf}</td><td className={`${TDR} hidden md:table-cell`}>{r.exp}</td><td className={`${TDR} font-semibold text-[#20744d]`}>{r.liv}</td><td className={`${TDR} hidden md:table-cell`}>{r.ret}</td><td className={`${TDR} font-bold`}>{fmtDA(r.ca)}</td></tr>)}
            {d.wilayas.length === 0 && <tr><td colSpan={7} className="py-6 text-center font-light text-stone-400">Aucune donnée.</td></tr>}</tbody>
          </table>
        </div>
      </div>

      <div className="card-soft p-4 md:p-5 mt-3">
        <p className="font-title font-semibold text-sm">Transporteurs</p>
        <p className="text-[11px] font-light text-stone-400 mt-0.5">Quel transporteur livre le mieux — pas seulement le moins cher.</p>
        <div className="mt-1">
          <table className="w-full text-xs">
            <thead><tr className="text-left text-stone-400 border-b border-[#e8e3d8]"><th className={TH}>Transporteur</th><th className={`${THR} hidden md:table-cell`}>Expédiées</th><th className={THR}>Livrées</th><th className={THR}>Taux livraison</th><th className={`${THR} hidden md:table-cell`}>Retours</th><th className={THR}>CA livré</th></tr></thead>
            <tbody>{d.carriers.map((r) => <tr key={r.c} className="border-b border-stone-100 last:border-0"><td className={`${TD} font-semibold`}>{r.c}</td><td className={`${TDR} hidden md:table-cell`}>{r.exp}</td><td className={`${TDR} font-semibold text-[#20744d]`}>{r.liv}</td><td className={TDR}>{r.exp ? `${Math.round((r.liv / r.exp) * 100)}%` : "—"}</td><td className={`${TDR} hidden md:table-cell`}>{r.ret}</td><td className={`${TDR} font-bold`}>{fmtDA(r.ca)}</td></tr>)}
            {d.carriers.length === 0 && <tr><td colSpan={6} className="py-6 text-center font-light text-stone-400">Aucune donnée.</td></tr>}</tbody>
          </table>
        </div>
      </div>

      <div className="card-soft p-4 md:p-5 mt-3">
        <p className="font-title font-semibold text-sm">Acquisition</p>
        <div className="mt-1">
          <table className="w-full text-xs">
            <thead><tr className="text-left text-stone-400 border-b border-[#e8e3d8]"><th className={TH}>Source</th><th className={THR}>Commandes</th><th className={`${THR} hidden md:table-cell`}>Confirmées</th><th className={THR}>Livrées</th><th className={THR}>CA livré</th><th className={`${THR} hidden md:table-cell`}>Coût pub</th><th className={THR}>Coût / livr.</th><th className={`${THR} hidden md:table-cell`}>ROAS</th></tr></thead>
            <tbody>{d.sources.map((r) => {
              const dep = spendByChannel[r.s] ?? 0;
              return <tr key={r.s} className="border-b border-stone-100 last:border-0"><td className={`${TD} font-semibold`}>{SRC_LABEL[r.s] ?? r.s}</td><td className={TDR}>{r.c}</td><td className={`${TDR} hidden md:table-cell`}>{r.conf}</td><td className={`${TDR} font-semibold text-[#20744d]`}>{r.liv}</td><td className={`${TDR} font-bold`}>{fmtDA(r.ca)}</td><td className={`${TDR} hidden md:table-cell`}>{dep ? fmtDA(dep) : "—"}</td><td className={TDR}>{r.liv && dep ? fmtDA(Math.round(dep / r.liv)) : "—"}</td><td className={`${TDR} hidden md:table-cell`}>{dep ? `${(r.ca / dep).toFixed(1)}×` : "—"}</td></tr>;
            })}
            {d.sources.length === 0 && <tr><td colSpan={8} className="py-6 text-center font-light text-stone-400">Aucune donnée.</td></tr>}</tbody>
          </table>
        </div>
        <p className="text-[11px] font-light text-stone-400 mt-2">Sources suivies : Facebook, Instagram, TikTok, WhatsApp.</p>
      </div>
      </>
      )}
    </div>
  );
}
