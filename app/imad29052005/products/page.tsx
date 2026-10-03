"use client";
import { Fragment, Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { fmtDA, type AdminProduct } from "@/lib/admin-data";
import { listProductsAdmin, setProductStatus } from "@/lib/actions/catalog";
import { adjustStock } from "@/lib/actions/orders";
import { hexOf } from "@/lib/catalog-options";
import { Plus, ChevronDown, Download } from "lucide-react";
import { ExportModal, ExportField } from "@/components/admin/ExportModal";
import { exportCatalogueXlsx, productState } from "@/lib/export-excel";

function CatalogueInner() {
  const params = useSearchParams();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(params.get("tab") === "stock" ? "stock" : "produits");
  const [q, setQ] = useState("");
  const [fStatut, setFStatut] = useState("");
  const [fCat, setFCat] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, number>>({});
  const [stockReason, setStockReason] = useState("reception");
  const [exportOpen, setExportOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [doneMsg, setDoneMsg] = useState("");
  const [eCat, setECat] = useState("");
  const [eStatut, setEStatut] = useState("");
  const [eEtat, setEEtat] = useState("");

  async function refresh() {
    const list = await listProductsAdmin().catch(() => [] as AdminProduct[]);
    setProducts(list);
    setLoading(false);
  }
  useEffect(() => { refresh(); }, []);

  const categories = useMemo(() => [...new Set(products.map((p) => p.categorie).filter(Boolean))], [products]);

  const list = useMemo(() => products.filter((p) =>
    (!q || p.name.toLowerCase().includes(q.toLowerCase())) && (!fStatut || p.statut === fStatut) && (!fCat || p.categorie === fCat)
  ), [products, q, fStatut, fCat]);

  function openExport() {
    // Pré-remplit avec les filtres déjà actifs sur la page.
    setECat(fCat);
    setEStatut(fStatut);
    setDoneMsg("");
    setExportOpen(true);
  }

  const exportRows = useMemo(() => products.filter((p) =>
    (!q || p.name.toLowerCase().includes(q.toLowerCase())) &&
    (!eCat || p.categorie === eCat) &&
    (!eStatut || p.statut === eStatut) &&
    (!eEtat || productState(p) === eEtat)
  ), [products, q, eCat, eStatut, eEtat]);

  const exportVariants = useMemo(
    () => exportRows.reduce((a, p) => a + p.variants.length, 0),
    [exportRows]
  );

  async function doExport() {
    if (exportRows.length === 0 || downloading) return;
    setDownloading(true);
    try {
      const name = await exportCatalogueXlsx(exportRows);
      setExportOpen(false);
      setDoneMsg(`Fichier téléchargé : ${name}`);
    } catch {
      setDoneMsg("Export impossible — réessayez.");
    }
    setDownloading(false);
  }

  const statutStyle = (s: string) => s === "En ligne" ? "bg-[#e7efe9] text-[#20744d]" : s === "Brouillon" ? "bg-[#f5eedd] text-[#7a5a28]" : "bg-[#fbeae4] text-[#c0452f]";
  const etatStyle = (e: string) => e === "Disponible" ? "bg-[#e7efe9] text-[#20744d]" : e === "Stock faible" ? "bg-[#f5eedd] text-[#7a5a28]" : "bg-[#fbeae4] text-[#c0452f]";

  function productEtat(p: AdminProduct) {
    const total = p.variants.reduce((a, v) => a + v.stock, 0);
    if (total === 0) return "Rupture";
    return p.variants.some((v) => v.stock > 0 && v.stock <= v.seuil) ? "Stock faible" : "Disponible";
  }

  function openProduct(id: string) {
    if (expandedId === id) { setExpandedId(null); return; }
    const p = products.find((x) => x.id === id);
    if (!p) return;
    const d: Record<string, number> = {};
    p.variants.forEach((v, i) => { d[`${id}:${i}`] = v.stock; });
    setDraft(d);
    setExpandedId(id);
  }

  async function saveStock(id: string) {
    const p = products.find((x) => x.id === id);
    if (!p) return;
    for (let i = 0; i < p.variants.length; i++) {
      const v = p.variants[i];
      const val = draft[`${id}:${i}`] ?? v.stock;
      if (val !== v.stock) await adjustStock(id, v.taille, v.couleur, val, stockReason);
    }
    setExpandedId(null);
    await refresh();
  }

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="section-title">Catalogue</h1>
          <p className="section-sub">Produits et stock au même endroit.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={openExport} className="h-[46px] px-5 rounded-[10px] border-[1.5px] border-[#e8e3d8] bg-white text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 hover:border-stone-400 whitespace-nowrap"><Download size={15} /> <span className="hidden sm:inline">Exporter Excel</span><span className="sm:hidden">Excel</span></button>
          <Link href="/imad29052005/products/new" className="btn-fluid !py-3 flex items-center gap-1.5"><Plus size={15} /> Ajouter un produit</Link>
        </div>
      </div>
      {doneMsg && (
        <p className="text-xs font-medium text-[#20744d] mt-3">{doneMsg}</p>
      )}

      <div className="flex h-10 rounded-[10px] border-[1.5px] border-[#e8e3d8] bg-white p-1 text-xs font-semibold w-fit mt-4">
        {(["produits", "stock"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-5 h-full rounded-lg capitalize ${tab === t ? "bg-[#1c1b18] text-white" : "text-stone-500"}`}>{t}</button>
        ))}
      </div>

      <div className="card-soft p-3 mt-3 flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un produit" className="input-soft min-w-0 basis-0 grow-[3]" />
        <select value={fCat} onChange={(e) => setFCat(e.target.value)} aria-label="Catégorie" className="input-soft min-w-0 basis-0 grow truncate"><option value="">Catégorie : toutes</option>{categories.map((c) => <option key={c} value={c}>{c}</option>)}</select>
        {tab === "produits" && (
          <select value={fStatut} onChange={(e) => setFStatut(e.target.value)} aria-label="Statut" className="input-soft min-w-0 basis-0 grow truncate"><option value="">Statut : tous</option><option>En ligne</option><option>Brouillon</option><option>Rupture</option></select>
        )}
      </div>

      {loading ? (
        <div className="card-soft p-8 mt-3 text-center text-sm font-light text-stone-500">Chargement…</div>
      ) : tab === "produits" ? (
        <div className="card-soft mt-3 overflow-hidden">
            <table className="w-full text-xs">
              <thead><tr className="text-stone-400 border-b border-[#e8e3d8]"><th className="py-2.5 pl-4 pr-3 font-medium text-left">Produit</th><th className="font-medium px-3 text-center">Prix</th><th className="font-medium px-3 text-center hidden md:table-cell">Variantes</th><th className="font-medium px-3 text-center">Stock</th><th className="font-medium px-3 text-center hidden sm:table-cell">Statut</th><th className="font-medium px-3 text-center hidden lg:table-cell">Modifié</th><th className="font-medium pl-3 pr-4 text-right">Actions</th></tr></thead>
              <tbody>
                {list.map((p) => {
                  const stock = p.variants.reduce((a, v) => a + v.stock, 0);
                  const taillesN = new Set(p.variants.map((v) => v.taille)).size;
                  const couleursN = new Set(p.variants.map((v) => v.couleur)).size;
                  return (
                    <tr key={p.id} className="border-b border-stone-100 last:border-0">
                      <td className="pl-4 pr-3 py-3"><Link href={`/imad29052005/products/${p.id}`} className="flex items-center gap-2.5 min-w-0 group"><span className="relative w-10 h-12 rounded-lg overflow-hidden bg-[#ece7d9] shrink-0">{p.image ? <Image src={p.image} alt={p.name} fill className="object-cover" /> : null}</span><span className="font-semibold max-w-[130px] sm:max-w-none truncate group-hover:underline underline-offset-4">{p.name}</span></Link></td>
                      <td className="font-bold px-3 text-center whitespace-nowrap">{fmtDA(p.prix)}</td>
                      <td className="font-light text-stone-500 px-3 text-center hidden md:table-cell whitespace-nowrap">{taillesN} tailles · {couleursN} couleurs</td>
                      <td className={`font-semibold px-3 text-center ${stock <= 5 ? "text-[#c0452f]" : ""}`}>{stock}</td>
                      <td className="px-3 text-center hidden sm:table-cell"><span className={`px-2 py-0.5 rounded-full font-semibold text-[11px] whitespace-nowrap ${statutStyle(p.statut)}`}>{p.statut}</span></td>
                      <td className="font-light text-stone-400 px-3 text-center hidden lg:table-cell whitespace-nowrap">{p.updated}</td>
                      <td className="pl-3 pr-4"><span className="flex flex-col sm:flex-row gap-1.5 justify-end">
                        <Link href={`/imad29052005/products/${p.id}`} className="h-9 px-3 rounded-lg border-[1.5px] border-[#e8e3d8] font-semibold hover:border-stone-400 bg-white whitespace-nowrap flex items-center justify-center">Modifier</Link>
                        <button onClick={async () => { await setProductStatus(p.id, p.statut === "En ligne" ? "Brouillon" : "En ligne"); await refresh(); }} className="h-9 px-3 rounded-lg border-[1.5px] border-[#e8e3d8] font-semibold hover:border-stone-400 bg-white whitespace-nowrap">{p.statut === "En ligne" ? "Désactiver" : "Activer"}</button>
                      </span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
        </div>
      ) : (
        <div className="card-soft mt-3 overflow-hidden">
            <table className="w-full text-xs">
              <thead><tr className="text-stone-400 border-b border-[#e8e3d8]"><th className="py-2.5 pl-4 pr-3 font-medium text-left">Produit</th><th className="font-medium px-3 text-center">Stock total</th><th className="font-medium px-3 text-center">État</th><th className="font-medium pl-3 pr-4 text-right"><span className="sr-only">Détails</span></th></tr></thead>
              <tbody>
                {list.map((p) => {
                  const total = p.variants.reduce((a, v) => a + v.stock, 0);
                  const etat = productEtat(p);
                  const open = expandedId === p.id;
                  const draftTotal = p.variants.reduce((a, _, i) => a + (draft[`${p.id}:${i}`] ?? 0), 0);
                  return (
                    <Fragment key={p.id}>
                      <tr onClick={() => openProduct(p.id)} className="border-b border-stone-100 last:border-0 hover:bg-[#faf8f3] cursor-pointer">
                        <td className="pl-4 pr-3 py-3"><span className="flex items-center gap-2.5 min-w-0"><span className="relative w-10 h-12 rounded-lg overflow-hidden bg-[#ece7d9] shrink-0">{p.image ? <Image src={p.image} alt={p.name} fill className="object-cover" /> : null}</span><span className="font-semibold max-w-[140px] sm:max-w-none truncate">{p.name}</span></span></td>
                        <td className="px-3 text-center font-bold">{total}</td>
                        <td className="px-3 text-center"><span className={`px-2 py-0.5 rounded-full font-semibold text-[11px] whitespace-nowrap ${etatStyle(etat)}`}>{etat}</span></td>
                        <td className="pl-3 pr-4 text-right"><span className="inline-flex w-8 h-8 rounded-full border border-[#e8e3d8] bg-white items-center justify-center"><ChevronDown size={14} className={`transition ${open ? "rotate-180" : ""}`} /></span></td>
                      </tr>
                      {open && (
                        <tr className="border-b border-stone-100 bg-[#faf8f3]">
                          <td colSpan={4} className="px-3 sm:px-4 py-3">
                            <div className="space-y-1.5">
                              {p.variants.map((v, i) => {
                                const key = `${p.id}:${i}`;
                                const val = draft[key] ?? v.stock;
                                const e = val === 0 ? "Rupture" : val <= v.seuil ? "Stock faible" : "Disponible";
                                return (
                                  <div key={i} className="flex items-center gap-2 bg-white border border-[#e8e3d8] rounded-xl px-3 py-2">
                                    <span className="w-5 h-5 rounded-full border border-black/15 shrink-0" style={{ background: hexOf(v.couleur) }} />
                                    <span className="font-medium flex-1 min-w-0 truncate">{v.taille} · {v.couleur}</span>
                                    <span className={`px-2 py-0.5 rounded-full font-semibold text-[11px] whitespace-nowrap hidden sm:inline ${etatStyle(e)}`}>{e}</span>
                                    <input type="number" min={0} value={val} onChange={(e) => setDraft((d) => ({ ...d, [key]: Math.max(0, Number(e.target.value) || 0) }))}
                                      aria-label={`Stock ${v.taille} ${v.couleur}`} className="w-16 h-9 rounded-lg border border-[#e8e3d8] text-right text-xs font-bold px-1.5 bg-[#f5f3ee] outline-none shrink-0" />
                                  </div>
                                );
                              })}
                              <select value={stockReason} onChange={(e) => setStockReason(e.target.value)} className="input-soft !h-10 text-xs" aria-label="Motif">
                                <option value="reception">Réception</option><option value="correction">Correction</option><option value="endommage">Produit endommagé</option><option value="retour">Retour</option>
                              </select>
                              <div className="flex items-center justify-between gap-2 pt-1.5">
                                <p className="text-xs font-light text-stone-500">Total : <span className="font-bold text-stone-800">{draftTotal}</span></p>
                                <span className="flex gap-1.5">
                                  <button onClick={() => setExpandedId(null)} className="h-10 px-4 rounded-[10px] border-[1.5px] border-[#e8e3d8] bg-white text-xs font-semibold">Annuler</button>
                                  <button onClick={() => saveStock(p.id)} className="btn-fluid !py-2.5">Enregistrer</button>
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
        </div>
      )}

      {exportOpen && (
        <ExportModal
          title="Exporter le catalogue"
          countLabel={`≈ ${exportRows.length} produit${exportRows.length > 1 ? "s" : ""} + ${exportVariants} variante${exportVariants > 1 ? "s" : ""} (2 onglets : Produits + Stock détail).`}
          downloading={downloading}
          canDownload={exportRows.length > 0}
          emptyHint="Aucun produit avec ces filtres — élargissez la recherche."
          onClose={() => setExportOpen(false)}
          onDownload={doExport}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <ExportField label="Catégorie">
              <select value={eCat} onChange={(e) => setECat(e.target.value)} className="input-soft !h-10 text-[13px]"><option value="">Toutes</option>{categories.map((c) => <option key={c} value={c}>{c}</option>)}</select>
            </ExportField>
            <ExportField label="Statut">
              <select value={eStatut} onChange={(e) => setEStatut(e.target.value)} className="input-soft !h-10 text-[13px]"><option value="">Tous</option><option>En ligne</option><option>Brouillon</option><option>Rupture</option></select>
            </ExportField>
            <ExportField label="État stock">
              <select value={eEtat} onChange={(e) => setEEtat(e.target.value)} className="input-soft !h-10 text-[13px]"><option value="">Tous</option><option>Disponible</option><option>Stock faible</option><option>Rupture</option></select>
            </ExportField>
          </div>
          <p className="text-[11px] font-light text-stone-500">Recherche de la page prise en compte (« {q || "—"} »).</p>
        </ExportModal>
      )}
    </div>
  );
}

export default function CataloguePage() {
  return (
    <Suspense fallback={<div className="card-soft p-6 text-sm font-light text-stone-500">Chargement…</div>}>
      <CatalogueInner />
    </Suspense>
  );
}
