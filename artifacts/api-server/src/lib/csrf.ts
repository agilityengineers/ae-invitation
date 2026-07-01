import type { Request } from "express";
import { isProd } from "@/lib/env";

/**
 * Same-origin check for mutating requests (defense-in-depth atop the SameSite
 * cookie). Extra origins allowed via ALLOWED_ORIGINS (comma-separated). In
 * development the app is served through the Replit proxy where the Origin host
 * and the internal Host header differ, so the check is relaxed there.
 */
export function requireSameOrigin(req: Request): boolean {
  if (!isProd) return true;

  const origin = req.get("origin") ?? req.get("referer");
  if (!origin) return false;

  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }

  const host = req.get("host");
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
