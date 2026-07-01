import { describe, it, expect } from "vitest";
import { buildZapierPayload } from "@/lib/zapier";
import { score } from "@/lib/scoring";
import { clientDefault } from "@/config/defaults/client";

describe("buildZapierPayload", () => {
  const answers = { industry: 0, stage: 0, po: 0, budget: 0, team: 0, compliance: 0 };
  const result = score(clientDefault.qualifier, answers);
  const lead = { name: "Jane Doe", email: "jane@co.com", company: "Co", phone: "555" };
  const payload = buildZapierPayload(clientDefault, lead, answers, result, "2026-01-01T00:00:00.000Z");

  it("carries the full lead + qualifier + variant context", () => {
    expect(payload.event).toBe("lead.captured");
    expect(payload.variant.slug).toBe(clientDefault.slug);
    expect(payload.variant.templateType).toBe("client");
    expect(payload.lead).toEqual(lead);
    expect(payload.qualifier.score).toBe(result.total);
    expect(payload.qualifier.tier).toBe(result.tier);
  });

  it("expands answers with question + option labels and points", () => {
    expect(payload.qualifier.answers).toHaveLength(clientDefault.qualifier.questions.length);
    const first = payload.qualifier.answers[0];
    expect(first.questionId).toBe("industry");
    expect(first.optionLabel).toBe(clientDefault.qualifier.questions[0].options[0].label);
    expect(typeof first.points).toBe("number");
  });

  it("includes conversion + generation provenance", () => {
    expect(payload.conversion.provider).toBe(clientDefault.booking.provider);
    expect(payload.generation).toHaveProperty("provider");
  });
});
