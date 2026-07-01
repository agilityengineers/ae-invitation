import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Lightweight health check for deploy monitoring (Replit / uptime pings).
 * Public and minimal — reports DB reachability only, no sensitive detail.
 */
export async function GET() {
  try {
    await query("SELECT 1");
    return NextResponse.json({ status: "ok", db: "up" });
  } catch {
    return NextResponse.json({ status: "degraded", db: "down" }, { status: 503 });
  }
}
