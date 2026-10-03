"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fmtDA, type AdminClient } from "@/lib/admin-data";
import { listCustomers, saveCustomerNote } from "@/lib/actions/orders";
import { Phone, MessageCircle, X, Search, Download } from "lucide-react";
import { ExportModal, ExportField } from "@/components/admin/ExportModal";
import { exportClientsXlsx } from "@/lib/export-excel";

const norm = (s: string) => s.toLowerCase().trim();
const normPhone = (s: string) => s.replace(/[\s.-]/g, "").toLowerCase();

export default function AdminCustomers() {
  const [qName, setQName] = useState("");
  const [qPhone, setQPhone] = useState("");
  const [qWilaya, setQWilaya] = useState("");
  const [sel, setSel] = useState<AdminClient | null>(null);
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [doneMsg, setDoneMsg] = useState("");
  const [eName, setEName] = useState("");
  const [ePhone, setEPhone] = useState("");
  const [eWilaya, setEWilaya] = useState("");
  const [eProfil, setEProfil] = useState("");

  useEffect(() => {
    listCustomers().then((c) => { setClients(c as AdminClient[]); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const wilayas = useMemo(() => [...new Set(clients.map((c) => c.wilaya))].sort(), [clients]);

  // Filtrage instantané à chaque frappe — aucun bouton Entrée / Rechercher requis.
  const list = useMemo(() => clients.filter((c) =>
    (!norm(qName) || norm(c.name).includes(norm(qName))) &&
    (!normPhone(qPhone) || normPhone(c.phone).includes(normPhone(qPhone))) &&
    (!norm(qWilaya) || norm(c.wilaya).includes(norm(qWilaya)))
  ), [qName, qPhone, qWilaya]);

  const hasFilter = qName !== "" || qPhone !== "" || qWilaya !== "";
  const reset = () => { setQName(""); setQPhone(""); setQWilaya(""); };

  function openExport() {
    // Pré-remplit avec les filtres déjà actifs sur la page.
    setEName(qName);
    setEPhone(qPhone);
    setEWilaya(qWilaya);
    setDoneMsg("");
    setExportOpen(true);
  }

  const exportRows = useMemo(() => clients.filter((c) =>
    (!norm(eName) || norm(c.name).includes(norm(eName))) &&
    (!normPhone(ePhone) || normPhone(c.phone).includes(normPhone(ePhone))) &&
    (!norm(eWilaya) || norm(c.wilaya).includes(norm(eWilaya))) &&
    (!eProfil ||
      (eProfil === "fideles" ? c.livrees >= 3 : eProfil === "risque" ? (c.annulees >= 3 || c.retours >= 1) : c.commandes <= 1))
  ), [clients, eName, ePhone, eWilaya, eProfil]);

  async function doExport() {
    if (exportRows.length === 0 || downloading) return;
    setDownloading(true);
    try {
      const name = await exportClientsXlsx(exportRows);
      setExportOpen(false);
      setDoneMsg(`Fichier téléchargé : ${name}`);
    } catch {
      setDoneMsg("Export impossible — réessayez.");
    }
    setDownloading(false);
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="section-title">Clients</h1>
          <p className="section-sub">Créés automatiquement depuis les commandes. Le téléphone est l&apos;identifiant.</p>
        </div>
        <button onClick={openExport} className="h-10 px-4 rounded-[10px] border-[1.5px] border-[#e8e3d8] bg-white text-xs font-semibold flex items-center gap-1.5 hover:border-stone-400 whitespace-nowrap"><Download size={15} /> <span className="hidden sm:inline">Exporter Excel</span><span className="sm:hidden">Excel</span></button>
      </div>
      {doneMsg && (
        <p className="text-xs font-medium text-[#20744d] mt-3">{doneMsg}</p>
      )}

      <form onSubmit={(e) => e.preventDefault()} className="card-soft p-3 mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="relative min-w-0">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            <input
              value={qName}
              onChange={(e) => setQName(e.target.value)}
              placeholder="Nom du client…"
              autoComplete="off"
              type="text"
              className="input-soft !pl-10 !pr-9 text-stone-900"
            />
            {qName !== "" && (
              <button type="button" onClick={() => setQName("")} aria-label="Effacer le nom" className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400">
                <X size={14} />
              </button>
            )}
          </div>
          <div className="relative min-w-0">
            <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            <input
              value={qPhone}
              onChange={(e) => setQPhone(e.target.value)}
              placeholder="Téléphone… ex. 0550"
              autoComplete="off"
              type="text"
              inputMode="tel"
              className="input-soft !pl-10 !pr-9 text-stone-900"
            />
            {qPhone !== "" && (
              <button type="button" onClick={() => setQPhone("")} aria-label="Effacer le téléphone" className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400">
                <X size={14} />
              </button>
            )}
          </div>
          <div className="relative min-w-0">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            <input
              value={qWilaya}
              onChange={(e) => setQWilaya(e.target.value)}
              placeholder="Wilaya… ex. Alger"
              autoComplete="off"
              type="text"
              list="clients-wilaya-list"
              className="input-soft !pl-10 !pr-9 text-stone-900"
            />
            {qWilaya !== "" && (
              <button type="button" onClick={() => setQWilaya("")} aria-label="Effacer la wilaya" className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full hover:bg-stone-100 flex items-center justify-center text-stone-400">
                <X size={14} />
              </button>
            )}
            <datalist id="clients-wilaya-list">
              {wilayas.map((w) => <option key={w} value={w} />)}
            </datalist>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 mt-2 px-1">
          <p className="text-[11px] font-light text-stone-500">
            {list.length} client{list.length > 1 ? "s" : ""} {hasFilter ? "trouvé" + (list.length > 1 ? "s" : "") : "au total"} — résultats instantanés
          </p>
          {hasFilter && (
            <button type="button" onClick={reset} className="text-[11px] font-semibold underline underline-offset-4 text-stone-600 hover:text-stone-900 shrink-0">
              Effacer les filtres
            </button>
          )}
        </div>
      </form>

      <div className="card-soft mt-3 overflow-x-auto">
          <table className="w-full min-w-[960px] text-xs border-collapse">
            <thead><tr className="text-stone-400 border-b border-[#e8e3d8]">
              <th className="px-4 py-3 font-medium text-center whitespace-nowrap">Client</th>
              <th className="px-4 py-3 font-medium text-center whitespace-nowrap">Téléphone</th>
              <th className="px-4 py-3 font-medium text-center whitespace-nowrap">Wilaya</th>
              <th className="px-4 py-3 font-medium text-center whitespace-nowrap">Commandes</th>
              <th className="px-4 py-3 font-medium text-center whitespace-nowrap">Livrées</th>
              <th className="px-4 py-3 font-medium text-center whitespace-nowrap">Retours</th>
              <th className="px-4 py-3 font-medium text-center whitespace-nowrap">Total dépensé</th>
              <th className="px-4 py-3 font-medium text-center whitespace-nowrap">Dernière commande</th>
            </tr></thead>
            <tbody>
              {loading && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-xs font-light text-stone-400">Chargement…</td></tr>
              )}
              {!loading && list.map((c) => (
                <tr key={c.phone} onClick={() => { setSel(c); setNote(c.note); }} className="border-b border-stone-100 last:border-0 hover:bg-[#faf8f3] cursor-pointer">
                  <td className="px-4 py-3 font-semibold text-center whitespace-nowrap align-middle" dir="auto">{c.name}</td>
                  <td className="px-4 py-3 font-normal text-center whitespace-nowrap align-middle">{c.phone}</td>
                  <td className="px-4 py-3 font-normal text-center whitespace-nowrap align-middle">{c.wilaya}</td>
                  <td className="px-4 py-3 text-center font-semibold align-middle">{c.commandes}</td>
                  <td className="px-4 py-3 text-center align-middle">{c.livrees}</td>
                  <td className="px-4 py-3 text-center align-middle">{c.retours}</td>
                  <td className="px-4 py-3 text-center font-bold whitespace-nowrap align-middle">{fmtDA(c.depense)}</td>
                  <td className="px-4 py-3 font-light text-stone-500 text-center whitespace-nowrap align-middle">{c.derniere}</td>
                </tr>
              ))}
              {!loading && list.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center">
                    <p className="text-sm font-medium text-stone-600">Aucun client trouvé</p>
                    <p className="text-xs font-light text-stone-400 mt-1">Modifiez le nom, le téléphone ou la wilaya.</p>
                    <button type="button" onClick={reset} className="mt-3 h-9 px-4 rounded-[10px] border-[1.5px] border-[#e8e3d8] bg-white text-xs font-semibold">Effacer les filtres</button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
      </div>

      {exportOpen && (
        <ExportModal
          title="Exporter les clients"
          countLabel={`≈ ${exportRows.length} client${exportRows.length > 1 ? "s" : ""} seront exportés (triés par total dépensé).`}
          downloading={downloading}
          canDownload={exportRows.length > 0}
          emptyHint="Aucun client avec ces filtres — élargissez la recherche."
          onClose={() => setExportOpen(false)}
          onDownload={doExport}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <ExportField label="Nom">
              <input value={eName} onChange={(e) => setEName(e.target.value)} placeholder="Nom du client…" className="input-soft !h-10 text-[13px]" />
            </ExportField>
            <ExportField label="Téléphone">
              <input value={ePhone} onChange={(e) => setEPhone(e.target.value)} placeholder="Téléphone… ex. 0550" inputMode="tel" className="input-soft !h-10 text-[13px]" />
            </ExportField>
            <ExportField label="Wilaya">
              <input value={eWilaya} onChange={(e) => setEWilaya(e.target.value)} placeholder="Wilaya… ex. Alger" list="export-clients-wilaya" className="input-soft !h-10 text-[13px]" />
            </ExportField>
            <ExportField label="Profil">
              <select value={eProfil} onChange={(e) => setEProfil(e.target.value)} className="input-soft !h-10 text-[13px]">
                <option value="">Tous</option>
                <option value="fideles">Fidèles (≥ 3 livrées)</option>
                <option value="risque">À risque (≥ 3 annulations ou ≥ 1 retour)</option>
                <option value="nouveaux">Nouveaux (1 commande)</option>
              </select>
            </ExportField>
          </div>
          <datalist id="export-clients-wilaya">
            {wilayas.map((w) => <option key={w} value={w} />)}
          </datalist>
        </ExportModal>
      )}

      {sel && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSel(null)} />
          <aside className="absolute right-0 top-0 h-full w-full sm:w-[400px] bg-[#f5f3ee] shadow-2xl overflow-y-auto p-4 md:p-5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0 text-center">
                <p className="font-display font-bold text-lg" dir="auto">{sel.name}</p>
                <p className="text-xs font-light text-stone-500" dir="ltr">{sel.phone}</p>
              </div>
              <button onClick={() => setSel(null)} className="w-9 h-9 rounded-full bg-white border border-[#e8e3d8] flex items-center justify-center"><X size={15} /></button>
            </div>
            <div className="flex gap-2 mt-3">
              <a href={`tel:${sel.phone.replaceAll(" ", "")}`} className="flex-1 h-10 rounded-[10px] bg-[#1c1b18] text-white text-xs font-semibold flex items-center justify-center gap-1.5"><Phone size={13} /> Appeler</a>
              <a href={`https://wa.me/213${sel.phone.replaceAll(" ", "").slice(1)}`} target="_blank" className="flex-1 h-10 rounded-[10px] bg-[#1e8e57] text-white text-xs font-semibold flex items-center justify-center gap-1.5"><MessageCircle size={13} /> WhatsApp</a>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {[["Commandes", sel.commandes], ["Livrées", sel.livrees], ["Annulées", sel.annulees], ["Retours", sel.retours], ["Dépensé", fmtDA(sel.depense)], ["Dernière", sel.derniere.split("·")[0]]].map(([l, v]) => (
                <div key={l as string} className="card-soft p-3"><p className="label-bold !text-[9px] text-stone-500">{l}</p><p className="font-bold text-sm mt-0.5 truncate">{v}</p></div>
              ))}
            </div>
            {(sel.annulees >= 3 || sel.retours >= 1) && (
              <div className="mt-3 rounded-xl border border-[#f3d4c8] bg-[#fdf6f2] p-3.5 text-xs font-medium text-[#c0452f]">
                {sel.retours >= 1 ? "1 commande refusée" : `${sel.annulees} annulations`} — historique factuel, à vérifier par téléphone avant expédition.
              </div>
            )}
            <div className="card-soft p-4 mt-3">
              <p className="label-bold !text-[10px] text-stone-500">Informations</p>
              <div className="text-xs mt-2 space-y-1"><p><span className="font-light text-stone-500">Nom : </span><span className="font-medium">{sel.name}</span></p>
              <p><span className="font-light text-stone-500">Téléphone : </span><span className="font-medium">{sel.phone}</span></p>
              <p><span className="font-light text-stone-500">Wilaya / Commune : </span><span className="font-medium">{sel.wilaya} · {sel.commune}</span></p>
              <p><span className="font-light text-stone-500">Dernière adresse : </span><span className="font-medium">{sel.adresse}</span></p></div>
            </div>
            <div className="card-soft p-4 mt-2.5">
              <p className="label-bold !text-[10px] text-stone-500">Historique commandes</p>
              <ul className="text-xs mt-2 space-y-1.5">
                <li><Link href="/imad29052005/orders" className="font-medium hover:underline">{sel.derniere}</Link></li>
              </ul>
            </div>
            <div className="card-soft p-4 mt-2.5 mb-4">
              <p className="label-bold !text-[10px] text-stone-500">Note interne</p>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} onBlur={() => saveCustomerNote(sel.phone, note)} placeholder="Note interne…" className="w-full mt-2 min-h-[56px] rounded-[10px] border-[1.5px] border-[#e8e3d8] p-2.5 text-xs bg-white outline-none" />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
