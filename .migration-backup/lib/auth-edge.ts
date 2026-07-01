/**
 * Edge-runtime mirror of lib/auth.ts token verification (Web Crypto), used by
 * middleware.ts where node:crypto is unavailable. Must stay in lock-step with
 * the Node signer in lib/auth.ts.
 */

// Edge-safe constants (no node:crypto / server-only), shared with lib/auth.ts.
export const COOKIE_NAME = "admin-auth";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days (seconds)

function getSigningSecret(): string | null {
  const dedicated = process.env.ADMIN_SESSION_SECRET;
  if (dedicated && dedicated.length >= 16) return dedicated;
  const pw = process.env.ADMIN_PASSWORD;
  if (pw && pw.length >= 8) return pw;
  return process.env.NODE_ENV === "production" ? null : "dev-only-do-not-use-secret";
}

async function hmacHex(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifySessionTokenEdge(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const secret = getSigningSecret();
  if (!secret) return false;
  const [issuedAt, mac] = token.split(".");
  if (!issuedAt || !mac) return false;
  const expected = await hmacHex(issuedAt, secret);
  if (mac.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < mac.length; i++) diff |= mac.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff !== 0) return false;
  const ageMs = Date.now() - Number(issuedAt);
  return Number.isFinite(ageMs) && ageMs >= 0 && ageMs <= COOKIE_MAX_AGE * 1000;
}
