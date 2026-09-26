"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/data";

export type CartItem = { slug: string; name: string; price: number; image: string; size: string; qty: number };

type CartCtx = {
  items: CartItem[];
  add: (p: Product, size?: string, qty?: number) => void;
  remove: (slug: string, size: string) => void;
  setQty: (slug: string, size: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
};

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("maskulino-cart");
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("maskulino-cart", JSON.stringify(items));
    } catch {}
  }, [items]);

  const api = useMemo<CartCtx>(() => {
    const add: CartCtx["add"] = (p, size = "L", qty = 1) => {
      setItems((prev) => {
        const found = prev.find((i) => i.slug === p.slug && i.size === size);
        if (found)
          return prev.map((i) =>
            i.slug === p.slug && i.size === size ? { ...i, qty: Math.min(10, i.qty + qty) } : i
          );
        return [...prev, { slug: p.slug, name: p.name, price: p.price, image: p.image, size, qty }];
      });
    };
    const remove = (slug: string, size: string) =>
      setItems((prev) => prev.filter((i) => !(i.slug === slug && i.size === size)));
    const setQty = (slug: string, size: string, qty: number) =>
      setItems((prev) =>
        qty <= 0
          ? prev.filter((i) => !(i.slug === slug && i.size === size))
          : prev.map((i) => (i.slug === slug && i.size === size ? { ...i, qty } : i))
      );
    const clear = () => setItems([]);
    const count = items.reduce((s, i) => s + i.qty, 0);
    const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
    return { items, add, remove, setQty, clear, count, subtotal };
  }, [items]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export const useCart = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart outside provider");
  return v;
};
