import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import { query } from "@/lib/db";
import { seedDefaults } from "@/lib/config";

/**
 * Applies db/schema.sql (idempotent) then seeds bundled default variants once.
 * Called from instrumentation.ts at server boot (Node runtime), mirroring
 * fabp-landing-pages' schema-at-boot approach. There is no migration framework;
 * schema.sql uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS throughout.
 */
export async function applySchemaAndSeed(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.warn("[bootstrap] DATABASE_URL not set — skipping schema/seed.");
    return;
  }
  const sqlPath = path.join(process.cwd(), "db", "schema.sql");
  const sql = readFileSync(sqlPath, "utf8");
  await query(sql);
  await seedDefaults();
  console.log("[bootstrap] schema applied and defaults seeded.");
}
