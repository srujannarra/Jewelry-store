# Admin Control Panel — Sandbox Prototype

> **Location & run steps:** see the parent [sandbox README](../README.md).

A **self-contained prototype** of the owner admin panel. Plain HTML + ES modules + Web Crypto; data in `localStorage`. **Not connected to the main Next.js app.**

---

## Quick run

```bash
cd sandbox/admin-prototype
python3 -m http.server 8080
```

Open: **http://localhost:8080/admin.html**

---

## What it demonstrates

| Feature | Implementation |
|---------|----------------|
| Admin on a **separate link** | `index.html` → `admin.html` |
| Username `admin` + owner password | Setup screen; SHA-256 + salt in `store.js` |
| **Microsoft Authenticator** | TOTP in `totp.js`; QR on setup |
| **Daily sales (ERP)** | Mock feed in `erp.js` |
| **Inventory CRUD + soft delete** | `store.js` + inventory UI in `app.js` |
| **Product schema / sheet entry** | `schema.js` mirrors `types/inventory.ts` |
| **Live column validation** | `validators.js` |
| **Confirm + automated checks** | Modal + `runAutomatedChecks()` in `app.js` |

---

## Files

| File | Role |
|------|------|
| `index.html` | Public storefront placeholder |
| `admin.html` | Setup, login, 2FA, dashboard shell |
| `app.js` | UI orchestrator |
| `schema.js` | Product field definitions |
| `store.js` | localStorage: auth, products, audit log |
| `validators.js` | Live + post-submit validation |
| `totp.js` | TOTP generate/verify |
| `erp.js` | Mock ERP daily sales |
| `styles.css` | Styles |

---

## Test checklist (~5 min)

1. Setup → password → Authenticator → finish
2. Login → password → 6-digit code → dashboard
3. **Daily sales** — toggle “Simulate ERP outage”
4. **Inventory** — edit, soft-delete, restore
5. **Add / edit products** — trigger red warnings, fix, submit, confirm, save
6. **Activity log** — verify entries
7. **Reset sandbox** (sidebar) to rerun setup

---

## Sandbox limitations

- Credentials and products live in the browser only
- No real ERP, database, or image upload backend
- TOTP secret is client-side (for testing only)

See [sandbox/README.md](../README.md) for isolation from the main app and future production notes.
