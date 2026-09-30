"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { STATUS_STYLE, fmtDA } from "@/lib/admin-data";
import { getDashboardStats } from "@/lib/actions/orders";
import { ArrowRight, ArrowUpRight } from "lucide-react";

const today = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

function MiniChart({ data }: { data: { d: string; c: number; l: number }[] }) {
  const recues = data.map((x) => x.c);
  const livrees = data.map((x) => x.l);
  if (recues.length === 0) {
    return <p className="text-xs font-light text-stone-400 py-10 text-center">Pas encore de données.</p>;
  }
  const W = 560, H = 160, P = 24;
  const max = Math.max(...recues, ...livrees) + 4;
  const px = (i: number) => P + (i * (W - P * 2)) / (recues.length - 1);
  const py = (v: number) => H - P - (v / max) * (H - P * 2);
  const line = (arr: number[]) => arr.map((v, i) => `${i === 0 ? "M" : "L"}${px(i)},${py(v)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-36 md:h-44">
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={P} x2={W - P} y1={H * f} y2={H * f} stroke="#e8e3d8" strokeWidth={1} />
      ))}
      <path d={line(recues)} fill="none" stroke="#1c1b18" strokeWidth={2.2} strokeLinecap="round" />
      <path d={line(livrees)} fill="none" stroke="#20744d" strokeWidth={2.2} strokeDasharray="5 4" strokeLinecap="round" />
      {recues.map((v, i) => <circle key={i} cx={px(i)} cy={py(v)} r={3} fill="#1c1b18" />)}
    </svg>
  );
}

type Stats = Awaited<ReturnType<typeof getDashboardStats>>;

export default function AdminDashboard() {
  const [periode, setPeriode] = useState<"7j" | "30j">("7j");
  const [s, setS] = useState<Stats | null>(null);

  useEffect(() => {
    getDashboardStats().then(setS).catch(() => undefined);
  }, []);

  const kpis = [
    { label: "Commandes aujourd'hui", v: String(s?.ordersToday ?? "—"), d: "+12% vs hier", action: null as string | null },
    { label: "À confirmer", v: String(s?.toConfirm ?? "—"), d: "Action requise", action: "/imad29052005/orders" },
    { label: "Livrées aujourd'hui", v: String(s?.deliveredToday ?? "—"), d: "À encaisser / reverser", action: null as string | null },
    { label: "CA encaissé (hors livraison)", v: s ? fmtDA(s.ca) : "—", d: "Commandes livrées payées", action: null as string | null },
    { label: "Stock faible", v: String(s?.low.length ?? "—"), d: "Variantes sous seuil", action: "/imad29052005/products?tab=stock" },
  ];

  const actions = [
    { label: `${s?.toConfirm ?? "…"} commandes à confirmer`, href: "/imad29052005/orders" },
    { label: "Commandes prêtes à expédier", href: "/imad29052005/orders" },
    { label: "Produits presque en rupture", href: "/imad29052005/products?tab=stock" },
    { label: "Retours à traiter", href: "/imad29052005/orders" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="section-title">Bonjour, Maskulino</h1>
          <p className="section-sub">Aujourd&apos;hui, {today}</p>
        </div>
        <Link href="/imad29052005/analytics" className="btn-ghost !py-2.5">Voir Analytics</Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2.5 md:gap-3 mt-5 items-stretch">
        {kpis.map((k, i) => {
          const card = (
            <div className={`card-soft p-4 flex flex-col justify-between min-h-[104px] h-full ${k.action ? "hover:border-stone-400 transition cursor-pointer" : ""}`}>
              <p className="label-bold !text-[10px] text-stone-500 leading-tight">{k.label}</p>
              <p className="font-display font-bold text-lg md:text-xl mt-1.5">{k.v}</p>
              <p className="text-[11px] font-medium text-stone-500 mt-0.5 flex items-center gap-1">{k.d} {k.action && <ArrowUpRight size={12} />}</p>
            </div>
          );
          const wrap = "h-full min-w-0" + (i === kpis.length - 1 ? " col-span-2 md:col-span-1" : "");
          return k.action ? <Link key={k.label} href={k.action} className={wrap}>{card}</Link> : <div key={k.label} className={wrap}>{card}</div>;
        })}
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-3 mt-3 items-start">
        <div className="card-soft p-4 md:p-5">
          <p className="font-title font-semibold text-sm">À traiter maintenant</p>
          <ul className="mt-3 space-y-2">
            {actions.map((a) => (
              <li key={a.label}>
                <Link href={a.href} className="flex items-center justify-between gap-2 bg-[#f5f3ee] border border-[#e8e3d8] rounded-xl px-3.5 py-3 text-[13px] font-medium hover:border-stone-400 transition">
                  {a.label} <ArrowRight size={14} className="shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="card-soft p-4 md:p-5 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <p className="font-title font-semibold text-sm">Commandes récentes</p>
            <Link href="/imad29052005/orders" className="label-bold !text-[10px] hover:underline underline-offset-4 whitespace-nowrap">Tout voir →</Link>
          </div>
          {!s ? (
            <p className="text-xs font-light text-stone-400 py-6 text-center">Chargement…</p>
          ) : (
          <table className="w-full text-xs mt-2">
            <thead><tr className="text-left text-stone-400 border-b border-[#e8e3d8]"><th className="py-2 font-medium">N°</th><th className="font-medium">Client</th><th className="font-medium hidden md:table-cell">Produit</th><th className="font-medium hidden md:table-cell">Wilaya</th><th className="font-medium text-right">Total</th><th className="font-medium hidden md:table-cell">Source</th><th className="font-medium text-right">Statut</th><th className="font-medium hidden lg:table-cell text-right">Heure</th></tr></thead>
            <tbody>
              {s.recent.map((o) => (
                <tr key={o.id} className="border-b border-stone-100 last:border-0">
                  <td className="py-2.5 font-semibold whitespace-nowrap">{o.id}</td>
                  <td className="font-normal max-w-[110px] truncate text-center" dir="auto">{o.client}</td>
                  <td className="font-light text-stone-500 hidden md:table-cell max-w-[160px] truncate">{o.items[0]?.name ?? "—"} ×{o.items[0]?.qty ?? 0}</td>
                  <td className="font-normal hidden md:table-cell">{o.wilaya}</td>
                  <td className="font-bold text-right whitespace-nowrap">{fmtDA(o.total)}</td>
                  <td className="font-normal hidden md:table-cell">{o.source}</td>
                  <td className="text-right"><span className={`px-2 py-0.5 rounded-full font-semibold text-[11px] whitespace-nowrap ${STATUS_STYLE[o.status]}`}>{o.status}</span></td>
                  <td className="font-light text-stone-400 hidden lg:table-cell text-right">{o.heure}</td>
                </tr>
              ))}
              {s.recent.length === 0 && (
                <tr><td colSpan={8} className="py-6 text-center font-light text-stone-400">Aucune commande pour le moment.</td></tr>
              )}
            </tbody>
          </table>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-3 mt-3 items-start">
        <div className="card-soft p-4 md:p-5 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-title font-semibold text-sm">Commandes vs livrées</p>
            <div className="flex gap-1.5">
              {(["7j", "30j"] as const).map((p) => (
                <button key={p} onClick={() => setPeriode(p)} className={`h-8 px-3 rounded-full text-xs border transition ${periode === p ? "bg-[#1c1b18] text-white border-[#1c1b18] font-semibold" : "bg-white border-[#e8e3d8]"}`}>
                  {p === "7j" ? "7 jours" : "30 jours"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-4 mt-2 text-[11px] font-medium">
            <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-[#1c1b18] rounded" /> Commandes</span>
            <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-[#20744d] rounded" /> Livrées</span>
          </div>
          <MiniChart data={(s?.daily ?? []).slice(periode === "7j" ? -7 : -30)} />
        </div>
        <div className="card-soft p-4 md:p-5 min-w-0">
          <p className="font-title font-semibold text-sm">Meilleures ventes (livrées)</p>
          {!s ? (
            <p className="text-xs font-light text-stone-400 py-6 text-center">Chargement…</p>
          ) : s.top.length === 0 ? (
            <p className="text-xs font-light text-stone-400 py-6 text-center">Pas encore de livraisons.</p>
          ) : (
          <table className="w-full text-xs mt-2">
            <thead><tr className="text-left text-stone-400 border-b border-[#e8e3d8]"><th className="py-2 font-medium">Produit</th><th className="font-medium text-right">Unités</th><th className="font-medium text-right">CA livré</th></tr></thead>
            <tbody>
              {s.top.map((t) => (
                <tr key={t.p} className="border-b border-stone-100 last:border-0">
                  <td className="py-2.5 font-medium max-w-[150px] truncate">{t.p}</td>
                  <td className="text-right font-semibold">{t.u}</td>
                  <td className="text-right font-bold whitespace-nowrap">{fmtDA(t.ca)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>

      <div className="card-soft p-4 md:p-5 mt-3">
        <div className="flex items-center justify-between gap-3">
          <p className="font-title font-semibold text-sm">Alertes stock</p>
          <Link href="/imad29052005/products?tab=stock" className="label-bold !text-[10px] hover:underline underline-offset-4">Gérer →</Link>
        </div>
        {!s ? (
          <p className="text-xs font-light text-stone-400 py-4 text-center">Chargement…</p>
        ) : s.low.length === 0 ? (
          <p className="text-xs font-light text-stone-400 py-4">Aucune alerte — tout est en stock.</p>
        ) : (
        <div className="grid sm:grid-cols-2 gap-2 mt-3">
          {s.low.map((a) => (
            <div key={a.label} className="flex items-center justify-between gap-2 bg-[#faf4e6] border border-[#e8d9b8] rounded-xl px-3.5 py-2.5 text-xs">
              <span className="font-medium truncate">{a.label}</span>
              <Link href="/imad29052005/products?tab=stock" className="font-semibold underline underline-offset-4 whitespace-nowrap shrink-0">Voir</Link>
            </div>
          ))}
        </div>
        )}
      </div>
    </div>
  );
}
