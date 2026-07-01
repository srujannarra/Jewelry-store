# Chat Summary — Shri Vasavi Jewellers Project

**Compressed record of work discussed in this session**  
**Period covered:** ~April–June 2026 (conversation + local uncommitted work)  
**Generated:** 2026-06-23

---

## 1. Admin control panel — original goal

The owner needs a **separate admin link** (not part of the public storefront) to manage the business **without touching code or schema**:

| Requirement | Approach discussed |
|-------------|-------------------|
| Separate admin URL | Maps to `/admin` in production; sandbox uses `admin.html` |
| Login | Username `admin` + owner-chosen password |
| 2FA | Microsoft Authenticator (TOTP / 6-digit code) after password |
| Daily sales | Third-party ERP feed (mock in sandbox) |
| Inventory | Read, write, modify, **soft delete** products |
| Data entry | Strict product schema, Google-Sheets-style grid |
| Validation | Live per-column warnings while typing |
| Submit flow | “Are you sure?” dialog → automated schema/index/media checks |
| Security | Auth server-side in production; sandbox uses `localStorage` for testing only |

**Decision:** Build and test in **`sandbox/admin-prototype/`** first — **not integrated** into the main Next.js app until approved.

---

## 2. Sandbox prototype (built)

**Location:** `sandbox/admin-prototype/`  
**Docs:** `sandbox/README.md`, `sandbox/admin-prototype/README.md`

### Run sandbox (separate from main app)

```bash
cd sandbox/admin-prototype
python3 -m http.server 8080
```

- Public placeholder: http://localhost:8080/
- Admin panel: http://localhost:8080/admin.html

### Sandbox files

| File | Purpose |
|------|---------|
| `admin.html` | Setup, login, 2FA, dashboard UI |
| `app.js` | Auth, ERP dashboard, inventory, sheet, checker |
| `schema.js` | Product fields (mirrors `types/inventory.ts`) |
| `store.js` | `localStorage`: credentials, products, audit log |
| `validators.js` | Live validation + post-submit checks |
| `totp.js` | TOTP (RFC 6238) for Microsoft Authenticator |
| `erp.js` | Mock daily sales feed |
| `styles.css` | Styling |

### Sandbox features delivered

- First-run setup: password + QR/manual TOTP enrollment
- Login: password → authenticator code → dashboard
- Daily sales KPIs, hourly chart, top products, transactions
- ERP outage simulation toggle
- Inventory table: edit, soft-delete, restore
- Spreadsheet product entry with live red warnings per column
- Confirm dialog + automated check report before save
- Activity log
- Reset sandbox button

### Product schema (sandbox)

Fields: `id`, `sku`, `name`, `description`, `category`, `material` (element type), `karat`, `weight`, `price`, `inStock`, `images`, `videos`.

- **No password schema** in `schema.js` — login is separate in `app.js` / `store.js`
- Setup password rules: min 8 chars, must match confirm field
- Login: non-empty password only; verified via SHA-256 + salt hash

---

## 3. Password field bug (sandbox) — root cause & fix

### Symptom
User could not type in the password field; counter stayed at “Characters typed: 0”; login showed “Password is empty.”

### Root cause
Password input was **injected via JavaScript** (`mountPlainInput()` → `replaceChildren()` into `#login-pw-mount`). On some browsers/webviews, **keyboard events did not reach dynamically created inputs**.

Username field worked because it was **static HTML**.

### Fix (final)
- Replaced JS-injected mount div with **static `<input id="login-pw">` in `admin.html`**
- Wrapped login in `<form id="login-form">`
- `wirePasswordHint()` only attaches listeners; never destroys/recreates the input
- Cache-bust query param: `?v=6`

### Password field spec (for reference)

| Property | Value |
|----------|-------|
| `type` | `text` (visible; no masking in final fix) |
| `maxlength` / `pattern` | Not set — any characters allowed |
| Login validation | Non-empty after `.trim()` |
| Storage | SHA-256 hash + salt in `localStorage` |

---

## 4. Main storefront work (local / mostly uncommitted)

Git has **one commit** (`929b14e`, 2026-05-21 — initial migrate). Most work below is **local, not yet committed**.

### Live metal pricing
- `lib/rates/` + `data/rates/elements/*.json`
- Elements: gold, silver, platinum, palladium, bronze, diamond
- APIs: `/api/rates`, `/api/rates/history`, legacy `/api/gold-rate`
- Client: `lib/GoldRateContext.tsx`

