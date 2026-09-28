"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { WILAYAS } from "@/lib/data";

// Tarifs indicatifs 2025-2026 (colis ≤ 5 kg, départ Alger).
// Yalidine : grilles publiques + moyennes 2026. ZR Express : grille 2025 (54 wilayas couvertes).
// stopdesk: null = pas de stop-desk sur cette wilaya pour ce transporteur.
const YALIDINE: Record<number, { home: number; stopdesk: number | null }> = {
  1: { home: 1100, stopdesk: 600 }, 2: { home: 690, stopdesk: 400 }, 3: { home: 900, stopdesk: 500 },
  4: { home: 850, stopdesk: 400 }, 5: { home: 850, stopdesk: 400 }, 6: { home: 790, stopdesk: 400 },
  7: { home: 950, stopdesk: 500 }, 8: { home: 1000, stopdesk: 600 }, 9: { home: 600, stopdesk: 400 },
  10: { home: 690, stopdesk: 400 }, 11: { home: 1100, stopdesk: 600 }, 12: { home: 850, stopdesk: 400 },
  13: { home: 600, stopdesk: 400 }, 14: { home: 700, stopdesk: 400 }, 15: { home: 690, stopdesk: 400 },
  16: { home: 500, stopdesk: 400 }, 17: { home: 900, stopdesk: 500 }, 18: { home: 790, stopdesk: 400 },
  19: { home: 750, stopdesk: 400 }, 20: { home: 790, stopdesk: 400 }, 21: { home: 690, stopdesk: 400 },
  22: { home: 600, stopdesk: 400 }, 23: { home: 800, stopdesk: 400 }, 24: { home: 850, stopdesk: 450 },
  25: { home: 800, stopdesk: 400 }, 26: { home: 690, stopdesk: 400 }, 27: { home: 600, stopdesk: 400 },
  28: { home: 800, stopdesk: 400 }, 29: { home: 650, stopdesk: 400 }, 30: { home: 900, stopdesk: 500 },
  31: { home: 450, stopdesk: 250 }, 32: { home: 900, stopdesk: 500 }, 33: { home: 1300, stopdesk: 600 },
  34: { home: 790, stopdesk: 400 }, 35: { home: 690, stopdesk: 350 }, 36: { home: 850, stopdesk: 500 },
  37: { home: 1300, stopdesk: 600 }, 38: { home: 750, stopdesk: 400 }, 39: { home: 950, stopdesk: 550 },
  40: { home: 800, stopdesk: 400 }, 41: { home: 800, stopdesk: 500 }, 42: { home: 690, stopdesk: 350 },
  43: { home: 690, stopdesk: 400 }, 44: { home: 690, stopdesk: 400 }, 45: { home: 900, stopdesk: 500 },
  46: { home: 600, stopdesk: 400 }, 47: { home: 990, stopdesk: 500 }, 48: { home: 690, stopdesk: 400 },
  49: { home: 1700, stopdesk: 1100 }, 50: { home: 1100, stopdesk: 600 }, 51: { home: 900, stopdesk: 600 },
  52: { home: 1100, stopdesk: 600 }, 53: { home: 900, stopdesk: null }, 54: { home: 990, stopdesk: 500 },
  55: { home: 990, stopdesk: 500 }, 56: { home: 1700, stopdesk: 1100 }, 57: { home: 1000, stopdesk: 750 },
  58: { home: 1700, stopdesk: 1100 },
};

const ZR: Record<number, { home: number; stopdesk: number | null }> = {
  1: { home: 1300, stopdesk: 900 }, 2: { home: 850, stopdesk: 450 }, 3: { home: 900, stopdesk: 550 },
  4: { home: 800, stopdesk: 450 }, 5: { home: 800, stopdesk: 450 }, 6: { home: 800, stopdesk: 450 },
  7: { home: 900, stopdesk: 550 }, 8: { home: 900, stopdesk: 650 }, 9: { home: 600, stopdesk: 450 },
  10: { home: 700, stopdesk: 450 }, 11: { home: 1400, stopdesk: 1000 }, 12: { home: 800, stopdesk: 500 },
  13: { home: 900, stopdesk: 500 }, 14: { home: 800, stopdesk: 450 }, 15: { home: 700, stopdesk: 450 },
  16: { home: 400, stopdesk: 300 }, 17: { home: 900, stopdesk: 550 }, 18: { home: 800, stopdesk: 450 },
  19: { home: 750, stopdesk: 450 }, 20: { home: 900, stopdesk: null }, 21: { home: 800, stopdesk: 450 },
  22: { home: 800, stopdesk: 450 }, 23: { home: 800, stopdesk: 450 }, 24: { home: 800, stopdesk: 450 },
  25: { home: 800, stopdesk: 450 }, 26: { home: 750, stopdesk: 450 }, 27: { home: 800, stopdesk: 450 },
  28: { home: 800, stopdesk: 500 }, 29: { home: 800, stopdesk: 450 }, 30: { home: 900, stopdesk: 600 },
  31: { home: 800, stopdesk: 450 }, 32: { home: 900, stopdesk: 600 },
  34: { home: 750, stopdesk: 450 }, 35: { home: 700, stopdesk: 450 }, 36: { home: 800, stopdesk: 450 },
  38: { home: 850, stopdesk: null }, 39: { home: 900, stopdesk: 600 }, 40: { home: 800, stopdesk: null },
  41: { home: 800, stopdesk: 450 }, 42: { home: 700, stopdesk: 450 }, 43: { home: 800, stopdesk: 300 },
  44: { home: 850, stopdesk: 450 }, 45: { home: 900, stopdesk: 600 }, 46: { home: 800, stopdesk: 450 },
  47: { home: 850, stopdesk: 600 }, 48: { home: 800, stopdesk: 450 }, 49: { home: 900, stopdesk: null },
  50: { home: 900, stopdesk: null }, 51: { home: 900, stopdesk: 550 },
  53: { home: 900, stopdesk: null }, 54: { home: 1200, stopdesk: null }, 55: { home: 900, stopdesk: 600 },
  57: { home: 1400, stopdesk: null }, 58: { home: 1400, stopdesk: null },
};

