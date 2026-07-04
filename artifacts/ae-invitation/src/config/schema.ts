import { z } from "zod";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Agility Engineers — per-variant config schema (single source of truth)
 * ─────────────────────────────────────────────────────────────────────────────
 * Mirrors fabp-landing-pages (one strict Zod schema both AI generations and
 * admin saves validate against) + Content-Authority (full content object stored
 * as Postgres jsonb). ONE schema covers both templates, discriminated by
 * `templateType`. Every control in the prototype's gear panel is a field here.
 *
 * The prototype's "Export config (JSON)" button emits a representative shape;
 * this is the production contract it maps to.
 */

/* ── Primitives ─────────────────────────────────────────────────────────── */

export const slugSchema = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "lowercase letters, numbers and dashes only");

const url = z.string().url();
const optionalUrl = z.string().url().or(z.literal("")).optional();

export const templateTypeSchema = z.enum(["client", "talent"]);
export type TemplateType = z.infer<typeof templateTypeSchema>;

/* ── 4.1 Targeting envelope ─────────────────────────────────────────────────
 * All fields optional in one object; the admin UI surfaces the relevant subset
 * per templateType, and the AI fills what it can from the targeting inputs. */

export const targetingSchema = z
  .object({
    // Client targeting (CEOs / owners / operators)
    industry: z.string().default(""),
    title: z.string().default(""), // job title/role of the target reader
    company: z.string().default(""), // optional, for 1:1 ABM pages
    accountName: z.string().default(""),
    painPoints: z.array(z.string()).default([]), // optional seed hints

    // Talent targeting (developers / architects / PMs / scrum / program / product)
    role: z.string().default(""),
    discipline: z.string().default(""), // backend / frontend / full-stack / data-ML / delivery-leadership
    seniority: z.string().default(""),
    location: z.string().default(""),
  })
  .partial();
export type Targeting = z.infer<typeof targetingSchema>;

/* ── 4.2 Sections toggle map ─────────────────────────────────────────────────
 * `spec` (the dark design-time band) never ships — it is intentionally absent. */

export const sectionsSchema = z.object({
  hero: z.boolean().default(true),
  problem: z.boolean().default(true),
  guide: z.boolean().default(true),
  plan: z.boolean().default(true),
  proof: z.boolean().default(true),
  objections: z.boolean().default(true),
  cta: z.boolean().default(true),
  footer: z.boolean().default(true),
});
export type Sections = z.infer<typeof sectionsSchema>;

/* ── 4.4 Media ───────────────────────────────────────────────────────────── */

export const heroMediaSchema = z.object({
  type: z.enum(["image", "youtube", "vimeo"]).default("image"),
  imageUrl: z.string().default(""),
  imageAlt: z.string().default(""),
  videoUrl: z.string().default(""),
});

export const guidePanelSchema = z.object({
  mode: z.enum(["stats", "image"]).default("stats"),
  imageUrl: z.string().default(""),
  imageAlt: z.string().default(""),
});

export const proofPanelSchema = z.object({
  mode: z.enum(["metrics", "image"]).default("metrics"),
  imageUrl: z.string().default(""),
  imageAlt: z.string().default(""),
  side: z.enum(["left", "right"]).default("right"),
});

export const logoTreatmentSchema = z.enum(["chip", "white", "hide"]).default("chip");
export type LogoTreatment = z.infer<typeof logoTreatmentSchema>;

/* ── 4.3 Copy — every section ────────────────────────────────────────────── */

const statSchema = z.object({ num: z.string(), label: z.string() });

export const heroSchema = z.object({
  eyebrow: z.string(),
  headline: z.string(),
  subhead: z.string(),
  ctaLabel: z.string(),
  footnote: z.string().default(""),
  badge: z.string().default(""), // floating badge on hero media
  media: heroMediaSchema.default({}),
});

export const problemSchema = z.object({
  heading: z.string(),
  subhead: z.string().default(""),
  cards: z
    .array(z.object({ icon: z.string().default(""), title: z.string(), body: z.string() }))
    .length(3),
});

export const guideSchema = z.object({
  eyebrow: z.string(),
  heading: z.string(),
  paragraphs: z.array(z.string()).length(2),
  chips: z.array(z.string()).length(3),
  stat1: statSchema,
  stat2: statSchema,
  credentials: z.string(),
  panel: guidePanelSchema.default({}),
});

export const planSchema = z.object({
  eyebrow: z.string(),
  heading: z.string(),
  subhead: z.string().default(""),
  steps: z
    .array(
      z.object({
        step: z.string(), // numbered badge label, e.g. "1"
        kicker: z.string(),
        title: z.string(),
        body: z.string(),
      }),
    )
    .length(3),
  ctaLabel: z.string(),
});

export const proofSchema = z.object({
  eyebrow: z.string(),
  heading: z.string(),
  quote: z.string(),
  attribution: z.object({
    name: z.string().default(""),
    title: z.string().default(""),
    company: z.string().default(""),
  }),
  metrics: z.array(statSchema).length(2),
  caseStudy: z.string().default(""),
  panel: proofPanelSchema.default({}),
});

