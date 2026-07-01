// =============================================================================
// APP — UI orchestrator for the sandbox admin panel.
// Wires together: auth (password + TOTP), ERP dashboard, inventory CRUD,
// the spreadsheet-style entry grid with live validation, and the post-submit
// automated checker.
// =============================================================================

import {
  PRODUCT_SCHEMA,
  EDITABLE_COLUMNS,
  CATEGORIES,
  normalizeRow,
} from "./schema.js";
import {
  generateSecret,
  otpauthURI,
  verifyTOTP,
  currentCode,
  formatSecret,
  secondsRemaining,
} from "./totp.js";
import * as store from "./store.js";
import { validateRow } from "./validators.js";
import { runAutomatedChecks } from "./validators.js";
import { fetchDailySales } from "./erp.js";

// ---------- tiny DOM helpers ----------
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const fmtINR = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

let toastTimer;
function toast(msg, kind = "") {
  const t = $("#toast");
  t.textContent = msg;
  t.className = `toast show ${kind}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.className = "toast"), 3200);
}

function showScreen(id) {
  ["screen-setup", "screen-login", "screen-2fa", "screen-app"].forEach((s) =>
    $(`#${s}`).classList.toggle("hidden", s !== id),
  );
}

// ---------- generic promise modal ----------
function showModal({ title, bodyHtml, buttons }) {
  return new Promise((resolve) => {
    const root = $("#modal-root");
    root.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal">
          <div class="head">${title}</div>
          <div class="body">${bodyHtml}</div>
          <div class="foot">
            ${buttons
              .map((b, i) => `<button class="btn ${b.class || ""}" data-i="${i}">${b.label}</button>`)
              .join("")}
          </div>
        </div>
      </div>`;
    const close = (val) => {
      root.innerHTML = "";
      resolve(val);
    };
    $$(".foot .btn", root).forEach((btn) =>
      btn.addEventListener("click", () => close(buttons[Number(btn.dataset.i)].value)),
    );
    $(".modal-backdrop", root).addEventListener("click", (e) => {
      if (e.target.classList.contains("modal-backdrop")) close(undefined);
    });
  });
}
const confirmDialog = (title, bodyHtml) =>
  showModal({
    title,
    bodyHtml,
    buttons: [
      { label: "Cancel", class: "ghost", value: false },
      { label: "Yes, continue", class: "primary", value: true },
    ],
  });

// =============================================================================
// AUTH
// =============================================================================
let pendingSecret = null; // secret during setup before it's saved
let countdownTimer = null;

function startCountdown(elId) {
  stopCountdown();
  const tick = () => ($(`#${elId}`).textContent = `Code refreshes in ${secondsRemaining()}s`);
  tick();
  countdownTimer = setInterval(tick, 1000);
}
function stopCountdown() {
  if (countdownTimer) clearInterval(countdownTimer);
  countdownTimer = null;
}

// ----- Setup (first run) -----
function initSetup() {
  showScreen("screen-setup");
  $("#setup-step1").classList.remove("hidden");
  $("#setup-step2").classList.add("hidden");
  wirePasswordHint(document.getElementById("setup-pw"));
  wirePasswordHint(document.getElementById("setup-pw2"));

  $("#setup-next").onclick = () => {
    const pw = document.getElementById("setup-pw")?.value || "";
    const pw2 = document.getElementById("setup-pw2")?.value || "";
    const err = $("#setup-err1");
    if (pw.length < 8) return (err.textContent = "Password must be at least 8 characters.");
    if (pw !== pw2) return (err.textContent = "Passwords do not match.");
    err.textContent = "";

    pendingSecret = generateSecret();
    $("#setup-secret").textContent = formatSecret(pendingSecret);
    const uri = otpauthURI({ secret: pendingSecret, account: "admin", issuer: "SVJ Admin" });
    if (window.QRCode) {
      window.QRCode.toCanvas($("#setup-qr"), uri, { width: 200, margin: 1 }, (e) => {
        if (e) console.warn("QR render failed", e);
      });
    } else {
      $(".qr-box").innerHTML = '<p class="small" style="color:#333">QR library offline — use the manual key below.</p>';
    }
    $("#setup-step1").classList.add("hidden");
    $("#setup-step2").classList.remove("hidden");
  };

  $("#setup-reveal").onclick = async (e) => {
    e.preventDefault();
    const code = await currentCode(pendingSecret);
    $("#setup-otp").value = code;
  };

  $("#setup-finish").onclick = async () => {
    const err = $("#setup-err2");
    const ok = await verifyTOTP(pendingSecret, $("#setup-otp").value);
    if (!ok) return (err.textContent = "That code is not valid — check the app and try again.");
    const pw = $("#setup-pw").value;
    await store.setOwner({ password: pw, totpSecret: pendingSecret });
    pendingSecret = null;
    toast("Owner account created. Please sign in.", "success");
    initLogin();
  };
}

// ----- Password field wiring (static HTML inputs — never destroy/recreate them) -----
function wirePasswordHint(input) {
  if (!input || input.dataset.wired === "1") return input;
  input.dataset.wired = "1";
  const hint = document.getElementById(`${input.id}-hint`);

  const sync = () => {
    if (!hint) return;
    const n = input.value.length;
    hint.textContent = `Characters typed: ${n}`;
    hint.classList.toggle("ok", n > 0);
  };

  // Multiple event types — some browsers/webviews only fire a subset
  ["input", "keyup", "keydown", "change", "paste", "cut", "compositionend"].forEach((ev) => {
    input.addEventListener(ev, sync);
  });
  sync();
  return input;
}

// ----- Login (step 1) -----
let loginPwInput = null;
let loginWired = false;

function initLogin() {
  showScreen("screen-login");
  $("#login-err").textContent = "";

  // Static HTML input — same as username field. Do NOT replaceChildren / recreate.
  loginPwInput = wirePasswordHint(document.getElementById("login-pw"));

  if (!loginWired) {
    loginWired = true;
    const form = document.getElementById("login-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        doLogin();
      });
    }
    $("#login-btn").onclick = (e) => {
      e.preventDefault();
      doLogin();
    };
    if (loginPwInput) {
      loginPwInput.addEventListener("input", () => {
        if ($("#login-err").textContent) $("#login-err").textContent = "";
      });
    }
  }

  $("#login-reset").onclick = async () => {
    const yes = await confirmDialog(
      "Reset sandbox account?",
      "This clears the saved password and authenticator setup in <strong>this browser</strong>. You can create a new owner account on the next screen.",
    );
    if (yes) {
      store.resetSandbox();
      toast("Sandbox reset. Set up your new password.", "success");
      initSetup();
    }
  };
}

