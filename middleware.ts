import { NextResponse, type NextRequest } from "next/server";
import { verifySessionTokenEdge, COOKIE_NAME } from "@/lib/auth-edge";

/**
 * Gates everything under /admin (except the login page) behind the admin cookie.
 * Verifies on the edge runtime via Web Crypto. API routes additionally re-check
 * auth inline (defense in depth), matching fabp.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (await verifySessionTokenEdge(token)) return NextResponse.next();

  const loginUrl = new URL("/admin/login", req.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
