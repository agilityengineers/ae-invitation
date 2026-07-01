import OpenAI from "openai";
import { AiError } from "@/lib/ai";
import { buildKey, uploadObject } from "@/lib/s3";

/**
 * AI image generation — OpenAI only (Anthropic has no image API), regardless of
 * the text provider chosen for copy. Generates a 1536x1024 image and stores it
 * in S3, returning the URL to drop into a hero/guide/proof image field.
 */

const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";

export async function generateAndStoreImage(slug: string, prompt: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    throw new AiError("OPENAI_API_KEY is required for AI image generation.");
  }
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const res = await client.images.generate({
    model: OPENAI_IMAGE_MODEL,
    prompt,
    size: "1536x1024",
    n: 1,
  });
  const b64 = res.data?.[0]?.b64_json;
  if (!b64) throw new AiError("Image generation returned no data.");
  const bytes = Buffer.from(b64, "base64");
  const key = buildKey("images", slug, `${Date.now()}.png`);
  return uploadObject(key, bytes, "image/png");
}

/** On-brand prompt scaffolding so generated imagery matches the page tone. */
export function brandImagePrompt(subject: string): string {
  return `Professional, editorial B2B photograph for a software engineering brand. ${subject}.
Calm, confident, modern. Teal (#0F88A2) and navy (#08527F) accents, clean composition, realistic
lighting, no text, no logos, no watermarks.`;
}
