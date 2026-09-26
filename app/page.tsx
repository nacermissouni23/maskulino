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
      <section className="hero-wash">
        <div className="container-x pt-8 pb-10 md:pt-14 md:pb-16 grid md:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div>
            <p className="eyebrow">Maskulino • Alger • 58 wilayas</p>
            <h1 className="font-display font-extrabold text-[40px] md:text-[56px] mt-4">
              Rehaussez<br />votre style
            </h1>
            <p className="body-light text-[15px] mt-5 max-w-md">
              Streetwear et essentiels pour homme, pensés pour l'Algérie. Sweats épais,
              ensembles, jeans. Commandez en 60 secondes — <span className="font-medium text-stone-800">payez en espèces à la réception</span>.
              Confirmation WhatsApp en moins de 4 h.
            </p>
            <div className="flex flex-wrap gap-3 mt-7">
              <Link href="/shop" className="btn-fluid">Voir la boutique <ArrowRight size={15} /></Link>
              <Link href="#commande-rapide" className="btn-ghost">Commande rapide</Link>
            </div>
            <div className="flex gap-10 mt-9">
              <div><p className="font-display font-bold text-2xl md:text-[28px]">58</p><p className="text-[11px] font-light text-stone-500 mt-1 leading-snug">Wilayas<br />livrées</p></div>
              <div><p className="font-display font-bold text-2xl md:text-[28px]">12 k+</p><p className="text-[11px] font-light text-stone-500 mt-1 leading-snug">Clients<br />vérifiés</p></div>
              <div><p className="font-display font-bold text-2xl md:text-[28px]">4,8/5</p><p className="text-[11px] font-light text-stone-500 mt-1 leading-snug">Avis<br />clients</p></div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-3 bg-[#e7ddc6] rounded-t-[120px] rounded-b-[20px]" />
            <Image src="https://images.unsplash.com/photo-1507680434567-5739c80be1ac?w=900&q=80" alt="Style homme Maskulino" width={700} height={850} className="relative rounded-t-[120px] rounded-b-[20px] object-cover aspect-[4/5] w-full" priority />
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-lg">
              <div>
                <p className="text-[11px] font-semibold flex items-center gap-1.5"><BadgeCheck size={14} className="text-[#20744d]" /> Top vente — Ensemble 2 pièces</p>
                <p className="font-bold mt-0.5">{formatDA(4490)} <span className="line-through text-stone-400 text-xs font-light">{formatDA(5990)}</span></p>
              </div>
              <Link href={`/product/${heroProduct.slug}`} className="btn-fluid !py-2.5 !px-5 shrink-0">Voir</Link>
            </div>
          </div>
        </div>
      </section>

      <div className="pt-8 md:pt-10"><TrustBar /></div>

      {/* Catégories */}
      <section className="section">
        <div className="container-x">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Catalogue</p>
              <h2 className="section-title mt-2">Nos catégories</h2>
            </div>
            <Link href="/shop" className="label-bold text-[#1c1b18] hover:underline underline-offset-4 shrink-0">Tout voir →</Link>
          </div>
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mt-6 md:mt-8">
            {CATEGORIES.map((c) => (
              <Link key={c.slug} href={`/shop?cat=${c.slug}`} className="group card-soft overflow-hidden hover:-translate-y-1 transition">
                <span className="block aspect-square overflow-hidden bg-[#ece7d9] relative">
                  <Image src={c.img} alt={c.name} fill className="object-cover group-hover:scale-105 transition duration-500" sizes="20vw" />
                </span>
                <span className="block text-center text-xs font-medium py-3 px-1">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Nouveautés */}
      <section className="section !pt-0">
        <div className="container-x">
          <p className="eyebrow text-center">Collection hiver 2026</p>
          <h2 className="section-title text-center mt-2">Les nouveautés</h2>
          <p className="section-sub text-center">Paiement à la livraison • 58 wilayas • Échange sous 7 jours</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mt-6 md:mt-8">
            {PRODUCTS.slice(0, 8).map((p) => <ProductCard key={p.slug} p={p} />)}
          </div>
          <div className="text-center mt-8 md:mt-10">
            <Link href="/shop" className="btn-fluid">Découvrir la boutique</Link>
          </div>
        </div>
      </section>

      {/* Qualité */}
      <section className="section !pt-0">
        <div className="container-x grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="relative pb-10">
            <div className="bg-[#e7ddc6] rounded-[20px] aspect-[3/4] max-w-sm overflow-hidden relative">
              <Image src="https://images.unsplash.com/photo-1488161628813-04466f872be2?w=800&q=80" alt="Tissu Maskulino" fill className="object-cover" />
            </div>
            <div className="absolute bottom-0 left-20 md:left-14 w-44 aspect-square rounded-2xl overflow-hidden border-[6px] border-[#f5f3ee] shadow-xl">
              <Image src="https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=400&q=80" alt="Détail couture" fill className="object-cover" />
            </div>
          </div>
          <div>
            <p className="eyebrow">Notre qualité</p>
            <h2 className="section-title mt-2">Des tissus épais,<br />doux comme une plume</h2>
            <p className="body-light text-sm mt-5 max-w-lg">
              Coton épais 400 g, coutures renforcées, coupes adaptées aux morphologies algériennes.
              Chaque pièce est contrôlée à Alger avant expédition. Si la taille ne convient pas —
              on l'échange sous 7 jours, sans discussion.
            </p>
            <ul className="mt-6 space-y-3 text-sm max-w-lg">
              {["Coton épais qui ne rétrécit pas", "Tailles M → XXL avec vrai guide des tailles", "Prix en dinars, sans surprise à la livraison"].map((t) => (
                <li key={t} className="flex items-start gap-3"><span className="w-6 h-6 rounded-full bg-[#e7efe9] text-[#20744d] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</span><span className="font-normal">{t}</span></li>
              ))}
            </ul>
            <Link href="/about" className="btn-dark mt-7">Notre histoire</Link>
          </div>
        </div>
      </section>

      {/* Commande rapide */}
      <section id="commande-rapide" className="bg-white border-y border-[#e8e3d8]">
        <div className="container-x py-12 md:py-20 grid lg:grid-cols-2 gap-10 lg:gap-14">
          <div>
            <p className="eyebrow">Commande rapide — 60 secondes</p>
            <h2 className="section-title mt-2">Un seul produit.<br /><span className="font-light">Payé à la livraison.</span></h2>
            <div className="card-soft p-4 md:p-5 flex gap-4 mt-6 md:mt-8">
              <Image src={heroProduct.image} alt={heroProduct.name} width={110} height={140} className="rounded-xl object-cover aspect-[4/5]" />
              <div>
                <p className="font-semibold text-sm">{heroProduct.name}</p>
                <span className="flex mt-1.5"><Stars value={heroProduct.rating} /></span>
                <p className="price-bold text-lg mt-1.5">{formatDA(heroProduct.price)}</p>
                <p className="text-xs font-light text-stone-500 flex items-center gap-1.5 mt-1"><Play size={12} /> 2 400 vues TikTok • 312 avis</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2.5 mt-4 text-center">
              {[["1", "Vous remplissez"], ["2", "On confirme"], ["3", "Vous payez cash"]].map(([n, t]) => (
                <span key={n} className="bg-[#f5f3ee] border border-[#e8e3d8] rounded-2xl p-3 md:p-4"><span className="block font-bold text-[#a06a2c]">{n}</span><span className="block text-[11px] font-normal mt-0.5">{t}</span></span>
              ))}
            </div>
          </div>
          <QuickOrderForm product={heroProduct} />
        </div>
      </section>

      {/* Avis */}
      <section className="section">
        <div className="container-x">
          <p className="eyebrow text-center">Ils nous font confiance</p>
          <h2 className="section-title text-center mt-2">4,8/5 — plus de 2 300 avis</h2>
          <div className="grid md:grid-cols-3 gap-4 md:gap-5 mt-6 md:mt-8">
            {[
              { n: "Yacine — Alger", t: "L'ensemble taille parfaitement, tissu lourd de qualité. Livré en 2 jours, j'ai payé en espèces. Je recommande." },
              { n: "Mohamed — Oran", t: "J'hésitais entre XL et XXL, ils m'ont conseillé sur WhatsApp. Échange gratuit, très sérieux." },
              { n: "Amine — Sétif", t: "Troisième commande. Le sweat ne bouge pas au lavage. Prix en dinars clair, sans surprise." },
            ].map((r) => (
              <div key={r.n} className="card-soft p-5 md:p-6">
                <Stars value={5} />
                <p className="text-sm font-normal mt-3 leading-relaxed">« {r.t} »</p>
                <p className="text-xs font-semibold mt-4 flex items-center gap-1.5"><BadgeCheck size={14} className="text-[#20744d]" /> {r.n} <span className="font-light text-stone-500">— Achat vérifié</span></p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Actualités */}
      <section className="section !pt-0">
        <div className="container-x">
          <p className="eyebrow text-center">Blog</p>
          <h2 className="section-title text-center mt-2">Actualités et conseils</h2>
          <div className="card-soft grid md:grid-cols-2 overflow-hidden mt-6 md:mt-8">
            <div className="p-7 md:p-12 order-2 md:order-1 flex flex-col justify-center">
              <p className="text-[11px] font-medium tracking-[0.18em] text-stone-400">SEPT. 2026 • STYLE MASKULINO</p>
              <p className="font-title font-semibold text-xl md:text-2xl mt-3 leading-snug">Pourquoi le coton épais ne rétrécit pas (et comment bien le laver)</p>
              <p className="text-sm font-light text-stone-500 mt-3 leading-relaxed">Pourquoi on a choisi 400 g pour l'hiver, comment laver sans rétrécir, et notre guide des tailles oversize…</p>
              <Link href="/news" className="label-bold text-[#1c1b18] mt-5 hover:underline underline-offset-4">Lire l'article →</Link>
            </div>
            <div className="order-1 md:order-2 bg-[#e7ddc6] min-h-60 md:min-h-[320px] relative">
              <Image src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80" alt="Actualité mode" fill className="object-cover object-top" />
            </div>
          </div>
        </div>
      </section>

      {/* Bandeau promo */}
      <section className="section !pt-0">
        <div className="container-x">
          <div className="rounded-[20px] bg-[#1c1b18] text-white p-7 md:p-12 grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <p className="eyebrow !text-[#c9a15e]">Facebook • Instagram • TikTok</p>
              <h3 className="font-display font-bold text-2xl md:text-[32px] mt-3 leading-tight">-10 % avec le code DZ10</h3>
              <p className="text-sm font-light text-white/70 mt-3 leading-relaxed max-w-md">Faites une capture de notre publicité, envoyez-la sur WhatsApp et on applique la remise avec une livraison prioritaire.</p>
            </div>
            <div className="flex flex-col sm:flex-row lg:justify-end gap-3">
              <a href="https://wa.me/213770000000" className="btn-fluid !bg-white !text-[#1c1b18] !shadow-none text-center">En profiter sur WhatsApp</a>
              <Link href="/shop" className="btn-ghost !border-white/40 !text-white hover:!bg-white hover:!text-black">Voir les tops ventes</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
