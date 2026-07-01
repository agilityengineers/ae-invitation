import type { Request, Response, NextFunction } from "express";
import { verifySessionToken, COOKIE_NAME } from "@/lib/auth";
import { requireSameOrigin } from "@/lib/csrf";

/** Require a valid admin session cookie. */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (verifySessionToken(req.cookies?.[COOKIE_NAME])) {
    next();
    return;
  }
  res.status(401).json({ error: "Unauthorized" });
}

/** Require a same-origin mutating request. */
export function sameOrigin(req: Request, res: Response, next: NextFunction): void {
  if (requireSameOrigin(req)) {
    next();
    return;
  }
  res.status(403).json({ error: "Bad origin" });
}
