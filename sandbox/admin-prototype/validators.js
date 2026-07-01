// =============================================================================
// VALIDATORS
//   1. Live per-cell validation (drives the warnings under each sheet column).
//   2. Post-submit automated checker: schema re-check, indexing/uniqueness,
//      and image/video "bug" detection (format + reachability).
// =============================================================================

import { PRODUCT_SCHEMA, parseList, normalizeRow, mediaHelpers } from "./schema.js";
import { existsId, existsSku } from "./store.js";

// ---- 1. Live field validation ----------------------------------------------
/** Validate a single field. Returns an error string or null. */
export function validateField(key, row) {
  const col = PRODUCT_SCHEMA.find((c) => c.key === key);
  if (!col) return null;
  return col.validate(row[key], row) || null;
}

/** Validate every field of a row. Returns { [key]: error }. */
export function validateRow(row) {
  const errors = {};
  for (const col of PRODUCT_SCHEMA) {
    const err = col.validate(row[col.key], row);
    if (err) errors[col.key] = err;
  }
  return errors;
}

// ---- 2a. Indexing / uniqueness check ---------------------------------------
/**
 * Checks id/sku uniqueness within the submitted batch AND against the store.
 * `editingId` is the id currently being edited (excluded from store collisions).
 */
export function checkIndexing(rows, editingId = null) {
  const problems = [];
  const idСounts = {};
  const skuCounts = {};

  rows.forEach((row, i) => {
    const id = String(row.id || "").trim();
    const sku = String(row.sku || "").trim();
    if (id) idСounts[id] = (idСounts[id] || 0) + 1;
    if (sku) skuCounts[sku] = (skuCounts[sku] || 0) + 1;

    if (id && existsId(id, editingId)) {
      problems.push({ row: i, level: "error", field: "id", message: `ID "${id}" already exists in the catalog` });
    }
    if (sku && existsSku(sku, editingId)) {
      problems.push({ row: i, level: "error", field: "sku", message: `SKU "${sku}" already exists in the catalog` });
    }
  });

  rows.forEach((row, i) => {
    const id = String(row.id || "").trim();
    const sku = String(row.sku || "").trim();
    if (id && idСounts[id] > 1) {
      problems.push({ row: i, level: "error", field: "id", message: `Duplicate ID "${id}" within this batch` });
    }
    if (sku && skuCounts[sku] > 1) {
      problems.push({ row: i, level: "error", field: "sku", message: `Duplicate SKU "${sku}" within this batch` });
    }
  });

  return problems;
}

// ---- 2b. Media checks (image/video) ----------------------------------------
function loadImage(url, timeoutMs = 6000) {
  return new Promise((resolve) => {
    const img = new Image();
    let done = false;
    const finish = (ok, note) => {
      if (done) return;
      done = true;
      resolve({ ok, note });
    };
    const timer = setTimeout(() => finish(false, "timed out"), timeoutMs);
    img.onload = () => {
      clearTimeout(timer);
      finish(true, `${img.naturalWidth}×${img.naturalHeight}`);
    };
    img.onerror = () => {
      clearTimeout(timer);
      finish(false, "could not load");
    };
    img.src = url;
  });
}

/**
 * Inspect every image/video reference on a row.
 * Local "/..." assets can't be fetched in the sandbox (no server), so they are
 * reported as info, not failures. Remote http(s) images are actually loaded.
 */
async function checkRowMedia(row, rowIndex) {
  const out = [];
  const images = parseList(row.images);
  const videos = parseList(row.videos);
  const { hasImageExt, hasVideoExt, isVideoHost, isLocalOrHttp } = mediaHelpers;

  for (const url of images) {
    if (!isLocalOrHttp(url) || !hasImageExt(url)) {
      out.push({ row: rowIndex, level: "error", field: "images", message: `Bad image reference: ${url}` });
      continue;
    }
    if (url.startsWith("/")) {
      out.push({ row: rowIndex, level: "info", field: "images", message: `Local asset (not verifiable in sandbox): ${url}` });
      continue;
    }
    // eslint-disable-next-line no-await-in-loop
    const res = await loadImage(url);
    out.push({
      row: rowIndex,
      level: res.ok ? "ok" : "warning",
      field: "images",
      message: res.ok ? `Image OK (${res.note}): ${url}` : `Image unreachable (${res.note}): ${url}`,
    });
  }

  for (const url of videos) {
    const okFormat = (isLocalOrHttp(url) && hasVideoExt(url)) || isVideoHost(url);
    if (!okFormat) {
      out.push({ row: rowIndex, level: "error", field: "videos", message: `Bad video reference: ${url}` });
    } else if (isVideoHost(url)) {
      out.push({ row: rowIndex, level: "info", field: "videos", message: `External video host (not deeply verified): ${url}` });
    } else if (url.startsWith("/")) {
      out.push({ row: rowIndex, level: "info", field: "videos", message: `Local video (not verifiable in sandbox): ${url}` });
    } else {
      out.push({ row: rowIndex, level: "info", field: "videos", message: `Remote video format OK: ${url}` });
    }
  }

  if (images.length === 0) {
    out.push({ row: rowIndex, level: "error", field: "images", message: "No images attached" });
  }
  return out;
}

// ---- 2c. Orchestrator ------------------------------------------------------
/**
 * Run the full automated check suite over the submitted rows.
 * Returns { ok, hardErrors, items:[{row, schema[], indexing[], media[]}], summary }.
 * `ok` is true only when there are zero hard errors (schema/indexing/media format).
 */
export async function runAutomatedChecks(rows, editingId = null) {
  const items = [];
  const indexingProblems = checkIndexing(rows, editingId);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const schemaErrors = Object.entries(validateRow(row)).map(([field, message]) => ({
      row: i,
      level: "error",
      field,
      message,
    }));
    // eslint-disable-next-line no-await-in-loop
    const media = await checkRowMedia(row, i);
    const indexing = indexingProblems.filter((p) => p.row === i);
    items.push({ row: i, normalized: normalizeRow(row), schema: schemaErrors, indexing, media });
  }

  const all = items.flatMap((it) => [...it.schema, ...it.indexing, ...it.media]);
  const counts = {
    error: all.filter((p) => p.level === "error").length,
    warning: all.filter((p) => p.level === "warning").length,
    info: all.filter((p) => p.level === "info").length,
    ok: all.filter((p) => p.level === "ok").length,
  };
  const hardErrors = counts.error;

  return {
    ok: hardErrors === 0,
    hardErrors,
    items,
    all,
    summary: counts,
  };
}
