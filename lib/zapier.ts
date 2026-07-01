import "server-only";
import type { Variant } from "@/config/schema";
import type { ScoreResult } from "@/lib/scoring";

/**
 * Outbound Zapier webhook (lead-first destination). Fires on lead capture with
 * the full payload so leads fan out to any downstream app. Kept generic/modular
 * so the existing repo syncs can coexist or be swapped per client direction.
 */

export interface LeadInfo {
  name: string;
  email: string;
  company: string;
  phone: string;
}

export interface ZapierPayload {
  event: "lead.captured";
  capturedAt: string;
  variant: { slug: string; label: string; templateType: string };
  targeting: Variant["targeting"];
  audience: string;
  lead: LeadInfo;
  qualifier: {
    score: number;
    tier: string;
    disqualified: boolean;
    kills: string[];
    flags: string[];
    answers: { questionId: string; question: string; optionIndex: number; optionLabel: string; points: number }[];
  };
  generation: { provider: string | null; model: string };
  conversion: { provider: string; mode: string; url: string };
}

export function buildZapierPayload(
  variant: Variant,
  lead: LeadInfo,
  answers: Record<string, number>,
  result: ScoreResult,
  capturedAt: string,
): ZapierPayload {
  const answerDetail = variant.qualifier.questions
    .map((q) => {
      const oi = answers[q.id];
      const opt = oi != null ? q.options[oi] : undefined;
      if (!opt) return null;
      return {
        questionId: q.id,
        question: q.q,
        optionIndex: oi,
        optionLabel: opt.label,
        points: opt.pts || 0,
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  return {
    event: "lead.captured",
    capturedAt,
    variant: { slug: variant.slug, label: variant.label, templateType: variant.templateType },
    targeting: variant.targeting,
    audience: variant.audience,
    lead,
    qualifier: {
      score: result.total,
      tier: result.tier,
      disqualified: result.disqualified,
      kills: result.kills,
      flags: result.flags,
      answers: answerDetail,
    },
    generation: { provider: variant.provenance.provider, model: variant.provenance.model },
    conversion: {
      provider: variant.booking.provider,
      mode: variant.booking.mode,
      url: variant.booking.url,
    },
  };
}

export type ZapierStatus = "sent" | "failed" | "skipped";

/** Best-effort POST to the Zapier catch hook. Never throws — returns a status. */
export async function sendToZapier(
  payload: ZapierPayload,
): Promise<{ status: ZapierStatus; error?: string }> {
  const url = process.env.ZAPIER_WEBHOOK_URL;
  if (!url) return { status: "skipped" };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return { status: "failed", error: `Zapier responded ${res.status}` };
    return { status: "sent" };
  } catch (err) {
    return { status: "failed", error: err instanceof Error ? err.message : "network error" };
  }
}
