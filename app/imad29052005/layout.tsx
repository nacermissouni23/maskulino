"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard, ShoppingCart, Package, Users, ChartLine, Settings, Store, Bell, X,
} from "lucide-react";
import { latestOrderInfo, listOrders } from "@/lib/actions/orders";

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
    [660, 880].forEach((f, i) => {
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const title = TITLES[path] ?? "Administration";
  const [toConfirm, setToConfirm] = useState(0);
  const [showPerm, setShowPerm] = useState(false);
  const lastId = useRef<string | null>(null);
  const firstPoll = useRef(true);

  useEffect(() => {
    try {
      if ("Notification" in window && Notification.permission === "default" && !localStorage.getItem("maskulino.push.asked")) {
        setShowPerm(true);
      }
    } catch { /* ignore */ }
    async function poll() {
      try {
        const info = await latestOrderInfo();
        setToConfirm(info.toConfirm);
        if (!firstPoll.current && info.latestId && lastId.current && info.latestId !== lastId.current) {
          const list = await listOrders().catch(() => []);
          const fresh = list[0];
          if (fresh) {
            ding();
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification(`Nouvelle commande ${fresh.id}`, {
                body: `${fresh.client} · ${fresh.wilaya} · ${fresh.total.toLocaleString("fr-DZ")} DA · ${fresh.source}`,
                tag: fresh.id,
              });
            }
          }
        }
        if (info.latestId) lastId.current = info.latestId;
      } catch { /* offline: keep quiet */ }
      firstPoll.current = false;
    }
    poll();
    const t = setInterval(poll, 20000);
    return () => clearInterval(t);
  }, []);

  async function enableAlerts() {
    try { localStorage.setItem("maskulino.push.asked", "1"); } catch { /* ignore */ }
    setShowPerm(false);
    if (!("Notification" in window)) return;
    const perm = await Notification.requestPermission();
    if (perm !== "granted") return;
    new Notification("Notifications activées ✅", { body: "Tu recevras chaque commande ici." });
    ding();
  }

  function dismissPerm() {
    try { localStorage.setItem("maskulino.push.asked", "1"); } catch { /* ignore */ }
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
              <p className="text-xs font-normal flex-1">Activer les alertes de commandes ? <span className="font-light text-stone-500">Son + notification à chaque commande.</span></p>
              <button onClick={enableAlerts} className="h-9 px-4 rounded-[10px] bg-[#1c1b18] text-white text-xs font-semibold shrink-0">Activer</button>
              <button onClick={dismissPerm} aria-label="Plus tard" className="w-9 h-9 rounded-full border border-[#e8e3d8] bg-white flex items-center justify-center shrink-0"><X size={14} /></button>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
