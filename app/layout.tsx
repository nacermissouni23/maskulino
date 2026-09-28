import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { ShopProvider } from "@/lib/shop-settings";
import { ShippingProvider } from "@/lib/shipping";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Maskulino",
  description:
    "Maskulino — boutique algérienne de vêtements pour homme. Hoodies, chemises, jeans, ensembles. Commandez sur le site, Facebook ou WhatsApp.",
  metadataBase: new URL("https://maskulino.store"),
  openGraph: {
    title: "Maskulino — Rehaussez votre style",
    description: "Mode homme en Algérie. Paiement à la livraison, 58 wilayas. Échange gratuit sous 7 jours.",
    type: "website",
  },
  manifest: "/manifest.webmanifest",
};

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
