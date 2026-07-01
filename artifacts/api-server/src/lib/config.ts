import { query, withClient } from "@/lib/db";
import { ensureReady } from "@/lib/bootstrap";
import { variantSchema, frontPageSchema, type Variant, type FrontPage } from "@/config/schema";
import { frontPageDefault } from "@/config/defaults";

type TemplateType = Variant["templateType"];

/**
 * The only module that reads/writes variant configs. Postgres-backed (configs
 * are jsonb, the single source of truth) — the Content-Authority pattern, with
 * fabp's "validate on every read and write" discipline.
 */

interface VariantRow {
  slug: string;
  config: Variant;
  created_at: Date;
  updated_at: Date;
}

function rowToVariant(row: VariantRow): Variant {
  // The DB column timestamps are authoritative; merge them onto the parsed config.
  return variantSchema.parse({
    ...row.config,
    slug: row.slug,
    createdAt: row.created_at?.toISOString?.() ?? row.config.createdAt,
    updatedAt: row.updated_at?.toISOString?.() ?? row.config.updatedAt,
  });
}

export async function listVariants(): Promise<Variant[]> {
  await ensureReady();
  const { rows } = await query<VariantRow>(
    "SELECT slug, config, created_at, updated_at FROM variants ORDER BY updated_at DESC",
  );
  return rows.map(rowToVariant);
}

export async function listSlugs(): Promise<string[]> {
  await ensureReady();
  const { rows } = await query<{ slug: string }>("SELECT slug FROM variants");
  return rows.map((r) => r.slug);
}

export async function listPublishedVariants(): Promise<Variant[]> {
  await ensureReady();
  const { rows } = await query<VariantRow>(
    "SELECT slug, config, created_at, updated_at FROM variants WHERE published = TRUE ORDER BY updated_at DESC",
  );
  return rows.map(rowToVariant);
}

export async function getVariant(slug: string): Promise<Variant | null> {
  await ensureReady();
  const { rows } = await query<VariantRow>(
    "SELECT slug, config, created_at, updated_at FROM variants WHERE slug = $1",
    [slug],
  );
  return rows[0] ? rowToVariant(rows[0]) : null;
}

export async function slugExists(slug: string): Promise<boolean> {
  await ensureReady();
  const { rows } = await query<{ exists: boolean }>(
    "SELECT EXISTS(SELECT 1 FROM variants WHERE slug = $1) AS exists",
    [slug],
  );
  return rows[0]?.exists ?? false;
}

/**
 * Upsert a variant. Validates against the schema first; the full object is
 * stored in `config` jsonb, with slug/template/label/published promoted to
 * columns and updated_at stamped on every write.
 */
export async function saveVariant(input: Variant): Promise<Variant> {
  await ensureReady();
  const variant = variantSchema.parse(input);
  const { rows } = await query<VariantRow>(
    `INSERT INTO variants (slug, template_type, label, published, is_default, config, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, now())
     ON CONFLICT (slug) DO UPDATE SET
       template_type = EXCLUDED.template_type,
       label = EXCLUDED.label,
       published = EXCLUDED.published,
       is_default = EXCLUDED.is_default,
       config = EXCLUDED.config,
       updated_at = now()
     RETURNING slug, config, created_at, updated_at`,
    [
      variant.slug,
      variant.templateType,
      variant.label,
      variant.published,
      variant.isDefault,
      JSON.stringify(variant),
    ],
  );
  return rowToVariant(rows[0]);
}

export async function setPublished(slug: string, published: boolean): Promise<Variant | null> {
  const existing = await getVariant(slug);
  if (!existing) return null;
  return saveVariant({ ...existing, published });
}

/** The variant currently marked default for a template type, or null if none. */
export async function getDefaultVariant(templateType: TemplateType): Promise<Variant | null> {
  await ensureReady();
  const { rows } = await query<VariantRow>(
    "SELECT slug, config, created_at, updated_at FROM variants WHERE template_type = $1 AND is_default = TRUE LIMIT 1",
    [templateType],
  );
  return rows[0] ? rowToVariant(rows[0]) : null;
}

/**
 * Make `slug` the sole default for its template type. Atomic: clears the flag on
 * any current default of that type, then sets it here — keeping both the promoted
 * column and the JSONB config in sync so the partial unique index is never violated.
 */
export async function setAsDefault(slug: string): Promise<Variant | null> {
  const target = await getVariant(slug);
  if (!target) return null;
  await withClient(async (client) => {
    await client.query("BEGIN");
    try {
      await client.query(
        `UPDATE variants
           SET is_default = FALSE,
               config = jsonb_set(config, '{isDefault}', 'false'::jsonb),
               updated_at = now()
         WHERE template_type = $1 AND is_default = TRUE`,
        [target.templateType],
      );
      await client.query(
        `UPDATE variants
           SET is_default = TRUE,
               config = jsonb_set(config, '{isDefault}', 'true'::jsonb),
               updated_at = now()
         WHERE slug = $1`,
        [slug],
      );
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    }
  });
  return getVariant(slug);
}

export async function deleteVariant(slug: string): Promise<void> {
  await ensureReady();
  await query("DELETE FROM variants WHERE slug = $1", [slug]);
}

/* ── Front page (singleton in `site_content`, key 'frontpage') ───────────────
 * Same validate-on-read/write discipline as variants. Falls back to the bundled
 * default whenever the row is missing or fails validation, so the page never
 * dead-ends. */

export async function getFrontPage(): Promise<FrontPage> {
  await ensureReady();
  const { rows } = await query<{ config: unknown }>(
    "SELECT config FROM site_content WHERE key = 'frontpage'",
  );
  if (!rows[0]) return frontPageDefault;
  const parsed = frontPageSchema.safeParse(rows[0].config);
  return parsed.success ? parsed.data : frontPageDefault;
}

export async function saveFrontPage(input: FrontPage): Promise<FrontPage> {
  await ensureReady();
  const frontPage = frontPageSchema.parse(input);
  const { rows } = await query<{ config: FrontPage }>(
    `INSERT INTO site_content (key, config, updated_at)
     VALUES ('frontpage', $1::jsonb, now())
     ON CONFLICT (key) DO UPDATE SET config = EXCLUDED.config, updated_at = now()
     RETURNING config`,
    [JSON.stringify(frontPage)],
  );
  return frontPageSchema.parse(rows[0].config);
}
