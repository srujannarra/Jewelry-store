# Sandbox — Admin Control Panel Prototype

This folder holds **experiments that are not part of the main Next.js app**. Nothing here is wired into production routes, build, or deploy.

---

## Location

From the repository root:

```
Jewellary__app/
└── sandbox/
    └── admin-prototype/     ← owner admin panel prototype (this is what you run)
        ├── index.html       public storefront placeholder
        ├── admin.html       admin login + dashboard
        ├── app.js           UI logic
        ├── schema.js        product field schema
        ├── store.js         localStorage persistence
        ├── validators.js    live + post-submit checks
        ├── totp.js          Microsoft Authenticator (TOTP)
        ├── erp.js           mock daily-sales feed
        ├── styles.css
        └── README.md        feature details for the prototype
```

**Absolute path (example):**

`/Users/sujju/Desktop/Git/Jewellary__app/sandbox/admin-prototype`

---

## How to run

A local HTTP server is **required**. Do not open the HTML files directly (`file://`) — TOTP and Web Crypto need `http://localhost`.

### Option A — Python (recommended)

From the **repository root**:

```bash
cd sandbox/admin-prototype
python3 -m http.server 8080
```

Or in one line from anywhere:

```bash
python3 -m http.server 8080 --directory /path/to/Jewellary__app/sandbox/admin-prototype
```

### Option B — npx serve

```bash
cd sandbox/admin-prototype
npx serve -l 8080
```

### Open in the browser

| Page | URL |
|------|-----|
| Public placeholder | http://localhost:8080/ |
| Admin panel (direct) | http://localhost:8080/admin.html |

Use **Chrome or Safari** for the most reliable keyboard input. If the page looks stale, hard refresh: **Cmd + Shift + R** (Mac) or **Ctrl + Shift + R** (Windows).

### Stop the server

In the terminal where the server is running: **Ctrl + C**

---

## First-time use

1. Open **http://localhost:8080/admin.html**
2. **Setup** (first visit only): choose a password (≥ 8 characters) → set up **Microsoft Authenticator** (scan QR or enter manual key) → confirm with the 6-digit code
3. **Login**: username `admin` + your password → authenticator code → dashboard
4. No phone for testing? Use **“Sandbox helper: reveal current code”** on the 2FA screen

Forgot password? On the login screen click **“Forgot password? Reset sandbox & set up again”** (clears data in **this browser only**).

---

## What’s in the prototype

- Separate admin link (`admin.html`), not the public storefront
- Password + Microsoft Authenticator (TOTP) login
- Daily sales dashboard (mock ERP)
- Inventory: read, add, edit, soft-delete, restore
- Spreadsheet-style product entry with live schema validation
- “Are you sure?” confirm + automated checks before save
- Activity log

All data (password hash, products, TOTP secret) is stored in **this browser’s `localStorage`** only.

---

## Not integrated

This sandbox is **intentionally isolated**:

- No changes to `app/`, `components/`, or `middleware.ts`
- Not included in `npm run build` or Cloud Run deploy
- Listed in `.eslintignore` and `.prettierignore` at repo root

When you are ready to move features into the real app, that will be a separate integration step.

---

## More detail

See [admin-prototype/README.md](./admin-prototype/README.md) for file-by-file breakdown, test script, and production migration notes.
