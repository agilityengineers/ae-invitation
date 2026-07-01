import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { isAuthenticated } from "@/lib/auth";
import { requireSameOrigin } from "@/lib/csrf";
import { rateLimit, rateLimitResponse, clientIp } from "@/lib/rate-limit";
import { generateRequestSchema } from "@/config/schema";
import { generateVariantContent, AiError } from "@/lib/ai";
import { assembleVariant } from "@/lib/assemble";
import { saveVariant, slugExists } from "@/lib/config";

/** Admin: AI-generate a new variant from a targeting envelope, then save it. */
export async function POST(req: NextRequest) {
  if (!requireSameOrigin(req)) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!rateLimit(`generate:${clientIp(req)}`, 10, 60_000)) return rateLimitResponse();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = generateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  if (await slugExists(parsed.data.slug)) {
    return NextResponse.json({ error: "A variant with that slug already exists." }, { status: 409 });
  }

  try {
    const gen = await generateVariantContent(parsed.data);
    const variant = await saveVariant(assembleVariant(parsed.data, gen));
    revalidatePath(`/${variant.slug}`);
    return NextResponse.json({ variant });
  } catch (err) {
    const message = err instanceof AiError ? err.message : "Generation failed.";
    const status = err instanceof AiError ? 502 : 500;
    if (!(err instanceof AiError)) console.error("[generate]", err);
    return NextResponse.json({ error: message }, { status });
  }
}
