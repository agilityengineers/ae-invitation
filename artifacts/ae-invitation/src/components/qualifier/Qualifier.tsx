"use client";

import { useState } from "react";
import type { Variant } from "@/config/schema";
import { score, resolveRouting, type Routing, type Tier } from "@/lib/scoring";
import { openBooking } from "@/lib/booking";

/**
 * Interactive multi-step qualifier (modal): questions → lead capture → scoring
 * → routing (booking / resource / thanks). Ported from the prototype engines'
 * renderQuestion/renderLead/renderResult/renderBooking/renderResource. Scoring
 * is authoritative server-side (/api/leads); the client computes locally only
 * for the immediate-kill bounce (which captures no lead, matching the engines).
 */

const C = {
  teal: "#0F88A2",
  navy: "#08527F",
  green: "#2E8B57",
  bg: "#F2F5F7",
  ink: "#0B2A38",
  muted: "#5A6B73",
  line: "#E2E8EB",
};

type View = "q" | "lead" | "score" | "booking" | "resource" | "thanks";

interface ServerResult {
  score: number;
  tier: Tier;
  routing: Routing;
}

export function Qualifier({ variant, onClose }: { variant: Variant; onClose: () => void }) {
  const questions = variant.qualifier.questions;
  const settings = variant.qualifier.settings;
  const talent = variant.templateType === "talent";

  const [view, setView] = useState<View>("q");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [lead, setLead] = useState({ name: "", email: "", company: "", phone: "" });
  const [result, setResult] = useState<ServerResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const N = questions.length;

  function choose(qid: string, oi: number) {
    const next = { ...answers, [qid]: oi };
    setAnswers(next);
    const opt = questions[step].options[oi];
    if (settings.killOn && settings.killTiming === "immediate" && opt.kill) {
      // Immediate bounce — compute locally, capture no lead (matches the engines).
      const r = score(variant.qualifier, next);
      setResult({ score: r.total, tier: r.tier, routing: resolveRouting(variant, r) });
      setView(settings.resourceOn ? "resource" : "thanks");
      return;
    }
    if (step < N - 1) setStep(step + 1);
    else setView("lead");
  }

  async function submitLead() {
    if (!lead.name || !/.+@.+\..+/.test(lead.email)) {
      setError("Please add your name and a valid work email.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: variant.slug, answers, lead }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || "Submission failed");
      const data = (await res.json()) as ServerResult & { routing: Routing };
      setResult(data);
      const route = data.routing.route;
      setView(route === "booking" ? (data.routing.showScore ? "score" : "booking") : route);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function openScheduler() {
    const r = result?.routing;
    if (!r) return;
    openBooking({ mode: r.bookingMode, url: r.bookingUrl }, r.bookingSlug);
  }

  const ctaLabel = talent ? "Complete my directory profile →" : "Book your Agility Assessment →";

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "rgba(4,33,51,.62)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        overflowY: "auto",
        padding: "28px 16px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 660,
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 40px 90px rgba(0,0,0,.4)",
          overflow: "hidden",
          fontFamily: "var(--font-body)",
        }}
      >
        <TopBar
          label={topLabel(view, talent)}
          onClose={onClose}
        />
        {view !== "score" && view !== "booking" && view !== "resource" && view !== "thanks" && (
          <Progress frac={(view === "lead" ? N : step) / (N + 1)} />
        )}

        {view === "q" && (
          <QuestionView
            q={questions[step]}
            index={step}
            total={N}
            selected={answers[questions[step].id]}
            onChoose={(oi) => choose(questions[step].id, oi)}
            onBack={step > 0 ? () => setStep(step - 1) : undefined}
          />
        )}

        {view === "lead" && (
          <LeadView
            lead={lead}
            setLead={setLead}
            talent={talent}
            error={error}
            submitting={submitting}
            onSubmit={submitLead}
            onBack={() => setView("q")}
          />
        )}

        {view === "score" && result && (
          <ScoreView result={result} talent={talent} ctaLabel={ctaLabel} onBook={openScheduler} />
        )}

        {view === "booking" && result && (
          <BookingView result={result} talent={talent} ctaLabel={ctaLabel} onBook={openScheduler} />
        )}

        {view === "resource" && <ResourceView talent={talent} />}
        {view === "thanks" && <ThanksView />}
      </div>
    </div>
  );
}