async function doLogin() {
  const err = $("#login-err");
  if (store.isLockedOut()) {
    return (err.textContent = `Too many attempts. Try again in ${store.lockoutSecondsLeft()}s.`);
  }
  const user = $("#login-user").value.trim();
  const pwEl = document.getElementById("login-pw");
  const pw = (pwEl?.value ?? "").trim();
  if (user !== "admin") return (err.textContent = "Unknown user. The only account is 'admin'.");
  if (!pw) {
    return (err.textContent = `Password is empty (read ${pwEl?.value?.length ?? 0} chars). Click the password box, type, and watch the counter go up.`);
  }
  const ok = await store.verifyPassword(pw);
  if (!ok) {
    store.recordFail();
    return (err.textContent = "Incorrect password. Use Reset sandbox below if you forgot it.");
  }
  err.textContent = "";
  init2FA();
}

// ----- 2FA (step 2) -----
function init2FA() {
  showScreen("screen-2fa");
  const otp = $("#twofa-otp");
  otp.value = "";
  $("#twofa-err").textContent = "";
  otp.focus();
  startCountdown("twofa-count");

  $("#twofa-reveal").onclick = async (e) => {
    e.preventDefault();
    otp.value = await currentCode(store.getTotpSecret());
  };
  $("#twofa-back").onclick = () => {
    stopCountdown();
    initLogin();
  };
  $("#twofa-btn").onclick = doVerify2FA;
  otp.onkeydown = (e) => e.key === "Enter" && doVerify2FA();
}

