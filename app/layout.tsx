import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import WhatsAppFloat from "@/components/WhatsAppFloat";

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Maskulino — Mode Homme Algérie | Paiement à la livraison 58 wilayas",
  description:
    "Maskulino — boutique algérienne de vêtements pour homme. Hoodies, chemises, jeans, ensembles. Paiement à la livraison dans les 58 wilayas. Commandez sur le site, Facebook ou WhatsApp.",
  metadataBase: new URL("https://maskulino.dz"),
  openGraph: {
    title: "Maskulino — Rehaussez votre style",
    description: "Mode homme en Algérie. Paiement à la livraison, 58 wilayas. Échange gratuit sous 7 jours.",
    type: "website",
  },
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
          <Header />
          <main className="flex-1 pb-20 md:pb-0">{children}</main>
          <Footer />
          <BottomNav />
          <WhatsAppFloat />
        </CartProvider>
      </body>
    </html>
  );
}
