import type { GenerateRequest, TemplateType, Variant, AiContent } from "@/config/schema";

/**
 * Brand-voice system prompt + targeting-driven user prompt for AI generation.
 * Encodes Agility Engineers' StoryBrand voice and the hard content rules from
 * the README (no jargon/buzzwords/AI-tells; never invent stats, client names, or
 * proof points — emit the [needs your data] placeholders for the admin).
 */

const SHARED_VOICE = `You write landing-page copy for Agility Engineers, a software engineering
firm that moves real ideas to production. Follow the StoryBrand framework precisely:
- The READER is the hero. Agility Engineers is the GUIDE (authority + empathy), never the hero.
- The three-stage approach IS the plan. There is exactly ONE conversion action, repeated.
- Speak with calm, professional confidence. Short, concrete sentences. No exclamation marks.

ABSOLUTE RULES:
- Do NOT invent statistics, client names, company names, testimonials, case studies, or proof
  points. Where real data is required, output the literal placeholder "[needs your data]" (or keep
  the bracketed placeholders shown in the example). This is critical — fabricated proof is unusable.
- No buzzwords, no jargon, no filler, no hype, no AI-tells ("unlock", "leverage", "in today's
  fast-paced world", "elevate", "seamless", "game-changer", em-dash-laden throat-clearing).
- Keep every field roughly the same length as the example. Preserve all array lengths exactly.

OUTPUT FORMAT:
- Return ONE valid JSON object and nothing else. No markdown code fences, no commentary.
- The object MUST have exactly these top-level keys: "audience", "copy", "meta".
- "copy" and "meta" MUST match the example's structure key-for-key (same nested keys, same array
  lengths). Only the text values change.`;

const CLIENT_VOICE = `This is the CLIENT TARGET page. Audience: CEOs, owners, and operators. The single
conversion is "book a meeting with a client advisor." Frame the reader's problem as ideas that
stall before production, with unpredictable cost/risk. Agility Engineers guides them from proof of
concept to live, supported software via the three-stage plan (prove it, scale it, keep it running).`;

const TALENT_VOICE = `This is the TALENT / DIRECTORY page. Audience: developers, architects, PMs, scrum
masters, program and product managers. The single conversion is "join the Agility Engineers
directory." Frame the reader's problem as great people who go unfound. Agility Engineers is the
guide that connects them to real projects on agile teams via a simple three-step plan.`;

export function systemPrompt(templateType: TemplateType): string {
  return `${SHARED_VOICE}\n\n${templateType === "talent" ? TALENT_VOICE : CLIENT_VOICE}`;
}

/** The AI-authored slice of an existing variant — the structural few-shot example. */
export function aiExample(variant: Variant): AiContent {
  return { audience: variant.audience, copy: variant.copy, meta: variant.meta };
}

function targetingLines(req: GenerateRequest): string {
  const t = req.targeting ?? {};
  const pairs: [string, string | undefined][] =
    req.templateType === "talent"
      ? [
          ["Role", t.role],
          ["Discipline", t.discipline],
          ["Seniority", t.seniority],
          ["Location", t.location],
        ]
      : [
          ["Industry", t.industry],
          ["Target title / role", t.title],
          ["Company / account", t.company || t.accountName],
          ["Pain-point hints", (t.painPoints ?? []).join("; ")],
        ];
  return pairs
    .filter(([, v]) => v && v.trim())
    .map(([k, v]) => `- ${k}: ${v}`)
    .join("\n");
}

export function userPrompt(req: GenerateRequest, example: AiContent): string {
  const targeting = targetingLines(req) || "- (no specifics provided; write strong, general copy)";
  return `Tailor a ${req.templateType === "talent" ? "Talent / Directory" : "Client Target"} page to this target:
${targeting}

Use what you reliably know about this audience to make the copy specific and credible WITHOUT
inventing proof. Set "audience" to a short noun phrase describing the reader (used verbatim around
the page). Write SEO "meta" (title <=60 chars, description <=155 chars) tuned to the targeting.

Return JSON with EXACTLY this structure (same keys, same array lengths) — change only the text:

${JSON.stringify(example, null, 2)}`;
}

/** Per-section regenerate prompt — returns just one section's copy object. */
export function sectionPrompt(
  templateType: TemplateType,
  section: string,
  exampleSection: unknown,
  targetingContext: string,
): string {
  return `Regenerate ONLY the "${section}" section of this ${templateType} landing page.
${targetingContext}

Return ONE JSON object matching this exact structure (same keys, same array lengths), no fences:

${JSON.stringify(exampleSection, null, 2)}`;
}
