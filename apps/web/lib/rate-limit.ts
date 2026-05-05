/**
 * Per-isolate sliding window rate limiter.
 *
 * Lives in module scope so it survives within an isolate; Cloudflare spreads
 * traffic across isolates so the effective cap is N×configured. Acceptable
 * for low-volume routes (contact, agent) — durable D1/KV-backed limiter is
 * a follow-up for high-traffic surfaces.
 */

interface Bucket { count: number; resetAt: number }

const buckets = new Map<string, Bucket>();

export interface LimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
}

export function limit(key: string, limitCount: number, windowSec: number): LimitResult {
  const now = Date.now();
  const windowMs = windowSec * 1000;
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { ok: true, remaining: limitCount - 1, resetAt };
  }
  if (existing.count >= limitCount) {
    return { ok: false, remaining: 0, resetAt: existing.resetAt };
  }
  existing.count += 1;
  return { ok: true, remaining: limitCount - existing.count, resetAt: existing.resetAt };
}

/** Pull the client IP off the request headers (Cloudflare forwards). */
export function clientIp(headers: Headers): string {
  return (
    headers.get("cf-connecting-ip") ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}
