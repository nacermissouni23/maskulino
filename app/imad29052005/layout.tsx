"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard, ShoppingCart, Package, Users, ChartLine, Settings, Store, Bell, MessageCircle, Phone, X,
} from "lucide-react";
import { latestOrderFull } from "@/lib/actions/orders";
import { pushSupported, subscribeForOrders, getPushState } from "@/lib/push-client";
import type { AdminOrder } from "@/lib/admin-data";

const NAV = [
  { href: "/imad29052005", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/imad29052005/orders", label: "Commandes", icon: ShoppingCart },
  { href: "/imad29052005/products", label: "Catalogue", icon: Package },
  { href: "/imad29052005/customers", label: "Clients", icon: Users },
  { href: "/imad29052005/analytics", label: "Analytics", icon: ChartLine },
];

const TITLES: Record<string, string> = {
  "/imad29052005": "Tableau de bord",
  "/imad29052005/orders": "Commandes",
  "/imad29052005/products": "Catalogue",
  "/imad29052005/customers": "Clients",
  "/imad29052005/analytics": "Analytics",
  "/imad29052005/settings": "Paramètres",
};

function ding() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    if (ctx.state === "suspended") void ctx.resume().catch(() => undefined);
    [660, 880, 990].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = f;
      g.gain.setValueAtTime(0.001, ctx.currentTime + i * 0.18);
      g.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + i * 0.18 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.18 + 0.35);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + i * 0.18);
      o.stop(ctx.currentTime + i * 0.18 + 0.4);
    });
  } catch { /* silent */ }
}

function buzz() {
  try {
    (navigator as Navigator & { vibrate?: (p: number[]) => boolean }).vibrate?.([250, 120, 250, 120, 400]);
  } catch { /* iOS/PC: ignored */ }
}

function orderBody(o: AdminOrder) {
  const lines = o.items.map((it) =>
    `• ${it.qty}× ${it.name} (${it.size} · ${it.color}) — ${(it.qty * it.price).toLocaleString("fr-DZ")} DA`
  );
  return [
    `${o.client} · ${o.phone}`,
    ...lines,
    `Total : ${o.total.toLocaleString("fr-DZ")} DA`,
  ].join("\n");
}

