import { Router, type IRouter } from "express";
import { listPublishedVariants, getVariant } from "@/lib/config";

const router: IRouter = Router();

/** Public: list published variants (home page grid). */
router.get("/public/variants", async (_req, res) => {
  try {
    res.json({ variants: await listPublishedVariants() });
  } catch {
    res.status(503).json({ error: "Database unavailable" });
  }
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
