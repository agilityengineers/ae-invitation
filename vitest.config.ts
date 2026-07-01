import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import tsconfigPaths from "vite-tsconfig-paths";

const emptyStub = fileURLToPath(new URL("./tests/stubs/empty.ts", import.meta.url));

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    // "server-only" throws when imported outside a React Server Component; stub it
    // so pure server helpers (scoring, zapier, ai parsing) can be unit-tested.
    alias: { "server-only": emptyStub },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
