import { NextResponse, type NextRequest } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { requireSameOrigin } from "@/lib/csrf";
import { rateLimit, rateLimitResponse, clientIp } from "@/lib/rate-limit";
import { buildKey, uploadObject } from "@/lib/s3";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif"]);

/** Admin: upload an image to S3 and return its URL (for hero/guide/proof fields). */
export async function POST(req: NextRequest) {
  if (!requireSameOrigin(req)) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!rateLimit(`upload:${clientIp(req)}`, 30, 60_000)) return rateLimitResponse();

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  const slug = String(form?.get("slug") ?? "misc");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: `Unsupported type: ${file.type}` }, { status: 415 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 8 MB)" }, { status: 413 });
  }

  try {
    const ext = file.type.split("/")[1] ?? "png";
    const key = buildKey("uploads", slug, `${Date.now()}.${ext}`);
    const bytes = Buffer.from(await file.arrayBuffer());
    const url = await uploadObject(key, bytes, file.type);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[upload]", err);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
