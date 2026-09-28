export type AdminOrderStatus =
  | "À confirmer"
  | "Confirmée"
  | "En préparation"
  | "Expédiée"
  | "En livraison"
  | "Livrée"
  | "Annulée"
  | "Retournée";

export type PaymentStatus = "En attente" | "Encaissé" | "Reversé";
export type DeliveryType = "Domicile" | "Stop Desk";
export type Source = "Facebook" | "Instagram" | "TikTok" | "WhatsApp" | "Direct" | "Autre";

export type ConfirmAttempt = { heure: string; moyen: string; resultat: string };
export type HistoryEvent = { date: string; label: string; detail?: string };

export type AdminOrderItem = {
  name: string;
  size: string;
  color: string;
  qty: number;
  price: number;
  image: string;
};

export type AdminOrder = {
  id: string;
  num: number;
  client: string;
  phone: string;
  wilaya: string;
  commune: string;
  adresse: string;
  repere: string;
  items: AdminOrderItem[];
  sousTotal: number;
  reduction: number;
  livraison: number;
  total: number;
  source: Source;
  campagne: string;
  status: AdminOrderStatus;
  paiement: PaymentStatus;
  deliveryType: DeliveryType;
  transporteur: string;
  tracking: string;
  date: string;
  heure: string;
  tentatives: ConfirmAttempt[];
  note: string;
  historique: HistoryEvent[];
  retour: { type: string; motif: string; statut: string } | null;
};

export const COLUMNS: AdminOrderStatus[] = [
  "À confirmer",
  "Confirmée",
  "En préparation",
  "Expédiée",
  "En livraison",
  "Livrée",
  "Retournée",
  "Annulée",
];

export const STATUS_STYLE: Record<AdminOrderStatus, string> = {
  "À confirmer": "bg-[#f5eedd] text-[#7a5a28]",
  Confirmée: "bg-[#1c1b18] text-white",
  "En préparation": "bg-[#e8e4d5] text-[#7a5a28]",
  Expédiée: "bg-[#e3ecf5] text-[#2c5a7a]",
  "En livraison": "bg-[#efe6f7] text-[#5b3d8a]",
  Livrée: "bg-[#e7efe9] text-[#20744d]",
  Retournée: "bg-[#fbeae4] text-[#c0452f]",
  Annulée: "bg-stone-200/70 text-stone-500",
};

const img = (id: string) => `https://images.unsplash.com/${id}?w=200&q=70`;

