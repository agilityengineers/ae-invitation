import "server-only";
import { query } from "@/lib/db";
import { ensureReady } from "@/lib/bootstrap";
import { variantSchema, type Variant } from "@/config/schema";

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
    `INSERT INTO variants (slug, template_type, label, published, config, updated_at)
     VALUES ($1, $2, $3, $4, $5::jsonb, now())
     ON CONFLICT (slug) DO UPDATE SET
       template_type = EXCLUDED.template_type,
       label = EXCLUDED.label,
       published = EXCLUDED.published,
       config = EXCLUDED.config,
       updated_at = now()
     RETURNING slug, config, created_at, updated_at`,
    [
      variant.slug,
      variant.templateType,
      variant.label,
      variant.published,
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

export async function deleteVariant(slug: string): Promise<void> {
  await ensureReady();
  await query("DELETE FROM variants WHERE slug = $1", [slug]);
}
