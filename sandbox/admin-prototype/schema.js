// =============================================================================
// PRODUCT SCHEMA  (mirrors the real app: types/inventory.ts + lib/rates/*)
// -----------------------------------------------------------------------------
// This is the single source of truth that drives BOTH the entry sheet and the
// validators. Keep it in sync with the production InventoryItem interface.
//   id, name, description, category, price, weight?, material, karat?,
//   images[], videos?, inStock, sku, createdAt, updatedAt
// =============================================================================

export const CATEGORIES = [
  "Rings",
  "Necklaces",
  "Earrings",
  "Bracelets",
  "Pendants",
  "Chains",
  "Bangles",
  "Anklets",
  "Brooches",
  "Watches",
];

// "Element type" — matches lib/rates/elements/*.json
export const MATERIALS = [
  "Gold",
  "Silver",
  "Platinum",
  "Palladium",
  "Bronze",
  "Diamond",
];

// Karat applies only to Gold (lib/pricing.ts purityFactor / gold.json usesKaratPurity)
export const KARATS = [14, 18, 22, 24];

// Gram-priced metals (lib/rates config unit === "gram"). Diamond is per-carat,
// so weight-in-grams is not used for live pricing.
export const GRAM_BASED = ["Gold", "Silver", "Platinum", "Palladium", "Bronze"];

const IMAGE_EXT = ["jpg", "jpeg", "png", "webp", "avif", "gif"];
const VIDEO_EXT = ["mp4", "webm", "mov", "m4v"];
const VIDEO_HOSTS = ["youtube.com", "youtu.be", "vimeo.com"];

// ---- small helpers ----------------------------------------------------------
export const isBlank = (v) => v === undefined || v === null || String(v).trim() === "";

export function parseList(value) {
  if (Array.isArray(value)) return value.filter((x) => !isBlank(x)).map((x) => String(x).trim());
  if (isBlank(value)) return [];
  return String(value)
    .split(/[\n,]/)
    .map((x) => x.trim())
    .filter((x) => x.length > 0);
}

function hasImageExt(url) {
  const clean = url.split("?")[0].toLowerCase();
  return IMAGE_EXT.some((ext) => clean.endsWith("." + ext));
}
function hasVideoExt(url) {
  const clean = url.split("?")[0].toLowerCase();
  return VIDEO_EXT.some((ext) => clean.endsWith("." + ext));
}
function isVideoHost(url) {
  return VIDEO_HOSTS.some((h) => url.toLowerCase().includes(h));
}
function isLocalOrHttp(url) {
  return url.startsWith("/") || /^https?:\/\//i.test(url);
}