async function doVerify2FA() {
  const err = $("#twofa-err");
  if (store.isLockedOut()) {
    return (err.textContent = `Too many attempts. Try again in ${store.lockoutSecondsLeft()}s.`);
  }
  const ok = await verifyTOTP(store.getTotpSecret(), $("#twofa-otp").value);
  if (!ok) {
    store.recordFail();
    return (err.textContent = "Invalid or expired code.");
  }
  store.clearFails();
  store.startSession();
  store.logAudit("auth.login", "Admin signed in (password + TOTP)");
  stopCountdown();
  enterApp();
}

// =============================================================================
// APP SHELL
// =============================================================================
function enterApp() {
  showScreen("screen-app");
  $$(".nav-item[data-view]").forEach((item) => {
    item.onclick = () => switchView(item.dataset.view);
  });
  $("#btn-logout").onclick = () => {
    store.endSession();
    store.logAudit("auth.logout", "Admin signed out");
    toast("Signed out.");
    initLogin();
  };
  $("#btn-reset").onclick = async () => {
    const yes = await confirmDialog(
      "Reset sandbox?",
      "This clears the owner account, all products, and the activity log in this browser. Use it to test the setup flow again.",
    );
    if (yes) {
      store.resetSandbox();
      location.reload();
    }
  };
  switchView("dashboard");
}

function switchView(view) {
  $$(".nav-item[data-view]").forEach((i) => i.classList.toggle("active", i.dataset.view === view));
  $$(".view").forEach((v) => v.classList.toggle("active", v.id === `view-${view}`));
  if (view === "dashboard") renderDashboard();
  if (view === "inventory") renderInventory();
  if (view === "sheet") renderSheetView();
  if (view === "activity") renderActivity();
}

// =============================================================================
// DASHBOARD (ERP daily sales)
// =============================================================================
async function renderDashboard() {
  const body = $("#dash-body");
  body.innerHTML = `<p class="muted">Loading sales from ERP…</p>`;
  $("#erp-refresh").onclick = renderDashboard;
  $("#erp-fail").onchange = renderDashboard;

  try {
    const data = await fetchDailySales({ simulateFailure: $("#erp-fail").checked });
    const maxRev = Math.max(1, ...data.hourly.map((h) => h.revenue));
    body.innerHTML = `
      <div class="kpi-grid">
        <div class="card kpi"><div class="label">Revenue today</div><div class="value gold">${fmtINR(data.totalRevenue)}</div></div>
        <div class="card kpi"><div class="label">Orders</div><div class="value">${data.orderCount}</div></div>
        <div class="card kpi"><div class="label">Units sold</div><div class="value">${data.unitsSold}</div></div>
        <div class="card kpi"><div class="label">Avg order value</div><div class="value">${fmtINR(data.avgOrderValue)}</div></div>
      </div>
      <div class="section-title">Revenue by hour</div>
      <div class="card">
        <div class="bars">
          ${data.hourly
            .map(
              (h) =>
                `<div class="bar-col"><div class="bar" style="height:${(h.revenue / maxRev) * 100}%" title="${fmtINR(h.revenue)}"></div><div class="h">${h.hour}</div></div>`,
            )
            .join("")}
        </div>
      </div>
      <div class="section-title">Top products today</div>
      <div class="card" style="padding:0"><table><thead><tr><th>Product</th><th>Revenue</th></tr></thead><tbody>
        ${data.topProducts.map((p) => `<tr><td>${esc(p.name)}</td><td>${fmtINR(p.revenue)}</td></tr>`).join("")}
      </tbody></table></div>
      <div class="section-title">Recent transactions</div>
      <div class="card" style="padding:0"><table><thead><tr><th>Time</th><th>Invoice</th><th>Item</th><th>Qty</th><th>Amount</th><th>Channel</th></tr></thead><tbody>
        ${data.recent
          .map(
            (r) =>
              `<tr><td>${r.time}</td><td>${esc(r.invoice)}</td><td>${esc(r.item)}</td><td>${r.qty}</td><td>${fmtINR(r.amount)}</td><td><span class="badge grey">${esc(r.channel)}</span></td></tr>`,
          )
          .join("")}
      </tbody></table></div>
      <p class="small muted" style="margin-top:14px">Source: ${esc(data.source)} · fetched ${new Date(data.fetchedAt).toLocaleTimeString()} · date ${data.date}</p>`;
  } catch (e) {
    body.innerHTML = `
      <div class="card" style="border-color:#5b2b2b">
        <div class="section-title" style="margin-top:0;color:var(--red)">Could not load sales</div>
        <p class="muted">${esc(e.message)}</p>
        <button class="btn small" id="erp-retry">Retry</button>
      </div>`;
    $("#erp-retry").onclick = renderDashboard;
  }
}

