// Why Origin checking works:
//   - Browsers send the `Origin` header on all cross-origin fetch() requests.
//   - A malicious site at evil.com CANNOT spoof the Origin header (browser enforced).
//   - Same-origin requests (from our own frontend) always pass this check.
//   - Combined with SameSite=Lax cookies, this provides defense-in-depth CSRF protection.
//
// When is this needed?
//   - All state-changing requests (POST, PUT, DELETE, PATCH) on admin/sensitive routes.
//   - GET requests are safe by convention and don't need CSRF protection.

function getAllowedOrigins() {
  const origins = new Set();

  // Always allow localhost in any environment (for development)
  origins.add("http://localhost:3000");
  origins.add("http://localhost");
  origins.add("http://127.0.0.1:3000");
  origins.add("http://127.0.0.1");

  // Add production domain from environment variable (preferred)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    origins.add(process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, ""));
  }
  if (process.env.VERCEL_URL) {
    origins.add(`https://${process.env.VERCEL_URL.replace(/\/$/, "")}`);
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    origins.add(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, "")}`);
  }

  // Fallback: known production domains
  origins.add("https://www.ravtron.com");
  origins.add("https://ravtron.com");
  origins.add("https://powerhub-umber.vercel.app");
  origins.add("https://ravtron.vercel.app");
  origins.add("https://powerhub.vercel.app");

  return origins;
}

/**
 * Validates that a state-changing request originates from this application.
 * Call this at the top of POST / PUT / DELETE API handlers.
 *
 * @param {Request} request - The incoming Next.js request object.
 * @returns {{ ok: boolean, response: NextResponse | null }}
 *   - `ok: true`  → request is safe to proceed
 *   - `ok: false` → return the `response` object (HTTP 403) immediately
 */
export function verifyCsrfOrigin(request) {
  // Skip CSRF check in test environments
  if (process.env.NODE_ENV === "test") {
    return { ok: true, response: null };
  }

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  // Derive the origin from the Referer header as a fallback
  // (some browsers omit Origin on same-site navigations)
  let effectiveOrigin = origin;
  if (!effectiveOrigin && referer) {
    try {
      effectiveOrigin = new URL(referer).origin;
    } catch {
      effectiveOrigin = null;
    }
  }

  // If neither header is present, this is likely a server-side or tool request.
  // Allow it — an attacker cannot suppress Origin on a browser-originated request.
  if (!effectiveOrigin) {
    return { ok: true, response: null };
  }

  // Dynamic same-origin check:
  // If the request origin host matches the server's Host header, it is guaranteed same-origin.
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (host && effectiveOrigin) {
    try {
      const originHost = new URL(effectiveOrigin).host.toLowerCase();
      if (originHost === host.toLowerCase()) {
        return { ok: true, response: null };
      }
    } catch {
      // ignore parse error, fallback to allowed origins set
    }
  }

  const allowed = getAllowedOrigins();
  if (!allowed.has(effectiveOrigin)) {
    const { NextResponse } = require("next/server");
    console.warn(`[SEC-016] CSRF origin rejected: ${effectiveOrigin}`);
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Forbidden: Cross-site request blocked." },
        { status: 403 }
      )
    };
  }

  return { ok: true, response: null };
}
