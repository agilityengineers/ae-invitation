/**
 * One-shot DB init: applies db/schema.sql and seeds default variants.
 * Usage: npm run db:init   (requires DATABASE_URL)
 */
import { applySchemaAndSeed } from "../lib/bootstrap";

applySchemaAndSeed()
  .then(() => {
    console.log("Database initialized.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Database init failed:", err);
    process.exit(1);
  });
