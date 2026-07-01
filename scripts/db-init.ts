/**
 * One-shot DB init: applies db/schema.sql so the tables exist.
 * Usage: npm run db:init   (requires DATABASE_URL)
 *
 * Self-contained (talks to pg directly, reads the SQL file, no app-module imports)
 * so it runs cleanly under tsx without the "server-only"/path-alias machinery the
 * Next runtime uses. Seed variants load automatically on the app's first DB
 * request (lib/bootstrap ensureReady) — running the app once completes seeding.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { Pool } from "pg";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const cs = connectionString.toLowerCase();
  const localhost = /@(localhost|127\.0\.0\.1|\[::1\]|::1)([:/]|$)/.test(cs);
  const wantSsl =
    process.env.DATABASE_SSL === "true" ||
    /[?&]sslmode=(require|prefer|verify-ca|verify-full)/.test(cs) ||
    (!localhost && process.env.DATABASE_SSL !== "false");

  const pool = new Pool({
    connectionString,
    ssl: wantSsl ? { rejectUnauthorized: false } : undefined,
  });

  const sql = readFileSync(path.join(process.cwd(), "db", "schema.sql"), "utf8");
  await pool.query(sql);
  await pool.end();
  console.log("Schema applied. Seed variants load on the app's first request.");
}

main().catch((err) => {
  console.error("Database init failed:", err);
  process.exit(1);
});
