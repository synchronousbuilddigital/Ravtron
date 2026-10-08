/**
 * Edge-compatible HMAC-SHA256 session cookie verification for Next.js Middleware.
 * Uses the Web Crypto API (available in Edge Runtime — no Node.js crypto needed).
 */

const COOKIE_SECRET = process.env.COOKIE_SECRET || (process.env.NODE_ENV === "production" ? null : "fallback-dev-secret-change-in-prod");

async function hmacSign(payload) {
  if (!COOKIE_SECRET) {
    console.error("FATAL: COOKIE_SECRET is missing in production Edge environment.");
    return "";
  }
  const encoder = new TextEncoder();
  const keyData = encoder.encode(COOKIE_SECRET);
  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function hmacVerify(payload, receivedSig) {
  const expectedSig = await hmacSign(payload);
  if (receivedSig.length !== expectedSig.length) return false;
  // Constant-time comparison
  let mismatch = 0;
  for (let i = 0; i < expectedSig.length; i++) {
    mismatch |= expectedSig.charCodeAt(i) ^ receivedSig.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Verifies HMAC signature and parses session from a raw signed cookie value.
 * Safe for Edge Runtime (middleware). Returns null on tampering or parse error.
 * @param {string} signed - The raw cookie value: `<payload>.<hex-sig>`
 * @returns {Object|null}
 */
export async function parseSessionFromCookieEdge(signed) {
  if (!signed || typeof signed !== "string") return null;

  const lastDot = signed.lastIndexOf(".");
  if (lastDot === -1) return null;

  const payload = signed.slice(0, lastDot);
  const receivedSig = signed.slice(lastDot + 1);

  const valid = await hmacVerify(payload, receivedSig);
  if (!valid) return null;

  try {
    return JSON.parse(decodeURIComponent(payload));
  } catch {
    return null;
  }
}
