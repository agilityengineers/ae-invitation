import { NextResponse, type NextRequest } from "next/server";
import { requireSameOrigin } from "@/lib/csrf";
import { COOKIE_NAME } from "@/lib/auth";

/** Admin logout — clears the session cookie. */
export async function POST(req: NextRequest) {
  if (!requireSameOrigin(req)) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return res;
}
