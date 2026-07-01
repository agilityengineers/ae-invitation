import { describe, it, expect } from "vitest";
import { computeSeparators, visibleSections } from "@/lib/section-tones";
import { sectionsSchema } from "@/config/schema";

const allOn = sectionsSchema.parse({});

describe("computeSeparators (sepSweep)", () => {
  it("no separators when all sections visible (tones differ at every seam)", () => {
    const sep = computeSeparators(allOn);
    // hero->problem, problem->guide etc. all differ enough; problem(F2F5F7)->guide(white) is close.
    // problem bottom #F2F5F7 vs guide top #ffffff are near — a separator is expected there.
    expect(sep.guide).toBeTruthy();
  });

  it("inserts a separator when hiding a section makes two light sections adjacent", () => {
    // Hide guide + plan so problem (#F2F5F7) sits directly above proof (#063A5A): different → no sep.
    const sep = computeSeparators({ ...allOn, guide: false, plan: false });
    expect(sep.proof).toBeFalsy();
  });

  it("hiding hero makes problem the first section (no separator on the first)", () => {
    const sep = computeSeparators({ ...allOn, hero: false });
    const vis = visibleSections({ ...allOn, hero: false });
    expect(vis[0]).toBe("problem");
    expect(sep.problem).toBeFalsy();
  });
});
