"use client";

import { Link } from "wouter";
import type { FrontPage } from "@/config/schema";
import { FieldNode, setByPath, type Path } from "@/components/admin/fields";
import { usePageDraft, SaveControls } from "@/hooks/usePageDraft";

const SECTION_LABELS: Record<keyof FrontPage["sections"], string> = {
  clientCard: "Client path card",
  talentCard: "Talent path card",
  cta: "Book-a-meeting CTA",
  footer: "Footer",
};

/**
 * Admin editor for the public front page (/). Reuses the same recursive field
 * editor and the shared usePageDraft engine (800ms debounced autosave + explicit
 * Save button) as the landing-page EditForm. The front page is a single content
 * object, so the copy is driven by one FieldNode tree; the `sections` toggle map
 * is rendered as a dedicated panel and omitted from that tree.
 */
export function FrontPageEditForm({ initial }: { initial: FrontPage }) {
  const { draft, setDraft, status, lastSavedAt, dirty, saveNow } = usePageDraft<FrontPage>({
    initial,
    endpoint: "/api/frontpage",
    label: "Front page",
  });

  const onField = (path: Path, value: unknown) => setDraft((d) => setByPath(d, path, value));

  return (
    <div className="mx-auto max-w-3xl pb-24">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 -mx-5 mb-5 border-b border-line bg-white/95 px-5 py-3 backdrop-blur md:-mx-8 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-xl font-extrabold text-navy">Front page</h1>
            <div className="text-xs text-muted-2">/</div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" target="_blank" className="rounded-lg border border-line px-3 py-2 text-sm font-semibold text-navy">
              View
            </Link>
            <SaveControls status={status} dirty={dirty} lastSavedAt={lastSavedAt} onSave={saveNow} />
          </div>
        </div>
      </div>

      {/* Sections — show/hide the front page's optional blocks */}
      <details open className="mb-3 rounded-xl border border-line bg-white">
        <summary className="cursor-pointer px-4 py-3 font-display font-bold text-navy">Sections</summary>
        <div className="border-t border-line px-4 py-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {(Object.keys(draft.sections) as (keyof FrontPage["sections"])[]).map((key) => (
              <label
                key={key}
                className="flex items-center justify-between gap-2 rounded-lg border border-line px-3 py-2 text-sm font-medium"
              >
                {SECTION_LABELS[key]}
                <input
                  type="checkbox"
                  checked={draft.sections[key]}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, sections: { ...d.sections, [key]: e.target.checked } }))
                  }
                  className="h-4 w-4 accent-[#2E8B57]"
                />
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-2">
            The eyebrow, headline and subhead always show — they identify the page. Turning both path
            cards off leaves only the headline and CTA.
          </p>
        </div>
      </details>

      <details open className="mb-3 rounded-xl border border-line bg-white">
        <summary className="cursor-pointer px-4 py-3 font-display font-bold text-navy">Front page content</summary>
        <div className="border-t border-line px-4 py-4">
          <p className="mb-4 text-xs text-muted-2">
            Edit the copy shown on the public front page (/). The
            {" "}&ldquo;{draft.cta.label}&rdquo; button opens whichever scheduler is configured on the current
            {" "}<strong>client</strong> default — set it in that page&rsquo;s Scheduler / booking settings.
          </p>
          <FieldNode value={draft} path={[]} onChange={onField} omit={(p) => p[0] === "sections"} />
        </div>
      </details>
    </div>
  );
}
