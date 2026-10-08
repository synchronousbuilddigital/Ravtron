/**
 * Production-Ready Serverless Rate Limiter for Powerhub API Endpoints
 * Persists sliding-window counters across serverless instances using Upstash Redis REST API.
 * Automatically falls back to in-memory tracking for local development and offline environments.
 */

const inMemoryTracker = new Map();

// Periodic cleanup for in-memory tracker (local dev)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of inMemoryTracker.entries()) {
      if (now > record.resetTime) {
        inMemoryTracker.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Check and record a rate limit attempt.
 * Persists via Upstash Redis REST API in serverless environments, or local in-memory fallback.
 * @param {string} key - Identifier (e.g., client IP or email)
 * @param {number} limit - Maximum allowed requests in window
 * @param {number} windowMs - Time window in milliseconds (default: 1 minute)
 * @returns {Promise<{ success: boolean, remaining: number, resetTime: number }>}
 */
export async function rateLimit(key, limit = 5, windowMs = 60 * 1000) {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  // ── 1. Upstash Redis Serverless REST API ───────────────────────────────────
  if (redisUrl && redisToken) {
    try {
      const windowSec = Math.max(1, Math.ceil(windowMs / 1000));
      const redisKey = `ratelimit:${key}`;

      // Atomic pipeline: INCR + EXPIRE (NX) + TTL
      const res = await fetch(`${redisUrl.replace(/\/$/, "")}/pipeline`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${redisToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          ["INCR", redisKey],
          ["EXPIRE", redisKey, windowSec, "NX"],
          ["TTL", redisKey],
        ]),
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        // data format: [{ result: count }, { result: 1|0 }, { result: ttlSec }]
        const currentCount = Number(data[0]?.result) || 1;
        const ttlSec = Number(data[2]?.result) > 0 ? Number(data[2]?.result) : windowSec;
        const resetTime = Date.now() + ttlSec * 1000;

        if (currentCount > limit) {
          return {
            success: false,
            remaining: 0,
            resetTime,
          };
        }

        return {
          success: true,
          remaining: Math.max(0, limit - currentCount),
          resetTime,
        };
      }
    } catch (redisErr) {
      console.warn("[RATE_LIMIT] Upstash Redis request failed, falling back to in-memory:", redisErr.message);
    }
  }

  // ── 2. In-Memory Sliding Window Fallback (Local Dev / Offline) ─────────────
  const now = Date.now();
  let record = inMemoryTracker.get(key);

  if (!record || now > record.resetTime) {
    record = {
      count: 1,
      resetTime: now + windowMs,
    };
    inMemoryTracker.set(key, record);
    return {
      success: true,
      remaining: limit - 1,
      resetTime: record.resetTime,
    };
  }

  if (record.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  record.count += 1;
  return {
    success: true,
    remaining: limit - record.count,
    resetTime: record.resetTime,
  };
}

/**
 * Helper to extract client IP from Next.js request headers
 * @param {Request} request 
 * @returns {string}
 */
export function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}
