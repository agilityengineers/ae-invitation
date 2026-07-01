import { Router, type IRouter } from "express";
import { z } from "zod";
import { requireAuth, sameOrigin } from "@/middlewares/guards";
import { variantSchema, slugSchema, templateTypeSchema } from "@/config/schema";
import { defaultForTemplate } from "@/config/defaults";
import {
  listVariants,
  getVariant,
  saveVariant,
  setPublished,
  deleteVariant,
  slugExists,
} from "@/lib/config";

const router: IRouter = Router();

/** GET — list all variants (admin). */
router.get("/variants", requireAuth, async (_req, res) => {
  res.json({ variants: await listVariants() });
});

/** GET one — any variant by slug (admin; used by edit + preview). */
router.get("/variants/:slug", requireAuth, async (req, res) => {
  const variant = await getVariant(String(req.params.slug)).catch(() => null);
  if (!variant) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ variant });
});

/** PATCH — save a full variant config (admin edit). */
router.patch("/variants", sameOrigin, requireAuth, async (req, res) => {
  const parsed = variantSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid config", issues: parsed.error.issues });
    return;
  }
  const saved = await saveVariant(parsed.data);
  res.json({ variant: saved });
});

/** PUT — create a new variant from the template default (manual, no AI). */
const createSchema = z.object({
  templateType: templateTypeSchema,
  slug: slugSchema,
  label: z.string().min(1),
});
router.put("/variants", sameOrigin, requireAuth, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", issues: parsed.error.issues });
    return;
  }
  if (await slugExists(parsed.data.slug)) {
    res.status(409).json({ error: "A variant with that slug already exists." });
    return;
  }
  const base = defaultForTemplate(parsed.data.templateType);
  const saved = await saveVariant({
    ...base,
    templateType: parsed.data.templateType,
    slug: parsed.data.slug,
    label: parsed.data.label,
    published: false,
  });
  res.json({ variant: saved });
});

/** POST — publish / unpublish / delete a variant. */
const actionSchema = z.object({
  slug: z.string(),
  action: z.enum(["publish", "unpublish", "delete"]),
});
router.post("/variants", sameOrigin, requireAuth, async (req, res) => {
  const parsed = actionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", issues: parsed.error.issues });
    return;
  }
  const { slug, action } = parsed.data;

  if (action === "delete") {
    await deleteVariant(slug);
    res.json({ ok: true });
    return;
  }

  if (!(await getVariant(slug))) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const saved = await setPublished(slug, action === "publish");
  res.json({ variant: saved });
});

export default router;
