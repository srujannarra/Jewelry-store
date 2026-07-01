import { GoldRate } from "@/types/inventory";
import { TROY_OUNCE_IN_GRAMS } from "./pricing";
import { getElementRate } from "./rates/service";

/**
 * Backward-compatible gold-rate helper. The multi-element rate engine in
 * lib/rates is the source of truth; this adapter exposes the gold element in
 * the legacy `GoldRate` shape used by the navbar display + /api/gold-rate.
 */
export async function getGoldRate(): Promise<GoldRate> {
  const gold = await getElementRate("gold");
  return {
    pricePerGram: gold.pricePerUnit,
    pricePerOunce: gold.pricePerUnit * TROY_OUNCE_IN_GRAMS,
    currency: "INR",
    usdToInr: gold.usdToInr,
    lastUpdated: gold.lastUpdated,
    source: gold.source,
    isStale: gold.isStale,
  };
}

/** Recommended client refresh interval (ms) based on the active source. */
export function getRecommendedRefreshRate(source: string): number {
  if (source.includes("GoldAPI") || source.includes("MetalpriceAPI")) {
    return 5 * 60 * 1000;
  }
  return 60 * 1000;
}