// =============================================================================
// INVENTORY (read / soft delete / restore / edit)
// =============================================================================
function renderInventory() {
  $("#inv-new").onclick = () => startNewSheet();
  $("#inv-search").oninput = paintInventory;
  $("#inv-show-deleted").onchange = paintInventory;
  paintInventory();
}

function paintInventory() {
  const q = $("#inv-search").value.trim().toLowerCase();
  const showDeleted = $("#inv-show-deleted").checked;
  const items = store.getProducts({ includeDeleted: true }).filter((p) => {
    if (!showDeleted && p.deleted) return false;
    if (!q) return true;
    return [p.id, p.sku, p.name].some((f) => String(f).toLowerCase().includes(q));
  });

  $("#inv-body").innerHTML = items.length
    ? `<table><thead><tr>
         <th>ID</th><th>Name</th><th>Category</th><th>Element</th><th>Karat</th><th>Weight</th><th>Stock</th><th>Status</th><th></th>
       </tr></thead><tbody>
       ${items
         .map(
           (p) => `<tr>
             <td>${esc(p.id)}</td>
             <td>${esc(p.name)}</td>
             <td>${esc(p.category)}</td>
             <td>${esc(p.material)}</td>
             <td>${p.karat ?? "—"}</td>
             <td>${p.weight ? p.weight + " g" : "—"}</td>
             <td>${p.inStock ? '<span class="badge green">In stock</span>' : '<span class="badge red">Out</span>'}</td>
             <td>${p.deleted ? '<span class="badge grey">Deleted</span>' : '<span class="badge green">Active</span>'}</td>
             <td><div class="row">
               ${p.deleted
                 ? `<button class="btn small" data-restore="${esc(p.id)}">Restore</button>`
                 : `<button class="btn small" data-edit="${esc(p.id)}">Edit</button>
                    <button class="btn small danger" data-del="${esc(p.id)}">Delete</button>`}
             </div></td>
           </tr>`,
         )
         .join("")}
       </tbody></table>`
    : `<p class="muted" style="padding:18px">No products found.</p>`;

  $$("[data-edit]").forEach((b) => (b.onclick = () => startEditSheet(b.dataset.edit)));
  $$("[data-del]").forEach(
    (b) =>
      (b.onclick = async () => {
        const yes = await confirmDialog(
          "Soft-delete product?",
          `This hides <strong>${esc(b.dataset.del)}</strong> from the storefront. It can be restored later (nothing is permanently removed).`,
        );
        if (yes) {
          store.softDelete(b.dataset.del);
          toast("Product soft-deleted.", "success");
          paintInventory();
        }
      }),
  );
  $$("[data-restore]").forEach(
    (b) =>
      (b.onclick = () => {
        store.restore(b.dataset.restore);
        toast("Product restored.", "success");
        paintInventory();
      }),
  );
}

