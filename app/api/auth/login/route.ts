import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { checkPassword, createSessionToken, COOKIE_NAME, authCookieOptions } from "@/lib/auth";
import { rateLimit, rateLimitResponse, clientIp } from "@/lib/rate-limit";

const bodySchema = z.object({ password: z.string().min(1) });

/** Admin login — sets the signed httpOnly session cookie on success. */
export async function POST(req: NextRequest) {
  if (!rateLimit(`login:${clientIp(req)}`, 10, 60_000)) return rateLimitResponse();

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Password required" }, { status: 400 });

  if (!checkPassword(parsed.data.password)) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, createSessionToken(), authCookieOptions());
  return res;
}
