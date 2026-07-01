import { Router, type IRouter } from "express";
import { requireAuth, sameOrigin } from "@/middlewares/guards";
import { rateLimit, clientIp, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";
import { generateRequestSchema, regenerableSections } from "@/config/schema";
import { z } from "zod";
import {
  generateVariantContent,
  regenerateSection,
  AiError,
} from "@/lib/ai";
import { assembleVariant } from "@/lib/assemble";
import { getVariant, saveVariant, slugExists } from "@/lib/config";

const router: IRouter = Router();

/** Admin: AI-generate a new variant from a targeting envelope, then save it. */
router.post("/generate", sameOrigin, requireAuth, async (req, res) => {
  if (!rateLimit(`generate:${clientIp(req)}`, 10, 60_000)) {
    res.status(429).json({ error: RATE_LIMIT_MESSAGE });
    return;
  }

  const parsed = generateRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", issues: parsed.error.issues });
    return;
  }

  if (await slugExists(parsed.data.slug)) {
    res.status(409).json({ error: "A variant with that slug already exists." });
    return;
  }

  try {
    const gen = await generateVariantContent(parsed.data);
    const variant = await saveVariant(assembleVariant(parsed.data, gen));
    res.json({ variant });
  } catch (err) {
    const message = err instanceof AiError ? err.message : "Generation failed.";
    const status = err instanceof AiError ? 502 : 500;
    if (!(err instanceof AiError)) console.error("[generate]", err);
    res.status(status).json({ error: message });
  }
});

const regenSchema = z.object({
  slug: z.string(),
  section: z.enum(regenerableSections),
  provider: z.string().optional(),
});

/** Admin: regenerate a single section's copy and merge it back into the variant. */
router.post("/regenerate", sameOrigin, requireAuth, async (req, res) => {
  if (!rateLimit(`regenerate:${clientIp(req)}`, 20, 60_000)) {
    res.status(429).json({ error: RATE_LIMIT_MESSAGE });
    return;
  }

  const parsed = regenSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", issues: parsed.error.issues });
    return;
  }

  const variant = await getVariant(parsed.data.slug);
  if (!variant) {
    res.status(404).json({ error: "Variant not found" });
    return;
  }

  try {
    const section = await regenerateSection(variant, parsed.data.section, parsed.data.provider);
    const updated = await saveVariant({
      ...variant,
      copy: { ...variant.copy, [parsed.data.section]: section },
    });
    res.json({ variant: updated, section: parsed.data.section });
  } catch (err) {
    const message = err instanceof AiError ? err.message : "Regeneration failed.";
    const status = err instanceof AiError ? 502 : 500;
    if (!(err instanceof AiError)) console.error("[regenerate]", err);
    res.status(status).json({ error: message });
  }
});

export default router;
