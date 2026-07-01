import "server-only";
import { query } from "@/lib/db";
import { ensureReady } from "@/lib/bootstrap";
import type { LeadInfo, ZapierStatus } from "@/lib/zapier";
import type { ScoreResult } from "@/lib/scoring";
import type { Variant } from "@/config/schema";

/** DB persistence for captured leads + the admin lead list. */

export interface LeadRecord {
  id: number;
  variant_slug: string;
  template_type: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  answers: Record<string, number>;
  score: number;
  tier: string;
  kills: string[];
  flags: string[];
  targeting: Variant["targeting"];
  provider: string | null;
  model: string;
  zapier_status: string;
  created_at: string;
}

export async function insertLead(args: {
  variant: Variant;
  lead: LeadInfo;
  answers: Record<string, number>;
  result: ScoreResult;
  zapierStatus: ZapierStatus;
  zapierError?: string;
  userAgent?: string;
  ip?: string;
}): Promise<number> {
  await ensureReady();
  const { variant, lead, answers, result } = args;
  const { rows } = await query<{ id: number }>(
    `INSERT INTO leads
       (variant_slug, template_type, name, email, company, phone, answers, score, tier,
        kills, flags, targeting, provider, model, zapier_status, zapier_error, user_agent, ip_address)
     VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10::jsonb,$11::jsonb,$12::jsonb,$13,$14,$15,$16,$17,$18)
     RETURNING id`,
    [
      variant.slug,
      variant.templateType,
      lead.name,
      lead.email,
      lead.company,
      lead.phone,
      JSON.stringify(answers),
      result.total,
      result.tier,
      JSON.stringify(result.kills),
      JSON.stringify(result.flags),
      JSON.stringify(variant.targeting),
      variant.provenance.provider,
      variant.provenance.model,
      args.zapierStatus,
      args.zapierError ?? null,
      args.userAgent ?? null,
      args.ip ?? null,
    ],
  );
  return rows[0].id;
}

export async function listLeads(opts: { slug?: string; limit?: number } = {}): Promise<LeadRecord[]> {
  await ensureReady();
  const limit = Math.min(opts.limit ?? 200, 1000);
  const params: unknown[] = [];
  let where = "";
  if (opts.slug) {
    params.push(opts.slug);
    where = `WHERE variant_slug = $1`;
  }
  params.push(limit);
  const { rows } = await query<LeadRecord>(
    `SELECT id, variant_slug, template_type, name, email, company, phone, answers, score, tier,
            kills, flags, targeting, provider, model, zapier_status, created_at
     FROM leads ${where} ORDER BY created_at DESC LIMIT $${params.length}`,
    params,
  );
  return rows;
}
