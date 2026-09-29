"use client";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { STATUS_STYLE, fmtDA, type AdminOrder, type AdminOrderStatus } from "@/lib/admin-data";
import { listOrders, moveOrder, saveDelivery, saveOrderNote } from "@/lib/actions/orders";
import { MessageCircle, Phone, X, Plus, Search } from "lucide-react";

const KANBAN = ["Non confirmé", "Confirmé", "En livraison", "Livré", "Retourné", "Annulée"] as const;
type KanbanCol = (typeof KANBAN)[number];

function colOf(o: AdminOrder): KanbanCol {
  switch (o.status) {
    case "À confirmer": return "Non confirmé";
    case "Confirmée":
    case "En préparation": return "Confirmé";
    case "Expédiée":
    case "En livraison": return "En livraison";
    case "Livrée": return "Livré";
    case "Retournée": return "Retourné";
    case "Annulée": return "Annulée";
  }
}

type Modal =
  | { kind: "delivered"; order: AdminOrder }
  | { kind: "cancel"; order: AdminOrder }
  | { kind: "return"; order: AdminOrder }
  | null;

function AdminOrdersInner() {
  const params = useSearchParams();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"kanban" | "liste">("kanban");
  const [q, setQ] = useState("");
  const [fWilaya, setFWilaya] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [fTransport, setFTransport] = useState("");
  const [mCol, setMCol] = useState<KanbanCol>("Non confirmé");
  const [selected, setSelected] = useState<AdminOrder | null>(null);
  const [modal, setModal] = useState<Modal>(null);
  const [toast, setToast] = useState<{ msg: string } | null>(null);
  const [checked, setChecked] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [shipCarrier, setShipCarrier] = useState("");
  const [shipTracking, setShipTracking] = useState("");
  const deepOpened = useRef(false);

  async function refresh(deep?: string | null) {
    const list = await listOrders().catch(() => [] as AdminOrder[]);
    setOrders(list);
    setSelected((s) => (s ? list.find((o) => o.id === s.id) ?? s : s));
    setLoading(false);
    if (deep && !deepOpened.current) {
      deepOpened.current = true;
      const hit = list.find((o) => o.id === deep);
      if (hit) { setSelected(hit); setNote(hit.note); }
    }
  }

  useEffect(() => {
    refresh(params.get("order"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setShipCarrier(selected?.transporteur ?? "");
    setShipTracking(selected?.tracking ?? "");
  }, [selected?.id]);

  const filtered = useMemo(() => orders.filter((o) =>
    (!q || (o.client + o.phone + o.id + o.tracking).toLowerCase().includes(q.toLowerCase())) &&
    (!fWilaya || o.wilaya === fWilaya) &&
    (!fStatus || o.status === fStatus) &&
    (!fTransport || o.transporteur === fTransport)
  ), [orders, q, fWilaya, fStatus, fTransport]);

  const wilayas = [...new Set(orders.map((o) => o.wilaya))];
  const statuses: AdminOrderStatus[] = ["À confirmer", "Confirmée", "En préparation", "Expédiée", "En livraison", "Livrée", "Retournée", "Annulée"];

  async function applyMove(order: AdminOrder, target: AdminOrderStatus) {
    const res = await moveOrder({ orderNumber: order.id, to: target });
    if (!res.ok) {
      if (res.code.startsWith("RUPTURE")) {
        const [, s, c] = res.code.split(":");
        setToast({ msg: `Stock épuisé : ${s} · ${c} — confirmation refusée` });
      } else {
        setToast({ msg: "Déplacement impossible — réessayez" });
      }
      return;
    }
    await refresh();
    setToast({ msg: `Commande ${order.id} déplacée vers ${target}` });
  }

  function requestMove(order: AdminOrder, col: KanbanCol) {
    if (colOf(order) === col) return;
    if (col === "Non confirmé") { applyMove(order, "À confirmer"); return; }
    if (col === "Confirmé") { applyMove(order, "Confirmée"); return; }
    if (col === "En livraison") { applyMove(order, "En livraison"); return; }
    if (col === "Livré") { setModal({ kind: "delivered", order }); return; }
    if (col === "Retourné") { setModal({ kind: "return", order }); return; }
    setModal({ kind: "cancel", order });
  }

  function onDrop(e: React.DragEvent, col: KanbanCol) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/order-id");
    const o = orders.find((x) => x.id === id);
    if (o) requestMove(o, col);
  }

  const inCol = (col: KanbanCol) => filtered.filter((o) => colOf(o) === col);

  function Card({ o, compact }: { o: AdminOrder; compact?: boolean }) {
    return (
      <div draggable
        onDragStart={(e) => e.dataTransfer.setData("text/order-id", o.id)}
        onClick={() => { setSelected(o); setNote(o.note); }}
        className="bg-white border border-[#e8e3d8] rounded-xl p-3 cursor-grab active:cursor-grabbing hover:border-stone-400 transition text-[13px] min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-bold">{o.id}</p>
          <span className="text-[10px] font-medium text-stone-400 whitespace-nowrap">{o.heure}</span>
        </div>
        <p className="font-medium mt-0.5 truncate">{o.client}</p>
        <p className="font-light text-stone-500 text-xs truncate">{o.phone}</p>
        <p className="font-normal mt-1.5 text-xs truncate">{o.items[0].name} <span className="text-stone-400">· {o.items[0].size} · {o.items[0].color} · ×{o.items[0].qty}</span></p>
        <p className="price-bold mt-1">{fmtDA(o.total)}</p>
        <div className="flex flex-wrap gap-1 mt-2 text-[10px] font-semibold">
          <span className="px-2 py-0.5 rounded-full bg-[#f5f3ee] border border-[#e8e3d8]">{o.wilaya}</span>
          <span className="px-2 py-0.5 rounded-full bg-[#f5f3ee] border border-[#e8e3d8]">{o.deliveryType}</span>
          <span className="px-2 py-0.5 rounded-full bg-[#f5f3ee] border border-[#e8e3d8]">{o.source}</span>
          {o.status === "En préparation" && <span className="px-2 py-0.5 rounded-full bg-[#e8e4d5] text-[#7a5a28]">En préparation</span>}
          {o.status === "Expédiée" && <span className="px-2 py-0.5 rounded-full bg-[#e3ecf5] text-[#2c5a7a]">Expédiée</span>}
        </div>
        {(o.status === "Expédiée" || o.status === "En livraison") && o.tracking && (
          <p className="text-[11px] font-medium text-stone-500 mt-1.5 truncate">{o.transporteur} · {o.tracking}</p>
        )}
        {!compact && (
          <select value={colOf(o)} onChange={(e) => requestMove(o, e.target.value as KanbanCol)}
            onClick={(e) => e.stopPropagation()}
            className="lg:hidden mt-2 w-full h-9 rounded-lg border border-[#e8e3d8] bg-[#f5f3ee] text-xs font-medium px-2">
            {KANBAN.map((c) => <option key={c} value={c}>→ {c}</option>)}
          </select>
        )}
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="section-title">Commandes</h1>
          <p className="section-sub">Voir la carte → déplacer → terminé. Ouvrez uniquement pour les détails.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex h-10 rounded-[10px] border-[1.5px] border-[#e8e3d8] bg-white p-1 text-xs font-semibold">
            {(["kanban", "liste"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} className={`px-4 h-full rounded-lg capitalize transition ${view === v ? "bg-[#1c1b18] text-white" : "text-stone-500"}`}>
                {v === "kanban" ? "Kanban" : "Liste"}
              </button>
            ))}
          </div>
          <Link href="/" className="btn-fluid !py-3 flex items-center gap-1.5"><Plus size={15} /> <span className="hidden sm:inline">Nouvelle commande</span><span className="sm:hidden">Nouvelle</span></Link>
        </div>
      </div>

      <div className="card-soft p-3 mt-4">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom, téléphone, numéro de commande ou code de suivi" className="input-soft !pl-10" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-2">
          <select value={fWilaya} onChange={(e) => setFWilaya(e.target.value)} className="input-soft !h-10 text-[13px]"><option value="">Wilaya : toutes</option>{wilayas.map((w) => <option key={w} value={w}>{w}</option>)}</select>
          <select value={fStatus} onChange={(e) => setFStatus(e.target.value)} className="input-soft !h-10 text-[13px]"><option value="">Statut : tous</option>{statuses.map((s) => <option key={s} value={s}>{s}</option>)}</select>
          <select value={fTransport} onChange={(e) => setFTransport(e.target.value)} className="input-soft !h-10 text-[13px]"><option value="">Transporteur : tous</option><option>Yalidine</option><option>ZR Express</option></select>
          <select className="input-soft !h-10 text-[13px]" defaultValue=""><option value="">Produit : tous</option><option>T-Shirt Oversize</option><option>Hoodie</option><option>Ensemble</option></select>
        </div>
      </div>

      {loading && orders.length === 0 && (
        <div className="card-soft p-8 mt-4 text-center text-sm font-light text-stone-500">Chargement des commandes…</div>
      )}
      {view === "kanban" ? (
        <div className="mt-4">
          {/* Mobile: status pills + single column (no horizontal scroll) */}
          <div className="lg:hidden">
            <div className="flex flex-wrap gap-1.5">
              {KANBAN.map((col) => (
                <button key={col} onClick={() => setMCol(col)}
                  className={`h-9 px-3 rounded-full text-xs border transition ${mCol === col ? "bg-[#1c1b18] text-white border-[#1c1b18] font-semibold" : "bg-white border-[#e8e3d8]"}`}>
                  {col} · {inCol(col).length}
                </button>
              ))}
            </div>
            <div className="space-y-2 mt-3">
              {inCol(mCol).map((o) => <Card key={o.id} o={o} />)}
              {inCol(mCol).length === 0 && <p className="text-xs font-light text-stone-400 text-center py-6">Aucune commande ici.</p>}
            </div>
          </div>
          {/* Desktop: 6 columns, fits without scrolling */}
          <div className="hidden lg:grid lg:grid-cols-6 gap-2">
            {KANBAN.map((col) => (
              <div key={col} onDragOver={(e) => e.preventDefault()} onDrop={(e) => onDrop(e, col)}
                className="rounded-2xl bg-[#ece7d9]/60 border border-[#e8e3d8] p-2 flex flex-col min-w-0 max-h-[72vh]">
                <div className="flex items-center justify-between gap-1 px-1 py-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{col}</p>
                  <span className="text-[11px] font-bold bg-white border border-[#e8e3d8] rounded-full px-2 py-0.5 shrink-0">{inCol(col).length}</span>
                </div>
                <div className="space-y-2 overflow-y-auto no-scrollbar mt-1">
                  {inCol(col).map((o) => <Card key={o.id} o={o} compact />)}
                  {inCol(col).length === 0 && <p className="text-[11px] font-light text-stone-400 text-center py-4">—</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card-soft mt-4 overflow-hidden">
          {checked.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 bg-[#1c1b18] text-white text-xs font-semibold">
              {checked.length} sélectionnée(s)
              <button onClick={async () => { const ids = [...checked]; setChecked([]); for (const id of ids) { const o = orders.find((x) => x.id === id); if (o) await moveOrder({ orderNumber: id, to: "Confirmée" }); } await refresh(); }} className="h-8 px-3 rounded-lg bg-white text-black">Confirmer</button>
              <button onClick={async () => { const n = checked.length; const ids = [...checked]; setChecked([]); for (const id of ids) { await moveOrder({ orderNumber: id, to: "Annulée" }); } await refresh(); setToast({ msg: `${n} commande(s) annulée(s)` }); }} className="h-8 px-3 rounded-lg border border-white/40">Annuler</button>
              <button className="h-8 px-3 rounded-lg border border-white/40">Exporter</button>
            </div>
          )}
          <table className="w-full text-xs">
            <thead><tr className="text-stone-400 border-b border-[#e8e3d8]">
              <th className="py-2.5 pl-4 pr-3 font-medium"><input type="checkbox" checked={checked.length === filtered.length && filtered.length > 0} onChange={(e) => setChecked(e.target.checked ? filtered.map((o) => o.id) : [])} /></th>
              <th className="font-medium px-3 text-left">Commande</th><th className="font-medium px-3 text-left">Client</th><th className="font-medium px-3 text-left hidden md:table-cell">Téléphone</th><th className="font-medium px-3 text-left hidden lg:table-cell">Produit</th><th className="font-medium px-3 text-left hidden sm:table-cell">Wilaya</th><th className="font-medium px-3 text-center">Total</th><th className="font-medium px-3 text-center hidden md:table-cell">Source</th><th className="font-medium px-3 text-center">Statut</th><th className="font-medium pl-3 pr-4 text-right hidden lg:table-cell">Date</th>
            </tr></thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} onClick={() => { setSelected(o); setNote(o.note); }} className="border-b border-stone-100 last:border-0 hover:bg-[#faf8f3] cursor-pointer">
                  <td className="pl-4 pr-3 py-3" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={checked.includes(o.id)} onChange={(e) => setChecked(e.target.checked ? [...checked, o.id] : checked.filter((x) => x !== o.id))} /></td>
                  <td className="font-semibold px-3 whitespace-nowrap">{o.id}</td>
                  <td className="font-normal px-3 max-w-[110px] truncate">{o.client}</td>
                  <td className="font-light text-stone-500 px-3 hidden md:table-cell whitespace-nowrap">{o.phone}</td>
                  <td className="font-normal px-3 hidden lg:table-cell max-w-[160px] truncate">{o.items[0].name} ×{o.items[0].qty}</td>
                  <td className="font-normal px-3 hidden sm:table-cell">{o.wilaya}</td>
                  <td className="font-bold px-3 text-center whitespace-nowrap">{fmtDA(o.total)}</td>
                  <td className="font-normal px-3 text-center hidden md:table-cell">{o.source}</td>
                  <td className="px-3 text-center"><span className={`px-2 py-0.5 rounded-full font-semibold text-[11px] whitespace-nowrap ${STATUS_STYLE[o.status]}`}>{o.status}</span></td>
                  <td className="font-light text-stone-400 pl-3 pr-4 hidden lg:table-cell text-right whitespace-nowrap">{o.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelected(null)} />
          <aside className="absolute right-0 top-0 h-full w-full sm:w-[440px] bg-[#f5f3ee] shadow-2xl overflow-y-auto p-4 md:p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-display font-bold text-xl">{selected.id}</p>
                <p className="text-xs font-light text-stone-500">{selected.date} · {selected.heure}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full font-semibold text-[11px] whitespace-nowrap ${STATUS_STYLE[selected.status]}`}>{selected.status}</span>
                <button onClick={() => setSelected(null)} className="w-9 h-9 rounded-full bg-white border border-[#e8e3d8] flex items-center justify-center shrink-0"><X size={15} /></button>
              </div>
            </div>

            <div className="card-soft p-4 mt-3">
              <p className="label-bold !text-[10px] text-stone-500">Client</p>
              <p className="font-semibold text-sm mt-1">{selected.client} · {selected.phone}</p>
              <p className="text-xs font-light text-stone-500 mt-0.5">{selected.wilaya} · {selected.commune} · {selected.adresse}{selected.repere ? ` · ${selected.repere}` : ""}</p>
              <div className="flex gap-2 mt-2.5">
              <a href={`tel:${selected.phone.replace(/\D/g, "")}`} className="flex-1 h-11 rounded-[10px] bg-[#1c1b18] text-white text-xs font-semibold flex items-center justify-center gap-1.5"><Phone size={14} /> Appeler</a>
              <a href={`https://wa.me/213${selected.phone.replace(/\D/g, "").slice(1)}`} target="_blank" className="flex-1 h-11 rounded-[10px] bg-[#1e8e57] text-white text-xs font-semibold flex items-center justify-center gap-1.5"><MessageCircle size={14} /> WhatsApp</a>
              </div>
            </div>

            <div className="card-soft p-4 mt-2.5">
              <p className="label-bold !text-[10px] text-stone-500">Produits</p>
              {selected.items.map((it, i) => (
                <div key={i} className="flex gap-2.5 mt-2.5">
                  <span className="relative w-12 h-14 rounded-lg overflow-hidden bg-[#ece7d9] shrink-0"><Image src={it.image} alt={it.name} fill className="object-cover" /></span>
                  <div className="text-xs flex-1 min-w-0">
                    <p className="font-semibold text-[13px] truncate">{it.name}</p>
                    <p className="font-light text-stone-500">{it.size} · {it.color} · ×{it.qty}</p>
                    <p className="font-bold mt-0.5">{fmtDA(it.price * it.qty)}</p>
                  </div>
                </div>
              ))}
              <div className="text-xs mt-3 space-y-1 border-t border-[#e8e3d8] pt-2.5">
                <p className="flex justify-between font-light text-stone-500"><span>Sous-total</span><span>{fmtDA(selected.sousTotal)}</span></p>
                {selected.reduction > 0 && <p className="flex justify-between font-light text-stone-500"><span>Réduction</span><span>−{fmtDA(selected.reduction)}</span></p>}
                <p className="flex justify-between font-light text-stone-500"><span>Livraison</span><span>{fmtDA(selected.livraison)}</span></p>
                <p className="flex justify-between font-bold text-sm"><span>Total à payer</span><span>{fmtDA(selected.total)}</span></p>
                <p className="font-light text-stone-400">Paiement à la livraison</p>
              </div>
            </div>

            <div className="card-soft p-4 mt-2.5">
              <p className="label-bold !text-[10px] text-stone-500">Livraison</p>
              <p className="text-xs font-normal mt-1.5">{selected.deliveryType} · {selected.wilaya}</p>
              <label className="label-bold !text-[10px] text-stone-500 mt-3 block">Transporteur</label>
              <select value={shipCarrier} onChange={(e) => setShipCarrier(e.target.value)} className="input-soft !h-11 text-xs mt-1.5">
                <option value="">Choisir…</option><option>Yalidine</option><option>ZR Express</option><option>Autre</option>
              </select>
              <label className="label-bold !text-[10px] text-stone-500 mt-2.5 block">Code de suivi</label>
              <input value={shipTracking} onChange={(e) => setShipTracking(e.target.value)} placeholder="YD…" className="input-soft !h-11 text-xs mt-1.5" />
              <button onClick={async () => { await saveDelivery(selected.id, shipCarrier, shipTracking.trim()); await refresh(); }} className="btn-fluid w-full mt-3">Enregistrer</button>
            </div>

            <div className="card-soft p-4 mt-2.5">
              <p className="label-bold !text-[10px] text-stone-500">Historique</p>
              <ul className="mt-2 space-y-1.5 text-xs">
                {selected.historique.map((h, i) => <li key={i} className="font-light text-stone-500"><span className="font-medium text-stone-700">{h.label}</span> · {h.date}{h.detail && <span className="block text-stone-400">{h.detail}</span>}</li>)}
              </ul>
            </div>

            <div className="card-soft p-4 mt-2.5 mb-4">
              <p className="label-bold !text-[10px] text-stone-500">Note interne</p>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} onBlur={() => saveOrderNote(selected.id, note).then(() => refresh())} placeholder="Ajouter une note..." className="w-full mt-2 min-h-[64px] rounded-[10px] border-[1.5px] border-[#e8e3d8] p-2.5 text-xs outline-none focus:border-stone-500 bg-white" />
            </div>
          </aside>
        </div>
      )}

      {modal?.kind === "delivered" && (
        <ModalWrap title="Commande livrée ?" onClose={() => setModal(null)}>
          <p className="text-sm font-light text-stone-500">Confirmez la livraison de <span className="font-semibold text-stone-800">{modal.order.id}</span>. La date est enregistrée, le paiement reste à encaisser.</p>
          <div className="flex gap-2 mt-4">
            <button onClick={() => setModal(null)} className="btn-ghost flex-1">Annuler</button>
            <button onClick={() => { applyMove(modal.order, "Livrée"); setModal(null); }} className="btn-dark flex-1">Confirmer</button>
          </div>
        </ModalWrap>
      )}
      {modal?.kind === "cancel" && (
        <ModalWrap title="Annuler cette commande ?" onClose={() => setModal(null)}>
          <label className="label-bold !text-[10px] text-stone-500">Motif (optionnel)</label>
          <select id="cancel-reason" className="input-soft mt-1.5"><option>Client</option><option>Stock</option><option>Adresse</option><option>Autre</option></select>
          <div className="flex gap-2 mt-4">
            <button onClick={() => setModal(null)} className="btn-ghost flex-1">Garder</button>
            <button onClick={async () => { const r = (document.getElementById("cancel-reason") as HTMLSelectElement)?.value ?? ""; setSelected(null); setModal(null); await applyMove(modal.order, "Annulée"); setToast({ msg: `Commande ${modal.order.id} annulée (${r})` }); }} className="flex-1 h-[46px] rounded-[10px] bg-[#c0452f] text-white text-xs font-semibold uppercase tracking-wider">Annuler</button>
          </div>
        </ModalWrap>
      )}
      {modal?.kind === "return" && (
        <ModalWrap title="Commande retournée ?" onClose={() => setModal(null)}>
          <label className="label-bold !text-[10px] text-stone-500">Motif (optionnel)</label>
          <select id="return-reason" className="input-soft mt-1.5"><option>Produit refusé</option><option>Problème taille</option><option>Produit incorrect</option><option>Autre</option></select>
          <div className="flex gap-2 mt-4">
            <button onClick={() => setModal(null)} className="btn-ghost flex-1">Fermer</button>
            <button onClick={() => { applyMove(modal.order, "Retournée"); setModal(null); }} className="btn-dark flex-1">Confirmer le retour</button>
          </div>
        </ModalWrap>
      )}
      {toast && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#1c1b18] text-white rounded-full pl-4 pr-2 py-2 text-xs font-medium shadow-2xl whitespace-nowrap max-w-[calc(100vw-2rem)] overflow-hidden">
          <span className="truncate">{toast.msg}</span>
          <button onClick={() => setToast(null)} className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"><X size={13} /></button>
        </div>
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="card-soft p-8 text-center text-sm font-light text-stone-500">Chargement…</div>}>
      <AdminOrdersInner />
    </Suspense>
  );
}

function ModalWrap({ title, children, onClose, wide }: { title: string; children: React.ReactNode; onClose: () => void; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative bg-[#f5f3ee] w-full ${wide ? "sm:max-w-[560px]" : "sm:max-w-[420px]"} rounded-t-2xl sm:rounded-2xl p-5 max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between mb-3">
          <p className="font-title font-semibold">{title}</p>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white border border-[#e8e3d8] flex items-center justify-center shrink-0"><X size={15} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