// =============================================================================
// SHEET (spreadsheet-style entry with live validation)
// =============================================================================
let sheetRows = [];
let editingId = null;

function blankRow() {
  const r = {};
  EDITABLE_COLUMNS.forEach((c) => (r[c.key] = c.type === "boolean" ? "true" : ""));
  return r;
}

function startNewSheet() {
  editingId = null;
  sheetRows = [blankRow()];
  $("#sheet-title").textContent = "Add products";
  switchView("sheet");
}

function startEditSheet(id) {
  const p = store.getProduct(id);
  if (!p) return;
  editingId = id;
  sheetRows = [
    {
      id: p.id,
      sku: p.sku,
      name: p.name,
      description: p.description,
      category: p.category,
      material: p.material,
      karat: p.karat ?? "",
      weight: p.weight ?? "",
      price: p.price ?? "",
      inStock: p.inStock ? "true" : "false",
      images: (p.images || []).join(", "),
      videos: (p.videos || []).join(", "),
    },
  ];
  $("#sheet-title").textContent = `Edit ${p.id}`;
  switchView("sheet");
}

function renderSheetView() {
  if (sheetRows.length === 0) {
    editingId = null;
    sheetRows = [blankRow()];
    $("#sheet-title").textContent = "Add products";
  }
  buildSheet();
}

function buildSheet() {
  // header
  $("#sheet-head").innerHTML = `<tr>
    <th class="rownum">#</th>
    ${EDITABLE_COLUMNS.map(
      (c) => `<th>${esc(c.label)}<div class="col-help">${esc(c.help)}</div></th>`,
    ).join("")}
    <th></th></tr>`;

  // body
  $("#sheet-body").innerHTML = sheetRows.map((row, i) => renderSheetRow(row, i)).join("");
  wireSheetEvents();

  $("#sheet-add-row").onclick = () => {
    sheetRows.push(blankRow());
    buildSheet();
  };
  $("#sheet-cancel").onclick = () => switchView("inventory");
  $("#sheet-submit").onclick = submitSheet;

  sheetRows.forEach((_, i) => paintRow(i));
  updateSheetStatus();
}

function cellInput(col, row, i) {
  const val = row[col.key] ?? "";
  const common = `data-row="${i}" data-key="${col.key}"`;
  if (col.type === "textarea" || col.type === "list") {
    return `<textarea ${common} class="js-cell" placeholder="${esc(col.type === "list" ? "comma or new line separated" : "")}">${esc(val)}</textarea>`;
  }
  if (col.type === "number") {
    return `<input ${common} class="js-cell" type="number" step="any" value="${esc(val)}" />`;
  }
  if (col.type === "select") {
    const opts = (col.options || []).map((o) => `<option value="${esc(o)}" ${String(val) === String(o) ? "selected" : ""}>${o === "" ? "—" : esc(o)}</option>`);
    return `<select ${common} class="js-cell"><option value="" ${val === "" ? "selected" : ""}>—</option>${opts.join("")}</select>`;
  }
  if (col.type === "boolean") {
    return `<select ${common} class="js-cell">
      <option value="true" ${val === "true" ? "selected" : ""}>Yes</option>
      <option value="false" ${val === "false" ? "selected" : ""}>No</option></select>`;
  }
  return `<input ${common} class="js-cell" type="text" value="${esc(val)}" />`;
}

