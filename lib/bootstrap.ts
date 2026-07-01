import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import { query } from "@/lib/db";
import { defaultVariants } from "@/config/defaults";

/**
 * Schema-at-first-use bootstrap. Applies db/schema.sql (idempotent) then seeds
 * bundled default variants ON CONFLICT DO NOTHING. Runs lazily on the Node
 * runtime via ensureReady() — there is no migration framework, and schema.sql
 * uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS throughout (fabp approach).
 *
 * Seeding is inlined here (rather than importing lib/config) to avoid an import
 * cycle: config -> bootstrap (ensureReady) -> config.
 */
export async function applySchemaAndSeed(): Promise<void> {
  const sqlPath = path.join(process.cwd(), "db", "schema.sql");
  const sql = readFileSync(sqlPath, "utf8");
  await query(sql);
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
      readyPromise = null; // allow a later retry if the first attempt failed
      throw err;
    });
  }
  return readyPromise;
}
