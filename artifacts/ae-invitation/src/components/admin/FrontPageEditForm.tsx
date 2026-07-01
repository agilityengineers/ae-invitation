"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import type { FrontPage } from "@/config/schema";
import { FieldNode, setByPath, type Path } from "@/components/admin/fields";

/**
 * Admin editor for the public front page (/). Reuses the same recursive field
 * editor and 800ms debounced autosave as the landing-page EditForm, but the front
 * page is a single content object (no variant envelope, sections, qualifier or
 * regenerate), so the whole config is driven by one FieldNode tree.
 */
export function FrontPageEditForm({ initial }: { initial: FrontPage }) {
  const [draft, setDraft] = useState<FrontPage>(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const first = useRef(true);

  // Debounced autosave (matches EditForm).
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setStatus("saving");
    const id = setTimeout(async () => {
      try {
        const res = await fetch("/api/frontpage", {
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

  const onField = (path: Path, value: unknown) => setDraft((d) => setByPath(d, path, value));

  return (
    <div className="mx-auto max-w-3xl pb-24">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 -mx-5 mb-5 border-b border-line bg-white/95 px-5 py-3 backdrop-blur md:-mx-8 md:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-xl font-extrabold text-navy">Front page</h1>
            <div className="text-xs text-muted-2">
              / · <SaveBadge status={status} />
            </div>
          </div>
          <Link href="/" target="_blank" className="rounded-lg border border-line px-3 py-2 text-sm font-semibold text-navy">
            View
          </Link>
        </div>
      </div>

      <details open className="mb-3 rounded-xl border border-line bg-white">
        <summary className="cursor-pointer px-4 py-3 font-display font-bold text-navy">Front page content</summary>
        <div className="border-t border-line px-4 py-4">
          <p className="mb-4 text-xs text-muted-2">
            Edit the copy shown on the public front page (/). The
            {" "}&ldquo;{draft.cta.label}&rdquo; button opens whichever scheduler is configured on the current
            {" "}<strong>client</strong> default — set it in that page&rsquo;s Scheduler / booking settings.
          </p>
          <FieldNode value={draft} path={[]} onChange={onField} />
        </div>
      </details>
    </div>
  );
}

function SaveBadge({ status }: { status: "idle" | "saving" | "saved" | "error" }) {
  const map = { idle: "", saving: "Saving…", saved: "✓ Saved", error: "⚠ Save failed" };
  const color = status === "error" ? "text-red-600" : status === "saved" ? "text-cta" : "text-muted-2";
  return <span className={color}>{map[status]}</span>;
}