export const objectionsSchema = z.object({
  heading: z.string(),
  items: z.array(z.object({ q: z.string(), a: z.string() })).length(4),
});

export const finalCtaSchema = z.object({
  heading: z.string(),
  body: z.string(),
  bullets: z.array(z.string()).length(3),
  cardHeading: z.string(),
  cardSubhead: z.string(),
  ctaLabel: z.string(),
});

export const footerSchema = z.object({
  tagline: z.string(),
  phone: z.string().default(""), // admin-editable tracking number
  logo: logoTreatmentSchema,
  // Legal links default to the canonical Agility Engineers pages (README §9).
  termsUrl: url.default("https://www.agility-engineers.com/about/terms"),
  privacyUrl: url.default("https://www.agility-engineers.com/about/privacy"),
  // Year is always rendered with new Date().getFullYear() — never stored.
});

export const copySchema = z.object({
  hero: heroSchema,
  problem: problemSchema,
  guide: guideSchema,
  plan: planSchema,
  proof: proofSchema,
  objections: objectionsSchema,
  cta: finalCtaSchema,
  footer: footerSchema,
});
export type Copy = z.infer<typeof copySchema>;

/* ── 4.5 Header links (fully admin-managed) ──────────────────────────────── */

export const headerLinkSchema = z.object({ label: z.string(), url: z.string() });

/* ── 4.6 Scheduler / booking (modular) ───────────────────────────────────────
 * The single conversion destination. `link` opens the URL; `embed` builds a
 * dedicated in-app booking route that re-executes the pasted embed scripts.
 * Calendly is the default; SmartScheduler.ai is a first-class provider; `custom`
 * covers the talent directory signup URL and any future provider. Kept modular
 * so a future Calendly/SmartScheduler API integration drops in here. */

export const bookingSchema = z.object({
  provider: z.enum(["calendly", "smartscheduler", "custom"]).default("calendly"),
  mode: z.enum(["link", "embed"]).default("link"),
  url: z.string().default(""),
  embedCode: z.string().default(""),
});
export type Booking = z.infer<typeof bookingSchema>;

/* ── 4.7 SEO / social meta (per variant) ─────────────────────────────────── */

export const metaSchema = z.object({
  title: z.string().default(""),
  description: z.string().default(""),
  ogTitle: z.string().default(""),
  ogDescription: z.string().default(""),
  ogImage: z.string().default(""),
  canonical: z.string().default(""),
});
export type Meta = z.infer<typeof metaSchema>;

/* ── 4.8 / §5 Qualifier (questions + settings) ───────────────────────────── */

export const qualifierOptionSchema = z.object({
  label: z.string(),
  pts: z.number().default(0),
  kill: z.string().optional(), // kill-switch key, e.g. "industry" | "budget" | "bodyrental"
  flag: z.string().optional(), // soft flag, e.g. "discovery"
});

export const qualifierQuestionSchema = z.object({
  id: z.string(),
  q: z.string(),
  options: z.array(qualifierOptionSchema).min(2),
});

export const qualifierSettingsSchema = z.object({
  killOn: z.boolean().default(true), // enable kill-switches (talent default: false)
  killTiming: z.enum(["end", "immediate"]).default("end"),
  showScore: z.boolean().default(false), // show Fit Score to the prospect
  resourceOn: z.boolean().default(true), // show the better-fit resource page (talent default: false)
  // Tier thresholds (Elite >= elite, Moderate >= moderate, else Low).
  eliteThreshold: z.number().default(80),
  moderateThreshold: z.number().default(50),
});

export const qualifierSchema = z.object({
  questions: z.array(qualifierQuestionSchema).min(1),
  settings: qualifierSettingsSchema.default({}),
});
export type Qualifier = z.infer<typeof qualifierSchema>;

/* ── Provenance (audit: which provider/model/targeting produced this) ────── */

export const provenanceSchema = z.object({
  provider: z.enum(["anthropic", "openai"]).nullable().default(null),
  model: z.string().default(""),
  generatedAt: z.string().default(""), // ISO timestamp
  targetingInputs: targetingSchema.optional(), // snapshot of targeting at generation time
});

/* ── The variant: the full per-page config ───────────────────────────────── */

