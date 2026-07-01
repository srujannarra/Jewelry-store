import { ELEMENT_CONFIGS, ELEMENT_KEYS } from "./config";
import { fetchLiveRate } from "./providers";
import {
  appendHistory,
  isFresh,
  readCache,
  writeCache,
} from "./store";
import { ElementConfig, ElementKey, ElementRate, RatesMap } from "./types";

/**
 * Central rate service. Returns a cached rate when fresh, fetches live when
 * stale, persists + logs fresh values, and degrades gracefully to the last
 * good value or the per-element configured fallback.
 */

function fallbackRate(config: ElementConfig): ElementRate {
  return {
    element: config.key,
    label: config.label,
    unit: config.unit,
    pricePerUnit: config.fallbackPerUnitInr,
    currency: "INR",
    usdToInr: undefined,
    lastUpdated: new Date().toISOString(),
    source: config.live
      ? "fallback (live source unavailable)"
      : "configured rate",
    isStale: true,
  };
}

export async function getElementRate(element: ElementKey): Promise<ElementRate> {
  const config = ELEMENT_CONFIGS[element];

  // Serve fresh cache if within TTL.
  const cached = readCache(element);
  if (cached && isFresh(cached, config.cacheTtlSeconds)) {
    return cached.rate;
  }

  // Try live providers (no-op for non-market elements).
  const live = await fetchLiveRate(config);
  if (live) {
    const rate: ElementRate = {
      element: config.key,
      label: config.label,
      unit: config.unit,
      pricePerUnit: live.pricePerGram,
      currency: "INR",
      usdToInr: live.usdToInr,
      lastUpdated: new Date().toISOString(),
      source: `${live.source} (live)`,
      isStale: false,
    };
    writeCache(element, rate);
    appendHistory(rate);
    return rate;
  }

  // Live failed / disabled — serve last good value if we have one.
  if (cached) {
    return { ...cached.rate, isStale: true, source: `${cached.rate.source} — cached` };
  }

  // Nothing cached: use configured fallback (and seed the cache with it).
  const fallback = fallbackRate(config);
  writeCache(element, fallback);
  return fallback;
}

/** Fetch every element's rate in parallel as a keyed map. */
export async function getAllElementRates(): Promise<RatesMap> {
  const entries = await Promise.all(
    ELEMENT_KEYS.map(async (key) => [key, await getElementRate(key)] as const),
  );
  return Object.fromEntries(entries) as RatesMap;
}
