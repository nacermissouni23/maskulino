"use client";
import { useEffect, useState } from "react";
import { fmtDA } from "@/lib/admin-data";
import { listCampaigns, campaignStats, saveCampaign, listPromos, savePromo } from "@/lib/actions/settings";
import { Plus, X, Link2 } from "lucide-react";

type Camp = { id: string; nom: string; canal: string; produit: string; depense: number; visites: number; commandes: number; confirmees: number; livrees: number; caLivre: number };
type PromoRow = { nom: string; type: string; valeur: string; debut: string; fin: string; statut: string };

export default function AdminMarketing() {
  const [tab, setTab] = useState<"promos" | "campagnes">("campagnes");
  const [camps, setCamps] = useState<Camp[]>([]);
  const [promos, setPromos] = useState<PromoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPromo, setShowPromo] = useState(false);
  const [showCamp, setShowCamp] = useState(false);
  const [showLink, setShowLink] = useState(false);
  const [link, setLink] = useState("");
  const [sel, setSel] = useState<Camp | null>(null);
  const [fNom, setFNom] = useState("");
  const [fCanal, setFCanal] = useState("Facebook");
  const [fProduit, setFProduit] = useState("");
  const [fDepense, setFDepense] = useState("");
  const [pNom, setPNom] = useState("");
  const [pType, setPType] = useState("Pourcentage");
  const [pValeur, setPValeur] = useState("");

  async function refresh() {
    const [cs, st, ps] = await Promise.all([
      listCampaigns().catch(() => []),
      campaignStats().catch(() => ({})),
      listPromos().catch(() => []),
    ]);
    setCamps((cs as { id: string; name: string; channel: string; product_slug: string; spend: number; visits: number }[]).map((c) => {
      const a = (st as Record<string, { commandes: number; confirmees: number; livrees: number; caLivre: number }>)[c.id] ?? { commandes: 0, confirmees: 0, livrees: 0, caLivre: 0 };
      return { id: c.id, nom: c.name, canal: c.channel, produit: c.product_slug, depense: c.spend, visites: c.visits, ...a };
    }));
    setPromos((ps as { name: string; type: string; value: number; starts_at: string | null; ends_at: string | null; active: boolean }[]).map((p) => ({
      nom: p.name, type: p.type === "montant" ? "Montant fixe" : "Pourcentage",
      valeur: p.type === "montant" ? `${p.value.toLocaleString("fr-DZ")} DA` : `-${p.value}%`,
      debut: p.starts_at ?? "—", fin: p.ends_at ?? "—", statut: p.active ? "Active" : "Inactive",
    })));
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  const cout = (c: Camp) => (c.livrees ? Math.round(c.depense / c.livrees) : 0);
  const roas = (c: Camp) => (c.depense ? (c.caLivre / c.depense).toFixed(1) + "×" : "—");

  async function createCamp() {
    if (!fNom.trim()) return;
    const r = await saveCampaign({ nom: fNom, canal: fCanal, produit: fProduit, depense: Number(fDepense) || 0 });
    if (r.ok) { setShowCamp(false); setFNom(""); setFProduit(""); setFDepense(""); await refresh(); }
  }
  async function createPromo() {
    if (!pNom.trim()) return;
    const r = await savePromo({ nom: pNom, type: pType, valeur: pValeur, debut: "", fin: "", actif: true });
    if (r.ok) { setShowPromo(false); setPNom(""); setPValeur(""); await refresh(); }
  }

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="section-title">Marketing</h1>
          <p className="section-sub">Suivez ce que Facebook, Instagram, TikTok et WhatsApp rapportent en livrées.</p>
        </div>
        {tab === "promos"
          ? <button onClick={() => setShowPromo(true)} className="btn-fluid !py-3 flex items-center gap-1.5"><Plus size={15} /> Nouvelle promotion</button>
          : <button onClick={() => setShowCamp(true)} className="btn-fluid !py-3 flex items-center gap-1.5"><Plus size={15} /> Nouvelle campagne</button>}
      </div>

      <div className="flex h-10 rounded-[10px] border-[1.5px] border-[#e8e3d8] bg-white p-1 text-xs font-semibold w-fit mt-4">
        {(["campagnes", "promos"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 h-full rounded-lg capitalize ${tab === t ? "bg-[#1c1b18] text-white" : "text-stone-500"}`}>
            {t === "promos" ? "Promotions" : "Campagnes"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card-soft p-8 mt-3 text-center text-sm font-light text-stone-500">Chargement…</div>
      ) : tab === "campagnes" ? (
        <>
          <div className="card-soft mt-3 overflow-hidden">
              <table className="w-full text-xs">
                <thead><tr className="text-stone-400 border-b border-[#e8e3d8]">
                  <th className="py-2.5 pl-4 pr-3 font-medium text-left">Campagne</th><th className="font-medium px-3 text-left">Canal</th><th className="font-medium px-3 text-left hidden md:table-cell">Produit / Landing</th>
                  <th className="font-medium px-3 text-center hidden md:table-cell">Dépense</th><th className="font-medium px-3 text-center">Commandes</th><th className="font-medium px-3 text-center hidden md:table-cell">Confirmées</th>
                  <th className="font-medium px-3 text-center">Livrées</th><th className="font-medium px-3 text-center hidden sm:table-cell">CA livré</th><th className="font-medium pl-3 pr-4 text-right">Coût / livrée</th>
                </tr></thead>
                <tbody>
                  {camps.map((c) => (
                    <tr key={c.id} onClick={() => setSel(c)} className="border-b border-stone-100 last:border-0 hover:bg-[#faf8f3] cursor-pointer">
                      <td className="pl-4 pr-3 py-3 font-semibold max-w-[110px] truncate">{c.nom}</td>
                      <td className="px-3"><span className="px-2 py-0.5 rounded-full bg-[#f5f3ee] border border-[#e8e3d8] font-semibold text-[11px] whitespace-nowrap">{c.canal}</span></td>
                      <td className="font-normal px-3 hidden md:table-cell max-w-[140px] truncate">{c.produit}</td>
                      <td className="px-3 text-center hidden md:table-cell whitespace-nowrap">{fmtDA(c.depense)}</td>
                      <td className="px-3 text-center font-semibold">{c.commandes}</td>
                      <td className="px-3 text-center hidden md:table-cell">{c.confirmees}</td>
                      <td className="px-3 text-center font-semibold text-[#20744d]">{c.livrees}</td>
                      <td className="px-3 text-center font-bold hidden sm:table-cell whitespace-nowrap">{fmtDA(c.caLivre)}</td>
                      <td className="pl-3 pr-4 text-right whitespace-nowrap">{c.livrees ? fmtDA(cout(c)) : "—"}</td>
                    </tr>
                  ))}
                  {camps.length === 0 && <tr><td colSpan={9} className="py-8 text-center font-light text-stone-400">Aucune campagne — créez la première.</td></tr>}
                </tbody>
              </table>
          </div>
          <button onClick={() => setShowLink(true)} className="btn-ghost mt-3 flex items-center gap-1.5"><Link2 size={14} /> Créer un lien de campagne</button>
        </>
      ) : (
        <div className="card-soft mt-3 overflow-hidden">
            <table className="w-full text-xs">
              <thead><tr className="text-stone-400 border-b border-[#e8e3d8]">
                <th className="py-2.5 pl-4 pr-3 font-medium text-left">Nom</th><th className="font-medium px-3 text-left hidden md:table-cell">Type</th><th className="font-medium px-3 text-left">Valeur</th><th className="font-medium pl-3 pr-4 text-right">Statut</th>
              </tr></thead>
              <tbody>
                {promos.map((p) => (
                  <tr key={p.nom} className="border-b border-stone-100 last:border-0">
                    <td className="pl-4 pr-3 py-3 font-semibold max-w-[130px] truncate">{p.nom}</td>
                    <td className="font-normal px-3 hidden md:table-cell">{p.type}</td><td className="font-bold px-3 whitespace-nowrap">{p.valeur}</td>
                    <td className="pl-3 pr-4 text-right"><span className={`px-2 py-0.5 rounded-full font-semibold text-[11px] whitespace-nowrap ${p.statut === "Active" ? "bg-[#e7efe9] text-[#20744d]" : "bg-stone-200/70 text-stone-500"}`}>{p.statut}</span></td>
                  </tr>
                ))}
                {promos.length === 0 && <tr><td colSpan={4} className="py-8 text-center font-light text-stone-400">Aucune promotion.</td></tr>}
              </tbody>
            </table>
        </div>
      )}

      {sel && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSel(null)} />
          <div className="relative bg-[#f5f3ee] w-full sm:max-w-[440px] rounded-t-2xl sm:rounded-2xl p-5">
            <div className="flex items-center justify-between"><p className="font-title font-semibold">{sel.nom}</p><button onClick={() => setSel(null)} className="w-9 h-9 rounded-full bg-white border border-[#e8e3d8] flex items-center justify-center shrink-0"><X size={15} /></button></div>
            <p className="text-xs font-light text-stone-500">{sel.canal} · {sel.produit}</p>
            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
              {[["Visites", sel.visites], ["Commandes", sel.commandes], ["Confirmation", sel.commandes ? `${Math.round((sel.confirmees / sel.commandes) * 100)}%` : "—"], ["Livrées", sel.livrees], ["Livraison", sel.commandes ? `${Math.round((sel.livrees / sel.commandes) * 100)}%` : "—"], ["CA livré", fmtDA(sel.caLivre)], ["Dépense", fmtDA(sel.depense)], ["Coût / livrée", sel.livrees ? fmtDA(cout(sel)) : "—"], ["ROAS livré", roas(sel)]].map(([l, v]) => (
                <div key={l as string} className="bg-white border border-[#e8e3d8] rounded-xl p-3"><p className="label-bold !text-[9px] text-stone-500">{l}</p><p className="font-bold text-sm mt-0.5">{v}</p></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showPromo && (
        <Modal title="Créer une promotion" onClose={() => setShowPromo(false)}>
          <input value={pNom} onChange={(e) => setPNom(e.target.value)} placeholder="Nom — ex. Promo rentrée" className="input-soft" />
          <div className="grid grid-cols-2 gap-2 mt-2">
            <select value={pType} onChange={(e) => setPType(e.target.value)} className="input-soft"><option>Pourcentage</option><option>Montant fixe</option></select>
            <input value={pValeur} onChange={(e) => setPValeur(e.target.value)} placeholder={pType === "Pourcentage" ? "10 (= -10 %)" : "1000 (= -1 000 DA)"} className="input-soft" />
          </div>
          <p className="text-[11px] font-light text-stone-400 mt-2">Pour un code utilisable au checkout, nommez-la avec le code (ex. DZ10) — le serveur l&apos;applique automatiquement.</p>
          <button onClick={createPromo} className="btn-fluid w-full mt-3">Créer</button>
        </Modal>
      )}
      {showCamp && (
        <Modal title="Créer une campagne" onClose={() => setShowCamp(false)}>
          <input value={fNom} onChange={(e) => setFNom(e.target.value)} placeholder="Nom de campagne" className="input-soft" />
          <div className="grid grid-cols-2 gap-2 mt-2">
            <select value={fCanal} onChange={(e) => setFCanal(e.target.value)} className="input-soft"><option>Facebook</option><option>Instagram</option><option>TikTok</option><option>WhatsApp</option><option>Direct</option><option>Autre</option></select>
            <input value={fProduit} onChange={(e) => setFProduit(e.target.value)} placeholder="Produit / landing" className="input-soft" />
            <input value={fDepense} onChange={(e) => setFDepense(e.target.value)} placeholder="Budget / dépense (DA)" type="number" className="input-soft col-span-2" />
          </div>
          <button onClick={createCamp} className="btn-fluid w-full mt-3">Créer la campagne</button>
        </Modal>
      )}
      {showLink && (
        <Modal title="Lien de campagne" onClose={() => setShowLink(false)}>
          <div className="grid grid-cols-2 gap-2">
            <select className="input-soft"><option>Facebook</option><option>Instagram</option><option>TikTok</option><option>WhatsApp</option></select>
            <select className="input-soft">{camps.map((c) => <option key={c.id}>{c.nom}</option>)}</select>
            <input placeholder="Annonce / contenu" className="input-soft" />
            <select className="input-soft"><option>T-Shirt Oversize</option><option>Hoodie</option></select>
          </div>
          <button onClick={() => setLink("https://maskulino.dz/p/tshirt-oversize?utm_source=facebook&utm_campaign=rentree-sep&utm_content=video1")} className="btn-dark w-full mt-3">Générer le lien</button>
          {link && <p className="text-xs font-normal bg-white border border-[#e8e3d8] rounded-xl p-3 mt-2.5 break-all">{link}</p>}
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-[#f5f3ee] w-full sm:max-w-[440px] rounded-t-2xl sm:rounded-2xl p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3"><p className="font-title font-semibold">{title}</p><button onClick={onClose} className="w-9 h-9 rounded-full bg-white border border-[#e8e3d8] flex items-center justify-center shrink-0"><X size={15} /></button></div>
        {children}
      </div>
    </div>
  );
}
