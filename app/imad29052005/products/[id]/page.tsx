"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { fmtDA, type AdminProduct, type ProductImage } from "@/lib/admin-data";
import { listProductsAdmin, saveProduct, deleteProduct } from "@/lib/actions/catalog";
import { listCategories } from "@/lib/actions/catalog";
import { COLORS, SIZES, type ColorOption } from "@/lib/catalog-options";
import { ArrowLeft, Plus, X, Star, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";

const LETTER_SET = new Set(SIZES);

function detectSizeMode(variants: AdminProduct["variants"]): "letters" | "numbers" {
  if (!variants.length) return "letters";
  return variants.some((v) => !LETTER_SET.has(v.taille)) ? "numbers" : "letters";
}

function uniqueSizes(variants: AdminProduct["variants"]): string[] {
  const out: string[] = [];
  for (const v of variants) if (!out.includes(v.taille)) out.push(v.taille);
  return out;
}

type Cell = { on: boolean; qty: number };
type Matrix = Record<string, Record<string, Cell>>;

function matrixFromVariants(variants: AdminProduct["variants"]): Matrix {
  const m: Matrix = {};
  for (const v of variants) {
    if (!m[v.taille]) m[v.taille] = {};
    m[v.taille][v.couleur] = { on: true, qty: v.stock };
  }
  return m;
}

function totalOf(matrix: Matrix): number {
  let t = 0;
  for (const size of Object.values(matrix))
    for (const c of Object.values(size)) if (c.on) t += c.qty || 0;
  return t;
}

export default function ProductPage() {
  const params = useParams();
  const id = params.id as string;
  const [products, setProducts] = useState<AdminProduct[] | null>(null);
  useEffect(() => {
    if (id === "new") return;
    listProductsAdmin().then(setProducts).catch(() => setProducts([]));
  }, [id]);
  if (id === "new") return <Form key="new" product={null} />;
  if (products === null) {
    return <div className="card-soft p-8 text-center text-sm font-light text-stone-500">Chargement…</div>;
  }
  const p = products.find((x) => x.id === id);
  if (!p) {
    return (
      <div className="card-soft p-8 text-center">
        <p className="font-title font-semibold">Produit introuvable</p>
        <p className="text-sm font-light text-stone-500 mt-1">Il a peut-être été supprimé.</p>
        <Link href="/imad29052005/products" className="btn-dark mt-4 !py-2.5">Retour au catalogue</Link>
      </div>
    );
  }
  return <Form key={p.id} product={p} />;
}

function Form({ product }: { product: AdminProduct | null }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<string[]>(product ? [product.categorie] : []);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    listCategories().then((cs) => {
      setCategories((prev) => {
        const merged = [...cs];
        for (const c of prev) if (!merged.includes(c)) merged.unshift(c);
        return merged.length ? merged : ["T-shirts"];
      });
    }).catch(() => undefined);
  }, []);

  const [name, setName] = useState(product?.name ?? "");
  const [desc, setDesc] = useState(product?.desc ?? "");
  const [categorie, setCategorie] = useState(product?.categorie ?? "");
  const [prix, setPrix] = useState(product ? String(product.prix) : "");
  const [ancienPrix, setAncienPrix] = useState(product?.ancienPrix ? String(product.ancienPrix) : "");
  const [statut, setStatut] = useState<AdminProduct["statut"]>(product?.statut ?? "Brouillon");
  const [selColors, setSelColors] = useState<string[]>(() =>
    product ? [...new Set(product.variants.map((v) => v.couleur))] : []
  );
  // Tailles : l'admin choisit le système — Lettres (XS…3XL) ou Numéros (chaussures/pantalons).
  const [sizeMode, setSizeMode] = useState<"letters" | "numbers">(() =>
    product ? detectSizeMode(product.variants) : "letters"
  );
  const [customSizes, setCustomSizes] = useState<string[]>(() =>
    product ? uniqueSizes(product.variants).filter((s) => !LETTER_SET.has(s)) : []
  );
  const [newSize, setNewSize] = useState("");
  const [sizeErr, setSizeErr] = useState("");
  // Couleurs perso : ajoutées uniquement dans ce produit (nom + roue chromatique).
  const [customColors, setCustomColors] = useState<ColorOption[]>(() => {
    if (!product) return [];
    const known = new Set(COLORS.map((c) => c.name.toLowerCase()));
    const seen = new Set<string>();
    const out: ColorOption[] = [];
    for (const v of product.variants) {
      const key = v.couleur.toLowerCase();
      if (!known.has(key) && !seen.has(key) && v.couleur.trim()) {
        seen.add(key);
        out.push({ name: v.couleur, hex: "#c9c4b8" });
      }
    }
    return out;
  });
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#1f3350");
  const [colorErr, setColorErr] = useState("");

  const allColors: ColorOption[] = useMemo(
    () => [...COLORS, ...customColors],
    [customColors]
  );
  const hexFor = (name: string) =>
    allColors.find((c) => c.name === name)?.hex ?? "#c9c4b8";
  const activeSizes: string[] = sizeMode === "letters" ? SIZES : customSizes;
  const [images, setImages] = useState<ProductImage[]>(() =>
    product ? product.images ?? [{ src: product.image, color: product.variants[0]?.couleur ?? "" }] : []
  );
  const [matrix, setMatrix] = useState<Matrix>(() => (product ? matrixFromVariants(product.variants) : {}));

  const total = totalOf(matrix);
  const valid = name.trim().length > 0 && Number(prix) > 0;
  const catOptions = useMemo(() => {
    const list = [...categories];
    if (product && !list.includes(product.categorie)) list.unshift(product.categorie);
    return list;
  }, [categories, product]);

  function toggleColor(name: string) {
    if (selColors.includes(name)) {
      setSelColors((cs) => cs.filter((c) => c !== name));
      setMatrix((m) => {
        const nx = { ...m };
        for (const s of Object.keys(nx)) {
          if (nx[s][name]) {
            const row = { ...nx[s] };
            delete row[name];
            nx[s] = row;
          }
        }
        return nx;
      });
      setImages((imgs) => imgs.map((im) => (im.color === name ? { ...im, color: "" } : im)));
    } else {
      setSelColors((cs) => [...cs, name]);
    }
  }

  function addSize() {
    const s = newSize.trim().slice(0, 10);
    if (!s) { setSizeErr("Tapez une taille — ex. 40."); return; }
    if (customSizes.some((x) => x.toLowerCase() === s.toLowerCase())) { setSizeErr("Cette taille est déjà ajoutée."); return; }
    setSizeErr("");
    setCustomSizes((xs) => [...xs, s]);
    setNewSize("");
  }

  function removeSize(s: string) {
    setCustomSizes((xs) => xs.filter((x) => x !== s));
    setMatrix((m) => {
      const nx = { ...m };
      delete nx[s];
      return nx;
    });
  }

  function addCustomColor() {
    const nm = newColorName.trim().slice(0, 40);
    if (!nm) { setColorErr("Donnez un nom — ex. Vert olive."); return; }
    if (allColors.some((c) => c.name.toLowerCase() === nm.toLowerCase())) { setColorErr("Cette couleur existe déjà."); return; }
    if (!/^#[0-9a-fA-F]{6}$/.test(newColorHex)) { setColorErr("Choisissez une couleur avec la roue."); return; }
    setColorErr("");
    setCustomColors((cs) => [...cs, { name: nm, hex: newColorHex }]);
    setSelColors((cs) => (cs.includes(nm) ? cs : [...cs, nm]));
    setNewColorName("");
  }

  function removeCustomColor(nm: string) {
    setCustomColors((cs) => cs.filter((c) => c.name !== nm));
    if (selColors.includes(nm)) toggleColor(nm);
  }

  function toggleCell(size: string, color: string) {
    setMatrix((m) => {
      const row = { ...(m[size] ?? {}) };
      const cur = row[color];
      row[color] = cur?.on ? { on: false, qty: cur.qty } : { on: true, qty: cur?.qty ?? 0 };
      return { ...m, [size]: row };
    });
  }

  function setQty(size: string, color: string, qty: number) {
    setMatrix((m) => ({ ...m, [size]: { ...(m[size] ?? {}), [color]: { on: true, qty: Math.max(0, qty || 0) } } }));
  }

  function toggleRow(size: string) {
    const row = matrix[size] ?? {};
    const allOn = selColors.length > 0 && selColors.every((c) => row[c]?.on);
    const nx = { ...row };
    for (const c of selColors) nx[c] = allOn ? { on: false, qty: nx[c]?.qty ?? 0 } : { on: true, qty: nx[c]?.qty ?? 0 };
    setMatrix((m) => ({ ...m, [size]: nx }));
  }

  function compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new window.Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        const max = 1600;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        canvas.getContext("2d")?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  async function onFiles(files: FileList | null) {
    if (!files) return;
    const room = 10 - images.length;
    if (room <= 0) return;
    const picked = Array.from(files).slice(0, room);
    try {
      const dataUrls = await Promise.all(picked.map(compressImage));
      setImages((imgs) => [...imgs, ...dataUrls.map((src) => ({ src, color: "" }))].slice(0, 10));
    } catch {
      setSaveErr("Images illisibles — réessayez avec des JPG/PNG.");
    }
  }

  function moveImg(i: number, dir: -1 | 1) {
    setImages((imgs) => {
      const j = i + dir;
      if (j < 0 || j >= imgs.length) return imgs;
      const nx = [...imgs];
      [nx[i], nx[j]] = [nx[j], nx[i]];
      return nx;
    });
  }

  async function save() {
    if (!valid || saving) return;
    if (sizeMode === "numbers" && customSizes.length === 0) {
      setSaveErr("Ajoutez au moins une taille numérotée (ex. 40) à l'étape 5.");
      return;
    }
    if (selColors.length === 0) {
      setSaveErr("Sélectionnez au moins une couleur à l'étape 3.");
      return;
    }
    setSaving(true);
    setSaveErr("");
    const variants = activeSizes.flatMap((s) =>
      selColors.flatMap((c) => {
        const cell = matrix[s]?.[c];
        return cell?.on ? [{ size: s, color: c, stock: cell.qty || 0 }] : [];
      })
    );
    const res = await saveProduct({
      id: product?.id ?? null,
      name: name.trim(),
      desc: desc.trim(),
      categorie: categorie || categories[0] || "T-shirts",
      prix: Number(prix),
      ancienPrix: ancienPrix ? Number(ancienPrix) : null,
      statut,
      images: images.slice(0, 10),
      variants,
    });
    setSaving(false);
    if (!res.ok) {
      setSaveErr("Enregistrement impossible — réessayez.");
      return;
    }
    router.push("/imad29052005/products");
  }

  const saveBtn = (
    <button onClick={save} disabled={!valid || saving} className="btn-fluid !py-3 disabled:opacity-40">
      {saving ? "Enregistrement…" : "Enregistrer"}
    </button>
  );

  async function remove() {
    if (!product || deleting) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    setSaveErr("");
    const res = await deleteProduct(product.id);
    setDeleting(false);
    if (!res.ok) {
      setConfirmDelete(false);
      setSaveErr(
        res.code === "HAS_ORDERS"
          ? "Suppression refusée : une commande confirmée réserve encore ce produit. Livrez ou annulez-la d'abord."
          : "Suppression impossible — réessayez."
      );
      return;
    }
    router.push("/imad29052005/products");
  }

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Link href="/imad29052005/products" aria-label="Retour" className="w-9 h-9 rounded-full bg-white border border-[#e8e3d8] flex items-center justify-center shrink-0">
            <ArrowLeft size={15} />
          </Link>
          <div className="min-w-0">
            <h1 className="section-title !text-2xl md:!text-3xl truncate">{product ? product.name : "Nouveau produit"}</h1>
            <p className="section-sub">{product ? "Modifiez puis enregistrez." : "Remplissez les informations ci-dessous."}</p>
          </div>
        </div>
        {saveBtn}
      </div>
      {!valid && <p className="text-xs font-medium text-[#a06a2c] mt-2">Nom et prix actuel requis pour enregistrer.</p>}
      {saveErr && <p className="text-xs font-medium text-[#c0452f] bg-[#fdf0ec] border border-[#f3d4c8] p-2.5 rounded-[10px] mt-2">{saveErr}</p>}

      <div className="card-soft p-4 md:p-5 mt-4">
        <p className="font-title font-semibold text-sm">1 · Informations</p>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom du produit — ex. T-Shirt Oversize Noir" className="input-soft mt-2.5" />
        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" className="w-full mt-2 min-h-[72px] rounded-[10px] border-[1.5px] border-[#e8e3d8] p-2.5 text-sm bg-white outline-none focus:border-stone-500" />
        <label className="label-bold !text-[10px] text-stone-500 mt-3 block">Catégorie</label>
        <select value={categorie} onChange={(e) => setCategorie(e.target.value)} className="input-soft mt-1.5">
          {catOptions.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="card-soft p-4 md:p-5 mt-3">
        <p className="font-title font-semibold text-sm">2 · Prix (DA)</p>
        <div className="grid grid-cols-2 gap-2 mt-2.5">
          <label className="text-xs font-light text-stone-500">Prix actuel *<input type="number" min={0} value={prix} onChange={(e) => setPrix(e.target.value)} placeholder="2 900" className="input-soft mt-1" /></label>
          <label className="text-xs font-light text-stone-500">Ancien prix (optionnel)<input type="number" min={0} value={ancienPrix} onChange={(e) => setAncienPrix(e.target.value)} placeholder="3 500" className="input-soft mt-1" /></label>
        </div>
        {Number(prix) > 0 && (
          <p className="text-xs font-normal mt-2.5 bg-[#faf8f3] border border-[#e8e3d8] rounded-xl px-3.5 py-2.5">
            Aperçu boutique : <span className="font-bold">{fmtDA(Number(prix))}</span>
            {Number(ancienPrix) > Number(prix) && <span className="font-light text-stone-400 line-through ml-2">{fmtDA(Number(ancienPrix))}</span>}
          </p>
        )}
      </div>

      <div className="card-soft p-4 md:p-5 mt-3">
        <p className="font-title font-semibold text-sm">3 · Couleurs</p>
        <p className="text-[11px] font-light text-stone-400 mt-0.5">Sélectionnez parmi les couleurs proposées, ou ajoutez la vôtre (roue + nom) — elle restera uniquement dans ce produit.</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-3">
          {COLORS.map((c) => {
            const on = selColors.includes(c.name);
            return (
              <button key={c.name} onClick={() => toggleColor(c.name)}
                className={`rounded-xl border-[1.5px] px-2 py-2.5 flex flex-col items-center gap-1.5 transition ${on ? "border-[#1c1b18] bg-[#1c1b18] text-white" : "border-[#e8e3d8] bg-white"}`}>
                <span className="w-6 h-6 rounded-full border border-black/15" style={{ background: c.hex }} />
                <span className="text-[11px] font-medium leading-none">{c.name}</span>
              </button>
            );
          })}
          {customColors.map((c) => {
            const on = selColors.includes(c.name);
            return (
              <span key={`custom-${c.name}`} className={`relative rounded-xl border-[1.5px] px-2 py-2.5 flex flex-col items-center gap-1.5 transition ${on ? "border-[#1c1b18] bg-[#1c1b18] text-white" : "border-dashed border-[#a06a2c] bg-white"}`}>
                <button onClick={() => toggleColor(c.name)} className="flex flex-col items-center gap-1.5" aria-label={c.name}>
                  <span className="w-6 h-6 rounded-full border border-black/15" style={{ background: c.hex }} />
                  <span className="text-[11px] font-medium leading-none">{c.name}</span>
                </button>
                <button onClick={() => removeCustomColor(c.name)} aria-label={`Retirer ${c.name}`}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-black text-white flex items-center justify-center"><X size={12} /></button>
              </span>
            );
          })}
        </div>
        <div className="mt-3 rounded-xl border-[1.5px] border-dashed border-[#e8e3d8] bg-[#faf8f3] p-3">
          <p className="text-xs font-semibold flex items-center gap-1.5"><Plus size={13} /> Ajouter une couleur à ce produit</p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <label className="flex items-center gap-2 text-xs font-medium bg-white border border-[#e8e3d8] rounded-[10px] px-2.5 h-11">
              <input type="color" value={newColorHex} onChange={(e) => setNewColorHex(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent" aria-label="Choisir la teinte" />
              <span className="font-mono">{newColorHex}</span>
            </label>
            <input value={newColorName} onChange={(e) => setNewColorName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomColor(); } }} placeholder="Nom — ex. Vert olive" className="input-soft !h-11 min-w-0 flex-1" maxLength={40} />
            <button onClick={addCustomColor} className="btn-dark !py-2.5 !h-11 flex items-center gap-1"><Plus size={13} /> Ajouter</button>
          </div>
          {colorErr && <p className="text-[11px] font-medium text-[#c0452f] mt-1.5">{colorErr}</p>}
        </div>
      </div>

      <div className="card-soft p-4 md:p-5 mt-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-title font-semibold text-sm">4 · Images (max 10)</p>
            <p className="text-[11px] font-light text-stone-400 mt-0.5">La 1ʳᵉ = principale. Sous chaque photo, choisissez sa couleur : la fiche affichera la bonne photo quand le client change de couleur.</p>
          </div>
          <button onClick={() => fileRef.current?.click()} disabled={images.length >= 10} className="btn-dark !py-2.5 flex items-center gap-1.5 disabled:opacity-40">
            <Plus size={14} /> Ajouter ({images.length}/10)
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { onFiles(e.target.files); e.target.value = ""; }} />
        {images.length === 0 ? (
          <button onClick={() => fileRef.current?.click()} className="w-full mt-3 rounded-xl border-[1.5px] border-dashed border-[#e8e3d8] bg-white py-8 text-xs font-light text-stone-400">
            Cliquez pour téléverser les photos du produit
          </button>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-3">
            {images.map((im, i) => (
              <div key={`${im.src}-${i}`} className="bg-white border border-[#e8e3d8] rounded-xl p-2">
                <span className="relative block aspect-[4/5] rounded-lg overflow-hidden bg-[#ece7d9]">
                  {im.src ? <Image src={im.src} alt="" fill className="object-cover" unoptimized /> : null}
                  {i === 0 && <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-black text-white rounded px-1.5 py-0.5">PRINCIPALE</span>}
                  <button onClick={() => setImages((imgs) => imgs.filter((_, j) => j !== i))} aria-label="Supprimer"
                    className="absolute top-1 right-1 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center"><X size={13} /></button>
                </span>
                <select value={im.color} onChange={(e) => setImages((imgs) => imgs.map((x, j) => j === i ? { ...x, color: e.target.value } : x))}
                  className="w-full mt-1.5 h-9 rounded-lg border border-[#e8e3d8] text-xs font-medium px-1.5 bg-[#f5f3ee]">
                  <option value="">Couleur…</option>
                  {selColors.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <span className="flex gap-1 mt-1.5">
                  <button onClick={() => moveImg(i, -1)} disabled={i === 0} aria-label="Vers la gauche" className="flex-1 h-8 rounded-lg border border-[#e8e3d8] flex items-center justify-center disabled:opacity-30 bg-white"><ChevronLeft size={14} /></button>
                  <button onClick={() => moveImg(i, 1)} disabled={i === images.length - 1} aria-label="Vers la droite" className="flex-1 h-8 rounded-lg border border-[#e8e3d8] flex items-center justify-center disabled:opacity-30 bg-white"><ChevronRight size={14} /></button>
                  <button onClick={() => setImages((imgs) => [imgs[i], ...imgs.filter((_, j) => j !== i)])} disabled={i === 0} aria-label="Principale" title="Définir comme principale" className="flex-1 h-8 rounded-lg border border-[#e8e3d8] flex items-center justify-center disabled:opacity-30 bg-white"><Star size={13} /></button>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card-soft p-4 md:p-5 mt-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-title font-semibold text-sm">5 · Tailles & stock par taille × couleur</p>
            <p className="text-[11px] font-light text-stone-400 mt-0.5">Choisissez le système de tailles, activez les couleurs dans chaque taille et saisissez les quantités.</p>
          </div>
          <span className="text-xs font-bold bg-[#e7efe9] text-[#20744d] rounded-full px-3 py-1.5 whitespace-nowrap">Stock total : {total}</span>
        </div>
        <div className="flex h-11 rounded-[10px] border-[1.5px] border-[#e8e3d8] bg-white p-1 text-xs font-semibold w-full sm:w-fit mt-3">
          {(["letters", "numbers"] as const).map((m) => (
            <button key={m} onClick={() => setSizeMode(m)} className={`flex-1 sm:flex-none px-5 h-full rounded-lg whitespace-nowrap ${sizeMode === m ? "bg-[#1c1b18] text-white" : "text-stone-500"}`}>
              {m === "letters" ? "Tailles S · M · L…" : "Tailles numérotées"}
            </button>
          ))}
        </div>
        {sizeMode === "numbers" && (
          <div className="mt-3 rounded-xl border-[1.5px] border-dashed border-[#e8e3d8] bg-[#faf8f3] p-3">
            <p className="text-xs font-semibold">Tapez chaque taille puis cliquez Ajouter (ex. 40 pour chaussures, 32 pour pantalons).</p>
            <div className="flex gap-2 mt-2">
              <input value={newSize} onChange={(e) => setNewSize(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSize(); } }} placeholder="Ex. 40" className="input-soft !h-11 min-w-0 flex-1" maxLength={10} inputMode="text" />
              <button onClick={addSize} className="btn-dark !h-11 !py-2 flex items-center gap-1 shrink-0"><Plus size={13} /> Ajouter</button>
            </div>
            {sizeErr && <p className="text-[11px] font-medium text-[#c0452f] mt-1.5">{sizeErr}</p>}
            {customSizes.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {customSizes.map((s) => (
                  <span key={s} className="flex items-center gap-1.5 h-9 pl-3.5 pr-1.5 rounded-full bg-[#1c1b18] text-white text-xs font-semibold">
                    {s}
                    <button onClick={() => removeSize(s)} aria-label={`Retirer taille ${s}`} className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center"><X size={12} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
        {selColors.length === 0 && <p className="text-xs font-light text-stone-400 mt-3">Sélectionnez d&apos;abord des couleurs à l&apos;étape 3.</p>}
        {sizeMode === "numbers" && customSizes.length === 0 && <p className="text-xs font-light text-stone-400 mt-3">Ajoutez au moins une taille numérotée ci-dessus.</p>}
        <div className="space-y-2 mt-3">
          {activeSizes.map((s) => {
            const row = matrix[s] ?? {};
            const rowTotal = selColors.reduce((a, c) => a + (row[c]?.on ? row[c].qty || 0 : 0), 0);
            return (
              <div key={s} className="border border-[#e8e3d8] bg-[#faf8f3] rounded-xl p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-bold min-w-10 flex items-center gap-1.5">{s}
                    {sizeMode === "numbers" && (
                      <button onClick={() => removeSize(s)} aria-label={`Retirer taille ${s}`} className="w-6 h-6 rounded-full border border-[#e8e3d8] bg-white items-center justify-center inline-flex"><X size={11} /></button>
                    )}
                  </p>
                  <p className="text-[11px] font-medium text-stone-500">Total : <span className="font-bold text-stone-800">{rowTotal}</span></p>
                  <button onClick={() => toggleRow(s)} disabled={selColors.length === 0} className="h-8 px-3 rounded-full border border-[#e8e3d8] bg-white text-[11px] font-semibold disabled:opacity-40">Tout</button>
                </div>
                {selColors.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-2">
                    {selColors.map((c) => {
                      const cell = row[c];
                      const on = !!cell?.on;
                      return (
                        <div key={c} className={`rounded-lg border p-1.5 flex items-center gap-1.5 ${on ? "border-[#1c1b18] bg-white" : "border-[#e8e3d8]"}`}>
                          <button onClick={() => toggleCell(s, c)} className="flex items-center gap-1.5 min-w-0 flex-1" title={c}>
                            <span className="w-5 h-5 rounded-full border border-black/15 shrink-0" style={{ background: hexFor(c) }} />
                            <span className={`text-[11px] font-medium truncate ${on ? "" : "text-stone-400"}`}>{c}</span>
                          </button>
                          {on && (
                            <input type="number" min={0} value={cell?.qty ?? 0} onChange={(e) => setQty(s, c, Number(e.target.value))}
                              className="w-14 h-8 rounded-lg border border-[#e8e3d8] text-right text-xs font-bold px-1 bg-[#f5f3ee] outline-none" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card-soft p-4 md:p-5 mt-3 mb-2">
        <p className="font-title font-semibold text-sm">6 · Publication</p>
        <div className="flex gap-2 mt-2.5 max-w-md">
          {(["Brouillon", "En ligne"] as const).map((s) => (
            <button key={s} onClick={() => setStatut(s)} className={`flex-1 h-11 rounded-[10px] border-[1.5px] text-xs font-semibold ${statut === s ? "bg-[#1c1b18] text-white border-[#1c1b18]" : "bg-white border-[#e8e3d8]"}`}>{s}</button>
          ))}
        </div>
        <div className="mt-3 max-w-md">{saveBtn}</div>
        {product && (
          <div className="mt-5 max-w-md border-t border-[#e8e3d8] pt-4">
            <p className="label-bold !text-[10px] text-stone-500">Zone dangereuse</p>
            <button
              onClick={remove}
              disabled={deleting}
              className={`mt-2 w-full h-11 rounded-[10px] border-[1.5px] text-xs font-semibold flex items-center justify-center gap-1.5 transition disabled:opacity-50 ${confirmDelete ? "bg-[#c0452f] border-[#c0452f] text-white" : "bg-white border-[#f3d4c8] text-[#c0452f] hover:bg-[#fdf0ec]"}`}
            >
              <Trash2 size={14} />
              {deleting ? "Suppression…" : confirmDelete ? "Cliquez pour confirmer la suppression" : "Supprimer ce produit"}
            </button>
            {confirmDelete && !deleting && (
              <button onClick={() => setConfirmDelete(false)} className="mt-2 w-full text-xs font-medium underline underline-offset-4 text-stone-500">
                Annuler
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
