import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { requireSameOrigin } from "@/lib/csrf";
import { rateLimit, rateLimitResponse, clientIp } from "@/lib/rate-limit";
import { getVariant } from "@/lib/config";
import { score, resolveRouting } from "@/lib/scoring";
import { buildZapierPayload, sendToZapier } from "@/lib/zapier";
import { insertLead } from "@/lib/leads";

/** Public: capture a qualifier lead → score → persist → fire Zapier → return routing. */
const bodySchema = z.object({
  slug: z.string(),
  answers: z.record(z.string(), z.number().int().nonnegative()),
  lead: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    company: z.string().default(""),
    phone: z.string().default(""),
  }),
});

export async function POST(req: NextRequest) {
  if (!requireSameOrigin(req)) return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  if (!rateLimit(`leads:${clientIp(req)}`, 8, 60_000)) return rateLimitResponse();

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission", issues: parsed.error.issues }, { status: 400 });
  }

  const variant = await getVariant(parsed.data.slug).catch(() => null);
  if (!variant) return NextResponse.json({ error: "Unknown page" }, { status: 404 });

  // Score authoritatively on the server (never trust a client-computed score).
  const result = score(variant.qualifier, parsed.data.answers);
  const routing = resolveRouting(variant, result);
  const capturedAt = new Date().toISOString();

  // Fire Zapier with the full payload, then persist the lead with the outcome.
  const payload = buildZapierPayload(variant, parsed.data.lead, parsed.data.answers, result, capturedAt);
  const zapier = await sendToZapier(payload);

  try {
    await insertLead({
      variant,
      lead: parsed.data.lead,
      answers: parsed.data.answers,
      result,
      zapierStatus: zapier.status,
      zapierError: zapier.error,
      userAgent: req.headers.get("user-agent") ?? undefined,
      ip: clientIp(req),
    });
  } catch (err) {
    console.error("[leads] insert failed:", err);
    // The Zapier webhook already fired; surface success to the user but log the DB miss.
  }

  return NextResponse.json({
    score: result.total,
    tier: result.tier,
    disqualified: result.disqualified,
    routing,
    templateType: variant.templateType,
  });
}
