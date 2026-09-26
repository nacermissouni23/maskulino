import Image from "next/image";
import Link from "next/link";

const POSTS = [
  { title: "Pourquoi le coton épais ne rétrécit pas", extrait: "On a choisi 400 g pour l'hiver algérien : voici comment le laver et garder la coupe oversize.", date: "Sept. 2026", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80", tag: "Qualité" },
  { title: "Guide des tailles oversize — M ou XXL ?", extrait: "Nos mesures réelles en centimètres, photos portées et conseils selon votre taille.", date: "Août 2026", img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80", tag: "Guide" },
  { title: "Comment on confirme votre commande en 4 h", extrait: "Appel, WhatsApp, photo du colis : notre méthode anti-retour qui protège votre argent.", date: "Août 2026", img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80", tag: "Livraison" },
];

export default function NewsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <p className="eyebrow text-center">Le blog Maskulino</p>
      <h1 className="section-title text-center mt-2">Actualités et conseils</h1>
      <p className="section-sub text-center">Guides des tailles • Coulisses • Conseils livraison</p>
      <div className="grid md:grid-cols-3 gap-4 mt-8">
        {POSTS.map((p) => (
          <article key={p.title} className="card-soft overflow-hidden !p-0 group">
            <span className="block relative aspect-[16/10] overflow-hidden">
              <Image src={p.img} alt={p.title} fill className="object-cover group-hover:scale-105 transition duration-500" />
              <span className="absolute top-3 left-3 text-[10px] font-semibold bg-white/95 px-2.5 py-1 rounded-full">{p.tag}</span>
            </span>
            <div className="p-5">
              <p className="text-[11px] font-medium tracking-wider text-gray-400">{p.date} • MASKULINO</p>
              <p className="font-title font-semibold mt-1.5 leading-snug">{p.title}</p>
              <p className="text-sm font-light text-gray-500 mt-1.5 leading-relaxed">{p.extrait}</p>
              <Link href="/shop" className="label-bold text-[#6c4dff] mt-3 inline-block hover:underline underline-offset-4">Lire l'article →</Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
