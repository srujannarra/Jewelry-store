export type JewelryCategory =
  | "Rings"
  | "Necklaces"
  | "Earrings"
  | "Bracelets"
  | "Pendants"
  | "Chains"
  | "Bangles"
  | "Anklets"
  | "Brooches"
  | "Watches"
  | "All";

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: JewelryCategory;
  price: number;
  weight?: number; // in grams
  material: string; // e.g., "Gold", "Silver", "Platinum"
  karat?: number; // for gold items (14k, 18k, 22k, 24k)
  images: string[];
  videos?: string[];
  inStock: boolean;
  sku: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoldRate {
  pricePerGram: number;
  pricePerOunce: number;
  currency: string;
  lastUpdated: string;
  source: string;
}









