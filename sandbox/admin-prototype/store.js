// =============================================================================
// STORE — localStorage persistence for the sandbox.
//   - Owner credentials (password hash + salt, TOTP secret)
//   - Products (with soft-delete)
//   - Audit log (who changed what, when)
//   - Brute-force lockout state
//
// NOTE (production): none of this belongs in the browser. Credentials and the
// TOTP secret must live server-side, products in a real database. This module
// just lets the full flow be tested without a backend.
// =============================================================================

const NS = "svj_admin_sandbox_v1";
const K = {
  settings: `${NS}:settings`,
  products: `${NS}:products`,
  audit: `${NS}:audit`,
  lockout: `${NS}:lockout`,
  session: `${NS}:session`, // sessionStorage
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ---- crypto helpers ---------------------------------------------------------
function toHex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function hashPassword(password, saltHex) {
  const enc = new TextEncoder();
  const data = enc.encode(`${saltHex}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
}
function randomSaltHex(bytes = 16) {
  return toHex(crypto.getRandomValues(new Uint8Array(bytes)));
}

// ---- audit ------------------------------------------------------------------
export function logAudit(action, detail = "") {
  const entries = read(K.audit, []);
  entries.unshift({ ts: new Date().toISOString(), action, detail });
  write(K.audit, entries.slice(0, 500));
}
export function getAudit() {
  return read(K.audit, []);
}

// ---- owner / auth -----------------------------------------------------------
export function hasOwner() {
  const s = read(K.settings, null);
  return !!(s && s.passwordHash && s.totpSecret);
}

export async function setOwner({ password, totpSecret }) {
  const salt = randomSaltHex();
  const passwordHash = await hashPassword(password, salt);
  write(K.settings, {
    username: "admin",
    passwordSalt: salt,
    passwordHash,
    totpSecret,
    createdAt: new Date().toISOString(),
  });
  logAudit("owner.enrolled", "Admin account created with password + TOTP");
}

export async function verifyPassword(password) {
  const s = read(K.settings, null);
  if (!s) return false;
  const hash = await hashPassword(password, s.passwordSalt);
  return hash === s.passwordHash;
}

export function getTotpSecret() {
  const s = read(K.settings, null);
  return s ? s.totpSecret : null;
}

// ---- lockout (basic brute-force protection demo) ----------------------------
const MAX_FAILS = 5;
const LOCK_MS = 60_000;

export function getLockout() {
  return read(K.lockout, { fails: 0, until: 0 });
}
export function isLockedOut() {
  const l = getLockout();
  return l.until > Date.now();
}
export function lockoutSecondsLeft() {
  const l = getLockout();
  return Math.max(0, Math.ceil((l.until - Date.now()) / 1000));
}
export function recordFail() {
  const l = getLockout();
  const fails = l.until > Date.now() ? l.fails : l.fails; // keep counting
  const next = { fails: fails + 1, until: 0 };
  if (next.fails >= MAX_FAILS) {
    next.until = Date.now() + LOCK_MS;
    next.fails = 0;
    logAudit("auth.lockout", `Too many failures — locked for ${LOCK_MS / 1000}s`);
  }
  write(K.lockout, next);
}
export function clearFails() {
  write(K.lockout, { fails: 0, until: 0 });
}

// ---- session ----------------------------------------------------------------
export function startSession() {
  sessionStorage.setItem(K.session, JSON.stringify({ at: Date.now() }));
}
export function isAuthed() {
  return !!sessionStorage.getItem(K.session);
}
export function endSession() {
  sessionStorage.removeItem(K.session);
}

// ---- products ---------------------------------------------------------------
export function getProducts({ includeDeleted = false } = {}) {
  const all = read(K.products, []);
  return includeDeleted ? all : all.filter((p) => !p.deleted);
}
export function getProduct(id) {
  return read(K.products, []).find((p) => p.id === id) || null;
}
export function existsId(id, exceptId = null) {
  return read(K.products, []).some((p) => p.id === id && p.id !== exceptId);
}
export function existsSku(sku, exceptId = null) {
  return read(K.products, []).some((p) => p.sku === sku && p.id !== exceptId);
}

export function upsertProduct(item) {
  const all = read(K.products, []);
  const now = new Date().toISOString();
  const idx = all.findIndex((p) => p.id === item.id);
  if (idx >= 0) {
    all[idx] = { ...all[idx], ...item, updatedAt: now };
    write(K.products, all);
    logAudit("product.update", `${item.id} (${item.name})`);
  } else {
    all.push({ ...item, deleted: false, createdAt: now, updatedAt: now });
    write(K.products, all);
    logAudit("product.create", `${item.id} (${item.name})`);
  }
}

export function softDelete(id) {
  const all = read(K.products, []);
  const p = all.find((x) => x.id === id);
  if (!p) return false;
  p.deleted = true;
  p.deletedAt = new Date().toISOString();
  p.updatedAt = p.deletedAt;
  write(K.products, all);
  logAudit("product.soft_delete", `${id} (${p.name})`);
  return true;
}
export function restore(id) {
  const all = read(K.products, []);
  const p = all.find((x) => x.id === id);
  if (!p) return false;
  p.deleted = false;
  delete p.deletedAt;
  p.updatedAt = new Date().toISOString();
  write(K.products, all);
  logAudit("product.restore", `${id} (${p.name})`);
  return true;
}

// ---- seed + reset -----------------------------------------------------------
export function seedIfEmpty() {
  if (read(K.products, null) !== null) return;
  const now = new Date().toISOString();
  const base = (o) => ({ deleted: false, createdAt: now, updatedAt: now, videos: [], ...o });
  write(K.products, [
    base({
      id: "ring-001",
      sku: "RING-001",
      name: "Classic 18K Gold Wedding Ring",
      description:
        "Elegant and timeless 18K gold wedding ring with a smooth finish. Perfect for everyday wear and special occasions.",
      category: "Rings",
      material: "Gold",
      karat: 18,
      weight: 6.5,
      price: 1850,
      inStock: true,
      images: ["/images/rings/classic-18k-gold-wedding-ring.jpg"],
    }),
    base({
      id: "silver-001",
      sku: "SILV-001",
      name: "Sterling Silver Rope Necklace",
      description: "Hand-finished sterling silver (92.5%) rope necklace, priced live from the daily silver rate.",
      category: "Necklaces",
      material: "Silver",
      weight: 18.5,
      price: 80,
      inStock: true,
      images: ["/images/necklaces/pearl-strand-necklace.jpg"],
    }),
    base({
      id: "platinum-002",
      sku: "PLAT-002",
      name: "Platinum Link Chain",
      description: "Substantial PT950 platinum link chain with a brushed finish, priced live from the daily platinum rate.",
      category: "Chains",
      material: "Platinum",
      weight: 24,
      price: 1500,
      inStock: true,
      images: ["/images/chains/box-chain-14k-gold.jpg"],
    }),
    base({
      id: "diamond-001",
      sku: "DIAM-001",
      name: "Solitaire Diamond Pendant",
      description: "A brilliant-cut solitaire diamond pendant on an 18K gold bail. Priced per carat from the diamond baseline.",
      category: "Pendants",
      material: "Diamond",
      price: 2400,
      inStock: true,
      images: ["/images/pendants/solitaire-pendant.jpg"],
    }),
    base({
      id: "bronze-001",
      sku: "BRON-001",
      name: "Antique Bronze Brooch",
      description: "Vintage-style bronze brooch with intricate detailing, priced from a maintained bronze baseline.",
      category: "Brooches",
      material: "Bronze",
      weight: 15,
      price: 40,
      inStock: false,
      images: ["/images/brooches/art-deco-brooch.jpg"],
    }),
  ]);
  logAudit("seed", "Loaded 5 sample products");
}

export function resetSandbox() {
  [K.settings, K.products, K.audit, K.lockout].forEach((k) => localStorage.removeItem(k));
  endSession();
  logAudit("sandbox.reset", "All sandbox data cleared");
}
