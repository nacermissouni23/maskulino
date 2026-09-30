"use client";

/** Meta Pixel helpers. Silent no-ops until a pixel ID is set in Paramètres. */

type Fbq = (...args: unknown[]) => void;

function fbq(): Fbq | null {
  if (typeof window === "undefined") return null;
  const f = (window as unknown as { fbq?: Fbq }).fbq;
  return typeof f === "function" ? f : null;
}

/** Inject the base code once per ID. Call from a client component. */
export function loadPixel(id: string) {
  if (typeof window === "undefined" || !id) return;
  const w = window as unknown as { fbq?: Fbq; _fbq?: Fbq; _maskulinoPixelId?: string };
  if (w._maskulinoPixelId === id && typeof w.fbq === "function") return;
  w._maskulinoPixelId = id;
  if (typeof w.fbq !== "function") {
    const n = function (...args: unknown[]) {
      const q = (n as unknown as { queue: unknown[] }).queue;
      if ((n as unknown as { callMethod?: unknown }).callMethod) {
        ((n as unknown as { callMethod: (...a: unknown[]) => void }).callMethod).apply(n, args);
      } else {
        q.push(args);
      }
    } as unknown as Fbq;
    (n as unknown as { queue: unknown[] }).queue = [];
    (n as unknown as { loaded?: boolean }).loaded = true;
    (n as unknown as { version?: string }).version = "2.0";
    w.fbq = n;
    w._fbq = n;
    const t = document.createElement("script");
    t.async = true;
    t.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(t);
  }
  w.fbq("init", id);
  w.fbq("track", "PageView");
}

export type PixelItem = { slug: string; price: number; qty?: number };

/** Standard e-commerce events. All silent when the pixel isn't loaded. */
export function pixelTrack(
  event: "ViewContent" | "InitiateCheckout" | "Purchase",
  items: PixelItem[],
  value?: number
) {
  const f = fbq();
  if (!f || items.length === 0) return;
  const total = value ?? items.reduce((s, i) => s + i.price * (i.qty ?? 1), 0);
  f("track", event, {
    content_ids: items.map((i) => i.slug),
    content_type: "product",
    value: total,
    currency: "DZD",
    num_items: items.reduce((s, i) => s + (i.qty ?? 1), 0),
  });
}
