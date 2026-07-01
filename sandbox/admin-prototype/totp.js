// =============================================================================
// TOTP (RFC 6238) — compatible with Microsoft Authenticator / Google Authenticator
// Pure client-side using the Web Crypto API (HMAC-SHA1). No secret leaves the
// browser. Requires a secure context (https or http://localhost).
//
// NOTE (production): in a real deployment the TOTP secret + verification MUST
// live on the server, never in the browser. This sandbox keeps it client-side
// only so the 2FA flow can be tested end-to-end without a backend.
// =============================================================================

const B32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Encode(bytes) {
  let bits = 0;
  let value = 0;
  let output = "";
  for (const b of bytes) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      output += B32_ALPHABET[(value >>> bits) & 31];
    }
  }
  if (bits > 0) output += B32_ALPHABET[(value << (5 - bits)) & 31];
  return output;
}

function base32Decode(str) {
  const clean = String(str).toUpperCase().replace(/=+$/, "").replace(/\s/g, "");
  let bits = 0;
  let value = 0;
  const out = [];
  for (const ch of clean) {
    const idx = B32_ALPHABET.indexOf(ch);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      out.push((value >>> bits) & 0xff);
    }
  }
  return new Uint8Array(out);
}

/** Generate a fresh random base32 secret (default 20 bytes = 160 bits). */
export function generateSecret(byteLength = 20) {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  return base32Encode(bytes);
}

async function hotp(secretBytes, counter) {
  const buf = new ArrayBuffer(8);
  const view = new DataView(buf);
  view.setUint32(0, Math.floor(counter / 2 ** 32), false);
  view.setUint32(4, counter >>> 0, false);
  const key = await crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, buf));
  const offset = sig[sig.length - 1] & 0xf;
  const code =
    ((sig[offset] & 0x7f) << 24) |
    (sig[offset + 1] << 16) |
    (sig[offset + 2] << 8) |
    sig[offset + 3];
  return (code % 1_000_000).toString().padStart(6, "0");
}

/** Current 6-digit code for a secret (handy for self-testing). */
export async function currentCode(secret, time = Date.now()) {
  const counter = Math.floor(time / 1000 / 30);
  return hotp(base32Decode(secret), counter);
}

/** Seconds remaining in the current 30s window. */
export function secondsRemaining(time = Date.now()) {
  return 30 - (Math.floor(time / 1000) % 30);
}

/**
 * Verify a user-entered token against the secret, allowing ±`window` steps
 * (default ±1 = 30s before/after) to tolerate clock drift.
 */
export async function verifyTOTP(secret, token, window = 1, time = Date.now()) {
  const clean = String(token || "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(clean)) return false;
  const counter = Math.floor(time / 1000 / 30);
  const bytes = base32Decode(secret);
  for (let w = -window; w <= window; w++) {
    // eslint-disable-next-line no-await-in-loop
    const code = await hotp(bytes, counter + w);
    if (code === clean) return true;
  }
  return false;
}

/** Build the otpauth:// URI for QR enrollment in an authenticator app. */
export function otpauthURI({ secret, account = "admin", issuer = "SVJ Admin" }) {
  const label = encodeURIComponent(`${issuer}:${account}`);
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: "SHA1",
    digits: "6",
    period: "30",
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

/** Format a secret in groups of 4 for easy manual entry. */
export function formatSecret(secret) {
  return secret.replace(/(.{4})/g, "$1 ").trim();
}
