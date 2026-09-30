import Image from "next/image";
import Link from "next/link";
import { coveredWilayaCount } from "@/lib/storefront";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AboutPage() {
  const wilayas = await coveredWilayaCount().catch(() => 58);
  let clients = 0;
  try {
    const admin = createAdminClient();
    const { count } = await admin.from("customers").select("phone", { count: "exact", head: true });
    clients = count ?? 0;
  } catch { /* ignore */ }
  const clientsTxt = clients >= 1000 ? `${(clients / 1000).toFixed(1).replace(".", ",")} k+` : clients > 0 ? `${clients}+` : "12 k+";
  return (
    <div className="container-x py-10 md:py-14 max-w-6xl">
      <p className="eyebrow">Fabriqué à Alger • Depuis 2023</p>
      <h1 className="section-title mt-2 max-w-xl">Maskulino — la mode homme, payée à la livraison.</h1>
      <div className="grid md:grid-cols-2 gap-10 lg:gap-14 items-center mt-8 md:mt-10">
        <div className="card-soft overflow-hidden">
          <Image src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80" alt="Boutique Maskulino à Alger" width={700} height={800} className="object-cover aspect-[4/5] w-full" />
        </div>
        <div>
          <p className="body-light text-[15px]">
            Tout a commencé sur Facebook avec 20 sweats à Didouche Mourad. Aujourd'hui, plus de
            {clientsTxt} clients dans {wilayas} wilayas, une équipe de confirmation WhatsApp en moins de 4 h,
            et un principe simple : <span className="font-medium text-stone-800">vous ne payez que si l'article vous plaît à la réception.</span>
          </p>
          <p className="body-light text-[15px] mt-3">
            Tissus épais, tailles réelles, prix affichés en dinars, échange gratuit sous 7 jours.
          </p>
          <div className="grid grid-cols-3 gap-2.5 mt-6 text-center">
            {[[String(wilayas), "Wilayas livrées"], [clientsTxt, "Clients satisfaits"], ["4,8/5", "Note moyenne"]].map(([a, b]) => (
              <div key={b} className="card-soft p-4"><p className="font-display font-bold text-xl">{a}</p><p className="text-[11px] font-light text-stone-500 mt-1">{b}</p></div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mt-7">
            <Link href="/shop" className="btn-fluid">Voir les best-sellers</Link>
            <Link href="/contact" className="btn-ghost">Nous contacter</Link>
          </div>
        </div>
      </div>
      <div className="card-soft grid md:grid-cols-3 gap-6 md:gap-8 p-7 md:p-9 mt-10 md:mt-12">
        {[
          ["Qualité contrôlée", "Chaque pièce est vérifiée à Alger avant expédition : coutures, taille, tissu."],
          ["Tailles honnêtes", "Guide réel M → XXL basé sur des mesures algériennes, pas des tailles approximatives."],
          ["Zéro risque", "Paiement en espèces à la réception, échange gratuit sous 7 jours."],
        ].map(([t, s]) => (
          <div key={t}><p className="font-title font-semibold">{t}</p><p className="text-sm font-light text-stone-500 mt-1.5 leading-relaxed">{s}</p></div>
        ))}
      </div>
    </div>
  );
}
