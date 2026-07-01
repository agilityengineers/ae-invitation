import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { isProd } from "@/lib/env";
import { COOKIE_NAME, COOKIE_MAX_AGE } from "@/lib/auth-edge";

export { COOKIE_NAME, COOKIE_MAX_AGE };

/**
 * Single-shared-password admin auth, ported from fabp-landing-pages.
 * Cookie `admin-auth` holds a signed token `<issuedAtMs>.<hmacHex>`; the HMAC
 * is verified on every request (here for the Node runtime; lib/auth-edge.ts
 * mirrors it for middleware on the edge runtime).
 */

/** Signing secret: dedicated secret preferred, else the password, else a dev-only fallback. */
export function getSigningSecret(): string | null {
  const dedicated = process.env.ADMIN_SESSION_SECRET;
  if (dedicated && dedicated.length >= 16) return dedicated;
  const pw = process.env.ADMIN_PASSWORD;
  if (pw && pw.length >= 8) return pw;
  return isProd ? null : "dev-only-do-not-use-secret";
}

function sign(issuedAt: string, secret: string): string {
  return createHmac("sha256", secret).update(issuedAt).digest("hex");
}

export function createSessionToken(): string {
  const secret = getSigningSecret();
  if (!secret) throw new Error("No admin signing secret configured.");
  const issuedAt = String(Date.now());
  return `${issuedAt}.${sign(issuedAt, secret)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const secret = getSigningSecret();
  if (!secret) return false;
  const [issuedAt, mac] = token.split(".");
  if (!issuedAt || !mac) return false;
  const expected = sign(issuedAt, secret);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  const ageMs = Date.now() - Number(issuedAt);
  return Number.isFinite(ageMs) && ageMs >= 0 && ageMs <= COOKIE_MAX_AGE * 1000;
}

/** Constant-time password check against ADMIN_PASSWORD (dev fallback: "admin"). */
export function checkPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? (isProd ? "" : "admin");
  if (!expected) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Reads + verifies the cookie in a Server Component / Route Handler context. */
export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(COOKIE_NAME)?.value);
}

export function authCookieOptions() {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict" as const,
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  };
}