/* ── sub-views ─────────────────────────────────────────────────────────────── */

function topLabel(view: View, talent: boolean): string {
  if (view === "lead") return "Almost there";
  if (view === "resource") return "A better-fit path";
  if (view === "thanks") return "Thank you";
  if (view === "score") return talent ? "Your Directory Fit" : "Your Strategic Fit";
  if (view === "booking") return talent ? "Join the directory" : "Book your call";
  return "Agility Assessment";
}

function TopBar({ label, onClose }: { label: string; onClose: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 22px", borderBottom: `1px solid ${C.line}` }}>
      <div style={{ font: "700 11px/1 var(--font-display)", letterSpacing: ".14em", textTransform: "uppercase", color: C.teal }}>{label}</div>
      <button onClick={onClose} aria-label="Close" style={{ border: "none", background: C.bg, color: C.muted, width: 32, height: 32, borderRadius: 8, fontSize: 17, cursor: "pointer" }}>
        ✕
      </button>
    </div>
  );
}

function Progress({ frac }: { frac: number }) {
  return (
    <div style={{ height: 4, background: C.bg }}>
      <div style={{ height: "100%", width: `${Math.round(frac * 100)}%`, background: `linear-gradient(90deg,${C.navy},${C.teal})`, transition: "width .3s ease" }} />
    </div>
  );
}