export const ADMIN_ORDERS: AdminOrder[] = [
  {
    id: "#1048", num: 1048, client: "Yasmine B.", phone: "0550 12 34 56", wilaya: "Alger", commune: "Bab Ezzouar",
    adresse: "Rue des frères, N°12", repere: "Près de la mosquée",
    items: [{ name: "T-Shirt Oversize Noir", size: "L", color: "Noir", qty: 2, price: 2900, image: img("photo-1521572163474-6864f9cf17ab") }],
    sousTotal: 5800, reduction: 0, livraison: 400, total: 6200, source: "Instagram", campagne: "Rentree-Sep",
    status: "À confirmer", paiement: "En attente", deliveryType: "Domicile", transporteur: "", tracking: "",
    date: "27/09", heure: "10:24",
    tentatives: [{ heure: "14:32", moyen: "Appel", resultat: "Pas de réponse" }],
    note: "Cliente préfère appel après 18h",
    historique: [{ date: "27/09 · 10:24", label: "Commande reçue" }],
    retour: null,
  },
  {
    id: "#1047", num: 1047, client: "Mohamed L.", phone: "0661 45 78 90", wilaya: "Oran", commune: "Bir El Djir",
    adresse: "Cité 1200 logts, Bt 4", repere: "",
    items: [{ name: "Ensemble survêtement 2 pièces", size: "XL", color: "Noir", qty: 1, price: 4490, image: img("photo-1611312449408-fcece27cdbb7") }],
    sousTotal: 4490, reduction: 0, livraison: 500, total: 4990, source: "Facebook", campagne: "Pack-Automne",
    status: "À confirmer", paiement: "En attente", deliveryType: "Domicile", transporteur: "", tracking: "",
    date: "27/09", heure: "09:12",
    tentatives: [],
    note: "",
    historique: [{ date: "27/09 · 09:12", label: "Commande reçue" }],
    retour: null,
  },
  {
    id: "#1046", num: 1046, client: "Amine K.", phone: "0770 22 11 44", wilaya: "Sétif", commune: "El Eulma",
    adresse: "Rue 8 mai 1945", repere: "Stop desk",
    items: [{ name: "Hoodie Oversize Noir", size: "M", color: "Gris", qty: 1, price: 3490, image: img("photo-1556821840-3a63f95609a7") }],
    sousTotal: 3490, reduction: 0, livraison: 300, total: 3790, source: "TikTok", campagne: "Hoodie-Video3",
    status: "Confirmée", paiement: "En attente", deliveryType: "Stop Desk", transporteur: "", tracking: "",
    date: "27/09", heure: "08:40",
    tentatives: [
      { heure: "14:32", moyen: "Appel", resultat: "Pas de réponse" },
      { heure: "16:10", moyen: "Appel", resultat: "Commande confirmée" },
    ],
    note: "Client confirme livraison demain matin",
    historique: [
      { date: "27/09 · 08:40", label: "Commande reçue" },
      { date: "27/09 · 16:10", label: "Confirmation", detail: "Commande confirmée" },
    ],
    retour: null,
  },
  {
    id: "#1044", num: 1044, client: "Riyad M.", phone: "0555 99 00 11", wilaya: "Ouargla", commune: "Centre",
    adresse: "Av. de l'indépendance", repere: "",
    items: [{ name: "Jean slim stretch brut", size: "32", color: "Brut", qty: 1, price: 3290, image: img("photo-1542272604-787c3835535d") }],
    sousTotal: 3290, reduction: 0, livraison: 800, total: 4090, source: "WhatsApp", campagne: "",
    status: "En préparation", paiement: "En attente", deliveryType: "Domicile", transporteur: "", tracking: "",
    date: "26/09", heure: "16:40",
    tentatives: [{ heure: "26/09", moyen: "WhatsApp", resultat: "Commande confirmée" }],
    note: "Vérifier taille avant expédition",
    historique: [
      { date: "26/09 · 15:00", label: "Commande reçue" },
      { date: "26/09 · 16:10", label: "Confirmation" },
      { date: "27/09 · 09:00", label: "Préparation" },
    ],
    retour: null,
  },
  {
    id: "#1041", num: 1041, client: "Walid S.", phone: "0662 33 44 55", wilaya: "Constantine", commune: "Ali Mendjeli",
    adresse: "UV 7, Bt 12", repere: "",
    items: [{ name: "Chemise Oxford bleu", size: "L", color: "Bleu", qty: 1, price: 2790, image: img("photo-1596755094514-f87e34085b2c") }],
    sousTotal: 2790, reduction: 0, livraison: 350, total: 3140, source: "Facebook", campagne: "Rentree-Sep",
    status: "Expédiée", paiement: "En attente", deliveryType: "Stop Desk", transporteur: "Yalidine", tracking: "YD123456789",
    date: "26/09", heure: "11:02",
    tentatives: [{ heure: "26/09", moyen: "Appel", resultat: "Commande confirmée" }],
    note: "",
    historique: [
      { date: "26/09 · 11:02", label: "Commande reçue" },
      { date: "26/09 · 14:31", label: "Confirmée" },
      { date: "27/09 · 17:05", label: "Expédiée", detail: "Yalidine · YD123456789" },
    ],
    retour: null,
  },
  {
    id: "#1039", num: 1039, client: "Sofiane T.", phone: "0551 88 77 66", wilaya: "Blida", commune: "Centre",
    adresse: "Rue des roses", repere: "",
    items: [{ name: "Pantalon cargo kaki", size: "32", color: "Kaki", qty: 1, price: 2990, image: img("photo-1624378439575-d8705ad7ae80") }],
    sousTotal: 2990, reduction: 0, livraison: 250, total: 3240, source: "Instagram", campagne: "Cargo-Reel",
    status: "En livraison", paiement: "En attente", deliveryType: "Domicile", transporteur: "ZR Express", tracking: "ZR987654",
    date: "25/09", heure: "15:20",
    tentatives: [{ heure: "25/09", moyen: "Appel", resultat: "Commande confirmée" }],
    note: "",
    historique: [
      { date: "25/09 · 15:20", label: "Commande reçue" },
      { date: "26/09 · 10:00", label: "Expédiée", detail: "ZR Express · ZR987654" },
      { date: "27/09 · 11:42", label: "En livraison" },
    ],
    retour: null,
  },
  {
    id: "#1035", num: 1035, client: "Karim D.", phone: "0771 11 22 33", wilaya: "Alger", commune: "Draria",
    adresse: "Cité AADL", repere: "",
    items: [{ name: "Lot 2 t-shirts blancs", size: "XL", color: "Blanc", qty: 1, price: 1890, image: img("photo-1521572163474-6864f9cf17ab") }],
    sousTotal: 1890, reduction: 0, livraison: 400, total: 2290, source: "Direct", campagne: "",
    status: "Livrée", paiement: "Encaissé", deliveryType: "Domicile", transporteur: "Yalidine", tracking: "YD111222333",
    date: "24/09", heure: "12:00",
    tentatives: [{ heure: "24/09", moyen: "Appel", resultat: "Commande confirmée" }],
    note: "",
    historique: [
      { date: "24/09 · 12:00", label: "Commande reçue" },
      { date: "25/09 · 09:00", label: "Expédiée" },
      { date: "26/09 · 15:20", label: "Livrée" },
    ],
    retour: null,
  },
  {
    id: "#1031", num: 1031, client: "Nassim H.", phone: "0550 00 00 01", wilaya: "Tamanrasset", commune: "Centre",
    adresse: "—", repere: "",
    items: [{ name: "Veste bomber matelassée", size: "L", color: "Noir", qty: 1, price: 5990, image: img("photo-1551028719-00167b16eac5") }],
    sousTotal: 5990, reduction: 0, livraison: 900, total: 6890, source: "TikTok", campagne: "Bomber-Test",
    status: "Retournée", paiement: "En attente", deliveryType: "Domicile", transporteur: "Yalidine", tracking: "YD555666",
    date: "24/09", heure: "09:00",
    tentatives: [{ heure: "24/09", moyen: "Appel", resultat: "Commande confirmée" }],
    note: "",
    historique: [
      { date: "24/09 · 09:00", label: "Commande reçue" },
      { date: "26/09 · 15:20", label: "Livrée" },
      { date: "27/09 · 10:00", label: "Retour demandé", detail: "Problème taille" },
    ],
    retour: { type: "Retour", motif: "Taille", statut: "Reçu" },
  },
  {
    id: "#1028", num: 1028, client: "Bilal F.", phone: "0662 00 11 22", wilaya: "Annaba", commune: "Centre",
    adresse: "Rue B", repere: "",
    items: [{ name: "Pull col rond beige", size: "M", color: "Beige", qty: 1, price: 2890, image: img("photo-1610384104075-e05c8cf200c3") }],
    sousTotal: 2890, reduction: 0, livraison: 600, total: 3490, source: "Facebook", campagne: "Rentree-Sep",
    status: "Annulée", paiement: "En attente", deliveryType: "Domicile", transporteur: "", tracking: "",
    date: "23/09", heure: "17:00",
    tentatives: [
      { heure: "23/09", moyen: "Appel", resultat: "Pas de réponse" },
      { heure: "24/09", moyen: "Appel", resultat: "Pas de réponse" },
    ],
    note: "",
    historique: [
      { date: "23/09 · 17:00", label: "Commande reçue" },
      { date: "24/09 · 18:00", label: "Commande annulée", detail: "Client injoignable" },
    ],
    retour: null,
  },
  {
    id: "#1049", num: 1049, client: "Anis Z.", phone: "0559 44 55 66", wilaya: "Tizi Ouzou", commune: "Azazga",
    adresse: "Village centre", repere: "",
    items: [{ name: "T-Shirt Oversize Noir", size: "M", color: "Blanc", qty: 1, price: 2900, image: img("photo-1521572163474-6864f9cf17ab") }],
    sousTotal: 2900, reduction: 0, livraison: 500, total: 3400, source: "Instagram", campagne: "Rentree-Sep",
    status: "À confirmer", paiement: "En attente", deliveryType: "Domicile", transporteur: "", tracking: "",
    date: "27/09", heure: "11:05",
    tentatives: [], note: "",
    historique: [{ date: "27/09 · 11:05", label: "Commande reçue" }],
    retour: null,
  },
  {
    id: "#1045", num: 1045, client: "Lina M.", phone: "0558 77 88 99", wilaya: "Alger", commune: "Kouba",
    adresse: "Rue A, N°5", repere: "",
    items: [{ name: "Ensemble survêtement 2 pièces", size: "M", color: "Gris", qty: 1, price: 4490, image: img("photo-1611312449408-fcece27cdbb7") }],
    sousTotal: 4490, reduction: 449, livraison: 400, total: 4441, source: "WhatsApp", campagne: "",
    status: "Confirmée", paiement: "En attente", deliveryType: "Domicile", transporteur: "", tracking: "",
    date: "27/09", heure: "07:55",
    tentatives: [{ heure: "27/09", moyen: "WhatsApp", resultat: "Commande confirmée" }],
    note: "", historique: [{ date: "27/09 · 07:55", label: "Commande reçue" }, { date: "27/09 · 09:30", label: "Confirmée" }],
    retour: null,
  },
  {
    id: "#1036", num: 1036, client: "Hichem A.", phone: "0665 12 12 12", wilaya: "Sétif", commune: "Centre",
    adresse: "Rue C", repere: "",
    items: [{ name: "Hoodie Oversize Noir", size: "XL", color: "Noir", qty: 1, price: 3490, image: img("photo-1556821840-3a63f95609a7") }],
    sousTotal: 3490, reduction: 0, livraison: 300, total: 3790, source: "Facebook", campagne: "Pack-Automne",
    status: "Livrée", paiement: "Reversé", deliveryType: "Stop Desk", transporteur: "Yalidine", tracking: "YD777888",
    date: "24/09", heure: "10:00",
    tentatives: [{ heure: "24/09", moyen: "Appel", resultat: "Commande confirmée" }],
    note: "", historique: [{ date: "24/09 · 10:00", label: "Commande reçue" }, { date: "26/09 · 14:00", label: "Livrée" }],
    retour: null,
  },
];

