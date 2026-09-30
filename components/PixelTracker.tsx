"use client";
import { useEffect } from "react";
import { useShopSettings } from "@/lib/shop-settings";
import { loadPixel } from "@/lib/pixel";

/** Loads the Meta Pixel when an ID is set in Paramètres. Renders nothing. */
export default function PixelTracker() {
  const { settings } = useShopSettings();
  useEffect(() => {
    const id = (settings.pixel_id || "").replace(/\D/g, "");
    if (id) loadPixel(id);
  }, [settings.pixel_id]);
  return null;
}
