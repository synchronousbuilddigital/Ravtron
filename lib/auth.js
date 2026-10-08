import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

// ─── HMAC-SHA256 Cookie Signing ───────────────────────────────────────────────

const COOKIE_SECRET = process.env.COOKIE_SECRET || (process.env.NODE_ENV === "production" ? null : "fallback-dev-secret-change-in-prod");

if (process.env.NODE_ENV === "production" && (!COOKIE_SECRET || COOKIE_SECRET === "fallback-dev-secret-change-in-prod")) {
  throw new Error("FATAL SECURITY ERROR: COOKIE_SECRET environment variable must be set to a secure, random string in production.");
}

/**
 * Signs a payload string with HMAC-SHA256 and returns `payload.signature`.
 * @param {string} payload - The URL-encoded JSON string to sign.
 * @returns {string} - Signed cookie value: `<payload>.<hex-signature>`
 */
function signCookieValue(payload) {
  if (!COOKIE_SECRET) {
    throw new Error("Cannot sign session cookie: COOKIE_SECRET is not configured.");
  }
  const sig = createHmac("sha256", COOKIE_SECRET).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

/**
 * Verifies and parses a signed cookie value. Returns null on tampering.
 * @param {string} signed - The full signed cookie string `<payload>.<hex-signature>`
 * @returns {Object|null} - Parsed session object or null if invalid/tampered.
 */
function verifyAndParseCookie(signed) {
  if (!signed || typeof signed !== "string") return null;

  const lastDot = signed.lastIndexOf(".");
  if (lastDot === -1) return null;

  const payload = signed.slice(0, lastDot);
  const receivedSig = signed.slice(lastDot + 1);

  // Recompute expected signature
  const expectedSig = createHmac("sha256", COOKIE_SECRET).update(payload).digest("hex");

  // Constant-time comparison to prevent timing attacks
  try {
    const receivedBuf = Buffer.from(receivedSig, "hex");
    const expectedBuf = Buffer.from(expectedSig, "hex");

    if (receivedBuf.length !== expectedBuf.length) return null;
    if (!timingSafeEqual(receivedBuf, expectedBuf)) return null;
  } catch {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(payload));
  } catch {
    return null;
  }
}

// ─── Cookie Options Helper ────────────────────────────────────────────────────

/**
 * Returns the standard cookie options for the session cookie.
 * @param {Request} request - Incoming Next.js request (for detecting HTTPS).
 * @returns {Object} - Cookie options object.
 */
export function getSessionCookieOptions(request) {
  const isProduction = process.env.NODE_ENV === "production";
  const forwardedProto = request?.headers?.get?.("x-forwarded-proto");
  const isHttps = forwardedProto === "https" || request?.url?.startsWith?.("https://");
  return {
    httpOnly: true,
    secure: isProduction && isHttps,
    path: "/",
    maxAge: 345600, // 4 days
    sameSite: "lax",
  };
}

// ─── Session Read/Write API ──────────────────────────────────────────────────

/**
 * Creates and sets a signed session cookie.
 * @param {Object} cookieStore - Awaited cookies() store.
 * @param {Object} sessionUser - Plain session object to store.
 * @param {Object} options - Cookie options from getSessionCookieOptions().
 */
export function setSessionCookie(cookieStore, sessionUser, options) {
  const payload = encodeURIComponent(JSON.stringify(sessionUser));
  const signedValue = signCookieValue(payload);
  cookieStore.set({
    name: "ravtron_session",
    value: signedValue,
    ...options,
  });
}

/**
 * Reads and verifies the signed session cookie from Next.js server context.
 * Returns null if cookie is missing, tampered, or invalid.
 * @returns {Object|null}
 */
export async function getSession() {
  try {
    const cookieStore = await cookies();
    const rawValue = cookieStore.get("ravtron_session")?.value;
    if (!rawValue) return null;
    return verifyAndParseCookie(rawValue);
  } catch (error) {
    console.error("Error retrieving user session:", error);
    return null;
  }
}

/**
 * Reads and verifies the session from a raw cookie string (for middleware Edge use).
 * @param {string} rawCookieValue - The raw cookie value string.
 * @returns {Object|null}
 */
export function parseSessionFromCookie(rawCookieValue) {
  return verifyAndParseCookie(rawCookieValue);
}

// ─── Auth Helpers ─────────────────────────────────────────────────────────────

export async function verifyAdmin() {
  const session = await getSession();
  return session && session.role === "Administrator";
}

export async function verifyUser(email) {
  const session = await getSession();
  if (!session) return false;
  if (session.role === "Administrator") return true;
  return session.email && session.email.toLowerCase() === email.toLowerCase();
}