export type Variant = { taille: string; couleur: string; stock: number; seuil: number };
export type ProductImage = { src: string; color: string };
export type AdminProduct = {
  id: string; name: string; desc: string; categorie: string; prix: number; ancienPrix?: number;
  statut: "En ligne" | "Brouillon" | "Rupture"; image: string; images?: ProductImage[]; updated: string;
  matiere: string; coupe: string; guide: string;
  variants: Variant[];
};

export const ADMIN_PRODUCTS: AdminProduct[] = [
  {
    id: "p1", name: "T-Shirt Oversize Noir", desc: "T-shirt oversize 100% coton, coupe large.", categorie: "T-shirts",
    prix: 2900, ancienPrix: 3500, statut: "En ligne",
    image: img("photo-1521572163474-6864f9cf17ab"), updated: "26/09",
    matiere: "100% coton", coupe: "Oversize", guide: "Prendre votre taille habituelle",
    variants: [
      { taille: "S", couleur: "Noir", stock: 4, seuil: 5 },
      { taille: "M", couleur: "Noir", stock: 8, seuil: 5 },
      { taille: "L", couleur: "Noir", stock: 2, seuil: 5 },
      { taille: "XL", couleur: "Noir", stock: 0, seuil: 5 },
      { taille: "M", couleur: "Blanc", stock: 6, seuil: 5 },
    ],
  },
  {
    id: "p2", name: "Hoodie Oversize Noir", desc: "Sweat épais 400g.", categorie: "Hoodies",
    prix: 3490, statut: "En ligne",
    image: img("photo-1556821840-3a63f95609a7"), updated: "25/09",
    matiere: "Coton / polyester", coupe: "Oversize", guide: "Taille grand",
    variants: [
      { taille: "M", couleur: "Noir", stock: 10, seuil: 5 },
      { taille: "L", couleur: "Noir", stock: 3, seuil: 5 },
      { taille: "XL", couleur: "Gris", stock: 0, seuil: 5 },
    ],
  },
  {
    id: "p3", name: "Ensemble survêtement 2 pièces", desc: "Veste zippée + pantalon cargo.", categorie: "Ensembles",
    prix: 4490, ancienPrix: 5990, statut: "En ligne",
    image: img("photo-1611312449408-fcece27cdbb7"), updated: "27/09",
    matiere: "Molleton gratté", coupe: "Regular", guide: "Voir tableau",
    variants: [
      { taille: "M", couleur: "Noir", stock: 7, seuil: 4 },
      { taille: "L", couleur: "Noir", stock: 6, seuil: 4 },
      { taille: "XL", couleur: "Gris", stock: 2, seuil: 4 },
    ],
  },
  {
    id: "p4", name: "Jean slim stretch brut", desc: "Denim stretch confortable.", categorie: "Jeans",
    prix: 3290, statut: "Brouillon",
    image: img("photo-1542272604-787c3835535d"), updated: "20/09",
    matiere: "Denim", coupe: "Slim", guide: "—",
    variants: [
      { taille: "32", couleur: "Brut", stock: 12, seuil: 5 },
      { taille: "34", couleur: "Noir", stock: 9, seuil: 5 },
    ],
  },
  {
    id: "p5", name: "Jogger Gris", desc: "Jogger molleton.", categorie: "Pantalons",
    prix: 2990, statut: "Rupture",
    image: img("photo-1624378439575-d8705ad7ae80"), updated: "18/09",
    matiere: "Molleton", coupe: "Jogger", guide: "—",
    variants: [
      { taille: "M", couleur: "Gris", stock: 0, seuil: 5 },
      { taille: "L", couleur: "Gris", stock: 0, seuil: 5 },
    ],
  },
];