// =============================================================================
// COLUMN DEFINITIONS
// Each column: { key, label, help, type, options?, auto?, validate(value,row) }
// validate() returns an error string (blocks submit) or null.
// =============================================================================
export const PRODUCT_SCHEMA = [
  {
    key: "id",
    label: "ID",
    help: "Unique, lowercase, hyphenated. e.g. ring-001",
    type: "text",
    unique: true,
    validate(v) {
      if (isBlank(v)) return "ID is required";
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v.trim()))
        return "Lowercase letters/numbers/hyphens only (e.g. ring-001)";
      return null;
    },
  },
  {
    key: "sku",
    label: "SKU",
    help: "Unique stock code, UPPERCASE. e.g. RING-001",
    type: "text",
    unique: true,
    validate(v) {
      if (isBlank(v)) return "SKU is required";
      if (!/^[A-Z0-9]+(?:-[A-Z0-9]+)*$/.test(v.trim()))
        return "UPPERCASE letters/numbers/hyphens only (e.g. RING-001)";
      return null;
    },
  },
  {
    key: "name",
    label: "Name",
    help: "Product title shown to customers",
    type: "text",
    validate(v) {
      if (isBlank(v)) return "Name is required";
      const n = v.trim().length;
      if (n < 3) return "Too short (min 3 characters)";
      if (n > 120) return "Too long (max 120 characters)";
      return null;
    },
  },
  {
    key: "description",
    label: "Description",
    help: "Customer-facing description",
    type: "textarea",
    validate(v) {
      if (isBlank(v)) return "Description is required";
      const n = v.trim().length;
      if (n < 10) return "Too short (min 10 characters)";
      if (n > 1000) return "Too long (max 1000 characters)";
      return null;
    },
  },
  {
    key: "category",
    label: "Category",
    help: "One of the storefront categories",
    type: "select",
    options: CATEGORIES,
    validate(v) {
      if (isBlank(v)) return "Category is required";
      if (!CATEGORIES.includes(v)) return "Not a valid category";
      return null;
    },
  },
  {
    key: "material",
    label: "Element type",
    help: "Metal / element used for live pricing",
    type: "select",
    options: MATERIALS,
    validate(v) {
      if (isBlank(v)) return "Element type is required";
      if (!MATERIALS.includes(v)) return "Not a valid element type";
      return null;
    },
  },
  {
    key: "karat",
    label: "Karat",
    help: "Only for Gold (14/18/22/24). Leave blank otherwise.",
    type: "select",
    options: ["", ...KARATS.map(String)],
    validate(v, row) {
      const isGold = row.material === "Gold";
      if (isGold) {
        if (isBlank(v)) return "Karat is required for Gold";
        if (!KARATS.includes(Number(v))) return "Must be 14, 18, 22 or 24";
      } else if (!isBlank(v)) {
        return "Karat only applies to Gold — leave blank";
      }
      return null;
    },
  },
  {
    key: "weight",
    label: "Weight (g)",
    help: "Grams. Required for metals priced by weight.",
    type: "number",
    validate(v, row) {
      const gramBased = GRAM_BASED.includes(row.material);
      if (gramBased) {
        if (isBlank(v)) return "Weight is required for " + row.material;
      }
      if (!isBlank(v)) {
        const n = Number(v);
        if (!Number.isFinite(n)) return "Must be a number";
        if (n <= 0) return "Must be greater than 0";
        if (n > 100000) return "Unrealistically large";
      }
      return null;
    },
  },
  {
    key: "price",
    label: "Base price (USD)",
    help: "Fallback price used when no live metal rate applies",
    type: "number",
    validate(v) {
      if (isBlank(v)) return "Base price is required";
      const n = Number(v);
      if (!Number.isFinite(n)) return "Must be a number";
      if (n <= 0) return "Must be greater than 0";
      if (n > 10000000) return "Unrealistically large";
      return null;
    },
  },
  {
    key: "inStock",
    label: "In stock",
    help: "Is this item available to buy?",
    type: "boolean",
    validate(v) {
      if (v === true || v === false || v === "true" || v === "false") return null;
      return "Choose Yes or No";
    },
  },
  {
    key: "images",
    label: "Images",
    help: "Comma/newline separated. Path (/images/...) or URL. jpg/png/webp…",
    type: "list",
    validate(v) {
      const list = parseList(v);
      if (list.length === 0) return "At least 1 image is required";
      const bad = list.filter((u) => !isLocalOrHttp(u) || !hasImageExt(u));
      if (bad.length) return `Invalid image entry: ${bad[0]} (need a path/URL ending in ${IMAGE_EXT.join("/")})`;
      return null;
    },
  },
  {
    key: "videos",
    label: "Videos",
    help: "Optional. mp4/webm path/URL or YouTube/Vimeo link.",
    type: "list",
    validate(v) {
      const list = parseList(v);
      if (list.length === 0) return null; // optional
      const bad = list.filter((u) => !((isLocalOrHttp(u) && hasVideoExt(u)) || isVideoHost(u)));
      if (bad.length) return `Invalid video entry: ${bad[0]} (need mp4/webm or YouTube/Vimeo)`;
      return null;
    },
  },
];

// Columns the owner edits (createdAt/updatedAt are auto-managed).
export const EDITABLE_COLUMNS = PRODUCT_SCHEMA;

// Build a normalized item from a raw sheet row (correct types for storage).
export function normalizeRow(row) {
  return {
    id: String(row.id || "").trim(),
    sku: String(row.sku || "").trim(),
    name: String(row.name || "").trim(),
    description: String(row.description || "").trim(),
    category: row.category || "",
    material: row.material || "",
    karat: isBlank(row.karat) ? undefined : Number(row.karat),
    weight: isBlank(row.weight) ? undefined : Number(row.weight),
    price: isBlank(row.price) ? 0 : Number(row.price),
    inStock: row.inStock === true || row.inStock === "true",
    images: parseList(row.images),
    videos: parseList(row.videos),
  };
}

export const mediaHelpers = { hasImageExt, hasVideoExt, isVideoHost, isLocalOrHttp };
