import { NextResponse, type NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { isAuthenticated } from "@/lib/auth";
import { requireSameOrigin } from "@/lib/csrf";
import { rateLimit, rateLimitResponse, clientIp } from "@/lib/rate-limit";
import { regenerableSections } from "@/config/schema";
import { regenerateSection, AiError } from "@/lib/ai";
import { getVariant, saveVariant } from "@/lib/config";

const bodySchema = z.object({
  slug: z.string(),
  section: z.enum(regenerableSections),
  provider: z.string().optional(),
});

/** Admin: regenerate a single section's copy and merge it back into the variant. */
export async function POST(req: NextRequest) {
  if (!requireSameOrigin(req)) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  if (!(await isAuthenticated())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!rateLimit(`regenerate:${clientIp(req)}`, 20, 60_000)) return rateLimitResponse();

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request", issues: parsed.error.issues }, { status: 400 });
  }

  const variant = await getVariant(parsed.data.slug);
  if (!variant) return NextResponse.json({ error: "Variant not found" }, { status: 404 });

  try {
    const section = await regenerateSection(variant, parsed.data.section, parsed.data.provider);
    const updated = await saveVariant({
      ...variant,
      copy: { ...variant.copy, [parsed.data.section]: section },
    });
    revalidatePath(`/${updated.slug}`);
    return NextResponse.json({ variant: updated, section: parsed.data.section });
  } catch (err) {
    const message = err instanceof AiError ? err.message : "Regeneration failed.";
    const status = err instanceof AiError ? 502 : 500;
    if (!(err instanceof AiError)) console.error("[regenerate]", err);
    return NextResponse.json({ error: message }, { status });
  }
}
