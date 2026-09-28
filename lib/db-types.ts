import type { AdminOrder, AdminOrderStatus, AdminProduct } from "./admin-data";

// DB enum -> UI French labels (UI freeze: labels unchanged)
export const STATUS_LABEL: Record<string, AdminOrderStatus> = {
  a_confirmer: "À confirmer",
  confirmee: "Confirmée",
  en_preparation: "En préparation",
  expediee: "Expédiée",
  en_livraison: "En livraison",
  livree: "Livrée",
  annulee: "Annulée",
  retournee: "Retournée",
};
export const STATUS_DB: Record<AdminOrderStatus, string> = {
  "À confirmer": "a_confirmer",
  "Confirmée": "confirmee",
  "En préparation": "en_preparation",
  "Expédiée": "expediee",
  "En livraison": "en_livraison",
  "Livrée": "livree",
  "Annulée": "annulee",
  "Retournée": "retournee",
};
export const SOURCE_LABEL: Record<string, AdminOrder["source"]> = {
  facebook: "Facebook", instagram: "Instagram", tiktok: "TikTok",
  whatsapp: "WhatsApp", direct: "Direct", autre: "Autre",
};

export type DbOrder = {
  id: string; number: string; customer_phone: string; customer_name: string;
  wilaya_code: number | null; commune: string; address: string; landmark: string;
  subtotal: number; discount: number; delivery_fee: number; total: number;
  delivery_type: "domicile" | "stopdesk"; carrier_id: string | null; tracking: string;
  source: string; campaign_id: string | null; status: string;
  payment_status: "en_attente" | "encaisse" | "reverse";
  note: string; created_at: string;
  wilayas?: { name: string } | null;
  campaigns?: { name: string } | null;
  order_items?: { name: string; size: string; color: string; qty: number; unit_price: number;
    products?: { principal_image_url: string } | null }[];
  order_events?: { from_status: string | null; to_status: string; meta: Record<string, string>; created_at: string }[];
};

const PAY_LABEL: Record<string, AdminOrder["paiement"]> = {
  en_attente: "En attente", encaisse: "Encaissé", reverse: "Reversé",
};

export function dbOrderToAdmin(o: DbOrder): AdminOrder {
  const wilaya = o.wilayas?.name ?? "";
  return {
    id: o.number, num: parseInt(o.number.replace("MSK-", ""), 10) || 0,
    client: o.customer_name, phone: o.customer_phone,
    wilaya: wilaya.replace(/^\d+\s*-\s*/, ""),
    commune: o.commune, adresse: o.address, repere: o.landmark,
    items: (o.order_items ?? []).map((it) => ({
      name: it.name, size: it.size, color: it.color, qty: it.qty,
      price: it.unit_price, image: it.products?.principal_image_url ?? "",
    })),
    sousTotal: o.subtotal, reduction: o.discount, livraison: o.delivery_fee, total: o.total,
    source: SOURCE_LABEL[o.source] ?? "Direct",
    campagne: o.campaigns?.name ?? "",
    status: STATUS_LABEL[o.status] ?? "À confirmer",
    paiement: PAY_LABEL[o.payment_status] ?? "En attente",
    deliveryType: o.delivery_type === "stopdesk" ? "Stop Desk" : "Domicile",
    transporteur: o.carrier_id === "yalidine" ? "Yalidine" : o.carrier_id === "zr" ? "ZR Express" : o.carrier_id ?? "",
    tracking: o.tracking,
    date: new Date(o.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
    heure: new Date(o.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    tentatives: [],
    note: o.note,
    historique: (o.order_events ?? []).map((e) => ({
      date: new Date(e.created_at).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }),
      label: e.from_status ? `${STATUS_LABEL[e.from_status] ?? e.from_status} → ${STATUS_LABEL[e.to_status] ?? e.to_status}` : (STATUS_LABEL[e.to_status] ?? e.to_status),
      detail: e.meta?.detail,
    })),
    retour: null,
  };
}

export function dbProductToAdmin(p: {
  id: string; slug: string; name: string; description: string; price: number; old_price: number | null;
  status: string; principal_image_url: string; updated_at: string;
  categories?: { name: string } | null;
  product_images?: { path: string; color: string; position: number }[];
  product_variants?: { size: string; color: string; stock: number; alert_threshold: number }[];
}): AdminProduct {
  const imgs = (p.product_images ?? []).sort((a, b) => a.position - b.position);
  return {
    id: p.id, name: p.name, desc: p.description,
    categorie: p.categories?.name ?? "",
    prix: p.price, ancienPrix: p.old_price ?? undefined,
    statut: p.status === "en_ligne" ? "En ligne" : p.status === "rupture" ? "Rupture" : "Brouillon",
    image: p.principal_image_url,
    images: imgs.map((i) => ({ src: i.path, color: i.color })),
    updated: new Date(p.updated_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
    matiere: "", coupe: "", guide: "",
    variants: (p.product_variants ?? []).map((v) => ({
      taille: v.size, couleur: v.color, stock: v.stock, seuil: v.alert_threshold,
    })),
  };
}
