import { Router, type IRouter } from "express";
import { z } from "zod";
import {
  checkPassword,
  createSessionToken,
  verifySessionToken,
  COOKIE_NAME,
  authCookieOptions,
} from "@/lib/auth";
import { sameOrigin } from "@/middlewares/guards";
import { rateLimit, clientIp, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";

const router: IRouter = Router();

const bodySchema = z.object({ password: z.string().min(1) });

/** Admin login — sets the signed httpOnly session cookie on success. */
router.post("/auth/login", (req, res) => {
  if (!rateLimit(`login:${clientIp(req)}`, 10, 60_000)) {
    res.status(429).json({ error: RATE_LIMIT_MESSAGE });
    return;
  }
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Password required" });
    return;
  }
  if (!checkPassword(parsed.data.password)) {
    res.status(401).json({ error: "Incorrect password" });
    return;
  }
  res.cookie(COOKIE_NAME, createSessionToken(), authCookieOptions());
  res.json({ ok: true });
});

/** Admin logout — clears the session cookie. */
router.post("/auth/logout", sameOrigin, (_req, res) => {
  res.clearCookie(COOKIE_NAME, { path: "/" });
  res.json({ ok: true });
});

/** Session probe — used for client-side admin route gating. */
router.get("/auth/session", (req, res) => {
  res.json({ authed: verifySessionToken(req.cookies?.[COOKIE_NAME]) });
});

export default router;
