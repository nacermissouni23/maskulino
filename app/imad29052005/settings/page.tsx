"use client";
import { useEffect, useMemo, useState } from "react";
import {
  getCarriers, getPrices, getWilayas, addCarrierDb, toggleCarrierDb, deleteCarrierDb,
  savePricesDb, getShopSettings, saveShopSettings,
  type CarrierRow, type PriceRow,
} from "@/lib/actions/settings";
import {
  listCategories, addCategory, renameCategory, deleteCategory,
} from "@/lib/actions/catalog";
import {
  pushTargets, setTelegramUsername, sendTestTelegram,
} from "@/lib/actions/notify";
import { subscribeForOrders } from "@/lib/push-client";
import { Plus, Trash2, Pencil, Bell } from "lucide-react";

type ShopForm = {
  name: string; phone: string; whatsapp: string; domain: string;
  facebook: string; instagram: string; tiktok: string; address: string; hours: string;
};
const EMPTY_SHOP: ShopForm = {
  name: "", phone: "", whatsapp: "", domain: "", facebook: "",
  instagram: "", tiktok: "", address: "", hours: "",
};

export default function AdminSettings() {
  const [categories, setCategories] = useState<string[]>([]);
  const [catDraft, setCatDraft] = useState("");
  const [editingCat, setEditingCat] = useState<{ index: number; value: string } | null>(null);
  const [shop, setShop] = useState<ShopForm>(EMPTY_SHOP);
  const [saved, setSaved] = useState(false);
  const [carriers, setCarriers] = useState<CarrierRow[]>([]);
  const [prices, setPrices] = useState<Record<string, Record<number, PriceRow>>>({});
  const [wilayas, setWilayas] = useState<{ code: number; name: string }[]>([]);
  const [draft, setDraft] = useState("");
  const [tarifsSaved, setTarifsSaved] = useState(false);
  const [activeCarrier, setActiveCarrier] = useState("yalidine");
  const [q, setQ] = useState("");
  const [onlyUncovered, setOnlyUncovered] = useState(false);
  const [tgUser, setTgUser] = useState("");
  const [tgActive, setTgActive] = useState(false);
  const [notifMsg, setNotifMsg] = useState("");
  const [pushDevices, setPushDevices] = useState(0);
  const [pushBusy, setPushBusy] = useState(false);

  async function loadAll() {
    const [cs, sh, cr, pr, wz, tg] = await Promise.all([
      listCategories().catch(() => [] as string[]),
      getShopSettings().catch(() => null),
      getCarriers().catch(() => [] as CarrierRow[]),
      getPrices().catch(() => ({})),
      getWilayas().catch(() => []),
      pushTargets().catch(() => ({ devices: 0, telegram: "", telegramActive: false })),
    ]);
    setCategories(cs);
    if (sh) setShop({ ...EMPTY_SHOP, ...(sh as unknown as ShopForm) });
    setCarriers(cr);
    setPrices(pr);
    setWilayas(wz);
    setTgUser(tg.telegram);
    setTgActive(tg.telegramActive);
    fetch("/api/push/subscribe").then((r) => r.json()).then((j) => setPushDevices(j.count ?? 0)).catch(() => undefined);
  }
  useEffect(() => { loadAll(); }, []);

  async function saveShop() {
    const r = await saveShopSettings(shop);
    if (r.ok) { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  }

  async function submitCategory() {
    if (!catDraft.trim()) return;
    const r = await addCategory(catDraft);
    if (r.ok) { setCatDraft(""); setCategories(await listCategories().catch(() => categories)); }
  }
  async function doRename(i: number, value: string) {
    if (!value.trim()) return;
    const r = await renameCategory(categories[i], value);
    if (r.ok) { setEditingCat(null); setCategories(await listCategories().catch(() => categories)); }
  }
  async function doDelete(i: number) {
    if (!window.confirm(`Supprimer la catégorie « ${categories[i]} » ?`)) return;
    const r = await deleteCategory(categories[i]);
    if (r.ok) setCategories(await listCategories().catch(() => categories));
  }

  const carrier = carriers.find((c) => c.id === activeCarrier) ?? carriers[0];
  const rows = useMemo(() => wilayas.filter((w) => {
    const p = carrier ? prices[carrier.id]?.[w.code] : undefined;
    if (q && !w.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (onlyUncovered && p?.couvert) return false;
    return true;
  }), [q, onlyUncovered, prices, carrier, wilayas]);

  async function addCarrier() {
    if (!draft.trim()) return;
    const r = await addCarrierDb(draft);
    if (r.ok && r.id) {
      setDraft("");
      const cr = await getCarriers().catch(() => carriers);
      const pr = await getPrices().catch(() => prices);
      setCarriers(cr); setPrices(pr); setActiveCarrier(r.id);
    }
  }
  async function removeCarrier(id: string) {
    const r = await deleteCarrierDb(id);
    if (r.ok) {
      if (activeCarrier === id) setActiveCarrier("yalidine");
      setCarriers(await getCarriers().catch(() => carriers));
    }
  }
  async function toggleCarrier(id: string) {
    const r = await toggleCarrierDb(id);
    if (r.ok) setCarriers(await getCarriers().catch(() => carriers));
  }

  function setPrice(code: number, patch: Partial<PriceRow>) {
    if (!carrier) return;
    setPrices((ps) => ({
      ...ps,
      [carrier.id]: { ...ps[carrier.id], [code]: { ...(ps[carrier.id]?.[code] ?? { home: 600, stopdesk: 350, couvert: true }), ...patch } },
    }));
  }

  async function saveTarifs() {
    if (!carrier) return;
    const r = await savePricesDb(carrier.id, prices[carrier.id] ?? {});
    if (r.ok) { setTarifsSaved(true); setTimeout(() => setTarifsSaved(false), 2000); }
  }

  const covered = carrier ? Object.values(prices[carrier.id] ?? {}).filter((p) => p.couvert).length : 0;

  async function connectTelegram() {
    if (!tgUser.trim()) return;
    const r = await setTelegramUsername(tgUser);
    if (r.ok && r.connectUrl) window.open(r.connectUrl, "_blank");
  }

  async function testTelegram() {
    const r = await sendTestTelegram();
    setNotifMsg(r.ok ? (r.sent > 0 ? "Message Telegram envoyé ✅" : "Telegram non connecté — touchez Start dans le bot.") : "Bot non configuré.");
  }

  async function enablePushHere() {
    setPushBusy(true);
    setNotifMsg("");
    const r = await subscribeForOrders();
    if (!r.ok) {
      setNotifMsg(r.code === "DENIED" ? "Notifications bloquées — autorisez-les dans le navigateur puis réessayez." : "Activation impossible — réessayez.");
      setPushBusy(false);
      return;
    }
    const j = await fetch("/api/push/subscribe").then((x) => x.json()).catch(() => ({ count: pushDevices }));
    setPushDevices(j.count ?? pushDevices);
    setNotifMsg("Alertes activées sur cet appareil ✅ — même navigateur fermé / téléphone verrouillé.");
    setPushBusy(false);
  }

  async function testPush() {
    setPushBusy(true);
    const r = await fetch("/api/push/test", { method: "POST" }).then((x) => x.json()).catch(() => null);
    setNotifMsg(r?.ok ? `Notification de test envoyée ✅ (${r.sent ?? 0} appareil${(r.sent ?? 0) > 1 ? "s" : ""}).` : "Aucun appareil abonné ou clés VAPID manquantes.");
    setPushBusy(false);
  }

  return (
    <div>
      <h1 className="section-title">Paramètres</h1>
      <p className="section-sub">Boutique, catégories, transporteurs et tarifs de livraison.</p>

      <div className="card-soft p-5 mt-4">
        <p className="font-title font-semibold text-sm">Boutique</p>
        <p className="text-[11px] font-light text-stone-400 mt-0.5">Ces infos s&apos;affichent sur la page Contact, le pied de page et le bouton WhatsApp.</p>
        <div className="grid sm:grid-cols-2 gap-2 mt-3">
          <input value={shop.name} onChange={(e) => setShop({ ...shop, name: e.target.value })} placeholder="Nom de la boutique" className="input-soft" />
          <input value={shop.phone} onChange={(e) => setShop({ ...shop, phone: e.target.value })} placeholder="Téléphone" className="input-soft" />
          <input value={shop.whatsapp} onChange={(e) => setShop({ ...shop, whatsapp: e.target.value })} placeholder="WhatsApp" className="input-soft" />
          <input value={shop.domain} onChange={(e) => setShop({ ...shop, domain: e.target.value })} placeholder="Domaine" className="input-soft" />
          <input value={shop.facebook} onChange={(e) => setShop({ ...shop, facebook: e.target.value })} placeholder="Facebook (lien complet)" className="input-soft" />
          <input value={shop.instagram} onChange={(e) => setShop({ ...shop, instagram: e.target.value })} placeholder="Instagram (lien complet)" className="input-soft" />
          <input value={shop.tiktok} onChange={(e) => setShop({ ...shop, tiktok: e.target.value })} placeholder="TikTok (lien complet)" className="input-soft sm:col-span-2" />
          <input value={shop.address} onChange={(e) => setShop({ ...shop, address: e.target.value })} placeholder="Adresse — ex. Didouche Mourad, Alger" className="input-soft sm:col-span-2" />
          <input value={shop.hours} onChange={(e) => setShop({ ...shop, hours: e.target.value })} placeholder="Horaires" className="input-soft sm:col-span-2" />
        </div>
        <button onClick={saveShop} className="btn-dark mt-3 !py-2.5">{saved ? "Enregistré ✓" : "Enregistrer"}</button>
      </div>

      <div className="card-soft p-5 mt-3">
        <p className="font-title font-semibold text-sm">Catégories</p>
        <p className="text-[11px] font-light text-stone-400 mt-0.5">Utilisées dans le catalogue pour classer les vêtements.</p>
        <div className="space-y-2 mt-3">
          {categories.map((c, i) => (
            <div key={`${c}-${i}`} className="flex items-center justify-between gap-2 bg-[#f5f3ee] border border-[#e8e3d8] rounded-xl px-3.5 py-2 text-sm">
              {editingCat?.index === i ? (
                <span className="flex items-center gap-2 flex-1">
                  <input value={editingCat.value} onChange={(e) => setEditingCat({ index: i, value: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && editingCat.value.trim()) doRename(i, editingCat.value);
                      if (e.key === "Escape") setEditingCat(null);
                    }}
                    autoFocus className="input-soft !h-9 flex-1" />
                  <button onClick={() => doRename(i, editingCat.value)} className="h-9 px-3.5 rounded-[10px] bg-[#1c1b18] text-white text-xs font-semibold whitespace-nowrap">OK</button>
                </span>
              ) : (
                <span className="font-medium truncate">{c}</span>
              )}
              <span className="flex items-center gap-1.5 shrink-0">
                {editingCat?.index !== i && (
                  <button onClick={() => setEditingCat({ index: i, value: c })} title="Renommer"
                    className="w-8 h-8 rounded-full bg-white border border-[#e8e3d8] flex items-center justify-center text-stone-500 hover:border-stone-400">
                    <Pencil size={13} />
                  </button>
                )}
                <button onClick={() => doDelete(i)} title="Supprimer" className="w-8 h-8 rounded-full bg-white border border-[#e8e3d8] flex items-center justify-center text-[#c0452f] hover:border-[#c0452f]">
                  <Trash2 size={13} />
                </button>
              </span>
            </div>
          ))}
          <div className="flex gap-2">
            <input value={catDraft} onChange={(e) => setCatDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submitCategory()}
              placeholder="Nouvelle catégorie — ex. Sportswear…" className="input-soft flex-1" />
            <button onClick={submitCategory} disabled={!catDraft.trim()} className="btn-dark !py-2.5 flex items-center gap-1.5 disabled:opacity-40">
              <Plus size={14} /> Ajouter
            </button>
          </div>
        </div>
      </div>

      <div className="card-soft p-5 mt-3">
        <p className="font-title font-semibold text-sm">Transporteurs</p>
        <p className="text-[11px] font-light text-stone-400 mt-0.5">Activez ceux que vous utilisez. Les tarifs se règlent par transporteur ci-dessous.</p>
        <div className="space-y-2 mt-3">
          {carriers.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-2 bg-[#f5f3ee] border border-[#e8e3d8] rounded-xl px-3.5 py-2.5 text-sm">
              <span className="font-medium">{c.nom}</span>
              <span className="flex items-center gap-1.5">
                {c.custom && (
                  <button onClick={() => removeCarrier(c.id)} title="Supprimer" className="w-8 h-8 rounded-full bg-white border border-[#e8e3d8] flex items-center justify-center text-[#c0452f]">
                    <Trash2 size={13} />
                  </button>
                )}
                <button onClick={() => toggleCarrier(c.id)}
                  className={`h-8 px-3.5 rounded-full text-xs font-semibold border transition ${c.actif ? "bg-[#e7efe9] text-[#20744d] border-[#cfe3d6]" : "bg-white text-stone-400 border-[#e8e3d8]"}`}>
                  {c.actif ? "Actif" : "Inactif"}
                </button>
              </span>
            </div>
          ))}
          <div className="flex gap-2">
            <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCarrier()}
              placeholder="Autre transporteur — nom…" className="input-soft flex-1" />
            <button onClick={addCarrier} disabled={!draft.trim()} className="btn-dark !py-2.5 flex items-center gap-1.5 disabled:opacity-40">
              <Plus size={14} /> Ajouter
            </button>
          </div>
        </div>
      </div>

      <div className="card-soft p-5 mt-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="font-title font-semibold text-sm">Tarifs par wilaya · Domicile / Stop Desk</p>
            <p className="text-[11px] font-light text-stone-400 mt-0.5">Choisissez le transporteur avant de modifier les prix — chacun a sa propre grille.</p>
          </div>
          <span className="text-[11px] font-semibold text-stone-500">{covered} / 69 wilayas couvertes</span>
        </div>

        <div className="flex flex-wrap gap-1.5 mt-3">
          {carriers.map((c) => (
            <button key={c.id} onClick={() => setActiveCarrier(c.id)}
              className={`px-4 h-9 text-xs rounded-full border whitespace-nowrap transition ${activeCarrier === c.id ? "bg-[#1c1b18] text-white border-[#1c1b18] font-semibold" : "bg-white border-[#e8e3d8]"}`}>
              {c.nom}{!c.actif ? " · off" : ""}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mt-2.5">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher une wilaya (ex. Oran, 59…)" className="input-soft sm:flex-1" />
          <button onClick={() => setOnlyUncovered(!onlyUncovered)}
            className={`h-12 px-4 rounded-[10px] border-[1.5px] text-xs font-semibold whitespace-nowrap transition ${onlyUncovered ? "bg-[#1c1b18] text-white border-[#1c1b18]" : "bg-white border-[#e8e3d8]"}`}>
            Non couvertes uniquement
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-2 mt-2.5 max-h-[420px] overflow-auto pr-1">
          {rows.map((w) => {
            const p = carrier ? prices[carrier.id]?.[w.code] : undefined;
            if (!p) return null;
            return (
              <div key={w.code} className={`border rounded-xl p-2.5 text-xs flex items-center justify-between gap-2 ${p.couvert ? "border-stone-100 bg-[#faf8f3]" : "border-[#f3d4c8] bg-[#fdf6f2] opacity-80"}`}>
                <label className="flex items-center gap-2 min-w-0 cursor-pointer">
                  <input type="checkbox" checked={p.couvert} onChange={(e) => setPrice(w.code, { couvert: e.target.checked })} title="Couvert par ce transporteur" />
                  <span className="font-medium truncate">{w.name}</span>
                </label>
                <span className="flex items-center gap-1 font-light text-stone-500 shrink-0">
                  <input type="number" value={p.home} disabled={!p.couvert} onChange={(e) => setPrice(w.code, { home: Number(e.target.value) || 0 })}
                    className="w-20 h-8 rounded-lg border border-[#e8e3d8] px-1.5 text-right bg-white disabled:opacity-40" /> /
                  <input type="number" value={p.stopdesk ?? ""} placeholder="—" disabled={!p.couvert} onChange={(e) => setPrice(w.code, { stopdesk: e.target.value === "" ? null : Number(e.target.value) })}
                    className="w-20 h-8 rounded-lg border border-[#e8e3d8] px-1.5 text-right bg-white disabled:opacity-40" /> DA
                </span>
              </div>
            );
          })}
        </div>
        {rows.length === 0 && <p className="text-xs font-light text-stone-400 text-center py-6">Aucune wilaya ne correspond.</p>}

        <button onClick={saveTarifs} className="btn-dark mt-3 !py-2.5">{tarifsSaved ? "Enregistré ✓ — visible sur la boutique" : `Enregistrer les tarifs ${carrier?.nom ?? ""}`}</button>
      </div>

      <div className="card-soft p-5 mt-3">
        <p className="font-title font-semibold text-sm flex items-center gap-2"><Bell size={15} /> Alertes de commandes</p>
        <p className="text-[11px] font-light text-stone-400 mt-0.5">Push + son + vibration à chaque commande — même navigateur fermé / téléphone verrouillé — plus Telegram en copie.</p>
        <div className="bg-[#f5f3ee] border border-[#e8e3d8] rounded-xl p-3.5 mt-3">
          <p className="text-xs font-semibold">Notifications push {pushDevices > 0 && <span className="font-bold text-[#20744d]">· {pushDevices} appareil{pushDevices > 1 ? "s" : ""}</span>}</p>
          <p className="text-[11px] font-light text-stone-500 mt-0.5">Activez sur chaque téléphone / PC qui doit recevoir les commandes.</p>
          <div className="flex gap-1.5 mt-2.5">
            <button onClick={enablePushHere} disabled={pushBusy} className="btn-dark !py-2 flex-1 disabled:opacity-50">{pushBusy ? "…" : "Activer sur cet appareil"}</button>
            <button onClick={testPush} disabled={pushBusy} className="flex-1 h-12 rounded-[10px] border-[1.5px] border-[#e8e3d8] bg-white text-xs font-semibold disabled:opacity-50">Envoyer un test</button>
          </div>
        </div>
        <div className="bg-[#f5f3ee] border border-[#e8e3d8] rounded-xl p-3.5 mt-2.5">
          <p className="text-xs font-semibold">Telegram {tgActive && <span className="font-bold text-[#20744d]">· connecté</span>}</p>
          <div className="flex gap-1.5 mt-2.5">
            <input value={tgUser} onChange={(e) => setTgUser(e.target.value)} placeholder="@username" className="input-soft !h-11 flex-1 min-w-0" />
            <button onClick={connectTelegram} className="btn-dark !py-2 whitespace-nowrap">Connecter</button>
          </div>
          <button onClick={testTelegram} className="w-full mt-1.5 h-11 rounded-[10px] border-[1.5px] border-[#e8e3d8] bg-white text-xs font-semibold">Envoyer un test</button>
        </div>
        {notifMsg && <p className="text-xs font-medium text-stone-600 bg-white border border-[#e8e3d8] rounded-xl p-2.5 mt-2.5">{notifMsg}</p>}
      </div>
    </div>
  );
}
