import type { Qualifier, Variant } from "@/config/schema";

/**
 * Qualifier scoring + routing, ported from the prototype engines' compute() and
 * the renderResult/renderBooking/renderResource routing. Pure (no IO) so it runs
 * identically on the server (authoritative lead record) and the client (instant
 * immediate-kill bounce). Answers map question id -> chosen option index.
 */

export type Tier = "elite" | "moderate" | "low" | "disqualified";

export interface ScoreResult {
  total: number;
  tier: Tier;
  kills: string[];
  flags: string[];
  disqualified: boolean;
}

export function score(qualifier: Qualifier, answers: Record<string, number>): ScoreResult {
  const { questions, settings } = qualifier;
  let total = 0;
  const kills: string[] = [];
  const flags: string[] = [];

  for (const q of questions) {
    const oi = answers[q.id];
    if (oi == null) continue;
    const opt = q.options[oi];
    if (!opt) continue;
    total += opt.pts || 0;
    if (opt.kill) kills.push(opt.kill);
    if (opt.flag) flags.push(opt.flag);
  }

  const disqualified = settings.killOn && kills.length > 0;
  let tier: Tier = disqualified
    ? "disqualified"
    : total >= settings.eliteThreshold
      ? "elite"
      : total >= settings.moderateThreshold
        ? "moderate"
        : "low";
  // A "discovery" flag demotes an otherwise-elite lead to moderate (paid-discovery framing).
  if (flags.includes("discovery") && tier === "elite") tier = "moderate";

  return { total, tier, kills, flags, disqualified };
}

export type RouteType = "booking" | "resource" | "thanks";

export interface Routing {
  route: RouteType;
  showScore: boolean;
  bookingMode: "link" | "embed";
  bookingUrl: string;
  bookingSlug: string;
}

/** Decide where a scored lead goes, from the variant's booking + qualifier settings. */
export function resolveRouting(variant: Variant, result: ScoreResult): Routing {
  const settings = variant.qualifier.settings;
  const qualified = result.tier === "elite" || result.tier === "moderate";
  const route: RouteType = qualified ? "booking" : settings.resourceOn ? "resource" : "thanks";
  return {
    route,
    showScore: settings.showScore,
    bookingMode: variant.booking.mode,
    bookingUrl: variant.booking.url,
    bookingSlug: variant.slug,
  };
}
