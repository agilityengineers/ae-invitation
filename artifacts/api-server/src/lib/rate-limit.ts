import type { Request } from "express";

/**
 * Lightweight in-memory fixed-window rate limiter (per process). Suitable for a
 * single persistent Node server; swap for a shared store (Redis) for multi-instance.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

export const RATE_LIMIT_MESSAGE =
  "Too many requests. Please slow down and try again shortly.";

/** Best-effort client IP from common proxy headers. */
export function clientIp(req: Request): string {
  const xff = req.headers["x-forwarded-for"];
  if (xff) {
    const raw = Array.isArray(xff) ? xff[0] : xff;
    return raw.split(",")[0].trim();
  }
  const xr = req.headers["x-real-ip"];
  if (xr) return Array.isArray(xr) ? xr[0] : xr;
  return req.ip ?? "unknown";
}
