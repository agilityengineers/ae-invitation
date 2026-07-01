import { Router, type IRouter } from "express";
import { requireAuth, sameOrigin } from "@/middlewares/guards";
import { frontPageSchema } from "@/config/schema";
import { getFrontPage, saveFrontPage } from "@/lib/config";

const router: IRouter = Router();

/** GET — the current front-page config (admin editor). */
router.get("/frontpage", requireAuth, async (_req, res) => {
  res.json({ frontPage: await getFrontPage() });
});

/** PATCH — save the front-page config (admin edit). */
router.patch("/frontpage", sameOrigin, requireAuth, async (req, res) => {
  const parsed = frontPageSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid config", issues: parsed.error.issues });
    return;
  }
  const saved = await saveFrontPage(parsed.data);
  res.json({ frontPage: saved });
});

export default router;