export type AdminClient = {
  name: string; phone: string; wilaya: string; commune: string; adresse: string;
  commandes: number; livrees: number; annulees: number; retours: number; depense: number; derniere: string; note: string;
};

export const ADMIN_CLIENTS: AdminClient[] = [
  { name: "Yasmine B.", phone: "0550 12 34 56", wilaya: "Alger", commune: "Bab Ezzouar", adresse: "Rue des frères, N°12", commandes: 3, livrees: 2, annulees: 0, retours: 0, depense: 12400, derniere: "#1048 · T-Shirt · 6 200 DA · À confirmer", note: "" },
  { name: "Mohamed L.", phone: "0661 45 78 90", wilaya: "Oran", commune: "Bir El Djir", adresse: "Cité 1200 logts", commandes: 4, livrees: 3, annulees: 1, retours: 0, depense: 15200, derniere: "#1047 · Ensemble · 4 990 DA · À confirmer", note: "" },
  { name: "Karim D.", phone: "0771 11 22 33", wilaya: "Alger", commune: "Draria", adresse: "Cité AADL", commandes: 5, livrees: 5, annulees: 0, retours: 0, depense: 18900, derniere: "#1035 · T-shirts · 2 290 DA · Livrée", note: "Client fiable, préfère livraison domicile" },
  { name: "Bilal F.", phone: "0662 00 11 22", wilaya: "Annaba", commune: "Centre", adresse: "Rue B", commandes: 4, livrees: 1, annulees: 3, retours: 0, depense: 3490, derniere: "#1028 · Pull · 3 490 DA · Annulée", note: "" },
  { name: "Nassim H.", phone: "0550 00 00 01", wilaya: "Tamanrasset", commune: "Centre", adresse: "—", commandes: 2, livrees: 1, annulees: 0, retours: 1, depense: 6890, derniere: "#1031 · Bomber · 6 890 DA · Retournée", note: "1 commande refusée — vérifier taille par téléphone" },
];

