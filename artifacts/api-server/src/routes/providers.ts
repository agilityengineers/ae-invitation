import { Router, type IRouter } from "express";
import { requireAuth } from "@/middlewares/guards";
import { availableProviders } from "@/lib/ai";

const router: IRouter = Router();

/** Admin: which AI providers have API keys configured. */
router.get("/providers", requireAuth, (_req, res) => {
  res.json({ providers: availableProviders() });
});

export default router;