function renderSheetRow(row, i) {
  return `<tr data-rowtr="${i}">
    <td class="rownum">${i + 1}</td>
    ${EDITABLE_COLUMNS.map(
      (c) => `<td class="cell ${c.type === "textarea" || c.type === "list" ? "wide" : ""}" data-cellfor="${i}-${c.key}">
        ${cellInput(c, row, i)}
        <div class="cell-warn" data-warn="${i}-${c.key}"></div>
      </td>`,
    ).join("")}
    <td>${sheetRows.length > 1 ? `<button class="btn small danger" data-rmrow="${i}">✕</button>` : ""}</td>
  </tr>`;
}

function wireSheetEvents() {
  $$(".js-cell").forEach((el) => {
    const handler = () => {
      const i = Number(el.dataset.row);
      sheetRows[i][el.dataset.key] = el.value;
      // material change affects karat/weight rules → repaint whole row
      paintRow(i);
      updateSheetStatus();
    };
    el.addEventListener("input", handler);
    el.addEventListener("change", handler);
  });
  $$("[data-rmrow]").forEach(
    (b) =>
      (b.onclick = () => {
        sheetRows.splice(Number(b.dataset.rmrow), 1);
        buildSheet();
      }),
  );
}

/** Schema errors + live uniqueness for one row. Returns { key: message }. */
function rowIssues(i) {
  const row = sheetRows[i];
  const issues = { ...validateRow(row) };
  const id = String(row.id || "").trim();
  const sku = String(row.sku || "").trim();
  // duplicates within the sheet
  const dupId = id && sheetRows.some((r, j) => j !== i && String(r.id || "").trim() === id);
  const dupSku = sku && sheetRows.some((r, j) => j !== i && String(r.sku || "").trim() === sku);
  if (!issues.id && dupId) issues.id = "Duplicate ID within this sheet";
  if (!issues.sku && dupSku) issues.sku = "Duplicate SKU within this sheet";
  // collisions with the catalog (ignore the row being edited)
  if (!issues.id && id && store.existsId(id, editingId)) issues.id = "ID already exists in the catalog";
  if (!issues.sku && sku && store.existsSku(sku, editingId)) issues.sku = "SKU already exists in the catalog";
  return issues;
}

function paintRow(i) {
  const issues = rowIssues(i);
  EDITABLE_COLUMNS.forEach((c) => {
    const cell = $(`[data-cellfor="${i}-${c.key}"]`);
    const warn = $(`[data-warn="${i}-${c.key}"]`);
    if (!cell || !warn) return;
    const msg = issues[c.key];
    cell.classList.toggle("invalid", !!msg);
    warn.textContent = msg || "";
  });
}

function totalIssues() {
  return sheetRows.reduce((sum, _, i) => sum + Object.keys(rowIssues(i)).length, 0);
}

function updateSheetStatus() {
  const n = totalIssues();
  const pill = $("#sheet-status");
  if (n === 0) {
    pill.className = "valid-pill ok";
    pill.textContent = `✓ ${sheetRows.length} row(s) valid`;
    $("#sheet-submit").disabled = false;
  } else {
    pill.className = "valid-pill bad";
    pill.textContent = `${n} issue(s) to fix`;
    $("#sheet-submit").disabled = true;
  }
}

// ----- submit: confirm → automated checks → commit -----
async function submitSheet() {
  sheetRows.forEach((_, i) => paintRow(i));
  if (totalIssues() > 0) {
    toast("Fix the highlighted fields first.", "error");
    return;
  }

  const summary = sheetRows
    .map((r) => `<li><strong>${esc(r.id)}</strong> — ${esc(r.name)} (${esc(r.category)} · ${esc(r.material)})</li>`)
    .join("");
  const verb = editingId ? "update" : "add";
  const yes = await confirmDialog(
    "Are you sure?",
    `You are about to <strong>${verb}</strong> ${sheetRows.length} product(s):<ul>${summary}</ul>
     An automated check (schema, indexing &amp; media) will run next.`,
  );
  if (!yes) return;

  await runChecksAndMaybeCommit();
}

