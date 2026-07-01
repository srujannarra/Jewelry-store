import { TROY_OUNCE_IN_GRAMS, PRICING_CONFIG } from "@/lib/pricing";
import { ElementConfig } from "./types";

/**
 * Step 1 — Data Sourcing. Generic live spot-price fetchers that work for any
 * precious-metal ticker (XAU/XAG/XPT/XPD). API keys are read from server-only
 * env vars and never reach the browser.
 */

const GOLDAPI_BASE = "https://www.goldapi.io/api";
const METALPRICE_URL = "https://api.metalpriceapi.com/v1/latest";
const FETCH_TIMEOUT_MS = 8000;

export interface LiveRate {
  pricePerGram: number; // INR per gram (pure metal)
  usdToInr?: number;
  source: string;
}

async function fetchJson(
  url: string,
  init: RequestInit & { revalidate?: number } = {},
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const { revalidate, ...rest } = init;
    return await fetch(url, {
      ...rest,
      signal: controller.signal,
      next: revalidate ? { revalidate } : undefined,
    });
  } finally {
    clearTimeout(timer);
  }
}

/** GoldAPI.io — one key covers XAU/XAG/XPT/XPD, returns per-gram 24K price. */
async function fromGoldAPI(symbol: string): Promise<LiveRate | null> {
  const apiKey = process.env.GOLDAPI_KEY;
  if (!apiKey) return null;
  try {
    const res = await fetchJson(`${GOLDAPI_BASE}/${symbol}/INR`, {
      headers: { "x-access-token": apiKey, Accept: "application/json" },
      revalidate: 300,
    });
    if (!res.ok) return null;
    const data = await res.json();
    const perGram: number =
      data.price_gram_24k ??
      (data.price ? data.price / TROY_OUNCE_IN_GRAMS : 0);
    if (!(perGram > 0)) return null;
    return {
      pricePerGram: perGram,
      usdToInr: PRICING_CONFIG.fallbackUsdToInr,
      source: "GoldAPI.io",
    };
  } catch {
    return null;
  }
}

/** MetalpriceAPI — base ticker, request INR + USD to derive rate + USD→INR. */
async function fromMetalpriceAPI(symbol: string): Promise<LiveRate | null> {
  const apiKey = process.env.METALPRICE_API_KEY;
  if (!apiKey) return null;
  try {
    const url = `${METALPRICE_URL}?api_key=${apiKey}&base=${symbol}&currencies=INR,USD`;
    const res = await fetchJson(url, {
      headers: { Accept: "application/json" },
      revalidate: 300,
    });
    if (!res.ok) return null;
    const data = await res.json();
    const inrPerOunce: number = data?.rates?.INR ?? 0;
    const usdPerOunce: number = data?.rates?.USD ?? 0;
    if (!(inrPerOunce > 0)) return null;
    return {
      pricePerGram: inrPerOunce / TROY_OUNCE_IN_GRAMS,
      usdToInr:
        usdPerOunce > 0
          ? inrPerOunce / usdPerOunce
          : PRICING_CONFIG.fallbackUsdToInr,
      source: "MetalpriceAPI",
    };
  } catch {
    return null;
  }
}

/**
 * Try each provider in priority order for a given element. Returns null when
 * the element is not market-traded (no symbol) or all providers fail.
 */
export async function fetchLiveRate(
  config: ElementConfig,
): Promise<LiveRate | null> {
  if (!config.live || !config.providerSymbol) return null;
  return (
    (await fromGoldAPI(config.providerSymbol)) ??
    (await fromMetalpriceAPI(config.providerSymbol))
  );
}