export type Campaign = {
  nom: string; canal: Source; produit: string; depense: number; commandes: number;
  confirmees: number; livrees: number; caLivre: number; visites: number;
};

export const CAMPAIGNS: Campaign[] = [
  { nom: "Rentree-Sep", canal: "Facebook", produit: "T-Shirt Oversize", depense: 45000, commandes: 120, confirmees: 98, livrees: 72, caLivre: 446400, visites: 8400 },
  { nom: "Hoodie-Video3", canal: "TikTok", produit: "Hoodie Oversize", depense: 28000, commandes: 85, confirmees: 70, livrees: 51, caLivre: 193800, visites: 12000 },
  { nom: "Cargo-Reel", canal: "Instagram", produit: "Pantalon cargo", depense: 18000, commandes: 60, confirmees: 52, livrees: 40, caLivre: 129600, visites: 5200 },
  { nom: "Pack-Automne", canal: "WhatsApp", produit: "Ensemble 2 pièces", depense: 0, commandes: 34, confirmees: 30, livrees: 27, caLivre: 134730, visites: 900 },
];

export type Promo = { nom: string; type: string; valeur: string; produits: string; debut: string; fin: string; statut: string };

export const PROMOS: Promo[] = [
  { nom: "Promo rentrée", type: "Pourcentage", valeur: "-10%", produits: "Tous", debut: "01/09", fin: "30/09", statut: "Active" },
  { nom: "Pack 2+1", type: "Montant fixe", valeur: "-1 000 DA", produits: "Ensembles", debut: "15/09", fin: "15/10", statut: "Active" },
  { nom: "Livraison Alger offerte", type: "Montant fixe", valeur: "Livraison 0 DA", produits: "Tous", debut: "01/09", fin: "31/12", statut: "Inactive" },
];

export const fmtDA = (n: number) => `${n.toLocaleString("fr-DZ")} DA`;
