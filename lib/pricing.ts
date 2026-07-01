import { InventoryItem } from "@/types/inventory";
import { ELEMENT_CONFIGS, elementForMaterial } from "./rates/config";
import { ElementKey, RatesMap, RateUnit } from "./rates/types";

// 1 troy ounce = 31.1034768 grams
export const TROY_OUNCE_IN_GRAMS = 31.1035;

/**
 * Non-secret pricing configuration (business rules, not API keys), exposed with
 * the NEXT_PUBLIC_ prefix so the storefront computes the same price the server
 * verifies. Override in `.env.local`.
 */
function num(value: string | undefined, fallback: number): number {
  const parsed = value ? Number.parseFloat(value) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const PRICING_CONFIG = {
  makingChargePct: num(process.env.NEXT_PUBLIC_MAKING_CHARGE_PCT, 12),
  marginPct: num(process.env.NEXT_PUBLIC_MARGIN_PCT, 0),
  gstPct: num(process.env.NEXT_PUBLIC_GST_PCT, 3),
  fallbackUsdToInr: num(process.env.NEXT_PUBLIC_USD_TO_INR_FALLBACK, 83),
};

/** A minimal shape that can be priced — satisfied by InventoryItem and CartItem. */
export interface PricedItem {
  material?: string;
  weight?: number;
  karat?: number;
  /** Legacy base price in USD, used when an item has no live metal rate. */
  basePriceUsd: number;
}

export interface PriceBreakdown {
  /** Metal value (live) or converted base value (fallback), in INR. */
  metalValue: number;
  makingCharges: number;
  margin: number;
  gst: number;
  /** Final retail price in INR. */
  total: number;
  /** True when priced live from a metal rate (weight × rate × purity). */
  isDynamic: boolean;
  element?: ElementKey;
  label?: string;
  unit?: RateUnit;
  /** Effective per-unit rate applied (after purity), in INR. */
  effectivePerUnit?: number;
  purity?: number;
}

export function purityFactor(karat?: number): number {
  if (!karat || karat <= 0) return 1;
  return Math.min(Math.max(karat / 24, 0), 1);
}

function toPricedItem(item: InventoryItem | PricedItem): PricedItem {
  if ("basePriceUsd" in item) return item;
  return {
    material: item.material,
    weight: item.weight,
    karat: item.karat,
    basePriceUsd: (item as InventoryItem).price,
  };
}

/** Pull a USD→INR rate from whatever element provides one. */
function resolveUsdToInr(rates: RatesMap): number {
  for (const key of Object.keys(rates) as ElementKey[]) {
    const r = rates[key];
    if (r?.usdToInr && r.usdToInr > 0) return r.usdToInr;
  }
  return PRICING_CONFIG.fallbackUsdToInr;
}

/**
 * Steps 2 & 3: unit + currency conversion and the dynamic retail-price formula.
 *
 *   Final = (weight × livePerGramRate × purity) + making + margin + GST
 *
 * Gram-based metals (gold, silver, platinum, palladium, bronze) with a known
 * weight are priced live from their own element rate. Items whose element has
 * no per-gram rate (e.g. diamond, priced per carat) or that lack weight fall
 * back to their stored USD base price converted to INR.
 */
export function computePriceBreakdown(
  rawItem: InventoryItem | PricedItem,
  rates: RatesMap,
): PriceBreakdown {
  const item = toPricedItem(rawItem);
  const makingRate = PRICING_CONFIG.makingChargePct / 100;
  const marginRate = PRICING_CONFIG.marginPct / 100;
  const gstRate = PRICING_CONFIG.gstPct / 100;

  const elementKey = elementForMaterial(item.material);
  const elementRate = elementKey ? rates[elementKey] : undefined;
  const config = elementKey ? ELEMENT_CONFIGS[elementKey] : undefined;

  const canPriceLive =
    !!elementKey &&
    !!elementRate &&
    !!config &&
    config.unit === "gram" &&
    typeof item.weight === "number" &&
    item.weight > 0 &&
    elementRate.pricePerUnit > 0;

  if (canPriceLive && elementRate && config && elementKey) {
    const purity = config.usesKaratPurity
      ? purityFactor(item.karat)
      : config.defaultPurity;
    const effectivePerUnit = elementRate.pricePerUnit * purity;
    const metalValue = (item.weight as number) * effectivePerUnit;
    const makingCharges = metalValue * makingRate;
    const margin = metalValue * marginRate;
    const taxable = metalValue + makingCharges + margin;
    const gst = taxable * gstRate;
    return {
      metalValue,
      makingCharges,
      margin,
      gst,
      total: Math.round(taxable + gst),
      isDynamic: true,
      element: elementKey,
      label: config.label,
      unit: config.unit,
      effectivePerUnit,
      purity,
    };
  }

  // Fallback: convert the legacy USD base price to INR.
  const usdToInr = resolveUsdToInr(rates);
  const base = item.basePriceUsd * usdToInr;
  const gst = base * gstRate;
  return {
    metalValue: base,
    makingCharges: 0,
    margin: 0,
    gst,
    total: Math.round(base + gst),
    isDynamic: false,
    element: elementKey ?? undefined,
    label: config?.label,
    unit: config?.unit,
  };
}

export function computeItemPriceINR(
  item: InventoryItem | PricedItem,
  rates: RatesMap,
): number {
  return computePriceBreakdown(item, rates).total;
}

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Format a number as Indian Rupees, e.g. ₹1,23,456. */
export function formatINR(value: number): string {
  return inrFormatter.format(Number.isFinite(value) ? value : 0);
}
