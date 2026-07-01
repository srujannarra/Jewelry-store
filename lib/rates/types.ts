export type ElementKey =
  | "gold"
  | "silver"
  | "platinum"
  | "palladium"
  | "bronze"
  | "diamond";

export type RateUnit = "gram" | "carat";

/** Per-element configuration, loaded from data/rates/elements/<key>.json. */
export interface ElementConfig {
  key: ElementKey;
  label: string;
  /** Spot ticker (XAU/XAG/XPT/XPD) or null for non-market elements. */
  providerSymbol: string | null;
  unit: RateUnit;
  /** Whether to fetch a live rate from providers. */
  live: boolean;
  /** Cache time-to-live in seconds (see docs for rationale). */
  cacheTtlSeconds: number;
  /** Manually maintained INR per unit, used as fallback / for non-live elements. */
  fallbackPerUnitInr: number;
  /** Purity used when the item has no karat (e.g. 0.925 sterling silver). */
  defaultPurity: number;
  /** Gold applies item karat/24 instead of defaultPurity. */
  usesKaratPurity: boolean;
  /** Lower-cased material strings that map to this element. */
  matchesMaterials: string[];
  notes?: string;
}

/** A resolved live (or fallback) rate for one element. */
export interface ElementRate {
  element: ElementKey;
  label: string;
  unit: RateUnit;
  /** INR per gram (pure) or per carat. */
  pricePerUnit: number;
  currency: "INR";
  usdToInr?: number;
  lastUpdated: string;
  source: string;
  /** True when served from cache/fallback because live sources failed or are disabled. */
  isStale: boolean;
}

export type RatesMap = Partial<Record<ElementKey, ElementRate>>;

/** One historical sample appended to data/rates/history/<key>.ndjson. */
export interface RateHistoryEntry {
  t: string; // ISO timestamp (UTC)
  element: ElementKey;
  unit: RateUnit;
  pricePerUnit: number;
  currency: "INR";
  source: string;
  usdToInr?: number;
}
