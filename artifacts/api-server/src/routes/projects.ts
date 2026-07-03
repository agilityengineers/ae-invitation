import { Router, type IRouter } from "express";
import { requireAuth, sameOrigin } from "@/middlewares/guards";
import { projectsPageSchema } from "@/config/schema";
import { projectsDefault } from "@/config/defaults";
import { getProjects, saveProjects } from "@/lib/config";

const router: IRouter = Router();

/**
 * GET — the current projects portfolio config (admin editor). Falls back to the
 * bundled default on a DB error (matches `/public/projects`'s resilience) so the
 * editor always has content to open with.
 */
router.get("/projects", requireAuth, async (_req, res) => {
  const projects = await getProjects().catch(() => projectsDefault);
  res.json({ projects });
});

/** PATCH — save the projects portfolio config (admin edit). */
router.patch("/projects", sameOrigin, requireAuth, async (req, res) => {
  const parsed = projectsPageSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid config", issues: parsed.error.issues });
    return;
  }
  const saved = await saveProjects(parsed.data);
  res.json({ projects: saved });
});

export default router;
