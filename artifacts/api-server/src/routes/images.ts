import { Router, type IRouter } from "express";
import multer from "multer";
import { z } from "zod";
import { requireAuth, sameOrigin } from "@/middlewares/guards";
import { rateLimit, clientIp, RATE_LIMIT_MESSAGE } from "@/lib/rate-limit";
import { buildKey, uploadObject } from "@/lib/s3";
import { generateAndStoreImage, brandImagePrompt } from "@/lib/images";
import { AiError } from "@/lib/ai";

const router: IRouter = Router();

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif"]);
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_BYTES } });

/** Admin: upload an image to S3 and return its URL. */
router.post("/upload", sameOrigin, requireAuth, upload.single("file"), async (req, res) => {
  if (!rateLimit(`upload:${clientIp(req)}`, 30, 60_000)) {
    res.status(429).json({ error: RATE_LIMIT_MESSAGE });
    return;
  }
  const file = req.file;
  const slug = String(req.body?.slug ?? "misc");
  if (!file) {
    res.status(400).json({ error: "No file provided" });
    return;
  }
  if (!ALLOWED.has(file.mimetype)) {
    res.status(415).json({ error: `Unsupported type: ${file.mimetype}` });
    return;
  }
  try {
    const ext = file.mimetype.split("/")[1] ?? "png";
    const key = buildKey("uploads", slug, `${Date.now()}.${ext}`);
    const url = await uploadObject(key, file.buffer, file.mimetype);
    res.json({ url });
  } catch (err) {
    console.error("[upload]", err);
    res.status(500).json({ error: "Upload failed." });
  }
});

const genSchema = z.object({
  slug: z.string().default("misc"),
  prompt: z.string().min(3),
  brandScaffold: z.boolean().default(true),
});

/** Admin: generate an on-brand image (OpenAI) and store it in S3; returns its URL. */
router.post("/images/generate", sameOrigin, requireAuth, async (req, res) => {
  if (!rateLimit(`image:${clientIp(req)}`, 10, 60_000)) {
    res.status(429).json({ error: RATE_LIMIT_MESSAGE });
    return;
  }
  const parsed = genSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", issues: parsed.error.issues });
    return;
  }
  const prompt = parsed.data.brandScaffold ? brandImagePrompt(parsed.data.prompt) : parsed.data.prompt;
  try {
    const url = await generateAndStoreImage(parsed.data.slug, prompt);
    res.json({ url });
  } catch (err) {
    const message = err instanceof AiError ? err.message : "Image generation failed.";
    const status = err instanceof AiError ? 502 : 500;
    if (!(err instanceof AiError)) console.error("[images/generate]", err);
    res.status(status).json({ error: message });
  }
});

export default router;
