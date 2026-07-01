import { Router, type IRouter } from "express";
import { z } from "zod";
import { requireAuth, sameOrigin } from "@/middlewares/guards";
import { rateLimit, clientIp, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";
import { getVariant } from "@/lib/config";
import { score, resolveRouting } from "@/lib/scoring";
import { buildZapierPayload, sendToZapier } from "@/lib/zapier";
import { insertLead, listLeads } from "@/lib/leads";

const router: IRouter = Router();

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

/** Public: capture a qualifier lead → score → persist → fire Zapier → return routing. */
router.post("/leads", sameOrigin, async (req, res) => {
  if (!rateLimit(`leads:${clientIp(req)}`, 8, 60_000)) {
    res.status(429).json({ error: RATE_LIMIT_MESSAGE });
    return;
  }

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid submission", issues: parsed.error.issues });
    return;
  }

  const variant = await getVariant(parsed.data.slug).catch(() => null);
  if (!variant) {
    res.status(404).json({ error: "Unknown page" });
    return;
  }

  const result = score(variant.qualifier, parsed.data.answers);
  const routing = resolveRouting(variant, result);
  const capturedAt = new Date().toISOString();

  const payload = buildZapierPayload(
    variant,
    parsed.data.lead,
    parsed.data.answers,
    result,
    capturedAt,
  );
  const zapier = await sendToZapier(payload);

  try {
    await insertLead({
      variant,
      lead: parsed.data.lead,
      answers: parsed.data.answers,
      result,
      zapierStatus: zapier.status,
      zapierError: zapier.error,
      userAgent: req.get("user-agent") ?? undefined,
      ip: clientIp(req),
    });
  } catch (err) {
    console.error("[leads] insert failed:", err);
  }

  res.json({
    score: result.total,
    tier: result.tier,
    disqualified: result.disqualified,
    routing,
    templateType: variant.templateType,
  });
});

/** Admin: list captured leads. */
router.get("/leads", requireAuth, async (_req, res) => {
  res.json({ leads: await listLeads({ limit: 300 }) });
});

export default router;
