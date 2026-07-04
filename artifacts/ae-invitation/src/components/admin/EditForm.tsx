"use client";

import { useCallback, useState } from "react";
import { Link } from "wouter";
import { regenerableSections, type Provider, type Variant } from "@/config/schema";
import { FieldNode, setByPath, type Path } from "@/components/admin/fields";
import { ImageInput } from "@/components/admin/ImageInput";
import { usePageDraft, SaveControls } from "@/hooks/usePageDraft";

const SECTION_TITLES: Record<string, string> = {
  hero: "Hero",
  problem: "Problem",
  guide: "Guide",
  plan: "Plan",
  proof: "Proof",
  objections: "Objections (FAQ)",
  cta: "Final CTA",
};

// Subtrees handled by dedicated controls, hidden from the recursive copy editor.
function omitCopy(path: Path): boolean {
  const [a, b] = path;
  if (b === "media" && a === "hero") return true;
  if (b === "panel" && (a === "guide" || a === "proof")) return true;
  if (a === "footer" && b === "logo") return true;
  return false;
}

export function EditForm({ initial, providers, generated }: { initial: Variant; providers: Provider[]; generated: boolean }) {
  const { draft, setDraft, status, lastSavedAt, dirty, saveNow } = usePageDraft<Variant>({
    initial,
    endpoint: "/api/variants",
    label: "Page",
  });
  const [regen, setRegen] = useState<string>("");
  const [provider, setProvider] = useState<Provider | "">(providers[0] ?? "");
  const talent = draft.templateType === "talent";

  const onCopy = useCallback((path: Path, value: unknown) => {
    setDraft((d) => ({ ...d, copy: setByPath(d.copy, path, value) }));
  }, []);
  const setCopyPath = (path: Path, value: unknown) => onCopy(path, value);
  const setTop = (patch: Partial<Variant>) => setDraft((d) => ({ ...d, ...patch }));

  async function regenerate(section: string) {
    setRegen(section);
    try {
      const res = await fetch("/api/regenerate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: draft.slug, section, provider: provider || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Regenerate failed");
      setDraft((d) => ({ ...d, copy: { ...d.copy, [section]: data.variant.copy[section] } }));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Regenerate failed");
    } finally {
      setRegen("");
    }
  }

  async function togglePublish() {
    const next = { ...draft, published: !draft.published };
    setDraft(next);
    await fetch("/api/variants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: draft.slug, action: next.published ? "publish" : "unpublish" }),
    });
  }

  function exportJson() {
    const json = JSON.stringify(draft, null, 2);
    navigator.clipboard?.writeText(json).then(
      () => alert("Config copied to clipboard."),
      () => window.prompt("Copy this config:", json),
    );
  }

  return (
    <div className="mx-auto max-w-3xl pb-24">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 -mx-5 mb-5 border-b border-line bg-white/95 px-5 py-3 backdrop-blur md:-mx-8 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <input
              value={draft.label}
              onChange={(e) => setTop({ label: e.target.value })}
              className="w-full max-w-xs truncate border-0 bg-transparent font-display text-xl font-extrabold text-navy outline-none"
            />
            <div className="text-xs text-muted-2">/{draft.slug} · {draft.templateType}</div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
            <Link href={draft.published ? `/${draft.slug}` : `/preview/${draft.slug}`} target="_blank" className="rounded-lg border border-line px-3 py-2 text-navy">
              {draft.published ? "View" : "Preview"}
            </Link>
            <button onClick={exportJson} className="rounded-lg border border-line px-3 py-2 text-navy">Export JSON</button>
            <button onClick={togglePublish} className={`rounded-lg px-3 py-2 text-white ${draft.published ? "bg-amber-600" : "bg-cta"}`}>
              {draft.published ? "Unpublish" : "Publish"}
            </button>
            <SaveControls status={status} dirty={dirty} lastSavedAt={lastSavedAt} onSave={saveNow} />
          </div>
        </div>
        {generated && <p className="mt-2 text-xs text-cta">✓ Generated with AI — review the copy, fill any [needs your data] placeholders, then publish.</p>}
      </div>

      {providers.length > 0 && (
        <div className="mb-4 flex items-center gap-2 text-sm">
          <span className="font-semibold text-muted">Regenerate with:</span>
          {providers.map((p) => (
            <button key={p} onClick={() => setProvider(p)} className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${provider === p ? "border-teal bg-teal/10 text-navy" : "border-line text-muted"}`}>
              {p === "anthropic" ? "Claude" : "OpenAI"}
            </button>
          ))}
        </div>
      )}

      {/* Sections toggle map — first and open by default so it's discoverable. */}
      <Section title="Sections" defaultOpen>
        <p className="mb-3 text-xs text-muted-2">Turn sections of this page on or off. Hidden sections are removed from the published page and greyed out below.</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Object.keys(draft.sections).map((k) => {
            const key = k as keyof Variant["sections"];
            return (
              <label key={k} className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm font-medium capitalize">
                <input
                  type="checkbox"
                  checked={draft.sections[key]}
                  onChange={(e) => setTop({ sections: { ...draft.sections, [key]: e.target.checked } })}
                  className="h-4 w-4 accent-[#2E8B57]"
                />
                {k}
              </label>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-muted-2">Hiding a section that leaves two same-background sections adjacent auto-inserts a separator on the page.</p>
      </Section>

      {/* Targeting */}
      <Section title="Targeting & audience">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-muted">Audience (interpolated as {"{audience}"})</span>
          <input className="ae-input" value={draft.audience} onChange={(e) => setTop({ audience: e.target.value })} />
        </label>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {(talent
            ? (["role", "discipline", "seniority", "location"] as const)
            : (["industry", "title", "company", "accountName"] as const)
          ).map((k) => (
            <label key={k} className="block">
              <span className="mb-1 block text-xs font-semibold text-muted capitalize">{k}</span>
              <input
                className="ae-input"
                value={(draft.targeting as Record<string, string>)[k] ?? ""}
                onChange={(e) => setTop({ targeting: { ...draft.targeting, [k]: e.target.value } })}
              />
            </label>
          ))}
        </div>
      </Section>

      {/* Copy — per section with regenerate */}
      {regenerableSections.map((section) => (
        <Section key={section} title={SECTION_TITLES[section]} disabled={!draft.sections[section as keyof Variant["sections"]]}>
          <div className="mb-2 flex justify-end">
            <button onClick={() => regenerate(section)} disabled={regen !== "" || providers.length === 0} className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-teal disabled:opacity-50">
              {regen === section ? "Regenerating…" : "✨ Regenerate section"}
            </button>
          </div>
          <FieldNode value={draft.copy[section]} path={[section]} onChange={setCopyPath} omit={omitCopy} />
        </Section>
      ))}

      {/* Media & images */}
      <Section title="Media & images">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-muted">Hero media type</span>
          <select className="ae-select" value={draft.copy.hero.media.type} onChange={(e) => setCopyPath(["hero", "media", "type"], e.target.value)}>
            <option value="image">Image</option>
            <option value="youtube">YouTube (background video)</option>
            <option value="vimeo">Vimeo (background video)</option>
          </select>
        </label>
        {draft.copy.hero.media.type === "image" ? (
          <div className="mt-3">
            <ImageInput label="Hero image" slug={draft.slug} value={draft.copy.hero.media.imageUrl} onChange={(url) => setCopyPath(["hero", "media", "imageUrl"], url)} />
          </div>
        ) : (
          <label className="mt-3 block">
            <span className="mb-1 block text-xs font-semibold text-muted">Video URL</span>
            <input className="ae-input" value={draft.copy.hero.media.videoUrl} onChange={(e) => setCopyPath(["hero", "media", "videoUrl"], e.target.value)} placeholder="https://youtu.be/… or https://vimeo.com/…" />
          </label>
        )}

        <hr className="my-4 border-line" />
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-muted">Guide panel</span>
          <select className="ae-select" value={draft.copy.guide.panel.mode} onChange={(e) => setCopyPath(["guide", "panel", "mode"], e.target.value)}>
            <option value="stats">Stat cards + credentials</option>
            <option value="image">Single image</option>
          </select>
        </label>
        {draft.copy.guide.panel.mode === "image" && (
          <div className="mt-3">
            <ImageInput label="Guide image" slug={draft.slug} value={draft.copy.guide.panel.imageUrl} onChange={(url) => setCopyPath(["guide", "panel", "imageUrl"], url)} />
          </div>
        )}

        <hr className="my-4 border-line" />
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-muted">Proof panel</span>
            <select className="ae-select" value={draft.copy.proof.panel.mode} onChange={(e) => setCopyPath(["proof", "panel", "mode"], e.target.value)}>
              <option value="metrics">Metrics + case study</option>
              <option value="image">Single image</option>
            </select>
          </label>
          {draft.copy.proof.panel.mode === "image" && (
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-muted">Image side</span>
              <select className="ae-select" value={draft.copy.proof.panel.side} onChange={(e) => setCopyPath(["proof", "panel", "side"], e.target.value)}>
                <option value="right">Right</option>
                <option value="left">Left</option>
              </select>
            </label>
          )}
        </div>
        {draft.copy.proof.panel.mode === "image" && (
          <div className="mt-3">
            <ImageInput label="Proof image" slug={draft.slug} value={draft.copy.proof.panel.imageUrl} onChange={(url) => setCopyPath(["proof", "panel", "imageUrl"], url)} />
          </div>
        )}

        <hr className="my-4 border-line" />
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-muted">Footer logo treatment</span>
          <select className="ae-select" value={draft.copy.footer.logo} onChange={(e) => setCopyPath(["footer", "logo"], e.target.value)}>
            <option value="chip">Chip (white background)</option>
            <option value="white">White (on dark)</option>
            <option value="hide">Hide</option>
          </select>
        </label>
      </Section>

      {/* Header links */}
      <Section title="Header links">
        {draft.headerLinks.map((l, i) => (
          <div key={i} className="mb-2 grid grid-cols-[1fr_1fr_auto] gap-2">
            <input className="ae-input" value={l.label} placeholder="Label" onChange={(e) => setTop({ headerLinks: draft.headerLinks.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} />
            <input className="ae-input" value={l.url} placeholder="https://…" onChange={(e) => setTop({ headerLinks: draft.headerLinks.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)) })} />
            <button onClick={() => setTop({ headerLinks: draft.headerLinks.filter((_, j) => j !== i) })} className="rounded-lg bg-red-50 px-3 text-sm font-semibold text-red-600">Remove</button>
          </div>
        ))}
        <button onClick={() => setTop({ headerLinks: [...draft.headerLinks, { label: "", url: "" }] })} className="mt-1 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-navy">+ Add link</button>
      </Section>

      {/* Booking / scheduler */}
      <Section title="Scheduler / booking">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-muted">Provider</span>
            <select className="ae-select" value={draft.booking.provider} onChange={(e) => setTop({ booking: { ...draft.booking, provider: e.target.value as Variant["booking"]["provider"] } })}>
              <option value="calendly">Calendly</option>
              <option value="smartscheduler">SmartScheduler.ai</option>
              <option value="custom">Other / custom</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-muted">Mode</span>
            <select className="ae-select" value={draft.booking.mode} onChange={(e) => setTop({ booking: { ...draft.booking, mode: e.target.value as Variant["booking"]["mode"] } })}>
              <option value="link">Direct link (opens scheduler)</option>
              <option value="embed">Embed (in-app booking page)</option>
            </select>
          </label>
        </div>
        <label className="mt-3 block">
          <span className="mb-1 block text-xs font-semibold text-muted">Scheduler link</span>
          <input className="ae-input" value={draft.booking.url} placeholder="https://calendly.com/… or https://smart-scheduler.ai/…" onChange={(e) => setTop({ booking: { ...draft.booking, url: e.target.value } })} />
        </label>
        {draft.booking.mode === "embed" && (
          <label className="mt-3 block">
            <span className="mb-1 block text-xs font-semibold text-muted">Embed code</span>
            <textarea className="ae-textarea" value={draft.booking.embedCode} placeholder="<!-- paste Calendly / SmartScheduler embed -->" onChange={(e) => setTop({ booking: { ...draft.booking, embedCode: e.target.value } })} />
          </label>
        )}
      </Section>

      {/* Qualifier */}
      <QualifierEditor draft={draft} setTop={setTop} />

      {/* SEO meta */}
      <Section title="SEO & social meta">
        {(["title", "description", "ogTitle", "ogDescription", "ogImage", "canonical"] as const).map((k) => (
          <label key={k} className="mt-2 block">
            <span className="mb-1 block text-xs font-semibold text-muted">{k}</span>
            {k === "description" || k === "ogDescription" ? (
              <textarea className="ae-textarea" value={draft.meta[k]} onChange={(e) => setTop({ meta: { ...draft.meta, [k]: e.target.value } })} />
            ) : (
              <input className="ae-input" value={draft.meta[k]} onChange={(e) => setTop({ meta: { ...draft.meta, [k]: e.target.value } })} />
            )}
          </label>
        ))}
      </Section>
    </div>
  );
}

function QualifierEditor({ draft, setTop }: { draft: Variant; setTop: (p: Partial<Variant>) => void }) {
  const s = draft.qualifier.settings;
  const [json, setJson] = useState(() => JSON.stringify(draft.qualifier.questions, null, 2));
  const [err, setErr] = useState("");

  function saveQuestions() {
    try {
      const parsed = JSON.parse(json);
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("Must be a non-empty array");
      setTop({ qualifier: { ...draft.qualifier, questions: parsed } });
      setErr("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Invalid JSON");
    }
  }

  const setSetting = (patch: Partial<typeof s>) => setTop({ qualifier: { ...draft.qualifier, settings: { ...s, ...patch } } });

  return (
    <Section title="Lead qualifier">
      <div className="grid gap-2 sm:grid-cols-2">
        <Toggle label="Enable kill-switches" checked={s.killOn} onChange={(v) => setSetting({ killOn: v })} />
        <Toggle label="Show Fit Score to prospect" checked={s.showScore} onChange={(v) => setSetting({ showScore: v })} />
        <Toggle label="Show better-fit resource page" checked={s.resourceOn} onChange={(v) => setSetting({ resourceOn: v })} />
        <label className="flex items-center justify-between gap-2 rounded-lg border border-line px-3 py-2 text-sm font-medium">
          Kill-switch timing
          <select className="ae-select w-40" value={s.killTiming} onChange={(e) => setSetting({ killTiming: e.target.value as typeof s.killTiming })}>
            <option value="end">At the end</option>
            <option value="immediate">Immediate bounce</option>
          </select>
        </label>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-muted">Elite threshold</span>
          <input type="number" className="ae-input" value={s.eliteThreshold} onChange={(e) => setSetting({ eliteThreshold: Number(e.target.value) })} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-muted">Moderate threshold</span>
          <input type="number" className="ae-input" value={s.moderateThreshold} onChange={(e) => setSetting({ moderateThreshold: Number(e.target.value) })} />
        </label>
      </div>
      <div className="mt-4">
        <span className="mb-1 block text-xs font-semibold text-muted">Questions (JSON: id, q, options[{"{label, pts, kill?, flag?}"}])</span>
        <textarea className="ae-textarea font-mono text-xs" style={{ minHeight: 240 }} value={json} onChange={(e) => setJson(e.target.value)} />
        {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
        <button onClick={saveQuestions} className="mt-2 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-navy">Apply questions</button>
      </div>
    </Section>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-2 rounded-lg border border-line px-3 py-2 text-sm font-medium">
      {label}
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[#2E8B57]" />
    </label>
  );
}

function Section({ title, children, defaultOpen = false, disabled = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean; disabled?: boolean }) {
  return (
    <details open={defaultOpen} className={`mb-3 rounded-xl border border-line bg-white ${disabled ? "opacity-60" : ""}`}>
      <summary className="cursor-pointer px-4 py-3 font-display font-bold text-navy">
        {title}
        {disabled && <span className="ml-2 text-xs font-normal text-muted-2">(section hidden)</span>}
      </summary>
      <div className="border-t border-line px-4 py-4">{children}</div>
    </details>
  );
}
