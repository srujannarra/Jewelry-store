# Security, Governance & Quality Audit — Findings & Remediation Backlog

> **Audit date:** 2026-06-02
> **Scope:** Full Next.js 14 (App Router) jewelry store — build/compile, lint, API fuzz + stress testing, secret/data-leak scan, dependency audit, and code review of the pricing engine, rate service, cart/checkout flow, Dockerfile, and Cloud Build config.
>
> This file is a **remediation backlog**. Nothing here has been changed in code yet — it is a checklist of what to fix in the future. Items are ordered by severity.

---

## Summary of audit results

| Check | Result |
|-------|--------|
| `next build` (production) | ✅ Compiled successfully, 11 routes generated, no type errors |
| `next lint` | ✅ No ESLint warnings or errors |
| Malicious input (path traversal / XSS / injection) on APIs | ✅ Correctly rejected (`400`/`404`), no input reflection |
| 200 concurrent requests to `/api/rates` | ✅ All `200` in ~0.38s |
| Secret keys in client bundle | ✅ Not present (server-only) |
| XSS sinks (`dangerouslySetInnerHTML`, `eval`, `innerHTML`) | ✅ None |
| Committed `.env` / secrets | ✅ None (only `.env.example` placeholders) |

The app is fundamentally sound. The items below harden it to production-grade, especially before connecting real payments.

---

## Issues to fix (remediation backlog)

### 1. [HIGH] Prices are computed/verified only on the client
- **Where:** `components/CheckoutView.tsx`, `lib/CartContext.tsx` (cart persisted in `localStorage` under `svj_cart_v2`).
- **Problem:** The verified total is computed in the browser, and `unitPrice` is stored in `localStorage`. The checkout UI claims "the server verifies," but **no server-side price/order endpoint exists**. Once a payment gateway is connected, a user can tamper with the stored price and pay an arbitrary amount.
- **Fix:**
  - Add a server-side order/price endpoint that **recomputes every line item from live rates** at payment time.
  - **Reject any client-supplied price/total.** Treat the cart as a list of `(itemId, quantity)` only; derive all prices on the server.
  - Validate stock/availability server-side too.

### 2. [HIGH] Next.js 14.2.33 has known CVEs
- **Where:** `package.json` (`"next": "^14.2.5"`, resolved to 14.2.33), plus a moderate `postcss` advisory.
- **Problem:** `npm audit` flags DoS in Server Components, image-optimization DoS, cache poisoning, SSRF via WebSocket upgrades, and a `postcss` XSS.
- **Fix:**
  - Upgrade Next.js to a patched release. Test for breaking changes first.
  - Run `npm audit` again after upgrade; aim for 0 high/critical.
  - Periodically run `npx update-browserslist-db@latest` (build currently warns the data is 6 months old).

### 3. [MEDIUM] No HTTP security headers
- **Where:** `next.config.mjs` (no `headers()` block).
- **Problem:** Missing `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security` (HSTS), `Referrer-Policy`, `Permissions-Policy`. Confirmed absent via response headers.
- **Fix:** Add an `async headers()` block in `next.config.mjs` returning the above for all routes (clickjacking protection, MIME-sniffing protection, HTTPS enforcement, a locked-down CSP).

### 4. [MEDIUM] No rate limiting / abuse protection on API routes
- **Where:** `app/api/rates/route.ts`, `app/api/gold-rate/route.ts`, `app/api/rates/history/route.ts`.
- **Problem:** Endpoints can be hammered/scraped freely. No throttling.
- **Fix:** Add rate limiting at the edge (Cloud Run / CDN / WAF) or via Next.js middleware on `/api/*` (e.g., token-bucket per IP).

### 5. [LOW–MEDIUM] Business profit margin is shipped to the client
- **Where:** `lib/pricing.ts` — `PRICING_CONFIG` reads `NEXT_PUBLIC_MARGIN_PCT`, `NEXT_PUBLIC_MAKING_CHARGE_PCT`, `NEXT_PUBLIC_GST_PCT`.
- **Problem:** Any `NEXT_PUBLIC_*` value is inlined into the client bundle. GST and making charges are normally disclosed, but **profit margin (`MARGIN_PCT`) being public** is a business-confidentiality leak.
- **Fix:** Move `MARGIN_PCT` (and ideally all pricing math) to a **server-only** env var and compute price server-side. Ties into issue #1.

### 6. [LOW] Pricing edge case — gold item with no karat is priced as 24K
- **Where:** `lib/pricing.ts` → `purityFactor(karat)` returns `1` when `karat` is missing/`<= 0`; `data/rates/elements/gold.json` has `usesKaratPurity: true`.
- **Problem:** A `Gold` item lacking a `karat` value is priced at full purity (24K) — the most expensive. Currently safe because all sample items set `karat`, but it's a latent correctness risk.
- **Fix:** Require `karat` for karat-priced materials, or default missing karat to a conservative documented value, and validate on item ingestion.

### 7. [LOW] `limit` param in history endpoint is unbounded
- **Where:** `app/api/rates/history/route.ts` (`limit = Number(...)`), `lib/rates/store.ts` → `readHistory`.
- **Problem:** No upper bound; a negative value produces an odd `slice`. Harmless today (tiny files) but not robust.
- **Fix:** Clamp the value, e.g. `const safeLimit = Math.min(Math.max(1, limit), 1000);`.

### 8. [LOW / OPS] Deployment doesn't inject rate-API secrets; history isn't persistent
- **Where:** `cloudbuild.yaml` (`--set-env-vars` only sets `NODE_ENV`, `GOOGLE_CLOUD_PROJECT`, `NEXT_PUBLIC_BUILD_ID`).
- **Problem:**
  - `GOLDAPI_KEY` / `METALPRICE_API_KEY` are never injected, so **live rates never work in production** (the app always serves the configured fallback). Confirmed via `X-Gold-Rate-Source: fallback (live source unavailable)`.
  - Rate **history is written to the Cloud Run filesystem**, which is ephemeral — history will not persist across instances/restarts (`lib/rates/store.ts`).
- **Fix:**
  - Inject the API keys via **Secret Manager** (`--set-secrets`), never `--set-env-vars` or hardcoded values.
  - If persistent history is required, write to a database or object storage bucket instead of local disk.

---

## Recommended order of work

1. **#1** Server-side price/order verification (blocks secure real-money checkout).
2. **#2** Upgrade Next.js (closes known CVEs).
3. **#3 + #4** Security headers + rate limiting.
4. **#8** Secret Manager wiring + persistent history (so live pricing actually works in prod).
5. **#5, #6, #7** Margin confidentiality, karat defaulting, `limit` clamping (cleanups).

## How to re-run the audit later

```bash
npm run build          # compile + type check
npm run lint           # eslint
npm audit --omit=dev   # dependency CVEs

# Start prod server and fuzz the APIs
PORT=3100 npm start
curl "http://localhost:3100/api/rates/history?element=../../etc/passwd"   # expect 400
curl -D - -o /dev/null http://localhost:3100/                            # check security headers

# Confirm no secrets leak into the client bundle
grep -rl "GOLDAPI_KEY\|METALPRICE_API_KEY" .next/static   # expect: no matches
```
