import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BadgeCheck, Play } from "lucide-react";
import { PRODUCTS, CATEGORIES, formatDA } from "@/lib/data";
import ProductCard, { Stars } from "@/components/ProductCard";
import { TrustBar, QuickOrderForm } from "@/components/Sections";

export default function Home() {
  const heroProduct = PRODUCTS[4];
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="hero-grid-bg absolute inset-0" />
        <div className="absolute -top-10 left-1/4 w-16 h-16 rounded-full bg-[#3aa0ff] hidden md:block" />
        <div className="max-w-7xl mx-auto px-4 pt-8 md:pt-14 pb-12 grid md:grid-cols-2 gap-10 items-center relative">
          <div>
            <p className="eyebrow">Maskulino • Alger • 58 wilayas</p>
            <h1 className="font-display font-extrabold text-[42px] md:text-6xl mt-4">
              Rehaussez<br />votre style
            </h1>
            <p className="body-light text-[15px] mt-5 max-w-md">
              Streetwear et essentiels pour homme, pensés pour l'Algérie. Sweats épais,
              ensembles, jeans. Commandez en 60 secondes — <span className="font-medium text-gray-800">payez en espèces à la réception</span>.
              Confirmation WhatsApp en moins de 4 h.
            </p>
            <div className="flex flex-wrap gap-3 mt-7">
              <Link href="/shop" className="btn-fluid">Voir la boutique <ArrowRight size={15} /></Link>
              <Link href="#commande-rapide" className="btn-ghost">Commande rapide</Link>
            </div>
            <div className="flex gap-9 mt-9">
              <div><p className="font-display font-bold text-2xl md:text-3xl text-[#8b9bff]">58</p><p className="text-[11px] font-light text-gray-500 mt-1 leading-snug">Wilayas<br />livrées</p></div>
              <div><p className="font-display font-bold text-2xl md:text-3xl text-[#8b9bff]">12 k+</p><p className="text-[11px] font-light text-gray-500 mt-1 leading-snug">Clients<br />vérifiés</p></div>
              <div><p className="font-display font-bold text-2xl md:text-3xl text-[#8b9bff]">4,8/5</p><p className="text-[11px] font-light text-gray-500 mt-1 leading-snug">Avis<br />clients</p></div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-4 bg-gradient-to-br from-[#dfe8ff] to-[#f3e4ff] rounded-t-[140px] rounded-b-[24px]" />
            <Image src="https://images.unsplash.com/photo-1507680434567-5739c80be1ac?w=900&q=80" alt="Style homme Maskulino" width={700} height={850} className="relative rounded-t-[140px] rounded-b-[24px] object-cover aspect-[4/5] w-full" priority />
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur rounded-2xl p-3.5 flex items-center justify-between shadow-lg">
              <div>
                <p className="text-[11px] font-semibold flex items-center gap-1.5"><BadgeCheck size={14} className="text-emerald-500" /> Top vente — Ensemble 2 pièces</p>
                <p className="font-bold mt-0.5">{formatDA(4490)} <span className="line-through text-gray-400 text-xs font-light">{formatDA(5990)}</span></p>
              </div>
              <Link href={`/product/${heroProduct.slug}`} className="btn-fluid !py-2.5 !px-5">Voir</Link>
            </div>
          </div>
        </div>
      </section>

      <TrustBar />

      {/* Catégories */}
      <section className="max-w-7xl mx-auto px-4 mt-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Catalogue</p>
            <h2 className="section-title mt-2">Nos catégories</h2>
          </div>
          <Link href="/shop" className="label-bold text-[#6c4dff] hover:underline underline-offset-4 shrink-0">Tout voir →</Link>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-6">
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={`/shop?cat=${c.slug}`} className="group card-soft !rounded-2xl overflow-hidden hover:-translate-y-1 transition">
              <span className="block aspect-square overflow-hidden bg-[#eef3ff] relative">
                <Image src={c.img} alt={c.name} fill className="object-cover group-hover:scale-105 transition duration-500" sizes="20vw" />
              </span>
              <span className="block text-center text-xs font-medium py-2.5 px-1">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Nouveautés */}
      <section className="max-w-7xl mx-auto px-4 mt-16">
        <p className="eyebrow text-center">Collection hiver 2026</p>
        <h2 className="section-title text-center mt-2">Les nouveautés</h2>
        <p className="section-sub text-center">Paiement à la livraison • 58 wilayas • Échange sous 7 jours</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mt-7">
          {PRODUCTS.slice(0, 8).map((p) => <ProductCard key={p.slug} p={p} />)}
        </div>
        <div className="text-center mt-9">
          <Link href="/shop" className="btn-fluid">Découvrir la boutique</Link>
        </div>
      </section>

      {/* Histoire marque */}
      <section className="max-w-7xl mx-auto px-4 mt-20 grid md:grid-cols-2 gap-10 items-center">
        <div className="relative pb-8">
          <div className="bg-[#bcd8f5] rounded-[24px] aspect-[3/4] max-w-sm overflow-hidden relative">
            <Image src="https://images.unsplash.com/photo-1488161628813-04466f872be2?w=800&q=80" alt="Tissu Maskulino" fill className="object-cover" />
          </div>
          <div className="absolute bottom-0 left-24 md:left-16 w-44 aspect-square rounded-2xl overflow-hidden border-[6px] border-[#fbfbff] shadow-xl">
            <Image src="https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=400&q=80" alt="Détail couture" fill className="object-cover" />
          </div>
        </div>
        <div>
          <p className="eyebrow">Notre qualité</p>
          <h2 className="section-title mt-2">Des tissus épais,<br />doux comme une plume</h2>
          <p className="body-light text-sm mt-5">
            Coton épais 400 g, coutures renforcées, coupes adaptées aux morphologies algériennes.
            Chaque pièce est contrôlée à Alger avant expédition. Si la taille ne convient pas —
            on l'échange sous 7 jours, sans discussion.
          </p>
          <ul className="mt-5 space-y-2.5 text-sm">
            {["Coton épais qui ne rétrécit pas", "Tailles M → XXL avec vrai guide des tailles", "Prix en dinars, sans surprise à la livraison"].map((t) => (
              <li key={t} className="flex items-start gap-2.5"><span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</span><span className="font-normal">{t}</span></li>
            ))}
          </ul>
          <Link href="/about" className="btn-dark mt-7">Notre histoire</Link>
        </div>
      </section>

      {/* Commande rapide */}
      <section id="commande-rapide" className="mt-20 bg-gradient-to-b from-[#eef1ff] to-white border-y border-[#eceafa]">
        <div className="max-w-7xl mx-auto px-4 py-14 grid md:grid-cols-2 gap-10">
          <div>
            <p className="eyebrow !text-red-500">Commande rapide — 60 secondes</p>
            <h2 className="section-title mt-2">Un seul produit.<br /><span className="font-light">Sans compte. Payé à la livraison.</span></h2>
            <div className="card-soft p-4 flex gap-4 mt-6">
              <Image src={heroProduct.image} alt={heroProduct.name} width={110} height={140} className="rounded-xl object-cover aspect-[4/5]" />
              <div>
                <p className="font-semibold text-sm">{heroProduct.name}</p>
                <span className="flex mt-1.5"><Stars value={heroProduct.rating} /></span>
                <p className="price-bold text-lg mt-1.5">{formatDA(heroProduct.price)}</p>
                <p className="text-xs font-light text-gray-500 flex items-center gap-1.5 mt-1"><Play size={12} /> 2 400 vues TikTok • 312 avis</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              {[["1", "Vous remplissez"], ["2", "On confirme"], ["3", "Vous payez cash"]].map(([n, t]) => (
                <span key={n} className="bg-white border border-[#eceafa] rounded-2xl p-3"><span className="block font-bold text-[#6c4dff]">{n}</span><span className="block text-[11px] font-normal mt-0.5">{t}</span></span>
              ))}
            </div>
          </div>
          <QuickOrderForm product={heroProduct} />
        </div>
      </section>

      {/* Avis */}
      <section className="max-w-7xl mx-auto px-4 mt-16">
        <p className="eyebrow text-center">Ils nous font confiance</p>
        <h2 className="section-title text-center mt-2">4,8/5 — plus de 2 300 avis</h2>
        <div className="grid md:grid-cols-3 gap-4 mt-7">
          {[
            { n: "Yacine — Alger", t: "L'ensemble taille parfaitement, tissu lourd de qualité. Livré en 2 jours, j'ai payé en espèces. Je recommande." },
            { n: "Mohamed — Oran", t: "J'hésitais entre XL et XXL, ils m'ont conseillé sur WhatsApp. Échange gratuit, très sérieux." },
            { n: "Amine — Sétif", t: "Troisième commande. Le sweat ne bouge pas au lavage. Prix en dinars clair, sans surprise." },
          ].map((r) => (
            <div key={r.n} className="card-soft p-5">
              <Stars value={5} />
              <p className="text-sm font-normal mt-3 leading-relaxed">« {r.t} »</p>
              <p className="text-xs font-semibold mt-3 flex items-center gap-1.5"><BadgeCheck size={14} className="text-blue-500" /> {r.n} <span className="font-light text-gray-500">— Achat vérifié</span></p>
            </div>
          ))}
        </div>
      </section>

      {/* Actualités */}
      <section className="max-w-7xl mx-auto px-4 mt-20">
        <p className="eyebrow text-center">Blog</p>
        <h2 className="section-title text-center mt-2">Actualités et conseils</h2>
        <div className="card-soft grid md:grid-cols-2 gap-0 mt-8 overflow-hidden !p-0">
          <div className="p-7 md:p-10 order-2 md:order-1 flex flex-col justify-center">
            <p className="text-[11px] font-medium tracking-[0.2em] text-gray-400">SEPT. 2026 • STYLE MASKULINO</p>
            <p className="font-title font-semibold text-xl mt-3 leading-snug">Pourquoi le coton épais ne rétrécit pas (et comment bien le laver)</p>
            <p className="text-sm font-light text-gray-500 mt-3 leading-relaxed">Pourquoi on a choisi 400 g pour l'hiver, comment laver sans rétrécir, et notre guide des tailles oversize…</p>
            <Link href="/news" className="label-bold text-[#6c4dff] mt-4 hover:underline underline-offset-4">Lire l'article →</Link>
          </div>
          <div className="order-1 md:order-2 bg-[#ffd84d] min-h-60 relative">
            <Image src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80" alt="Actualité mode" fill className="object-cover object-top" />
          </div>
        </div>
      </section>

      {/* Bandeau promo */}
      <section className="max-w-7xl mx-auto px-4 mt-14">
        <div className="rounded-[24px] bg-[#14142b] text-white p-7 md:p-12 grid md:grid-cols-2 gap-8 items-center overflow-hidden relative">
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-[#6c4dff]/25 blur-3xl" />
          <div className="relative">
            <p className="eyebrow !text-[#6fc3f0]">Facebook • Instagram • TikTok</p>
            <h3 className="font-display font-bold text-2xl md:text-[32px] mt-3 leading-tight">-10 % avec le code DZ10</h3>
            <p className="text-sm font-light text-white/70 mt-3 leading-relaxed">Faites une capture de notre publicité, envoyez-la sur WhatsApp et on applique la remise avec une livraison prioritaire.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 relative">
            <a href="https://wa.me/213770000000" className="btn-fluid text-center">En profiter sur WhatsApp</a>
            <Link href="/shop" className="btn-ghost !border-white/40 !text-white hover:!bg-white hover:!text-black">Voir les tops ventes</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
