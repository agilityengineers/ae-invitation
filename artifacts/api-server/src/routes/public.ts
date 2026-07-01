import { Router, type IRouter } from "express";
import { listPublishedVariants, getVariant, getDefaultVariant, getFrontPage } from "@/lib/config";
import { defaultForTemplate, frontPageDefault } from "@/config/defaults";
import { templateTypeSchema } from "@/config/schema";

const router: IRouter = Router();

/** Public: list published variants (home page grid). */
router.get("/public/variants", async (_req, res) => {
  try {
    res.json({ variants: await listPublishedVariants() });
  } catch {
    res.status(503).json({ error: "Database unavailable" });
  }
});

/**
 * Public: the generic default page for a template type, served at /client and
 * /talent. Returns the admin-designated default if one is set (regardless of its
 * published flag), otherwise the bundled template constant — so it never 404s.
 */
router.get("/public/defaults/:type", async (req, res) => {
  const parsed = templateTypeSchema.safeParse(req.params.type);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid type" });
    return;
  }
  const def = await getDefaultVariant(parsed.data).catch(() => null);
  res.json({ variant: def ?? defaultForTemplate(parsed.data) });
});

/**
 * Public: the front page content served at /. Returns the admin-edited config if
 * present, otherwise the bundled default — so it never 404s (mirrors defaults).
 */
router.get("/public/frontpage", async (_req, res) => {
  const frontPage = await getFrontPage().catch(() => frontPageDefault);
  res.json({ frontPage });
});

/** Public: a single published variant by slug (landing + booking pages). */
router.get("/public/variants/:slug", async (req, res) => {
  const variant = await getVariant(String(req.params.slug)).catch(() => null);
  if (!variant || !variant.published) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({ variant });
});

export default router;
