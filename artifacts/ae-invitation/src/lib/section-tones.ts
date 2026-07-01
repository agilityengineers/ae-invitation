import type { Sections } from "@/config/schema";

/**
 * Per-section top/bottom background tones (shared by both templates — identical
 * design) and a server-side port of the engines' sepSweep(): when hiding a
 * section makes two same-background sections adjacent, insert a hairline
 * separator on the lower section so the seam stays legible.
 */

export const SECTION_ORDER = [
  "hero",
  "problem",
  "guide",
  "plan",
  "proof",
  "objections",
  "cta",
  "footer",
] as const;
export type SectionKey = (typeof SECTION_ORDER)[number];

export const TONES: Record<SectionKey, { top: string; bot: string }> = {
  hero: { top: "#063A5A", bot: "#0F88A2" },
  problem: { top: "#F2F5F7", bot: "#F2F5F7" },
  guide: { top: "#ffffff", bot: "#ffffff" },
  plan: { top: "#F2F5F7", bot: "#ffffff" },
  proof: { top: "#063A5A", bot: "#063A5A" },
  objections: { top: "#ffffff", bot: "#ffffff" },
  cta: { top: "#08527F", bot: "#0F88A2" },
  footer: { top: "#04293F", bot: "#04293F" },
};

function hex2rgb(h: string): [number, number, number] {
  h = h.replace("#", "");
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function colorDist(a: string, b: string): number {
  const x = hex2rgb(a);
  const y = hex2rgb(b);
  return Math.sqrt((x[0] - y[0]) ** 2 + (x[1] - y[1]) ** 2 + (x[2] - y[2]) ** 2);
}

function lum(h: string): number {
  const [r, g, b] = hex2rgb(h);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/** The ordered list of visible section keys per the toggle map. */
export function visibleSections(sections: Sections): SectionKey[] {
  return SECTION_ORDER.filter((k) => sections[k]);
}

/**
 * Returns a map of sectionKey -> CSS border-top value for sections that need a
 * separator because the section above shares a near-identical bottom tone.
 */
export function computeSeparators(sections: Sections): Partial<Record<SectionKey, string>> {
  const vis = visibleSections(sections);
  const out: Partial<Record<SectionKey, string>> = {};
  for (let i = 1; i < vis.length; i++) {
    const prevBot = TONES[vis[i - 1]].bot;
    const curTop = TONES[vis[i]].top;
    if (colorDist(prevBot, curTop) < 46) {
      out[vis[i]] = `1px solid ${lum(curTop) > 0.6 ? "rgba(8,82,127,.13)" : "rgba(255,255,255,.14)"}`;
    }
  }
  return out;
}
