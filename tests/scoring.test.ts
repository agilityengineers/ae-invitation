import { describe, it, expect } from "vitest";
import { score, resolveRouting } from "@/lib/scoring";
import { clientDefault } from "@/config/defaults/client";
import { talentDefault } from "@/config/defaults/talent";

const clientQ = clientDefault.qualifier;

describe("score", () => {
  it("sums points and assigns elite tier", () => {
    // industry(25) + stage(15) + po(20) + budget(25) + team(10) + compliance(5) = 100
    const answers = { industry: 0, stage: 0, po: 0, budget: 0, team: 0, compliance: 0 };
    const r = score(clientQ, answers);
    expect(r.total).toBe(100);
    expect(r.tier).toBe("elite");
    expect(r.disqualified).toBe(false);
  });

  it("disqualifies on a kill-switch when killOn", () => {
    // budget "Under $15,000" carries kill:"budget"
    const answers = { industry: 0, stage: 0, po: 0, budget: 4, team: 0, compliance: 0 };
    const r = score(clientQ, answers);
    expect(r.kills).toContain("budget");
    expect(r.disqualified).toBe(true);
    expect(r.tier).toBe("disqualified");
  });

  it("ignores kill-switches when killOn is false", () => {
    const q = { ...clientQ, settings: { ...clientQ.settings, killOn: false } };
    const answers = { industry: 0, stage: 0, po: 0, budget: 4, team: 0, compliance: 0 };
    const r = score(q, answers);
    expect(r.disqualified).toBe(false);
  });

  it("demotes elite to moderate on a discovery flag", () => {
    // po option index 2 carries flag:"discovery"; keep total >= 80
    const answers = { industry: 0, stage: 0, po: 2, budget: 0, team: 0, compliance: 0 };
    const r = score(clientQ, answers);
    expect(r.flags).toContain("discovery");
    expect(r.tier).toBe("moderate");
  });

  it("talent defaults always qualify (min score >= moderate threshold)", () => {
    const answers = { role: 6, experience: 4, focus: 4, availability: 3, model: 1, agile: 3 };
    const r = score(talentDefault.qualifier, answers);
    expect(r.total).toBeGreaterThanOrEqual(talentDefault.qualifier.settings.moderateThreshold);
    expect(["elite", "moderate"]).toContain(r.tier);
  });
});

describe("resolveRouting", () => {
  it("routes qualified leads to booking", () => {
    const r = score(clientQ, { industry: 0, stage: 0, po: 0, budget: 0, team: 0, compliance: 0 });
    expect(resolveRouting(clientDefault, r).route).toBe("booking");
  });

  it("routes disqualified to resource when resourceOn", () => {
    const r = score(clientQ, { industry: 6, stage: 0, po: 0, budget: 0, team: 0, compliance: 0 });
    expect(resolveRouting(clientDefault, r).route).toBe("resource");
  });

  it("routes to thanks when resource page is off", () => {
    const variant = { ...clientDefault, qualifier: { ...clientQ, settings: { ...clientQ.settings, resourceOn: false } } };
    const r = score(variant.qualifier, { industry: 6, stage: 0, po: 0, budget: 0, team: 0, compliance: 0 });
    expect(resolveRouting(variant, r).route).toBe("thanks");
  });
});
