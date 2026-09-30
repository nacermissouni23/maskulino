import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { formatDA } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import { TrustBar } from "@/components/Sections";
import { getShopProducts, coveredWilayaCount } from "@/lib/storefront";
import { getHeroProduct } from "@/lib/actions/storefront";
import { getShopSettings } from "@/lib/actions/settings";

function toCard(p: Awaited<ReturnType<typeof getShopProducts>>[number]) {
  return {
    slug: p.slug, name: p.name, category: p.category, price: p.price,
    oldPrice: p.oldPrice, rating: 5, reviews: 0, sizes: p.sizes, colors: p.colors,
    image: p.image, gallery: p.gallery.map((g) => g.src), desc: p.desc, stock: p.totalStock,
  };
}

export default async function Home() {
  const [all, wilayas, hero, settings] = await Promise.all([
    getShopProducts(), coveredWilayaCount(), getHeroProduct(), getShopSettings().catch(() => null),
  ]);
  const top3 = all.slice(0, 3);
  const heroProduct = hero ?? (all.length ? {
    slug: all[0].slug, name: all[0].name, price: all[0].price,
    oldPrice: all[0].oldPrice, image: all[0].image, units: 0,
  } : null);
  const heroTitle = (settings?.hero_title || "Votre style,\nnotre univers").split("\n");
  const heroSub = settings?.hero_subtitle || "Des vêtements pour homme confortables et modernes, pour un look soigné au quotidien. Explorez nos collections et trouvez les pièces qui vous ressemblent.";
  return (
    <div>
      {/* HERO — texte à gauche, photo à droite */}
      <section className="hero-wash overflow-hidden">
        <div className="grid md:grid-cols-2 items-center gap-8 md:gap-12 px-6 md:pl-[max(2rem,calc((100vw-1200px)/2+2rem))] md:pr-[max(2rem,calc((100vw-1200px)/2+2rem))] py-12 md:py-16">
          <div className="flex flex-col justify-center">
            <h1 className="font-display font-extrabold text-[#1c1b18] text-[44px] leading-[1.02] tracking-[-0.02em] md:text-[68px]">
              {heroTitle.map((line, i) => (
                <span key={i}>{line}{i < heroTitle.length - 1 && <br />}</span>
              ))}
            </h1>
            <p className="mt-6 text-[15px] md:text-[16px] font-light leading-[1.8] text-stone-500 max-w-[440px]">
              {heroSub}
            </p>
            <div className="mt-8">
              <Link href="/shop" className="inline-flex items-center gap-2.5 bg-[#1c1b18] text-white text-[12px] font-semibold tracking-[0.14em] uppercase rounded-[12px] px-7 py-4 shadow-lg hover:bg-black transition">
                Voir la boutique <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          {heroProduct && (
          <div className="relative h-[280px] md:h-[340px] rounded-[20px] overflow-hidden">
            <Image src={heroProduct.image} alt={heroProduct.name} fill className="object-cover" priority sizes="(max-width:768px) 100vw, 50vw" />
            <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur rounded-xl px-3.5 py-2.5 flex items-center justify-between gap-3 shadow-lg">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold flex items-center gap-1.5 truncate"><BadgeCheck size={13} className="text-[#20744d] shrink-0" /> {heroProduct.units > 0 ? "Top vente" : "Notre sélection"} — {heroProduct.name}</p>
                <p className="font-bold text-[13px] mt-0.5">{formatDA(heroProduct.price)} {heroProduct.oldPrice && heroProduct.oldPrice > heroProduct.price && <span className="line-through text-stone-400 text-xs font-light">{formatDA(heroProduct.oldPrice)}</span>}</p>
              </div>
              <Link href={`/product/${heroProduct.slug}`} className="bg-[#1c1b18] text-white text-[10px] font-semibold tracking-[0.12em] uppercase rounded-lg px-4 py-2 shrink-0 hover:bg-black transition">Voir</Link>
            </div>
          </div>
          )}
        </div>
      </section>

      <div className="pt-8 md:pt-10"><TrustBar wilayaCount={wilayas} /></div>

      {/* TOP 3 PRODUITS — clic → page commande */}
      <section className="section">
        <div className="container-x">
          <p className="eyebrow text-center">Les plus demandés</p>
          <h2 className="section-title text-center mt-2">Top 3 produits</h2>
          <p className="section-sub text-center">Cliquez sur un produit pour commander — paiement à la livraison</p>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5 mt-6 md:mt-8">
            {top3.map((p) => <ProductCard key={p.slug} p={toCard(p)} />)}
          </div>
          <div className="text-center mt-8 md:mt-10">
            <Link href="/shop" className="btn-fluid">Découvrir la boutique</Link>
          </div>
        </div>
      </section>

      {/* ILS NOUS FONT CONFIANCE */}
      <section className="section !pt-0">
        <div className="container-x">
          <p className="eyebrow text-center">Ils nous font confiance</p>
          <div className="grid md:grid-cols-3 gap-4 md:gap-5 mt-6 md:mt-8">
            {[
              { n: "Nacer — Saïda", t: "معاملة مشاء الله, ثقة و صدق, ربي يوفقكم" },
              { n: "Mohamed — Oran", t: "الصور حقيقية، السلعة لي وصلتني كيما شفتها في الموقع" },
              { n: "Amine — Sétif", t: "توصيل سريع للولاية، تعامل محترم" },
            ].map((r) => (
              <div key={r.n} className="card-soft p-5 md:p-6">
                <p className="text-sm font-normal leading-relaxed" dir="auto">« {r.t} »</p>
                <p className="text-xs font-semibold mt-4 flex items-center gap-1.5"><BadgeCheck size={14} className="text-[#20744d]" /> {r.n}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
