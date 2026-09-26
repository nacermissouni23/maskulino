"use client";
import { useState } from "react";
import { MOCK_ORDERS, formatDA, type OrderStatus } from "@/lib/data";
import { MessageCircle, Phone, Printer, Ban } from "lucide-react";

const STATUTS: ("Toutes" | OrderStatus)[] = ["Toutes", "En attente", "Confirmée", "Expédiée", "Livrée", "Retournée", "Annulée"];

export default function AdminOrders() {
  const [filtre, setFiltre] = useState<(typeof STATUTS)[number]>("Toutes");
  const [q, setQ] = useState("");
  const list = MOCK_ORDERS.filter((o) => (filtre === "Toutes" || o.status === filtre) && (!q || (o.customer + o.id + o.phone).toLowerCase().includes(q.toLowerCase())));
  return (
    <div>
      <p className="eyebrow">Paiement à la livraison</p>
      <h1 className="section-title mt-1">Commandes</h1>
      <p className="section-sub">En attente → confirmée (WhatsApp / appel en moins de 4 h) → expédiée → livrée ou retournée.</p>
      <div className="card-soft p-3 flex gap-2 mt-5">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher nom, téléphone, MSK-…" className="flex-1 h-11 bg-[#f6f5ff] rounded-xl px-4 text-sm outline-none placeholder:font-light" />
        <button className="h-11 px-4 border-[1.5px] border-gray-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:border-gray-400"><Printer size={14}/> Exporter</button>
      </div>
      <div className="flex gap-1.5 mt-3.5 overflow-x-auto no-scrollbar pb-1">
        {STATUTS.map((s) => (
          <button key={s} onClick={() => setFiltre(s)} className={`px-4 h-10 text-xs rounded-full border-[1.5px] whitespace-nowrap transition ${filtre === s ? "bg-[#14142b] text-white border-[#14142b] font-semibold" : "bg-white border-gray-200 font-normal"}`}>{s}</button>
        ))}
      </div>
      <div className="space-y-3 mt-4">
        {list.map((o) => (
          <div key={o.id} className="card-soft p-5 grid md:grid-cols-[1fr_auto] gap-4">
            <div>
              <p className="font-semibold text-sm">{o.id} — {o.customer} <span className="ml-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100">Risque {o.risk.toLowerCase()}</span></p>
              <p className="text-xs font-light text-gray-500 mt-1">{o.phone} • {o.wilaya} • {o.items} article{o.items > 1 ? "s" : ""} • {o.date}</p>
              <p className="price-bold mt-1.5">{formatDA(o.total)} <span className="text-xs font-light text-gray-400">en espèces</span></p>
            </div>
            <div className="flex md:flex-col gap-1.5">
              <span className="flex gap-1.5">
                <button title="Confirmer sur WhatsApp" className="h-10 px-3.5 rounded-xl bg-[#25D366] text-white text-xs font-semibold flex items-center gap-1.5 hover:brightness-105"><MessageCircle size={14}/> Confirmer</button>
                <button title="Appeler" className="h-10 px-3.5 rounded-xl bg-[#14142b] text-white text-xs font-semibold flex items-center gap-1.5"><Phone size={14}/> Appeler</button>
              </span>
              <span className="flex gap-1.5">
                <button className="h-10 px-3.5 rounded-xl border-[1.5px] border-gray-200 text-xs font-semibold hover:border-gray-400">Expédier → Yalidine</button>
                <button title="Blacklister" className="h-10 px-3.5 rounded-xl border-[1.5px] border-red-200 text-red-500 text-xs font-semibold flex items-center gap-1 hover:bg-red-50"><Ban size={14}/></button>
              </span>
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <div className="card-soft text-center py-12">
            <p className="font-semibold">Aucune commande dans ce statut</p>
            <p className="text-sm font-light text-gray-500 mt-1">Changez de filtre ou de recherche.</p>
          </div>
        )}
      </div>
    </div>
  );
}