export type Carrier = { id: string; nom: string; actif: boolean; custom: boolean };
export type Price = { home: number; stopdesk: number | null; couvert: boolean };

export function buildPrices(
  base: Record<number, { home: number; stopdesk: number | null }>,
  coveredDefault: boolean
): Record<number, Price> {
  const out: Record<number, Price> = {};
  for (const w of WILAYAS) {
    const b = base[w.code];
    if (b) out[w.code] = { home: b.home, stopdesk: b.stopdesk, couvert: coveredDefault };
    else out[w.code] = { home: w.home, stopdesk: w.stopdesk, couvert: false };
  }
  return out;
}

const DEFAULT_CARRIERS: Carrier[] = [
  { id: "yalidine", nom: "Yalidine", actif: true, custom: false },
  { id: "zr", nom: "ZR Express", actif: true, custom: false },
];

function defaultPrices(): Record<string, Record<number, Price>> {
  return { yalidine: buildPrices(YALIDINE, true), zr: buildPrices(ZR, true) };
}

const CARRIERS_KEY = "maskulino.carriers";
const PRICES_KEY = "maskulino.prices";

function loadCarriers(): Carrier[] {
  try {
    const raw = localStorage.getItem(CARRIERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Carrier[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  return DEFAULT_CARRIERS;
}

function loadPrices(): Record<string, Record<number, Price>> {
  const base = defaultPrices();
  try {
    const raw = localStorage.getItem(PRICES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, Record<number, Price>>;
      // Merge with defaults so new wilayas/carriers always exist
      for (const id of Object.keys(parsed)) base[id] = { ...base[id], ...parsed[id] };
    }
  } catch { /* ignore */ }
  return base;
}

type ShippingCtx = {
  carriers: Carrier[];
  prices: Record<string, Record<number, Price>>;
  activeCarriers: Carrier[];
  addCarrier: (nom: string) => string;
  removeCarrier: (id: string) => void;
  toggleCarrier: (id: string) => void;
  setPrice: (carrierId: string, code: number, patch: Partial<Price>) => void;
};

const Ctx = createContext<ShippingCtx | null>(null);

export function ShippingProvider({ children }: { children: ReactNode }) {
  const [carriers, setCarriers] = useState<Carrier[]>(DEFAULT_CARRIERS);
  const [prices, setPrices] = useState<Record<string, Record<number, Price>>>(defaultPrices);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCarriers(loadCarriers());
    setPrices(loadPrices());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(CARRIERS_KEY, JSON.stringify(carriers));
      localStorage.setItem(PRICES_KEY, JSON.stringify(prices));
    } catch { /* ignore */ }
  }, [carriers, prices, ready]);

  useEffect(() => {
    if (!ready) return;
    const onStorage = () => {
      setCarriers(loadCarriers());
      setPrices(loadPrices());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [ready]);

  function addCarrier(nom: string): string {
    const n = nom.trim();
    if (!n) return "";
    const id = `c${Date.now()}`;
    setCarriers((cs) => [...cs, { id, nom: n, actif: true, custom: true }]);
    setPrices((ps) => ({ ...ps, [id]: buildPrices(YALIDINE, true) }));
    return id;
  }

  function removeCarrier(id: string) {
    setCarriers((cs) => cs.filter((x) => x.id !== id));
    setPrices((ps) => {
      const next = { ...ps };
      delete next[id];
      return next;
    });
  }

  function toggleCarrier(id: string) {
    setCarriers((cs) => cs.map((x) => (x.id === id ? { ...x, actif: !x.actif } : x)));
  }

  function setPrice(carrierId: string, code: number, patch: Partial<Price>) {
    setPrices((ps) => ({
      ...ps,
      [carrierId]: { ...ps[carrierId], [code]: { ...ps[carrierId][code], ...patch } },
    }));
  }

  const activeCarriers = carriers.filter((c) => c.actif);

  return (
    <Ctx.Provider value={{ carriers, prices, activeCarriers, addCarrier, removeCarrier, toggleCarrier, setPrice }}>
      {children}
    </Ctx.Provider>
  );
}

export function useShipping(): ShippingCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useShipping must be used inside ShippingProvider");
  return c;
}
