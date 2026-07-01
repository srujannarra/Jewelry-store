# Live Material Rates

This folder powers live, per-material pricing (gold, silver, platinum,
palladium, bronze, diamond). Everything is split **per element** so any one
material can be inspected or fixed in isolation.

```
data/rates/
├── elements/      # COMMITTED config, one JSON file per element
│   ├── gold.json
│   ├── silver.json
│   ├── platinum.json
│   ├── palladium.json
│   ├── bronze.json
│   └── diamond.json
├── cache/         # RUNTIME (git-ignored) latest cached rate per element
│   └── <element>.json        ->  { "rate": {...}, "fetchedAt": 1719... }
└── history/       # RUNTIME (git-ignored) append-only samples per element
    └── <element>.ndjson      ->  one JSON sample per line
```

## 1. Data sourcing (which sites)

| Element   | Live source                          | Ticker | Notes |
|-----------|--------------------------------------|--------|-------|
| Gold      | GoldAPI.io → MetalpriceAPI fallback  | XAU    | 24K, karat purity per item |
| Silver    | GoldAPI.io → MetalpriceAPI fallback  | XAG    | default 0.925 (sterling) |
| Platinum  | GoldAPI.io → MetalpriceAPI fallback  | XPT    | default 0.95 (PT950) |
| Palladium | GoldAPI.io → MetalpriceAPI fallback  | XPD    | default 0.95 |
| Bronze    | none (manual baseline)               | —      | not a precious-metal spot market |
| Diamond   | none (manual baseline, per **carat**)| —      | 4C-dependent; wire OpenFacet/IDEX later |

**Why these:** GoldAPI.io and MetalpriceAPI both expose all four LBMA precious
metals (XAU/XAG/XPT/XPD) in INR from a single key, with bid/ask sourced from
COMEX/LBMA. Bronze is a copper–tin alloy with no precious-metal ticker, and
diamonds are priced per carat against the 4Cs (no single spot rate), so both
use a manually maintained baseline in their JSON file.

## 2. Cache expiry (TTL) — and why

`cacheTtlSeconds` per element:

- **Live metals: 300s (5 minutes).** Industry guidance for jewelry storefronts
  is a 30s–300s TTL: long enough to cut API calls by ~90% and stay within free
  tiers (which often only refresh hourly), short enough to stay fresh during
  normal volatility. We use the upper end (5 min) because retail gold prices
  don't move meaningfully second-to-second and it keeps us well under provider
  limits.
- **Bronze / Diamond: 86400s (24h).** Manually maintained baselines that rarely
  change, so there's no reason to re-read them often.

The cache stores only the **latest** value per element (a few hundred bytes
each), so it never grows — that addresses "we won't be storing huge data."
On any provider failure the service serves the last good value (marked
`isStale`) and finally the configured fallback, so the storefront never breaks.

## 3. History for volatility analysis

Every successful **fresh** fetch appends one line to
`history/<element>.ndjson`:

```json
{"t":"2026-06-02T20:15:00.000Z","element":"gold","unit":"gram","pricePerUnit":7123,"currency":"INR","source":"GoldAPI.io (live)","usdToInr":83.1}
```

NDJSON (newline-delimited JSON) is used on purpose: each sample is a single
self-contained line appended to the end of the file, so an interrupted write
can never corrupt earlier records (unlike one giant JSON array). It's tiny,
trivially parsed line-by-line, and can be batch-converted to Parquet later for
heavier analytics (DuckDB/Polars/pandas).

Query it via:

```
GET /api/rates/history?element=gold&limit=200
```

which returns the raw samples plus a quick volatility summary (min/max/mean,
standard deviation, and a coefficient-of-variation `volatilityPct`).

## Editing an element

Open the relevant `elements/<key>.json`, change a value (e.g.
`fallbackPerUnitInr` or `cacheTtlSeconds`), and save. No code changes needed.