function fireOrderAlert(o: AdminOrder) {
  ding();
  buzz();
  try {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`Nouvelle commande ${o.id}`, {
        body: orderBody(o),
        tag: o.id,
        requireInteraction: true,
        silent: false,
        icon: "/icon.svg",
      });
    }
  } catch { /* fallback: in-page toast below */ }
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const title = TITLES[path] ?? "Administration";
  const [toConfirm, setToConfirm] = useState(0);
  const [showPerm, setShowPerm] = useState(false);
  const [permState, setPermState] = useState<"default" | "granted" | "denied" | "unsupported">("default");
  const [pushBusy, setPushBusy] = useState(false);
  const [pushMsg, setPushMsg] = useState("");
  const [freshOrder, setFreshOrder] = useState<AdminOrder | null>(null);
  const lastId = useRef<string | null>(null);
  const firstPoll = useRef(true);

  // Demande d'activation : à chaque entrée sur l'admin, si CET appareil n'est pas
  // abonné aux alertes de fond, on affiche le bandeau. Au clic sur Activer, le
  // navigateur affiche sa vraie question (Autoriser / Bloquer) puis l'appareil
  // est enregistré côté serveur → alertes même navigateur fermé / téléphone verrouillé.
  useEffect(() => {
    (async () => {
      try {
        if (!pushSupported()) {
          setPermState("unsupported");
          setShowPerm(true);
          return;
        }
        const st = await getPushState();
        setPermState(st.permission === "unsupported" ? "unsupported" : st.permission);
        setShowPerm(!st.subscribed);
        if (st.subscribed) {
          try { localStorage.setItem("maskulino.notif.granted", "1"); } catch { /* ignore */ }
        }
      } catch { /* ignore */ }
    })();
    async function poll() {
      try {
        const info = await latestOrderFull();
        setToConfirm(info.toConfirm);
        if (!firstPoll.current && info.latestId && lastId.current && info.latestId !== lastId.current && info.order) {
          fireOrderAlert(info.order);
          setFreshOrder(info.order);
        }
        if (info.latestId) lastId.current = info.latestId;
      } catch { /* offline: keep quiet */ }
      firstPoll.current = false;
    }
    poll();
    const t = setInterval(poll, 10000);
    return () => clearInterval(t);
  }, []);

  async function enableAlerts() {
    setPushBusy(true);
    setPushMsg("");
    const r = await subscribeForOrders();
    setPushBusy(false);
    if (!r.ok) {
      if (r.code === "DENIED") {
        setPermState("denied");
        setPushMsg("Vous avez bloqué les notifications — rouvrez le cadenas / réglages du site → Autoriser, puis réessayez.");
      } else if (r.code === "UNSUPPORTED") {
        setPermState("unsupported");
      } else if (r.code === "NO_VAPID_KEY") {
        setPushMsg("Clé push manquante côté serveur (NEXT_PUBLIC_VAPID_PUBLIC_KEY) — ajoutez-la sur Vercel puis rechargez.");
      } else {
        setPushMsg("Enregistrement impossible — vérifiez la connexion puis réessayez.");
      }
      return;
    }
    setPermState("granted");
    setShowPerm(false);
    ding();
    buzz();
    // Preuve immédiate : une vraie notification de fond arrive sur cet appareil.
    await fetch("/api/push/test", { method: "POST" }).catch(() => null);
  }

  function dismissPerm() {
    // Masqué pour cette session seulement : à la prochaine entrée on redemande
    // tant que le navigateur n'a pas autorisé.
    setShowPerm(false);
  }

  return (
    <div className="bg-[#f5f3ee] min-h-[85vh]">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-[#f5f3ee]/95 backdrop-blur border-b border-[#e8e3d8]">
        <div className="container-x flex items-center justify-between gap-3 h-14">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link href="/" className="md:hidden w-8 h-8 rounded-lg bg-[#1c1b18] text-white flex items-center justify-center font-bold text-sm shrink-0">M</Link>
            <p className="font-title font-semibold text-sm md:text-base truncate">{title}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/imad29052005/orders" className="flex items-center gap-1.5 h-9 px-3 rounded-full bg-[#fbeae4] text-[#c0452f] text-xs font-semibold whitespace-nowrap">
              <Bell size={13} /> <span className="hidden sm:inline">{toConfirm} à confirmer</span><span className="sm:hidden">{toConfirm}</span>
            </Link>
            <Link href="/imad29052005/settings" aria-label="Paramètres" className={`w-9 h-9 rounded-full border flex items-center justify-center transition ${path === "/imad29052005/settings" ? "bg-[#1c1b18] text-white border-[#1c1b18]" : "bg-white border-[#e8e3d8] hover:border-stone-400"}`}>
              <Settings size={15} />
            </Link>
          </div>
        </div>
        {/* Mobile nav */}
        <nav className="md:hidden container-x flex flex-wrap gap-1.5 pb-2.5">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={`flex items-center gap-1.5 px-3 h-9 rounded-full text-xs whitespace-nowrap border transition ${path === n.href ? "bg-[#1c1b18] text-white border-[#1c1b18] font-semibold" : "bg-white border-[#e8e3d8] font-normal"}`}>
              <n.icon size={13} /> {n.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="container-x py-4 md:py-8 grid md:grid-cols-[68px_1fr] gap-4 md:gap-6 items-start">
        {/* Sidebar desktop — icons only, no vertical scroll */}
        <aside className="hidden md:flex flex-col items-center card-soft py-4 px-0 sticky top-24 self-start shrink-0 overflow-visible overflow-y-visible max-h-none">
          <nav className="space-y-1 flex flex-col items-center overflow-visible">
            {NAV.map((n) => {
              const active = path === n.href;
              return (
                <Link key={n.href} href={n.href} title={n.label} aria-label={n.label} className={`w-11 h-11 rounded-[10px] flex items-center justify-center transition ${active ? "bg-[#1c1b18] text-white" : "text-stone-600 hover:bg-[#f5f3ee]"}`}>
                  <n.icon size={17} />
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-[#e8e3d8] mt-3 pt-3 space-y-1 flex flex-col items-center w-full px-0">
            <Link href="/imad29052005/settings" title="Paramètres" aria-label="Paramètres" className={`w-11 h-11 rounded-[10px] flex items-center justify-center transition ${path === "/imad29052005/settings" ? "bg-[#1c1b18] text-white" : "text-stone-600 hover:bg-[#f5f3ee]"}`}>
              <Settings size={17} />
            </Link>
            <Link href="/" title="Voir la boutique" aria-label="Voir la boutique" className="w-11 h-11 rounded-[10px] flex items-center justify-center text-stone-500 hover:bg-[#f5f3ee] transition">
              <Store size={17} />
            </Link>
          </div>
        </aside>
        <div className="min-w-0">
          {showPerm && (
            <div className="card-soft p-4 mb-3 flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-[#fbeae4] text-[#c0452f] flex items-center justify-center shrink-0"><Bell size={15} /></span>
              <p className="text-xs font-normal flex-1">
                {permState === "denied" ? (
                  <>Notifications bloquées dans ce navigateur. <span className="font-light text-stone-500">Ouvrez les réglages du site (cadenas / réglages) → Notifications → Autoriser, puis cliquez Réessayer.</span></>
                ) : permState === "unsupported" ? (
                  <>Ce navigateur n&apos;affiche pas les notifications. <span className="font-light text-stone-500">Laissez cette page ouverte : chaque commande sonne ici.</span></>
                ) : (
                  <>Activer les alertes de commandes ? <span className="font-light text-stone-500">Le navigateur va vous demander d&apos;autoriser. Ensuite : son + vibration avec nom, téléphone, articles et total — même navigateur fermé / téléphone verrouillé.</span></>
                )}
                {pushMsg && <span className="block font-medium text-[#c0452f] mt-1">{pushMsg}</span>}
              </p>
              {permState !== "unsupported" && (
                <button onClick={enableAlerts} disabled={pushBusy} className="h-9 px-4 rounded-[10px] bg-[#1c1b18] text-white text-xs font-semibold shrink-0 disabled:opacity-50">
                  {pushBusy ? "…" : permState === "denied" ? "Réessayer" : "Activer"}
                </button>
              )}
              <button onClick={dismissPerm} aria-label="Plus tard" className="w-9 h-9 rounded-full border border-[#e8e3d8] bg-white flex items-center justify-center shrink-0"><X size={14} /></button>
            </div>
          )}
          {freshOrder && (
            <div className="card-soft p-4 mb-3 border-[#20744d] !border-[1.5px]">
              <div className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-full bg-[#e7efe9] text-[#20744d] flex items-center justify-center shrink-0"><Bell size={15} /></span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold">Nouvelle commande {freshOrder.id} — {freshOrder.total.toLocaleString("fr-DZ")} DA</p>
                  <p className="text-xs font-normal mt-0.5">{freshOrder.client} · {freshOrder.phone}</p>
                  <div className="mt-1.5 space-y-0.5">
                    {freshOrder.items.map((it, i) => (
                      <p key={i} className="text-[11px] font-light text-stone-600">• {it.qty}× {it.name} ({it.size} · {it.color})</p>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    <a href={`tel:${freshOrder.phone.replace(/\D/g, "")}`} className="h-9 px-4 rounded-[10px] bg-[#1c1b18] text-white text-xs font-semibold flex items-center gap-1.5"><Phone size={13} /> Appeler</a>
                    <a href={`https://wa.me/213${freshOrder.phone.replace(/\D/g, "").slice(1)}`} target="_blank" className="h-9 px-4 rounded-[10px] bg-[#1e8e57] text-white text-xs font-semibold flex items-center gap-1.5"><MessageCircle size={13} /> WhatsApp</a>
                    <Link href={`/imad29052005/orders?order=${encodeURIComponent(freshOrder.id)}`} className="h-9 px-4 rounded-[10px] bg-[#1c1b18] text-white text-xs font-semibold flex items-center">Voir la commande</Link>
                    <button onClick={() => setFreshOrder(null)} className="h-9 px-4 rounded-[10px] border-[1.5px] border-[#e8e3d8] bg-white text-xs font-semibold">Fermer</button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
