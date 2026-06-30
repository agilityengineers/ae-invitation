import { variantSchema, type Variant, type TemplateType } from "@/config/schema";
import { clientDefault } from "@/config/defaults/client";
import { talentDefault } from "@/config/defaults/talent";

/** Bundled default variants — seeded into the DB and used as AI few-shot examples. */
export const defaultVariants: Variant[] = [
  variantSchema.parse(clientDefault),
  variantSchema.parse(talentDefault),
];

/** The default content for a given template type — the AI few-shot example. */
export function defaultForTemplate(templateType: TemplateType): Variant {
  return templateType === "talent"
    ? variantSchema.parse(talentDefault)
    : variantSchema.parse(clientDefault);
}

export { clientDefault, talentDefault };