### Pricing engine
- `lib/pricing.ts` — weight × rate × purity + making + margin + GST → INR

### Shopping flow
- Cart: `app/cart/`, `lib/CartContext.tsx`, `components/CartView.tsx`
- Checkout: `app/checkout/`, `components/CheckoutView.tsx` (preview only; no payment gateway)

### UI / UX
- Splash screen, Shop by Category, Navbar updates, home page refresh
- Expanded `lib/inventoryCache.ts` sample catalog

### Security audit (`SECURITY_AUDIT_FINDINGS.md`, 2026-06-02)
- **Passed:** build, lint, API fuzzing, no secrets in client bundle
- **Open:** server-side price verification before real payments, Next.js CVE upgrade, security headers, rate limiting, Secret Manager for prod deploy

---

## 5. Main site bug — blank page + “Unable to fetch gold rate”

### Symptom (user screenshot)
Navbar visible; red “Unable to fetch gold rate”; main content blank (no Welcome, no Categories).

### Root cause
Next.js dev server hit **`EMFILE: too many open files`** (macOS file watcher limit). Routes were **not discovered** — everything compiled as `/_not-found` only:

- `GET /` → **404**
- `GET /api/rates` → **404** → gold rate error in navbar
- Layout/navbar still rendered; page body showed Not Found

Terminal showed repeated: `Watchpack Error (watcher): Error: EMFILE: too many open files, watch`

### Fix applied
1. `next.config.mjs` — dev `webpack.watchOptions` with **polling** + ignore `sandbox/`, `.git/`, `node_modules`
2. `package.json` — `"dev": "WATCHPACK_POLLING=true next dev"`
3. Cleared `.next` and restarted with higher `ulimit`
4. `GoldRateDisplay.tsx` — softer message when live rate unavailable (uses cached fallback)

### Verified after fix
- Home: **200**
- `/api/rates`: **200** (cached fallback rates)
- Inventory: **200**

---

## 6. How to run the main website

```bash
cd /path/to/Jewellary__app
npm run dev
```

**http://localhost:3000**

| Page | URL |
|------|-----|
| Home | http://localhost:3000/ |
| Inventory | http://localhost:3000/inventory |
| Cart | http://localhost:3000/cart |
| Checkout | http://localhost:3000/checkout |

Hard refresh if stale: **Cmd + Shift + R** (Mac) / **Ctrl + Shift + R** (Windows)

---

## 7. What is intentionally NOT done yet

- Admin panel **not integrated** into Next.js (`/admin`, `middleware.ts`, database)
- No real ERP, cloud image uploads, or payment gateway
- No server-side auth/TOTP in production
- Sandbox credentials live in browser `localStorage` only
- Audit backlog items (server price verification, security headers, etc.) still open

---

## 8. Recommended next steps (when ready)

1. **Continue extending sandbox** (shipping rules, image upload UI, real ERP wire-up mock)
2. **Commit storefront work** in logical chunks (rates, cart, checkout, UI)
3. **Integrate admin** into Next.js with server-side auth + database
4. **Fix audit item #1** before enabling real payments (server-side price verification)

---

## 9. Key file paths quick reference

```
Jewellary__app/
├── app/                          # Next.js storefront
├── components/                   # UI components
├── lib/rates/, lib/pricing.ts    # Metal rates + pricing
├── SECURITY_AUDIT_FINDINGS.md    # Security backlog
├── sandbox/
│   ├── README.md                 # Sandbox location + run steps
│   └── admin-prototype/          # Admin prototype (isolated)
├── next.config.mjs               # Includes dev watch polling fix
└── CHAT_SUMMARY.md               # This file
```

---

## 10. Session decisions log

| Decision | Outcome |
|----------|---------|
| Admin in separate link | Yes — sandbox `admin.html`; prod target `/admin` |
| Auth: admin + password + TOTP | Implemented in sandbox |
| ERP daily sales | Mock in sandbox; real API server-side later |
| Product entry | Spreadsheet grid + live validation + confirm + auto-check |
| Integrate admin into main app now? | **No** — keep in sandbox |
| Run admin sandbox with `npm dev`? | **No** — main site only; sandbox uses `python3 -m http.server` |

---

*End of compressed chat summary.*
