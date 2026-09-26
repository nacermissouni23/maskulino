export type Product = {
  slug: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  badge?: "NOUVEAU" | "TOP VENTE" | "-20%" | "-30%" | "PACK";
  sizes: string[];
  colors: string[];
  image: string;
  gallery: string[];
  desc: string;
  stock: number;
};

export const CATEGORIES = [
  { slug: "hoodies", name: "Sweats à capuche", img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&q=80" },
  { slug: "tshirts", name: "T-shirts", img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80" },
  { slug: "chemises", name: "Chemises", img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80" },
  { slug: "jeans", name: "Jeans & Pantalons", img: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80" },
  { slug: "ensembles", name: "Ensembles", img: "https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=600&q=80" },
  { slug: "vestes", name: "Vestes", img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80" },
];

export const PRODUCTS: Product[] = [
  {
    slug: "hoodie-oversize-noir",
    name: "Sweat à capuche oversize noir premium",
    category: "hoodies",
    price: 3490,
    oldPrice: 4490,
    rating: 4.8,
    reviews: 214,
    badge: "TOP VENTE",
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Noir", "Gris", "Beige"],
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80",
      "https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=800&q=80",
    ],
    desc: "Sweat épais 400 g, coton dense, coupe oversize. Idéal pour l'hiver algérien. Ne rétrécit pas au lavage. Échange de taille gratuit sous 7 jours.",
    stock: 34,
  },
  {
    slug: "tshirt-essentiel-blanc",
    name: "Lot de 2 t-shirts essentiels blancs",
    category: "tshirts",
    price: 1890,
    oldPrice: 2490,
    rating: 4.7,
    reviews: 389,
    badge: "-20%",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Blanc", "Noir"],
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
    gallery: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80"],
    desc: "Lot de 2 t-shirts 100 % coton, col rond renforcé. Coupe droite adaptée aux morphologies algériennes.",
    stock: 120,
  },
  {
    slug: "chemise-oxford-bleu",
    name: "Chemise Oxford bleu ciel",
    category: "chemises",
    price: 2790,
    rating: 4.9,
    reviews: 96,
    badge: "NOUVEAU",
    sizes: ["M", "L", "XL"],
    colors: ["Bleu", "Blanc"],
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80",
    gallery: ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80"],
    desc: "Chemise Oxford élégante, boutons premium, parfaite pour le bureau comme pour les sorties. Repassage facile.",
    stock: 45,
  },
  {
    slug: "jean-slim-stretch",
    name: "Jean slim stretch brut",
    category: "jeans",
    price: 3290,
    oldPrice: 3990,
    rating: 4.6,
    reviews: 178,
    badge: "-20%",
    sizes: ["30", "31", "32", "33", "34", "36"],
    colors: ["Brut", "Noir"],
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80",
    gallery: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80"],
    desc: "Toile denim stretch confortable, coupe slim moderne. Longueur adaptée aux tailles de 170 à 190 cm.",
    stock: 60,
  },
  {
    slug: "ensemble-survetement",
    name: "Ensemble de survêtement 2 pièces",
    category: "ensembles",
    price: 4490,
    oldPrice: 5990,
    rating: 4.9,
    reviews: 312,
    badge: "PACK",
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Noir", "Gris", "Vert"],
    image: "https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=800&q=80",
    gallery: ["https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=800&q=80"],
    desc: "Le best-seller Maskulino. Ensemble en molleton gratté : veste zippée + pantalon cargo. Le préféré des 25-34 ans.",
    stock: 28,
  },
  {
    slug: "veste-bomber",
    name: "Veste bomber matelassée",
    category: "vestes",
    price: 5990,
    oldPrice: 7990,
    rating: 4.8,
    reviews: 84,
    badge: "-30%",
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Noir", "Kaki"],
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80",
    gallery: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80"],
    desc: "Bomber chaud et doublé, coupe premium. Stock limité — collection hiver.",
    stock: 15,
  },
  {
    slug: "pull-col-ronde",
    name: "Pull à col rond beige",
    category: "hoodies",
    price: 2890,
    rating: 4.5,
    reviews: 67,
    sizes: ["M", "L", "XL"],
    colors: ["Beige", "Marron"],
    image: "https://images.unsplash.com/photo-1610384104075-e05c8cf200c3?w=800&q=80",
    gallery: ["https://images.unsplash.com/photo-1610384104075-e05c8cf200c3?w=800&q=80"],
    desc: "Pull doux en maille fine, parfait pour la mi-saison à Alger, Oran ou Constantine.",
    stock: 50,
  },
  {
    slug: "pantalon-cargo",
    name: "Pantalon cargo kaki",
    category: "jeans",
    price: 2990,
    rating: 4.7,
    reviews: 143,
    badge: "TOP VENTE",
    sizes: ["30", "32", "34", "36"],
    colors: ["Kaki", "Noir"],
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80",
    gallery: ["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80"],
    desc: "Cargo 6 poches en toile résistante. Coupe streetwear très demandée en Algérie.",
    stock: 70,
  },
];

export type Wilaya = { code: number; name: string; home: number; stopdesk: number };

export const WILAYAS: Wilaya[] = [
  { code: 16, name: "16 - Alger", home: 400, stopdesk: 250 },
  { code: 31, name: "31 - Oran", home: 500, stopdesk: 300 },
  { code: 25, name: "25 - Constantine", home: 550, stopdesk: 350 },
  { code: 9, name: "09 - Blida", home: 450, stopdesk: 250 },
  { code: 19, name: "19 - Sétif", home: 500, stopdesk: 300 },
  { code: 23, name: "23 - Annaba", home: 600, stopdesk: 350 },
  { code: 13, name: "13 - Tlemcen", home: 600, stopdesk: 350 },
  { code: 6, name: "06 - Béjaïa", home: 550, stopdesk: 300 },
  { code: 15, name: "15 - Tizi Ouzou", home: 500, stopdesk: 300 },
  { code: 35, name: "35 - Boumerdès", home: 450, stopdesk: 250 },
  { code: 42, name: "42 - Tipaza", home: 450, stopdesk: 250 },
  { code: 11, name: "11 - Tamanrasset", home: 900, stopdesk: 600 },
  { code: 30, name: "30 - Ouargla", home: 800, stopdesk: 500 },
  { code: 7, name: "07 - Biskra", home: 650, stopdesk: 400 },
  { code: 10, name: "10 - Bouira", home: 500, stopdesk: 300 },
  { code: 22, name: "22 - Sidi Bel Abbès", home: 600, stopdesk: 350 },
];

// Complément pour atteindre 58 wilayas (démo)
const extraNames = ["Adrar","Chlef","Laghouat","Oum El Bouaghi","Batna","Djelfa","Tébessa","Tiaret","Tizi","Alger","Sidi","Skikda","Jijel","Mascara","Mila","Mostaganem","M'Sila","Ghardaia","Relizane","El Oued","Khenchela","Souk Ahras","Naama","Ain Temouchent","Ghardaia2","Illizi","Tindouf","El Bayadh"];
extraNames.forEach((n, i) => {
  const code = i + 1;
  if (!WILAYAS.find((w) => w.code === code))
    WILAYAS.push({ code, name: `${String(code).padStart(2, "0")} - ${n}`, home: 600, stopdesk: 350 });
});
WILAYAS.sort((a, b) => a.code - b.code);

export const formatDA = (n: number) => `${n.toLocaleString("fr-DZ")} DA`;

export type OrderStatus = "En attente" | "Confirmée" | "Expédiée" | "Livrée" | "Retournée" | "Annulée";

export const MOCK_ORDERS: { id: string; customer: string; phone: string; wilaya: string; total: number; status: OrderStatus; items: number; date: string; risk: "Faible" | "Moyen" | "Élevé" }[] = [
  { id: "MSK-8421", customer: "Yacine B. — Alger", phone: "0550 12 34 56", wilaya: "16 - Alger", total: 3890, status: "En attente", items: 2, date: "Aujourd'hui 10:24", risk: "Faible" },
  { id: "MSK-8419", customer: "Mohamed L. — Oran", phone: "0661 45 78 90", wilaya: "31 - Oran", total: 4490, status: "Confirmée", items: 1, date: "Aujourd'hui 09:12", risk: "Faible" },
  { id: "MSK-8415", customer: "Amine K. — Sétif", phone: "0770 22 11 44", wilaya: "19 - Sétif", total: 5380, status: "Expédiée", items: 2, date: "Hier 16:40", risk: "Moyen" },
  { id: "MSK-8409", customer: "Riyad M. — Ouargla", phone: "0555 99 00 11", wilaya: "30 - Ouargla", total: 3790, status: "Livrée", items: 1, date: "Hier 11:02", risk: "Faible" },
  { id: "MSK-8402", customer: "Inconnu — 0550 00 00 00", phone: "0550 00 00 00", wilaya: "11 - Tamanrasset", total: 6890, status: "Retournée", items: 3, date: "24 sept.", risk: "Élevé" },
  { id: "MSK-8398", customer: "Walid S. — Constantine", phone: "0662 33 44 55", wilaya: "25 - Constantine", total: 2990, status: "Annulée", items: 1, date: "24 sept.", risk: "Élevé" },
];
