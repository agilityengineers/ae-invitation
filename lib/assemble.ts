import { variantSchema, type GenerateRequest, type Variant } from "@/config/schema";
import { defaultForTemplate } from "@/config/defaults";
import type { GenerationResult } from "@/lib/ai";

/**
 * Assemble a full Variant from a generation request + the AI-authored slice.
 * Admin-owned fields (sections, header links, booking, qualifier) start from the
 * template default; the AI only fills audience + copy + meta.
 */
export function assembleVariant(req: GenerateRequest, gen: GenerationResult): Variant {
  const base = defaultForTemplate(req.templateType);
  return variantSchema.parse({
    ...base,
    templateType: req.templateType,
    slug: req.slug,
    label: req.label,
    published: false,
    targeting: req.targeting ?? {},
    audience: gen.content.audience,
    copy: gen.content.copy,
    meta: gen.content.meta,
    provenance: {
      provider: gen.provider,
      model: gen.model,
      generatedAt: new Date().toISOString(),
      targetingInputs: req.targeting ?? {},
    },
  });
}
