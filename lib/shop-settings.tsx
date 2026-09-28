"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type ShopSettings = {
  name: string;
  phone: string;
  whatsapp: string;
  domain: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  address: string;
  hours: string;
};

export const DEFAULT_SHOP_SETTINGS: ShopSettings = {
  name: "Maskulino",
  phone: "0781 51 04 18",
  whatsapp: "https://wa.me/213781510418",
  domain: "maskulino.dz",
  facebook: "",
  instagram: "",
  tiktok: "",
  address: "Didouche Mourad, Alger",
  hours: "Sam – Jeu : 10h – 20h | Ven : 15h – 20h",
};

const KEY = "maskulino.shop-settings";

function load(): ShopSettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULT_SHOP_SETTINGS, ...(JSON.parse(raw) as Partial<ShopSettings>) };
  } catch { /* ignore */ }
  return DEFAULT_SHOP_SETTINGS;
}

/** Digits only, e.g. "0770 00 00 00" -> "0770000000" */
export function digitsOnly(s: string): string {
  return (s || "").replace(/\D/g, "");
}

/** Build a wa.me link from settings: prefer the whatsapp field if it's a full URL, else derive from phone. */
export function whatsappLink(s: ShopSettings, text?: string): string {
  const base = s.whatsapp.trim();
  if (/^https?:\/\//i.test(base)) {
    if (!text) return base;
    const sep = base.includes("?") ? "&" : "?";
    return `${base}${sep}text=${encodeURIComponent(text)}`;
  }
  let d = digitsOnly(base || s.phone);
  if (d.startsWith("0")) d = `213${d.slice(1)}`;
  const msg = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${d}${msg}`;
}

type Ctx = {
  settings: ShopSettings;
  setSettings: (s: ShopSettings) => void;
  save: (s: ShopSettings) => void;
};

const ShopCtx = createContext<Ctx | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<ShopSettings>(DEFAULT_SHOP_SETTINGS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Base de données d'abord, cache local en secours (hors-ligne).
    import("@/lib/actions/settings").then(({ getShopSettings }) =>
      getShopSettings()
        .then((db) => {
          if (db) {
            setSettingsState({ ...DEFAULT_SHOP_SETTINGS, ...(db as unknown as ShopSettings) });
            try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* ignore */ }
          } else {
            setSettingsState(load());
          }
        })
        .catch(() => setSettingsState(load()))
        .finally(() => setReady(true))
    ).catch(() => { setSettingsState(load()); setReady(true); });
  }, []);

  function setSettings(s: ShopSettings) {
    setSettingsState(s);
  }

  function save(s: ShopSettings) {
    setSettingsState(s);
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch { /* ignore */ }
    import("@/lib/actions/settings").then(({ saveShopSettings }) =>
      saveShopSettings(s).catch(() => undefined)
    ).catch(() => undefined);
    // Notify other tabs / components reading localStorage directly
    try {
      window.dispatchEvent(new StorageEvent("storage", { key: KEY }));
    } catch { /* ignore */ }
  }

  useEffect(() => {
    if (!ready) return;
    const onStorage = () => setSettingsState(load());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [ready]);

  return <ShopCtx.Provider value={{ settings, setSettings, save }}>{children}</ShopCtx.Provider>;
}

export function useShopSettings(): Ctx {
  const c = useContext(ShopCtx);
  if (!c) throw new Error("useShopSettings must be used inside ShopProvider");
  return c;
}
