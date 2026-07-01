import type { Variant } from "@/config/schema";
import { clientDefault } from "@/config/defaults/client";
import { talentDefault } from "@/config/defaults/talent";

/**
 * Published demo variants so the app looks alive on first run. They reuse the
 * default StoryBrand copy (on-brand, with [needs your data] placeholders intact)
 * but carry distinct targeting/slugs and are published. Replace or delete from
 * the admin once real pages exist.
 */
export const clientDemo: Variant = {
  ...clientDefault,
  slug: "specialty-insurance-leaders",
  label: "Specialty Insurance — Leadership",
  published: true,
  isDefault: false,
  audience: "specialty insurance leaders",
  targeting: { industry: "Specialty insurance carrier", title: "VP of Operations", company: "", painPoints: [] },
};

export const talentDemo: Variant = {
  ...talentDefault,
  slug: "backend-engineers",
  label: "Backend Engineers",
  published: true,
  isDefault: false,
  audience: "backend engineers",
  targeting: { role: "Backend developer", discipline: "backend", seniority: "Senior", location: "Remote (US)" },
};
