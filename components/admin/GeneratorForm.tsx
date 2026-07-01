"use client";

import { useState } from "react";
import type { Provider, TemplateType } from "@/config/schema";

const PROVIDER_LABEL: Record<Provider, string> = { anthropic: "Claude (Anthropic)", openai: "OpenAI" };

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

export function GeneratorForm({ providers }: { providers: Provider[] }) {
  const [templateType, setTemplateType] = useState<TemplateType>("client");
  const [label, setLabel] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [provider, setProvider] = useState<Provider | "">(providers[0] ?? "");
  const [t, setT] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<"" | "ai" | "manual">("");
  const [error, setError] = useState("");

  const effSlug = slugTouched ? slug : slugify(label);

  function setField(k: string, v: string) {
    setT((prev) => ({ ...prev, [k]: v }));
  }

  function targeting() {
    if (templateType === "talent") {
      return {
        role: t.role ?? "",
        discipline: t.discipline ?? "",
        seniority: t.seniority ?? "",
        location: t.location ?? "",
      };
    }
    return {
      industry: t.industry ?? "",
      title: t.title ?? "",
      company: t.company ?? "",
      painPoints: (t.painPoints ?? "").split(/[,\n]/).map((s) => s.trim()).filter(Boolean),
    };
  }

  async function generate() {
    if (!label || !effSlug) return setError("Add a label.");
    if (!provider) return setError("No AI provider is configured (set an API key).");
    setError("");
    setBusy("ai");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateType, slug: effSlug, label, provider, targeting: targeting() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Generation failed");
      window.location.assign(`/admin/${data.variant.slug}?generated=1`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
      setBusy("");
    }
  }

  async function createManual() {
    if (!label || !effSlug) return setError("Add a label.");
    setError("");
    setBusy("manual");
    try {
      const res = await fetch("/api/variants", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateType, slug: effSlug, label }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Create failed");
      window.location.assign(`/admin/${data.variant.slug}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed");
      setBusy("");
    }
  }

  const clientFields: [string, string, string][] = [
    ["industry", "Industry", "e.g. Specialty insurance carrier"],
    ["title", "Target title / role", "e.g. VP of Operations"],
    ["company", "Company / account (optional)", "for a 1:1 ABM page"],
    ["painPoints", "Pain-point hints (optional, comma-separated)", "legacy system, slow delivery"],
  ];
  const talentFields: [string, string, string][] = [
    ["role", "Role", "e.g. Backend developer"],
    ["discipline", "Discipline", "e.g. data-ML / delivery-leadership"],
    ["seniority", "Seniority (optional)", "e.g. Senior / Staff"],
    ["location", "Location (optional)", "e.g. Remote (US)"],
  ];
  const fields = templateType === "talent" ? talentFields : clientFields;

  return (
    <div className="rounded-2xl border border-line bg-white p-6">
      <Labeled label="Template">
        <div className="flex gap-2">
          {(["client", "talent"] as TemplateType[]).map((tt) => (
            <button
              key={tt}
              onClick={() => setTemplateType(tt)}
              className={`rounded-lg border px-4 py-2 text-sm font-semibold capitalize ${
                templateType === tt ? "border-teal bg-teal/10 text-navy" : "border-line text-muted"
              }`}
            >
              {tt === "client" ? "Client Target" : "Talent / Directory"}
            </button>
          ))}
        </div>
      </Labeled>

      <Labeled label="Label (internal name)">
        <input className="ae-input" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Specialty Insurance — VP Ops" />
      </Labeled>
      <Labeled label="Slug (URL)">
        <input
          className="ae-input"
          value={effSlug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(slugify(e.target.value));
          }}
          placeholder="specialty-insurance-vp-ops"
        />
      </Labeled>

      <div className="mt-2 grid gap-3 sm:grid-cols-2">
        {fields.map(([k, lbl, ph]) => (
          <Labeled key={k} label={lbl}>
            <input className="ae-input" value={t[k] ?? ""} onChange={(e) => setField(k, e.target.value)} placeholder={ph} />
          </Labeled>
        ))}
      </div>

      <Labeled label="AI provider">
        {providers.length === 0 ? (
          <p className="text-sm text-amber-700">No provider configured — set ANTHROPIC_API_KEY or OPENAI_API_KEY to enable AI generation. You can still create a blank page below.</p>
        ) : (
          <div className="flex gap-2">
            {providers.map((p) => (
              <button
                key={p}
                onClick={() => setProvider(p)}
                className={`rounded-lg border px-4 py-2 text-sm font-semibold ${provider === p ? "border-teal bg-teal/10 text-navy" : "border-line text-muted"}`}
              >
                {PROVIDER_LABEL[p]}
              </button>
            ))}
          </div>
        )}
      </Labeled>

      {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={generate}
          disabled={busy !== "" || providers.length === 0}
          className="ae-cta rounded-[10px] bg-cta px-5 py-3 font-display font-bold text-white disabled:opacity-60"
        >
          {busy === "ai" ? "Generating…" : "Generate with AI →"}
        </button>
        <button
          onClick={createManual}
          disabled={busy !== ""}
          className="rounded-[10px] border border-line bg-white px-5 py-3 font-display font-bold text-navy disabled:opacity-60"
        >
          {busy === "manual" ? "Creating…" : "Create blank page"}
        </button>
      </div>
    </div>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mt-4 block">
      <span className="mb-1.5 block text-sm font-semibold text-muted">{label}</span>
      {children}
    </label>
  );
}
