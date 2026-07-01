-- ─────────────────────────────────────────────────────────────────────────────
-- Agility Engineers Landing-Page Generator — Postgres schema
-- Idempotent (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS). Applied at boot by
-- instrumentation.ts, mirroring fabp-landing-pages' schema-at-boot approach.
-- ─────────────────────────────────────────────────────────────────────────────

-- Per-variant landing pages. The full Zod-validated Variant lives in `config`
-- (jsonb = single source of truth, Content-Authority pattern). slug / template
-- / published / label are promoted to columns for fast listing + sitemap.
CREATE TABLE IF NOT EXISTS variants (
  slug          TEXT PRIMARY KEY,
  template_type TEXT NOT NULL CHECK (template_type IN ('client', 'talent')),
  label         TEXT NOT NULL DEFAULT '',
  published     BOOLEAN NOT NULL DEFAULT FALSE,
  config        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- The generic page served at /client and /talent. At most one default per type
-- (partial unique index); independent of `published`.
ALTER TABLE variants ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS variants_published_idx ON variants (published);
CREATE INDEX IF NOT EXISTS variants_template_idx ON variants (template_type);
CREATE UNIQUE INDEX IF NOT EXISTS variants_one_default_per_type
  ON variants (template_type) WHERE is_default;

-- Captured leads from the qualifier. Full payload retained for auditability and
-- to mirror what the Zapier outbound webhook fans out.
CREATE TABLE IF NOT EXISTS leads (
  id            BIGSERIAL PRIMARY KEY,
  variant_slug  TEXT,
  template_type TEXT,
  name          TEXT,
  email         TEXT,
  company       TEXT,
  phone         TEXT,
  answers       JSONB NOT NULL DEFAULT '{}'::jsonb,  -- { questionId: optionIndex }
  score         INTEGER,
  tier          TEXT,                                 -- elite | moderate | low | disqualified
  kills         JSONB NOT NULL DEFAULT '[]'::jsonb,
  flags         JSONB NOT NULL DEFAULT '[]'::jsonb,
  targeting     JSONB NOT NULL DEFAULT '{}'::jsonb,
  provider      TEXT,                                 -- generation provider on the variant
  model         TEXT,
  zapier_status TEXT NOT NULL DEFAULT 'pending',      -- pending | sent | failed | skipped
  zapier_error  TEXT,
  user_agent    TEXT,
  ip_address    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_variant_idx ON leads (variant_slug);
CREATE INDEX IF NOT EXISTS leads_created_idx ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS leads_tier_idx ON leads (tier);
