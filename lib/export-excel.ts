import type { Workbook, Worksheet } from "exceljs";
import type { AdminClient, AdminOrder, AdminProduct } from "./admin-data";

/**
 * Export Excel — 100 % côté client, lazy-loadé.
 *
 * Garanties limites / quotas :
 * - Aucun appel Supabase : on exporte les lignes déjà chargées par la page.
 * - Aucune route API / Server Action : rien ne s'exécute sur Vercel.
 * - `exceljs` est importé dynamiquement (chunk séparé) : le bundle initial
 *   des pages admin ne grossit pas.
 * - Volumes bornés : ≤ 500 lignes, génération < 2 s, quelques centaines de Ko.
 */

const HEADER_FILL = "FF1C1B18";
const RUPTURE_FILL = "FFFBEAE4";
const FAIBLE_FILL = "FFF5EEDD";

export function exportFileName(prefix: string): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${prefix}-${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}.xlsx`;
}

async function newWorkbook(): Promise<Workbook> {
  const ExcelJS = (await import("exceljs")).default;
  return new ExcelJS.Workbook();
}

function styleSheet(ws: Worksheet, widths: number[]) {
  widths.forEach((w, i) => {
    ws.getColumn(i + 1).width = w;
  });
  const header = ws.getRow(1);
  header.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_FILL } };
    cell.font = { color: { argb: "FFFFFFFF" }, bold: true, size: 11 };
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  });
  header.height = 22;
  ws.views = [{ state: "frozen", ySplit: 1 }];
  if (ws.rowCount > 1) {
    ws.autoFilter = { from: "A1", to: ws.getRow(1).cellCount > 0 ? ws.getCell(1, ws.getRow(1).cellCount).address : "A1" };
  }
}

async function download(wb: Workbook, filename: string) {
  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf as ArrayBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

const articlesOf = (o: AdminOrder) =>
  o.items.map((it) => `${it.qty}x ${it.name} (${it.size}/${it.color})`).join(" + ");
const qtyOf = (o: AdminOrder) => o.items.reduce((a, it) => a + it.qty, 0);
const dateOf = (o: AdminOrder): Date | null => {
  if (o.createdAt) {
    const d = new Date(o.createdAt);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
};

// ---------------------------------------------------------------- Commandes
export async function exportOrdersXlsx(rows: AdminOrder[]): Promise<string> {
  const wb = await newWorkbook();
  const ws = wb.addWorksheet("Commandes");
  const headers = [
    "N°", "Date", "Heure", "Client", "Téléphone", "Wilaya", "Commune", "Adresse",
    "Articles", "Qté", "Sous-total", "Réduction", "Livraison", "Total",
    "Source", "Campagne", "Statut", "Paiement", "Type livr.", "Transporteur", "Tracking", "Note",
  ];
  ws.addRow(headers);
  for (const o of rows) {
    const d = dateOf(o);
    const r = ws.addRow([
      o.id, d ?? o.date, o.heure, o.client, o.phone, o.wilaya, o.commune,
      [o.adresse, o.repere].filter(Boolean).join(" · "),
      articlesOf(o), qtyOf(o), o.sousTotal, o.reduction, o.livraison, o.total,
      o.source, o.campagne, o.status, o.paiement, o.deliveryType,
      o.transporteur, o.tracking, o.note,
    ]);
    // Téléphone en texte : garde le 0 initial (0550…). Date = vraie date Excel.
    r.getCell(5).numFmt = "@";
    if (d) r.getCell(2).numFmt = "DD/MM/YYYY";
    for (const c of [11, 12, 13, 14]) r.getCell(c).numFmt = "#,##0";
  }
  if (rows.length > 0) {
    const t = ws.addRow([
      `TOTAL (${rows.length} commandes)`, "", "", "", "", "", "", "",
      "", qtyOf({ items: rows.flatMap((o) => o.items) } as AdminOrder),
      rows.reduce((a, o) => a + o.sousTotal, 0),
      rows.reduce((a, o) => a + o.reduction, 0),
      rows.reduce((a, o) => a + o.livraison, 0),
      rows.reduce((a, o) => a + o.total, 0),
    ]);
    t.font = { bold: true };
    for (const c of [10, 11, 12, 13, 14]) t.getCell(c).numFmt = "#,##0";
  }
  styleSheet(ws, [12, 12, 8, 20, 14, 14, 14, 26, 52, 7, 11, 10, 10, 11, 11, 14, 13, 11, 11, 12, 14, 30]);
  const name = exportFileName("commandes");
  await download(wb, name);
  return name;
}

// ------------------------------------------------------------------ Clients
export async function exportClientsXlsx(rows: AdminClient[]): Promise<string> {
  const wb = await newWorkbook();
  const ws = wb.addWorksheet("Clients");
  ws.addRow([
    "Nom", "Téléphone", "Wilaya", "Commune", "Dernière adresse",
    "Commandes", "Livrées", "Annulées", "Retours", "Total dépensé (DA)",
    "Dernière commande", "Note",
  ]);
  const sorted = [...rows].sort((a, b) => b.depense - a.depense);
  for (const c of sorted) {
    const r = ws.addRow([
      c.name, c.phone, c.wilaya, c.commune, c.adresse,
      c.commandes, c.livrees, c.annulees, c.retours, c.depense,
      c.derniere, c.note,
    ]);
    r.getCell(2).numFmt = "@";
    r.getCell(10).numFmt = "#,##0";
  }
  styleSheet(ws, [20, 14, 14, 16, 28, 11, 9, 9, 9, 16, 34, 30]);
  const name = exportFileName("clients");
  await download(wb, name);
  return name;
}

// ----------------------------------------------------------------- Catalogue
export type StockState = "Disponible" | "Stock faible" | "Rupture";

export function productStockTotal(p: AdminProduct): number {
  return p.variants.reduce((a, v) => a + v.stock, 0);
}

export function variantState(stock: number, seuil: number): StockState {
  if (stock === 0) return "Rupture";
  return stock <= seuil ? "Stock faible" : "Disponible";
}

export function productState(p: AdminProduct): StockState {
  const total = productStockTotal(p);
  if (total === 0) return "Rupture";
  return p.variants.some((v) => v.stock > 0 && v.stock <= v.seuil) ? "Stock faible" : "Disponible";
}

export async function exportCatalogueXlsx(products: AdminProduct[]): Promise<string> {
  const wb = await newWorkbook();
  // Onglet 1 — Produits
  const ws = wb.addWorksheet("Produits");
  ws.addRow([
    "Produit", "Catégorie", "Prix (DA)", "Ancien prix (DA)", "Statut",
    "Stock total", "Nb tailles", "Nb couleurs", "État", "Modifié le",
  ]);
  for (const p of products) {
    const r = ws.addRow([
      p.name, p.categorie, p.prix, p.ancienPrix ?? "",
      p.statut, productStockTotal(p),
      new Set(p.variants.map((v) => v.taille)).size,
      new Set(p.variants.map((v) => v.couleur)).size,
      productState(p), p.updated,
    ]);
    r.getCell(3).numFmt = "#,##0";
    r.getCell(4).numFmt = "#,##0";
    const etat = productState(p);
    if (etat !== "Disponible") {
      r.fill = {
        type: "pattern", pattern: "solid",
        fgColor: { argb: etat === "Rupture" ? RUPTURE_FILL : FAIBLE_FILL },
      };
    }
  }
  styleSheet(ws, [32, 16, 12, 15, 11, 12, 11, 11, 13, 11]);
  // Onglet 2 — Stock détail
  const ws2 = wb.addWorksheet("Stock détail");
  ws2.addRow(["Produit", "Catégorie", "Taille", "Couleur", "Stock", "Seuil", "État"]);
  for (const p of products) {
    for (const v of p.variants) {
      const etat = variantState(v.stock, v.seuil);
      const r = ws2.addRow([p.name, p.categorie, v.taille, v.couleur, v.stock, v.seuil, etat]);
      if (etat !== "Disponible") {
        r.fill = {
          type: "pattern", pattern: "solid",
          fgColor: { argb: etat === "Rupture" ? RUPTURE_FILL : FAIBLE_FILL },
        };
      }
    }
  }
  styleSheet(ws2, [32, 16, 10, 14, 9, 9, 13]);
  const name = exportFileName("catalogue");
  await download(wb, name);
  return name;
}
