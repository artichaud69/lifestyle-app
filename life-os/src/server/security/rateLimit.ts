// In-memory fixed-window rate limiter. Correct for a single Node process (the
// Phase 1 deployment); swap for Redis when running more than one instance.
type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfterMs: number } {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 10_000) sweep(now);
    return { ok: true, retryAfterMs: 0 };
  }
  bucket.count += 1;
  return bucket.count <= limit ? { ok: true, retryAfterMs: 0 } : { ok: false, retryAfterMs: bucket.resetAt - now };
}

function sweep(now: number) {
  for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
}

export function resetRateLimits() {
  buckets.clear();
}