function QuestionView({
  q,
  index,
  total,
  selected,
  onChoose,
  onBack,
}: {
  q: Variant["qualifier"]["questions"][number];
  index: number;
  total: number;
  selected: number | undefined;
  onChoose: (oi: number) => void;
  onBack?: () => void;
}) {
  return (
    <div style={{ padding: "26px 26px 28px" }}>
      <div style={{ font: "600 12.5px/1 var(--font-body)", color: C.muted, marginBottom: 10 }}>
        Question {index + 1} of {total}
      </div>
      <h2 style={{ font: "800 clamp(20px,2.4vw,26px)/1.2 var(--font-display)", color: C.navy, letterSpacing: "-.01em", margin: "0 0 20px" }}>{q.q}</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {q.options.map((opt, oi) => {
          const sel = selected === oi;
          return (
            <button
              key={oi}
              onClick={() => onChoose(oi)}
              style={{
                textAlign: "left",
                cursor: "pointer",
                borderRadius: 12,
                padding: "15px 16px",
                font: "500 15px/1.4 var(--font-body)",
                display: "flex",
                alignItems: "center",
                gap: 13,
                transition: "all .15s ease",
                border: sel ? `2px solid ${C.teal}` : `1px solid ${C.line}`,
                background: sel ? "#F0FAFC" : "#fff",
                color: C.ink,
              }}
            >
              <span style={{ flex: "none", width: 20, height: 20, borderRadius: "50%", ...(sel ? { background: C.teal, boxShadow: "inset 0 0 0 4px #fff", border: `1px solid ${C.teal}` } : { border: "2px solid #C4D2D9" }) }} />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
      {onBack && (
        <button onClick={onBack} style={{ marginTop: 22, border: "none", background: "none", color: C.muted, font: "600 14px var(--font-body)", cursor: "pointer", padding: "6px 0" }}>
          ← Back
        </button>
      )}
    </div>
  );
}

function Field({ label, type = "text", value, placeholder, onChange }: { label: string; type?: string; value: string; placeholder?: string; onChange: (v: string) => void }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ font: "600 12.5px/1 var(--font-body)", color: C.muted, marginBottom: 6 }}>{label}</div>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", padding: "12px 13px", border: "1px solid #C4D2D9", borderRadius: 9, font: "500 15px var(--font-body)", color: C.ink }}
      />
    </div>
  );
}

function LeadView({
  lead,
  setLead,
  talent,
  error,
  submitting,
  onSubmit,
  onBack,
}: {
  lead: { name: string; email: string; company: string; phone: string };
  setLead: (l: { name: string; email: string; company: string; phone: string }) => void;
  talent: boolean;
  error: string;
  submitting: boolean;
  onSubmit: () => void;
  onBack: () => void;
}) {
  return (
    <div style={{ padding: 26 }}>
      <h2 style={{ font: "800 clamp(20px,2.4vw,26px)/1.2 var(--font-display)", color: C.navy, margin: "0 0 6px" }}>
        {talent ? "Where should we send your directory profile?" : "Where should we send your assessment?"}
      </h2>
      <p style={{ font: "500 14.5px/1.5 var(--font-body)", color: C.muted, margin: "0 0 20px" }}>
        {talent
          ? "We'll show your directory fit, then take you straight to complete your profile — no spam, no list."
          : "We'll show your result, then take you straight to book a meeting with a client advisor — no spam, no list."}
      </p>
      <Field label="Full name" value={lead.name} placeholder="Jane Doe" onChange={(v) => setLead({ ...lead, name: v })} />
      <Field label="Work email" type="email" value={lead.email} placeholder="jane@company.com" onChange={(v) => setLead({ ...lead, email: v })} />
      <Field label="Company" value={lead.company} placeholder="Company, Inc." onChange={(v) => setLead({ ...lead, company: v })} />
      <Field label="Phone" type="tel" value={lead.phone} placeholder="(555) 123-4567" onChange={(v) => setLead({ ...lead, phone: v })} />
      {error && <div style={{ font: "500 13px var(--font-body)", color: "#C0392B", margin: "2px 0 12px" }}>{error}</div>}
      <button
        onClick={onSubmit}
        disabled={submitting}
        style={{ width: "100%", border: "none", background: C.green, color: "#fff", font: "700 16px var(--font-display)", padding: 16, borderRadius: 11, cursor: submitting ? "default" : "pointer", opacity: submitting ? 0.7 : 1, boxShadow: "0 12px 26px rgba(46,139,87,.3)" }}
      >
        {submitting ? "Submitting…" : talent ? "See my directory fit & sign up →" : "See my results & book my call →"}
      </button>
      <button onClick={onBack} style={{ marginTop: 14, border: "none", background: "none", color: C.muted, font: "600 14px var(--font-body)", cursor: "pointer", width: "100%" }}>
        ← Back
      </button>
    </div>
  );
}

function ScoreView({ result, talent, ctaLabel, onBook }: { result: ServerResult; talent: boolean; ctaLabel: string; onBook: () => void }) {
  const elite = result.tier === "elite";
  return (
    <div style={{ padding: "28px 26px" }}>
      <div style={{ marginBottom: 12 }}>
        <div style={{ font: "800 48px/1 var(--font-display)", color: C.navy }}>{result.score}</div>
        <div style={{ font: "600 13px var(--font-body)", color: C.muted, marginTop: 2 }}>out of 100 · {talent ? "Directory" : "Strategic"} Fit Score</div>
      </div>
      <Pill text={elite ? "Strong fit" : "Promising fit"} bg={elite ? "#E8F6EE" : "#EAF1F8"} col={elite ? C.green : C.navy} />
      <p style={{ font: "500 15.5px/1.6 var(--font-body)", color: C.ink, margin: "16px 0 22px" }}>
        {message(result.tier, talent)}
      </p>
      <BookButton label={ctaLabel} onBook={onBook} />
    </div>
  );
}

function BookingView({ result, talent, ctaLabel, onBook }: { result: ServerResult; talent: boolean; ctaLabel: string; onBook: () => void }) {
  return (
    <div style={{ padding: "28px 26px" }}>
      <h2 style={{ font: "800 24px/1.2 var(--font-display)", color: C.navy, margin: "0 0 10px" }}>
        {result.tier === "moderate" && !talent ? "Let's scope it the right way" : talent ? "Let's get you listed" : "Let's map your path to production"}
      </h2>
      <p style={{ font: "500 15.5px/1.6 var(--font-body)", color: C.ink, margin: "0 0 22px" }}>{message(result.tier, talent)}</p>
      <BookButton label={ctaLabel} onBook={onBook} />
    </div>
  );
}

function ResourceView({ talent }: { talent: boolean }) {
  const recs: [string, string][] = talent
    ? [
        ["Keep your profile current", "Update your skills and availability so we can match you the moment the right project appears."],
        ["Build in public", "Share your work — talks, posts, open source. Hiring teams notice people who show their craft."],
        ["Come back anytime", "Demand shifts constantly. Check back when your availability or focus changes."],
      ]
    : [
        ["Validate with no-code", "Stand up a working version fast on a visual platform like Bubble or Softr before investing in custom code."],
        ["Start with off-the-shelf SaaS", "For common workflows, a configurable SaaS tool will outpace a from-scratch build on cost and time."],
        ["Right-size the budget", "When the idea proves out and the budget grows with it, come back — that's when our team adds the most value."],
      ];
  return (
    <div style={{ padding: "28px 26px" }}>
      <h2 style={{ font: "800 24px/1.2 var(--font-display)", color: C.navy, margin: "0 0 10px" }}>Here&apos;s the fastest way forward for you</h2>
      <p style={{ font: "500 15px/1.6 var(--font-body)", color: C.ink, margin: "0 0 20px" }}>
        {talent
          ? "Based on where you are today, here are the most efficient next steps — and we're here when the fit is right."
          : "Based on where your project is today, a full custom engineering engagement likely isn't the most efficient next step."}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 22 }}>
        {recs.map(([t, b], i) => (
          <div key={i} style={{ border: `1px solid ${C.line}`, borderRadius: 12, padding: "16px 18px", background: C.bg }}>
            <div style={{ font: "700 15px var(--font-display)", color: C.navy, marginBottom: 4 }}>{t}</div>
            <div style={{ font: "500 14px/1.5 var(--font-body)", color: C.muted }}>{b}</div>
          </div>
        ))}
      </div>
      <p style={{ font: "500 13px/1.5 var(--font-body)", color: C.muted, textAlign: "center" }}>We&apos;ll keep your details on file — reach back out anytime your scope changes.</p>
    </div>
  );
}

