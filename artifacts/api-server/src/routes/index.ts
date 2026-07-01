import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import variantsRouter from "./variants";
import publicRouter from "./public";
import leadsRouter from "./leads";
import generateRouter from "./generate";
import imagesRouter from "./images";
import providersRouter from "./providers";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(publicRouter);
router.use(variantsRouter);
router.use(leadsRouter);
router.use(generateRouter);
router.use(imagesRouter);
router.use(providersRouter);

export default router;
