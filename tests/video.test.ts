import { describe, it, expect } from "vitest";
import { videoEmbedSrc } from "@/lib/video";

describe("videoEmbedSrc", () => {
  it("parses a youtu.be short link", () => {
    expect(videoEmbedSrc("youtube", "https://youtu.be/dQw4w9WgXcQ")).toContain("/embed/dQw4w9WgXcQ");
  });
  it("parses a watch?v= link with autoplay+mute+loop", () => {
    const src = videoEmbedSrc("youtube", "https://www.youtube.com/watch?v=abc123XYZ");
    expect(src).toContain("autoplay=1");
    expect(src).toContain("mute=1");
    expect(src).toContain("loop=1");
  });
  it("parses a vimeo numeric id", () => {
    expect(videoEmbedSrc("vimeo", "https://vimeo.com/76979871")).toContain("player.vimeo.com/video/76979871");
  });
  it("returns empty for an unparseable url", () => {
    expect(videoEmbedSrc("youtube", "")).toBe("");
    expect(videoEmbedSrc("image", "whatever")).toBe("");
  });
});
