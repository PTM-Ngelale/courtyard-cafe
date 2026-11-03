import type { NextRequest } from 'next/server';

/**
 * A small in-memory rate limiter for API routes, keyed by client IP.
 *
 * It's per server instance: Vercel reuses warm instances, so it stops a
 * script hammering an endpoint, but it isn't a hard global limit. For that,
 * add a Vercel Firewall rate-limit rule on the same path as well.
 */

const hits = new Map<string, number[]>();
const MAX_TRACKED = 5000;

/** The caller's IP as Vercel reports it (Vercel sets these headers itself). */
export function clientIp(req: NextRequest) {
  return (
    req.headers.get('x-real-ip')?.trim() ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

/**
 * Records a hit and says whether it's allowed: at most `limit` hits per
 * `windowMs` for each key. Returns how long to wait when it isn't.
 */
export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

  if (recent.length >= limit) {
    hits.set(key, recent);
    return { ok: false as const, retryAfterSeconds: Math.ceil((recent[0] + windowMs - now) / 1000) };
  }

  recent.push(now);
  hits.set(key, recent);

  // Keep memory bounded: drop keys whose hits have all expired.
  if (hits.size > MAX_TRACKED) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= windowMs)) hits.delete(k);
    }
  }
  return { ok: true as const };
}