export const variantSchema = z.object({
  // Envelope
  templateType: templateTypeSchema,
  slug: slugSchema,
  label: z.string().min(1), // internal admin name
  published: z.boolean().default(false),
  // The one variant served at /client (or /talent) as the public generic page for
  // its templateType. At most one default per type; independent of `published`.
  isDefault: z.boolean().default(false),

  // Targeting + audience interpolation token (Content-Authority {audience} pattern)
  targeting: targetingSchema.default({}),
  audience: z.string().default(""),

  // Composition + content
  sections: sectionsSchema,
  copy: copySchema,
  headerLinks: z.array(headerLinkSchema).default([]),

  // Conversion + SEO + qualifier
  booking: bookingSchema.default({}),
  meta: metaSchema.default({}),
  qualifier: qualifierSchema,

  // Audit
  provenance: provenanceSchema.default({}),

  // Timestamps are owned by the DB layer (stamped on write); surfaced read-only.
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type Variant = z.infer<typeof variantSchema>;

/* ── Front page (the public site router at /) ─────────────────────────────────
 * The site's front page is a singleton content record — NOT a variant (the
 * variant schema is landing-page shaped and templateType is client|talent). It
 * routes visitors to /client or /talent and offers a standalone "book a meeting"
 * CTA. Stored in the `site_content` table under key 'frontpage' and edited in the
 * admin CMS like a variant. The CTA's scheduler destination is intentionally NOT
 * stored here — it resolves live from the client default's booking config so the
 * two always stay in sync. */

export const frontPageCardSchema = z.object({
  eyebrow: z.string(),
  heading: z.string(),
  body: z.string(),
  action: z.string(),
  href: z.string().default("/client"),
});
export type FrontPageCard = z.infer<typeof frontPageCardSchema>;

export const frontPageSchema = z.object({
  meta: z
    .object({ title: z.string().default("Agility Engineers — Moving real ideas to production.") })
    .default({}),
  eyebrow: z.string().default("Agility Engineers"),
  headline: z.string(),
  subhead: z.string(),
  clientCard: frontPageCardSchema,
  talentCard: frontPageCardSchema,
  cta: z.object({
    prompt: z.string(),
    label: z.string(),
    footnote: z.string(),
  }),
  footer: z.object({
    tagline: z.string(),
    termsUrl: z.string().url().default("https://www.agility-engineers.com/about/terms"),
    privacyUrl: z.string().url().default("https://www.agility-engineers.com/about/privacy"),
  }),
  // Which optional blocks render on the public front page. Hero copy (eyebrow,
  // headline, subhead) is the page's identity and always shows; these are the
  // admin-toggleable blocks. `.default({})` keeps records saved before this
  // field existed valid — they resolve to all-on.
  sections: z
    .object({
      clientCard: z.boolean().default(true),
      talentCard: z.boolean().default(true),
      cta: z.boolean().default(true),
      footer: z.boolean().default(true),
    })
    .default({}),
});
export type FrontPage = z.infer<typeof frontPageSchema>;

/* ── Projects portfolio (singleton in `site_content`, key 'projects') ─────────
 * The public /projects page: an intro band plus a grid of shipped-app cards.
 * Stored and edited exactly like the front page (one JSON object in
 * `site_content`, admin-edited at /admin/projects), so the portfolio is managed
 * without a developer or redeploy. Image fields are loose strings (URL or
 * /assets path), matching the heroMedia.imageUrl convention. */

export const projectSchema = z.object({
  /** Stable id — React key + S3 upload namespace for the screenshot. */
  id: z.string().default(""),
  name: z.string().default(""),
  blurb: z.string().default(""),
  screenshot: z.string().default(""),
  screenshotAlt: z.string().default(""),
  url: z.string().default(""),
  tags: z.array(z.string()).default([]),
  // Show this project on the public page. Lets an admin hide a card without
  // deleting it. `.default(true)` keeps pre-existing records visible.
  visible: z.boolean().default(true),
});
export type Project = z.infer<typeof projectSchema>;

export const projectsPageSchema = z.object({
  intro: z
    .object({
      eyebrow: z.string().default("Shipped & in production"),
      headline: z.string().default("Software we've moved to production."),
      subhead: z
        .string()
        .default(
          "These are real applications Agility Engineers designed, built, and launched for clients — live, supported, and doing work every day. Browse the projects below and click any card to open the live application.",
        ),
    })
    .default({}),
  items: z.array(projectSchema).default([]),
  // Toggle the intro band on the public /projects page. `.default({})` keeps
  // pre-existing records valid (intro shown).
  sections: z.object({ intro: z.boolean().default(true) }).default({}),
});
export type ProjectsPage = z.infer<typeof projectsPageSchema>;

/* ── AI request shape (admin picks provider per generation) ──────────────── */

export const providerSchema = z.enum(["anthropic", "openai"]);
export type Provider = z.infer<typeof providerSchema>;

export const generateRequestSchema = z.object({
  templateType: templateTypeSchema,
  slug: slugSchema,
  label: z.string().min(1),
  targeting: targetingSchema.default({}),
  provider: providerSchema.default("anthropic"),
});
export type GenerateRequest = z.infer<typeof generateRequestSchema>;

/**
 * The AI-authored slice: everything the model produces. Targeting, slug, label,
 * sections toggles, booking and qualifier settings are admin-owned and merged in
 * around this — so the model only fills copy + meta + audience, and we validate
 * that slice, then assemble the full Variant.
 */
export const aiContentSchema = z.object({
  audience: z.string(),
  copy: copySchema,
  meta: metaSchema,
});
export type AiContent = z.infer<typeof aiContentSchema>;

/** Section keys the per-section regenerate endpoint accepts. */
export const regenerableSections = [
  "hero",
  "problem",
  "guide",
  "plan",
  "proof",
  "objections",
  "cta",
] as const;
export type RegenerableSection = (typeof regenerableSections)[number];
