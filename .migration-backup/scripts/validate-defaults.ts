/**
 * Parses the bundled default variants through the Zod schema. Run in CI / before
 * build to prove the schema and the seed data agree. Exits non-zero on failure.
 */
import { variantSchema } from "../config/schema";
import { clientDefault } from "../config/defaults/client";
import { talentDefault } from "../config/defaults/talent";

let failed = false;
for (const [name, data] of [
  ["client", clientDefault],
  ["talent", talentDefault],
] as const) {
  const result = variantSchema.safeParse(data);
  if (result.success) {
    console.log(`✓ ${name} default validates against variantSchema`);
  } else {
    failed = true;
    console.error(`✗ ${name} default failed validation:`);
    for (const issue of result.error.issues) {
      console.error(`   ${issue.path.join(".")}: ${issue.message}`);
    }
  }
}

process.exit(failed ? 1 : 0);
