// Options partagées : catégories (modifiables dans Paramètres) et palette de couleurs imposée.
export const CATEGORIES = [
  "T-shirts",
  "Chemises",
  "Pantalons",
  "Jeans",
  "Hoodies & Sweats",
  "Vestes & Manteaux",
  "Ensembles",
  "Chaussures",
  "Accessoires",
];

export type ColorOption = { name: string; hex: string };

export const COLORS: ColorOption[] = [
  { name: "Noir", hex: "#1c1b18" },
  { name: "Blanc", hex: "#ffffff" },
  { name: "Gris", hex: "#8f8f8f" },
  { name: "Gris clair", hex: "#d6d3cb" },
  { name: "Bleu marine", hex: "#1f3350" },
  { name: "Bleu", hex: "#2f6db3" },
  { name: "Bleu ciel", hex: "#a9cdf3" },
  { name: "Rouge", hex: "#c0392b" },
  { name: "Bordeaux", hex: "#6e1423" },
  { name: "Vert", hex: "#2e7d4f" },
  { name: "Kaki", hex: "#7a7444" },
  { name: "Beige", hex: "#d9c7a7" },
  { name: "Camel", hex: "#b07d3c" },
  { name: "Marron", hex: "#5b3a24" },
  { name: "Jaune", hex: "#e8b90f" },
  { name: "Orange", hex: "#d96c26" },
  { name: "Rose", hex: "#e5a3b3" },
  { name: "Violet", hex: "#6c4d9e" },
];

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

export const hexOf = (name: string) => COLORS.find((c) => c.name === name)?.hex ?? "#c9c4b8";
