/**
 * Next.js instrumentation hook — runs once when the server process starts.
 * Applies the DB schema and seeds default variants on the Node runtime only
 * (skipped on the edge runtime, where pg is unavailable).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { applySchemaAndSeed } = await import("@/lib/bootstrap");
  try {
    await applySchemaAndSeed();
  } catch (err) {
    console.error("[instrumentation] schema/seed failed:", err);
  }
}
