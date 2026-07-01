import { query } from "@/lib/db";
import { defaultVariants } from "@/config/defaults";

/**
 * Schema-at-first-use bootstrap. Applies the schema (idempotent) then seeds
 * bundled default variants ON CONFLICT DO NOTHING. Runs lazily via ensureReady().
 * The schema is inlined (rather than read from disk) so it resolves identically
 * under dev (cwd = artifact dir) and production (cwd = workspace root).
 */
const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS variants (
  slug          TEXT PRIMARY KEY,
  template_type TEXT NOT NULL CHECK (template_type IN ('client', 'talent')),
  label         TEXT NOT NULL DEFAULT '',
  published     BOOLEAN NOT NULL DEFAULT FALSE,
  config        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS variants_published_idx ON variants (published);
CREATE INDEX IF NOT EXISTS variants_template_idx ON variants (template_type);

CREATE TABLE IF NOT EXISTS leads (
  id            BIGSERIAL PRIMARY KEY,
  variant_slug  TEXT,
  template_type TEXT,
  name          TEXT,
  email         TEXT,
  company       TEXT,
  phone         TEXT,
  answers       JSONB NOT NULL DEFAULT '{}'::jsonb,
  score         INTEGER,
  tier          TEXT,
  kills         JSONB NOT NULL DEFAULT '[]'::jsonb,
  flags         JSONB NOT NULL DEFAULT '[]'::jsonb,
  targeting     JSONB NOT NULL DEFAULT '{}'::jsonb,
  provider      TEXT,
  model         TEXT,
  zapier_status TEXT NOT NULL DEFAULT 'pending',
  zapier_error  TEXT,
  user_agent    TEXT,
  ip_address    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS leads_variant_idx ON leads (variant_slug);
CREATE INDEX IF NOT EXISTS leads_created_idx ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS leads_tier_idx ON leads (tier);
`;

export async function applySchemaAndSeed(): Promise<void> {
  await query(SCHEMA_SQL);
  for (const variant of defaultVariants) {
    await query(
      `INSERT INTO variants (slug, template_type, label, published, config)
       VALUES ($1, $2, $3, $4, $5::jsonb)
       ON CONFLICT (slug) DO NOTHING`,
      [
        variant.slug,
        variant.templateType,
        variant.label,
        variant.published,
        JSON.stringify(variant),
      ],
    );
  }
  console.log("[bootstrap] schema applied and defaults seeded.");
}

let readyPromise: Promise<void> | null = null;

/** Idempotent: applies schema + seed exactly once per process. */
export function ensureReady(): Promise<void> {
  if (!readyPromise) {
    readyPromise = applySchemaAndSeed().catch((err) => {
      readyPromise = null;
      throw err;
    });
  }
  return readyPromise;
}
