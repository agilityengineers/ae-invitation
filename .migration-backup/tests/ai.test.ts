import { describe, it, expect } from "vitest";
import { extractJson, AiError } from "@/lib/ai";

describe("extractJson", () => {
  it("parses bare JSON", () => {
    expect(extractJson('{"a":1}')).toEqual({ a: 1 });
  });
  it("strips ```json fences", () => {
    expect(extractJson('```json\n{"a":2}\n```')).toEqual({ a: 2 });
  });
  it("strips plain ``` fences", () => {
    expect(extractJson('```\n{"a":3}\n```')).toEqual({ a: 3 });
  });
  it("slices an object out of surrounding prose", () => {
    expect(extractJson('Here you go: {"a":4} — enjoy')).toEqual({ a: 4 });
  });
  it("throws AiError on non-JSON", () => {
    expect(() => extractJson("not json at all")).toThrow(AiError);
  });
});
