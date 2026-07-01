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
  /** Live price per gram of 24K (pure) gold, in `currency`. */
  pricePerGram: number;
  /** Live price per troy ounce of 24K (pure) gold, in `currency`. */
  pricePerOunce: number;
  /** Display currency for the values above (e.g. "INR"). */
  currency: string;
  /** USD → INR conversion rate used for legacy/non-gold base prices. */
  usdToInr?: number;
  /** Original USD reference values (for transparency / debugging). */
  pricePerGramUSD?: number;
  pricePerOunceUSD?: number;
  lastUpdated: string;
  source: string;
  /** True when served from cache/fallback because live sources failed. */
  isStale?: boolean;
}









