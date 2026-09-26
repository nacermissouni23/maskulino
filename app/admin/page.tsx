import { MOCK_ORDERS, PRODUCTS, formatDA } from "@/lib/data";
import Link from "next/link";

const KPIS = [
  { label: "Commandes du jour", v: "47", d: "↑ +12 %", c: "text-emerald-600" },
  { label: "Chiffre encaissé", v: "472 500 DA", d: "ROAS encaissé 3,1×", c: "text-emerald-600" },
  { label: "Taux de confirmation", v: "84 %", d: "objectif 85 %+", c: "text-blue-600" },
  { label: "Taux de retour", v: "18 %", d: "↓ contre 32 % avant", c: "text-amber-600" },
];

const statusStyle: Record<string, string> = {
  "Livrée": "bg-emerald-100 text-emerald-700",
  "Retournée": "bg-red-100 text-red-600",
  "Annulée": "bg-red-100 text-red-600",
  "Expédiée": "bg-blue-100 text-blue-700",
  "Confirmée": "bg-violet-100 text-violet-700",
  "En attente": "bg-amber-100 text-amber-700",
};

export default function AdminDashboard() {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Pilotage quotidien</p>
          <h1 className="section-title mt-1">Tableau de bord</h1>
          <p className="section-sub">Confirmation → livraison → espèces. ROAS affiché × confirmation × livraison = ROAS réel.</p>
        </div>
        <Link href="/admin/orders" className="btn-fluid !py-3">+ Nouvelle commande</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
        {KPIS.map((k) => (
          <div key={k.label} className="card-soft p-5">
            <p className="label-bold !text-[10px] text-gray-500">{k.label}</p>
            <p className="font-display font-bold text-xl md:text-2xl mt-1.5">{k.v}</p>
            <p className={`text-xs font-medium mt-1 ${k.c}`}>{k.d}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-4 mt-4 items-start">
        <div className="card-soft p-5">
          <div className="flex items-center justify-between">
            <p className="font-title font-semibold">Dernières commandes</p>
            <Link href="/admin/orders" className="label-bold !text-[10px] text-[#6c4dff] hover:underline underline-offset-4">Tout gérer →</Link>
          </div>
          <div className="overflow-x-auto mt-3">
            <table className="w-full text-xs min-w-[620px]">
              <thead><tr className="text-left font-light text-gray-400 border-b border-gray-100"><th className="py-2.5 font-medium">Commande</th><th className="font-medium">Client / Wilaya</th><th className="font-medium">Total</th><th className="font-medium">Statut</th><th className="font-medium">Risque</th></tr></thead>
              <tbody>
                {MOCK_ORDERS.map((o) => (
                  <tr key={o.id} className="border-b border-gray-50 last:border-0 hover:bg-[#fafaff]">
                    <td className="py-3 font-semibold">{o.id}<br /><span className="font-light text-gray-400">{o.date}</span></td>
                    <td className="font-normal">{o.customer}<br /><span className="font-light text-gray-400">{o.phone}</span></td>
                    <td className="font-bold">{formatDA(o.total)}</td>
                    <td><span className={`px-2.5 py-1 rounded-full font-semibold text-[11px] ${statusStyle[o.status]}`}>{o.status}</span></td>
                    <td className="font-light">{o.risk === "Élevé" ? "🔴 Élevé" : o.risk === "Moyen" ? "🟡 Moyen" : "🟢 Faible"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="space-y-3.5">
          <div className="card-soft p-5">
            <p className="font-title font-semibold text-sm">Performance par wilaya</p>
            <p className="text-[11px] font-light text-gray-400">Bénéfice net par commande</p>
            <ul className="text-xs mt-3 space-y-2.5">
              <li className="flex justify-between gap-2"><span className="font-normal">16 - Alger (2 j)</span><span className="font-semibold text-emerald-600">+200 DA • 15 % retours</span></li>
              <li className="flex justify-between gap-2"><span className="font-normal">31 - Oran (3 j)</span><span className="font-semibold text-emerald-600">+150 DA • 20 % retours</span></li>
              <li className="flex justify-between gap-2"><span className="font-normal">30 - Ouargla (5 j)</span><span className="font-semibold text-amber-600">+40 DA • 35 % retours</span></li>
              <li className="flex justify-between gap-2"><span className="font-normal">11 - Tamanrasset (7 j)</span><span className="font-semibold text-red-500">−50 DA • 45 % retours</span></li>
            </ul>
            <p className="text-[11px] font-light text-gray-500 bg-[#f6f5ff] rounded-xl p-2.5 mt-3 leading-relaxed">Astuce : excluez le Sud tant que la confirmation n'est pas rodée, puis réintégrez.</p>
          </div>
          <div className="card-soft p-5">
            <p className="font-title font-semibold text-sm">File de confirmation</p>
            <p className="text-xs font-light text-gray-500 mt-1 leading-relaxed">Agissez en moins de 4 h : modèle WhatsApp + photo produit + prix + délai.</p>
            <button className="w-full mt-3 h-11 rounded-xl bg-[#25D366] text-white text-xs font-semibold hover:brightness-105 transition">Confirmer via WhatsApp (12 en attente)</button>
            <button className="w-full mt-2 h-11 rounded-xl border-[1.5px] border-gray-200 text-xs font-semibold hover:border-gray-400 transition">Vue centre d'appels</button>
          </div>
        </div>
      </div>

      <div className="card-soft p-5 mt-4">
        <p className="font-title font-semibold text-sm">Alertes de stock faible</p>
        <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar pb-1">
          {PRODUCTS.filter((p) => p.stock < 40).map((p) => (
            <span key={p.slug} className="text-xs font-normal border border-amber-200 rounded-xl px-3.5 py-2.5 whitespace-nowrap bg-amber-50">Stock faible : {p.name} — {p.stock} restants</span>
          ))}
        </div>
      </div>
    </div>
  );
}
