import { describe, it, expect } from "vitest";
import { variantSchema } from "@/config/schema";
import { clientDefault } from "@/config/defaults/client";
import { talentDefault } from "@/config/defaults/talent";

describe("variantSchema", () => {
  it("accepts the client default", () => {
    expect(variantSchema.safeParse(clientDefault).success).toBe(true);
  });

  it("accepts the talent default", () => {
    expect(variantSchema.safeParse(talentDefault).success).toBe(true);
  });

  it("rejects an invalid slug", () => {
    const bad = { ...clientDefault, slug: "Not A Slug!" };
    expect(variantSchema.safeParse(bad).success).toBe(false);
  });

  it("enforces fixed array lengths (3 problem cards)", () => {
    const bad = {
      ...clientDefault,
      copy: { ...clientDefault.copy, problem: { ...clientDefault.copy.problem, cards: clientDefault.copy.problem.cards.slice(0, 2) } },
    };
    expect(variantSchema.safeParse(bad).success).toBe(false);
  });

  it("applies defaults for optional fields", () => {
    const parsed = variantSchema.parse(clientDefault);
    expect(parsed.booking.provider).toBe("calendly");
    expect(parsed.qualifier.settings.eliteThreshold).toBe(80);
  });
});
