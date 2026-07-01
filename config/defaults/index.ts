import { variantSchema, type Variant, type TemplateType } from "@/config/schema";
import { clientDefault } from "@/config/defaults/client";
import { talentDefault } from "@/config/defaults/talent";
import { clientDemo, talentDemo } from "@/config/defaults/demos";

/**
 * Bundled variants seeded into the DB. The two "default-*" rows are unpublished
 * templates + AI few-shot examples; the two demos are published example pages so
 * the site looks alive on first run.
 */
export const defaultVariants: Variant[] = [
  variantSchema.parse(clientDefault),
  variantSchema.parse(talentDefault),
  variantSchema.parse(clientDemo),
  variantSchema.parse(talentDemo),
];

/** The default content for a given template type — the AI few-shot example. */
export function defaultForTemplate(templateType: TemplateType): Variant {
  return templateType === "talent"
    ? variantSchema.parse(talentDefault)
    : variantSchema.parse(clientDefault);
}

export { clientDefault, talentDefault };
