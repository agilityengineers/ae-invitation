import { type NextRequest } from "next/server";

/**
 * Same-origin check for mutating requests (defense-in-depth atop the SameSite
 * cookie), ported from fabp-landing-pages. Extra origins allowed via
 * ALLOWED_ORIGINS (comma-separated). Returns true when the request may proceed.
 */
export function requireSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin") ?? req.headers.get("referer");
  if (!origin) return false;

  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }

  const host = req.headers.get("host");
  if (host && originHost === host) return true;

  const allowed = (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return allowed.some((a) => {
    try {
      return new URL(a).host === originHost;
    } catch {
      return a === originHost;
    }
  });
}
