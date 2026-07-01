import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import {
  aiContentSchema,
  copySchema,
  providerSchema,
  type AiContent,
  type GenerateRequest,
  type Provider,
  type RegenerableSection,
  type Variant,
} from "@/config/schema";
import { defaultForTemplate } from "@/config/defaults";
import { aiExample, sectionPrompt, systemPrompt, userPrompt } from "@/lib/prompts";

/**
 * Multi-provider AI, ported from Content-Authority's server/ai.ts: Anthropic OR
 * OpenAI per request, output validated against the Zod schema, retry once on
 * failure. Models are env-overridable. availableProviders() reports which keys
 * are configured (drives the admin's provider picker).
 */

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5-20250929";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o";

export class AiError extends Error {}

export function availableProviders(): Provider[] {
  const out: Provider[] = [];
  if (process.env.ANTHROPIC_API_KEY) out.push("anthropic");
  if (process.env.OPENAI_API_KEY) out.push("openai");
  return out;
}

/** Resolve the provider to use: the requested one (if configured), else the first available. */
export function resolveProvider(requested?: string): Provider {
  const providers = availableProviders();
  if (providers.length === 0) {
    throw new AiError("No AI provider configured. Set ANTHROPIC_API_KEY and/or OPENAI_API_KEY.");
  }
  const parsed = providerSchema.safeParse(requested);
  if (parsed.success) {
    if (!providers.includes(parsed.data)) {
      throw new AiError(`Provider "${parsed.data}" is not configured (missing API key).`);
    }
    return parsed.data;
  }
  return providers[0];
}

function modelFor(provider: Provider): string {
  return provider === "openai" ? OPENAI_MODEL : ANTHROPIC_MODEL;
}

async function callAnthropic(system: string, user: string, maxTokens = 8000): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) throw new AiError("ANTHROPIC_API_KEY is not configured.");
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const res = await client.messages.create({
    model: ANTHROPIC_MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: user }],
  });
  const block = res.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") throw new AiError("Claude returned no text content.");
  return block.text;
}

async function callOpenAI(system: string, user: string): Promise<string> {
  if (!process.env.OPENAI_API_KEY) throw new AiError("OPENAI_API_KEY is not configured.");
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const res = await client.chat.completions.create({
    model: OPENAI_MODEL,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  const text = res.choices[0]?.message?.content;
  if (!text) throw new AiError("OpenAI returned no content.");
  return text;
}

function callModel(provider: Provider, system: string, user: string): Promise<string> {
  return provider === "openai" ? callOpenAI(system, user) : callAnthropic(system, user);
}

/** Strip code fences / surrounding prose, then JSON.parse. Provider-agnostic. */
export function extractJson(raw: string): unknown {
  let text = raw.trim();
  const fence = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fence) text = fence[1].trim();
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start !== -1 && end > start) {
      return JSON.parse(text.slice(start, end + 1));
    }
    throw new AiError("AI response was not valid JSON.");
  }
}

function issueSummary(error: { issues: { path: (string | number)[]; message: string }[] }): string {
  return error.issues
    .slice(0, 5)
    .map((i) => `${i.path.join(".")}: ${i.message}`)
    .join("; ");
}

export interface GenerationResult {
  content: AiContent;
  provider: Provider;
  model: string;
}

/**
 * Generate the AI-authored slice (audience + copy + meta) for a new variant.
 * Validates against aiContentSchema; retries once with the validation error
 * appended to the prompt (fabp pattern).
 */
export async function generateVariantContent(req: GenerateRequest): Promise<GenerationResult> {
  const provider = resolveProvider(req.provider);
  const system = systemPrompt(req.templateType);
  const example = aiExample(defaultForTemplate(req.templateType));
  const baseUser = userPrompt(req, example);

  let lastErr: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    const user =
      attempt === 0
        ? baseUser
        : `${baseUser}\n\nYour previous response failed validation: ${
            lastErr instanceof Error ? lastErr.message : String(lastErr)
          }. Fix it and return corrected JSON only.`;
    try {
      const raw = await callModel(provider, system, user);
      const parsed = aiContentSchema.safeParse(extractJson(raw));
      if (parsed.success) return { content: parsed.data, provider, model: modelFor(provider) };
      lastErr = new AiError(`Generated content failed validation: ${issueSummary(parsed.error)}`);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr instanceof AiError
    ? lastErr
    : new AiError(`AI generation failed: ${(lastErr as Error)?.message ?? "unknown error"}`);
}

/** Regenerate a single section's copy. Returns the validated section object. */
export async function regenerateSection(
  variant: Variant,
  section: RegenerableSection,
  requestedProvider?: string,
): Promise<Variant["copy"][RegenerableSection]> {
  const provider = resolveProvider(requestedProvider);
  const system = systemPrompt(variant.templateType);
  const sectionSchema = copySchema.shape[section];
  const example = variant.copy[section];
  const context = `Audience: ${variant.audience}. Keep voice and stakes consistent with the rest of the page.`;
  const user = sectionPrompt(variant.templateType, section, example, context);

  let lastErr: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    const prompt =
      attempt === 0
        ? user
        : `${user}\n\nYour previous response failed validation: ${
            lastErr instanceof Error ? lastErr.message : String(lastErr)
          }. Return corrected JSON only.`;
    try {
      const raw = await callModel(provider, system, prompt);
      const parsed = sectionSchema.safeParse(extractJson(raw));
      if (parsed.success) return parsed.data as Variant["copy"][RegenerableSection];
      lastErr = new AiError(`Section "${section}" failed validation: ${issueSummary(parsed.error)}`);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr instanceof AiError
    ? lastErr
    : new AiError(`Section regeneration failed: ${(lastErr as Error)?.message ?? "unknown"}`);
}
