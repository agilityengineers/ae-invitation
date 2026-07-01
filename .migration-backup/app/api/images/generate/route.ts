import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isAuthenticated } from "@/lib/auth";
import { requireSameOrigin } from "@/lib/csrf";
import { rateLimit, rateLimitResponse, clientIp } from "@/lib/rate-limit";
import { generateAndStoreImage, brandImagePrompt } from "@/lib/images";
import { AiError } from "@/lib/ai";

const bodySchema = z.object({
  slug: z.string().default("misc"),
  prompt: z.string().min(3),
  brandScaffold: z.boolean().default(true),
});

/** Admin: generate an on-brand image (OpenAI) and store it in S3; returns its URL. */
export async function POST(req: NextRequest) {
  if (!requireSameOrigin(req)) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!rateLimit(`image:${clientIp(req)}`, 10, 60_000)) return rateLimitResponse();

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", issues: parsed.error.issues }, { status: 400 });
  }

  const prompt = parsed.data.brandScaffold ? brandImagePrompt(parsed.data.prompt) : parsed.data.prompt;
  try {
    const url = await generateAndStoreImage(parsed.data.slug, prompt);
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof AiError ? err.message : "Image generation failed.";
    const status = err instanceof AiError ? 502 : 500;
    if (!(err instanceof AiError)) console.error("[images/generate]", err);
    return NextResponse.json({ error: message }, { status });
  }
}