function ThanksView() {
  return (
    <div style={{ padding: "28px 26px" }}>
      <h2 style={{ font: "800 24px/1.2 var(--font-display)", color: C.navy, margin: "0 0 10px" }}>Thanks — we&apos;ve got your details</h2>
      <p style={{ font: "500 15.5px/1.6 var(--font-body)", color: C.ink }}>A member of our team will reach out if there&apos;s a fit. We appreciate your time.</p>
    </div>
  );
}

function Pill({ text, bg, col }: { text: string; bg: string; col: string }) {
  return <span style={{ display: "inline-block", padding: "6px 12px", borderRadius: 100, font: "700 12px var(--font-display)", background: bg, color: col }}>{text}</span>;
}

function BookButton({ label, onBook }: { label: string; onBook: () => void }) {
  return (
    <button onClick={onBook} className="ae-cta" style={{ width: "100%", justifyContent: "center", border: "none", background: C.green, color: "#fff", font: "700 16px var(--font-display)", padding: 16, borderRadius: 11, cursor: "pointer", boxShadow: "0 12px 26px rgba(46,139,87,.3)" }}>
      {label}
    </button>
  );
}

function message(tier: Tier, talent: boolean): string {
  if (talent) {
    return tier === "elite"
      ? "Your background is a strong match for the directory. Finish your profile to get listed and visible to teams looking for people like you."
      : "You're a promising fit. Complete your profile to get listed and discoverable by hiring teams.";
  }
  return tier === "elite"
    ? "Your initiative lines up closely with the work we do best. A client advisor can walk you through the fastest path to production."
    : "You're a promising fit. We'd start with a short paid discovery sprint to lock scope before any build — your advisor will explain how that de-risks the work.";
}
