import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { ShopProvider } from "@/lib/shop-settings";
import { ShippingProvider } from "@/lib/shipping";
import { createClient } from "@/lib/supabase/server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  // Tout vient de la boutique : titre/hero configurés + wilayas réellement couvertes.
  // Google et les aperçus de lien (WhatsApp/Facebook) lisent ces balises.
  let name = "Maskulino";
  let heroTitle = "Votre style, notre univers";
  let heroSub = "Des vêtements pour homme confortables et modernes, pour un look soigné au quotidien.";
  let domain = "https://maskulino.store";
  let wilayas = 58;
  try {
    const supabase = await createClient();
    const { data: s } = await supabase.from("shop_settings").select("*").eq("id", 1).maybeSingle();
    if (s) {
      const r = s as Record<string, string>;
      if (r.name) name = r.name;
      if (r.hero_title) heroTitle = r.hero_title;
      if (r.hero_subtitle) heroSub = r.hero_subtitle;
      if (r.domain && /^https?:\/\//i.test(r.domain)) domain = r.domain;
      else if (r.domain && /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(r.domain)) domain = `https://${r.domain}`;
    }
    const { data: cov } = await supabase.from("carrier_prices").select("wilaya_code").eq("covered", true);
    if (cov && cov.length) wilayas = new Set((cov as { wilaya_code: number }[]).map((r) => r.wilaya_code)).size;
  } catch { /* defaults */ }
  const description = `${heroSub} Paiement à la livraison, ${wilayas} wilayas. Échange gratuit sous 7 jours.`;
  return {
    title: `${name} — ${heroTitle.replace(/\s+/g, " ").trim()}`,
    description,
    metadataBase: new URL(domain),
    openGraph: {
      title: `${name} — ${heroTitle.replace(/\s+/g, " ").trim()}`,
      description,
      type: "website",
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#f5f3ee",
};



export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={poppins.variable}>
      <body className="min-h-screen flex flex-col antialiased font-[family-name:var(--font-sans)]">
        <CartProvider>
          <ShopProvider>
            <ShippingProvider>
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </ShippingProvider>
          </ShopProvider>
        </CartProvider>
      </body>
    </html>
  );
}
