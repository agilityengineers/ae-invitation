"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "wouter";
import type { ProjectsPage, Project } from "@/config/schema";
import { ImageInput } from "@/components/admin/ImageInput";

/**
 * Admin editor for the public portfolio page (/projects). Mirrors the front-page
 * editor's 800ms debounced autosave and PATCH-to-API pattern, but the portfolio
 * is a variable-length list, so it uses an explicit add / remove / reorder card
 * editor (like EditForm's "Header links") plus the shared ImageInput for each
 * project's screenshot (URL paste / S3 upload / AI generation, all → a URL).
 */
export function ProjectsEditForm({ initial }: { initial: ProjectsPage }) {
  const [draft, setDraft] = useState<ProjectsPage>(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const first = useRef(true);

  // Debounced autosave (matches FrontPageEditForm / EditForm).
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setStatus("saving");
    const id = setTimeout(async () => {
      try {
        const res = await fetch("/api/projects", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(draft),
        });
        setStatus(res.ok ? "saved" : "error");
      } catch {
        setStatus("error");
      }
    }, 800);
    return () => clearTimeout(id);
  }, [draft]);

  const setIntro = (patch: Partial<ProjectsPage["intro"]>) =>
    setDraft((d) => ({ ...d, intro: { ...d.intro, ...patch } }));

  const updateItem = (i: number, patch: Partial<Project>) =>
    setDraft((d) => ({
      ...d,
      items: d.items.map((it, j) => (j === i ? { ...it, ...patch } : it)),
    }));

  const addItem = () =>
    setDraft((d) => ({
      ...d,
      items: [
        ...d.items,
        {
          id: newId(),
          name: "",
          blurb: "",
          screenshot: "",
          screenshotAlt: "",
          url: "",
          tags: [],
        },
      ],
    }));

  const removeItem = (i: number) =>
    setDraft((d) => ({ ...d, items: d.items.filter((_, j) => j !== i) }));

  const moveItem = (i: number, dir: -1 | 1) =>
    setDraft((d) => {
      const j = i + dir;
      if (j < 0 || j >= d.items.length) return d;
      const items = d.items.slice();
      [items[i], items[j]] = [items[j], items[i]];
      return { ...d, items };
    });

  return (
    <div className="mx-auto max-w-3xl pb-24">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 -mx-5 mb-5 border-b border-line bg-white/95 px-5 py-3 backdrop-blur md:-mx-8 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-xl font-extrabold text-navy">Projects</h1>
            <div className="text-xs text-muted-2">
              /projects · <SaveBadge status={status} />
            </div>
          </div>
          <Link
            href="/projects"
            target="_blank"
            className="rounded-lg border border-line px-3 py-2 text-sm font-semibold text-navy"
          >
            View
          </Link>
        </div>
      </div>

      {/* Intro copy */}
      <Section title="Page intro" defaultOpen>
        <p className="mb-4 text-xs text-muted-2">
          The heading band at the top of the public /projects page.
        </p>
        <div className="grid gap-3">
          <Labeled label="Eyebrow">
            <input
              className="ae-input"
              value={draft.intro.eyebrow}
              onChange={(e) => setIntro({ eyebrow: e.target.value })}
            />
          </Labeled>
          <Labeled label="Headline">
            <input
              className="ae-input"
              value={draft.intro.headline}
              onChange={(e) => setIntro({ headline: e.target.value })}
            />
          </Labeled>
          <Labeled label="Subhead">
            <textarea
              className="ae-textarea"
              value={draft.intro.subhead}
              onChange={(e) => setIntro({ subhead: e.target.value })}
            />
          </Labeled>
        </div>
      </Section>

      {/* Projects list */}
      <Section title={`Projects (${draft.items.length})`} defaultOpen>
        <p className="mb-4 text-xs text-muted-2">
          Each project is a card on the page, in this order. Add, remove, or reorder them; a
          screenshot can be uploaded, generated, or pasted as a URL.
        </p>

        {draft.items.length === 0 && (
          <p className="mb-3 rounded-lg border border-dashed border-line px-3 py-6 text-center text-sm text-muted-2">
            No projects yet. Add your first one below.
          </p>
        )}

        {draft.items.map((item, i) => (
          <div key={item.id || i} className="mb-4 rounded-xl border border-line bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="font-display text-sm font-bold text-navy">
                {item.name.trim() || `Project ${i + 1}`}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveItem(i, -1)}
                  disabled={i === 0}
                  aria-label="Move up"
                  className="rounded-lg border border-line px-2 py-1 text-sm font-semibold text-navy disabled:opacity-40"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(i, 1)}
                  disabled={i === draft.items.length - 1}
                  aria-label="Move down"
                  className="rounded-lg border border-line px-2 py-1 text-sm font-semibold text-navy disabled:opacity-40"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="rounded-lg bg-red-50 px-3 py-1 text-sm font-semibold text-red-600"
                >
                  Remove
                </button>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Labeled label="Name">
                  <input
                    className="ae-input"
                    value={item.name}
                    placeholder="ClaimPilot"
                    onChange={(e) => updateItem(i, { name: e.target.value })}
                  />
                </Labeled>
                <Labeled label="Live app URL">
                  <input
                    className="ae-input"
                    value={item.url}
                    placeholder="https://app.example.com"
                    onChange={(e) => updateItem(i, { url: e.target.value })}
                  />
                </Labeled>
              </div>

              <Labeled label="Blurb">
                <textarea
                  className="ae-textarea"
                  value={item.blurb}
                  placeholder="2–3 sentences: what it is and the value it delivers."
                  onChange={(e) => updateItem(i, { blurb: e.target.value })}
                />
              </Labeled>

              <Labeled label="Tags (comma-separated)">
                <input
                  className="ae-input"
                  value={item.tags.join(", ")}
                  placeholder="Insurance, React, PostgreSQL"
                  onChange={(e) =>
                    updateItem(i, {
                      tags: e.target.value
                        .split(/[,\n]/)
                        .map((t) => t.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </Labeled>

              <ImageInput
                label="Screenshot"
                slug={item.id || "project"}
                value={item.screenshot}
                onChange={(url) => updateItem(i, { screenshot: url })}
              />

              <Labeled label="Screenshot alt text">
                <input
                  className="ae-input"
                  value={item.screenshotAlt}
                  placeholder="ClaimPilot dashboard showing the claims triage queue"
                  onChange={(e) => updateItem(i, { screenshotAlt: e.target.value })}
                />
              </Labeled>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          className="mt-1 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-navy"
        >
          + Add project
        </button>
      </Section>
    </div>
  );
}

/** Stable id for a new project — React key + S3 upload namespace. */
function newId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  } catch {
    /* fall through */
  }
  return `project-${Date.now().toString(36)}`;
}

function Labeled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-muted">{label}</span>
      {children}
    </label>
  );
}

function Section({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details open={defaultOpen} className="mb-3 rounded-xl border border-line bg-white">
      <summary className="cursor-pointer px-4 py-3 font-display font-bold text-navy">{title}</summary>
      <div className="border-t border-line px-4 py-4">{children}</div>
    </details>
  );
}

function SaveBadge({ status }: { status: "idle" | "saving" | "saved" | "error" }) {
  const map = { idle: "", saving: "Saving…", saved: "✓ Saved", error: "⚠ Save failed" };
  const color =
    status === "error" ? "text-red-600" : status === "saved" ? "text-cta" : "text-muted-2";
  return <span className={color}>{map[status]}</span>;
}
