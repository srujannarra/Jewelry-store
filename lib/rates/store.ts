import fs from "node:fs";
import path from "node:path";
import { ElementKey, ElementRate, RateHistoryEntry } from "./types";

/**
 * Step 4 — Caching + history persistence. Each element is cached and logged in
 * its OWN file so they can be inspected/repaired independently:
 *
 *   data/rates/cache/<element>.json     -> { rate, fetchedAt }  (latest only)
 *   data/rates/history/<element>.ndjson -> append-only samples for volatility
 *
 * NDJSON (one JSON object per line) is used for history because it is
 * append-safe: a new sample is a single line appended to the end, so an
 * interrupted write can never corrupt earlier records (unlike a big JSON
 * array). It stays tiny and is trivially parsed line-by-line later, or batch
 * converted to Parquet for heavier analytics.
 *
 * All disk access is best-effort: on a read-only/serverless filesystem we fall
 * back to an in-memory cache so the app keeps working.
 */

const CACHE_DIR = path.join(process.cwd(), "data", "rates", "cache");
const HISTORY_DIR = path.join(process.cwd(), "data", "rates", "history");

interface CacheEntry {
  rate: ElementRate;
  fetchedAt: number;
}

// In-memory layer (also the only layer when the FS is not writable).
const memoryCache = new Map<ElementKey, CacheEntry>();

function ensureDir(dir: string): boolean {
  try {
    fs.mkdirSync(dir, { recursive: true });
    return true;
  } catch {
    return false;
  }
}

export function readCache(element: ElementKey): CacheEntry | null {
  const mem = memoryCache.get(element);
  if (mem) return mem;
  try {
    const file = path.join(CACHE_DIR, `${element}.json`);
    const raw = fs.readFileSync(file, "utf8");
    const parsed = JSON.parse(raw) as CacheEntry;
    if (parsed?.rate && typeof parsed.fetchedAt === "number") {
      memoryCache.set(element, parsed);
      return parsed;
    }
  } catch {
    // No cache file yet, or unreadable — ignore.
  }
  return null;
}

export function writeCache(element: ElementKey, rate: ElementRate): void {
  const entry: CacheEntry = { rate, fetchedAt: Date.now() };
  memoryCache.set(element, entry);
  if (ensureDir(CACHE_DIR)) {
    try {
      fs.writeFileSync(
        path.join(CACHE_DIR, `${element}.json`),
        JSON.stringify(entry, null, 2),
        "utf8",
      );
    } catch {
      // best-effort only
    }
  }
}

export function isFresh(entry: CacheEntry, ttlSeconds: number): boolean {
  return Date.now() - entry.fetchedAt < ttlSeconds * 1000;
}

/** Append a single sample to the element's history log (for volatility analysis). */
export function appendHistory(rate: ElementRate): void {
  if (!ensureDir(HISTORY_DIR)) return;
  const entry: RateHistoryEntry = {
    t: rate.lastUpdated,
    element: rate.element,
    unit: rate.unit,
    pricePerUnit: rate.pricePerUnit,
    currency: rate.currency,
    source: rate.source,
    usdToInr: rate.usdToInr,
  };
  try {
    fs.appendFileSync(
      path.join(HISTORY_DIR, `${rate.element}.ndjson`),
      JSON.stringify(entry) + "\n",
      "utf8",
    );
  } catch {
    // best-effort only
  }
}

/** Read recent history samples for an element (most-recent last). */
export function readHistory(
  element: ElementKey,
  limit = 500,
): RateHistoryEntry[] {
  try {
    const file = path.join(HISTORY_DIR, `${element}.ndjson`);
    const raw = fs.readFileSync(file, "utf8");
    const lines = raw.split("\n").filter(Boolean);
    return lines
      .slice(-limit)
      .map((line) => {
        try {
          return JSON.parse(line) as RateHistoryEntry;
        } catch {
          return null;
        }
      })
      .filter((e): e is RateHistoryEntry => e !== null);
  } catch {
    return [];
  }
}