async function runChecksAndMaybeCommit() {
  const root = $("#modal-root");
  root.innerHTML = `<div class="modal-backdrop"><div class="modal"><div class="head">Running automated checks…</div>
    <div class="body"><p class="muted">Validating schema, checking indexes, and inspecting images/videos…</p></div></div></div>`;

  const report = await runAutomatedChecks(sheetRows, editingId);
  renderCheckReport(report);
}

function levelDot(level) {
  const icon = { error: "✕", warning: "!", info: "i", ok: "✓" }[level] || "i";
  return `<span class="dot-i ${level}">${icon}</span>`;
}

async function renderCheckReport(report) {
  const itemBlocks = report.items
    .map((it) => {
      const lines = [...it.schema, ...it.indexing, ...it.media];
      const body = lines.length
        ? lines.map((l) => `<div class="check-line">${levelDot(l.level)}<div><strong>${esc(l.field)}:</strong> ${esc(l.message)}</div></div>`).join("")
        : `<div class="check-line">${levelDot("ok")}<div>All checks passed.</div></div>`;
      return `<div class="check-group-title">Row ${it.row + 1} — ${esc(it.normalized.id || "(no id)")}</div>${body}`;
    })
    .join("");

  const s = report.summary;
  const summaryHtml = `<div class="row wrap" style="gap:8px;margin-bottom:6px">
      <span class="badge red">${s.error} errors</span>
      <span class="badge grey">${s.warning} warnings</span>
      <span class="badge grey">${s.info} info</span>
      <span class="badge green">${s.ok} ok</span>
    </div>`;

  const buttons = report.ok
    ? [
        { label: "Back", class: "ghost", value: "cancel" },
        { label: `Confirm & save ${sheetRows.length} product(s)`, class: "primary", value: "commit" },
      ]
    : [{ label: "Close & fix", class: "primary", value: "cancel" }];

  const note = report.ok
    ? `<p class="ok-text">No blocking issues found. Review media notes below, then save.</p>`
    : `<p class="error-text">${report.hardErrors} blocking issue(s) must be fixed before saving.</p>`;

  const choice = await showModal({
    title: "Automated check results",
    bodyHtml: `${summaryHtml}${note}<div style="max-height:42vh;overflow:auto;margin-top:8px">${itemBlocks}</div>`,
    buttons,
  });

  if (choice === "commit") commitSheet();
}

function commitSheet() {
  sheetRows.forEach((row) => store.upsertProduct(normalizeRow(row)));
  toast(`Saved ${sheetRows.length} product(s).`, "success");
  editingId = null;
  sheetRows = [blankRow()];
  switchView("inventory");
}

// =============================================================================
// ACTIVITY LOG
// =============================================================================
function renderActivity() {
  const entries = store.getAudit();
  $("#activity-body").innerHTML = entries.length
    ? `<table><thead><tr><th>When</th><th>Action</th><th>Detail</th></tr></thead><tbody>
       ${entries
         .map(
           (e) =>
             `<tr><td>${new Date(e.ts).toLocaleString()}</td><td><span class="badge grey">${esc(e.action)}</span></td><td>${esc(e.detail)}</td></tr>`,
         )
         .join("")}
       </tbody></table>`
    : `<p class="muted" style="padding:18px">No activity yet.</p>`;
}

// =============================================================================
// BOOT
// =============================================================================
function boot() {
  if (!window.isSecureContext) {
    toast("Open via http://localhost (not file://) so 2FA crypto works.", "error");
  }
  store.seedIfEmpty();
  // Wire static password fields once DOM is ready
  wirePasswordHint(document.getElementById("login-pw"));
  wirePasswordHint(document.getElementById("setup-pw"));
  wirePasswordHint(document.getElementById("setup-pw2"));
  if (!store.hasOwner()) initSetup();
  else if (store.isAuthed()) enterApp();
  else initLogin();
}

boot();
