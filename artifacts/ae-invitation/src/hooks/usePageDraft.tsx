"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * Shared draft/save engine for the admin editors (landing variant, front page,
 * projects). Extracted from the three editors that each hand-rolled an identical
 * 800ms debounced autosave + inline status badge.
 *
 * Behavior:
 * - Holds the editable `draft` and persists it with `PATCH {endpoint}` (full
 *   JSON body), matching the existing API routes.
 * - Autosaves 800ms after the last change (rapid edits coalesce into one save).
 * - `saveNow()` cancels the pending debounce and flushes immediately — this is
 *   what the explicit Save button calls.
 * - `dirty` compares the current draft against the last-saved snapshot.
 * - A confirmation toast fires on explicit (manual) saves and on any failure;
 *   debounced autosaves stay quiet and are surfaced only by the inline status /
 *   "Saved · HH:MM" badge, so the toast isn't spammed on every keystroke batch.
 */
export function usePageDraft<T>({
  initial,
  endpoint,
  label = "Changes",
}: {
  initial: T;
  endpoint: string;
  /** Noun used in the toast, e.g. "Front page". */
  label?: string;
}) {
  const [draft, setDraft] = useState<T>(initial);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const { toast } = useToast();

  // Serialized snapshot of what's persisted, for dirty comparison.
  const savedRef = useRef<string>(JSON.stringify(initial));
  const dirty = JSON.stringify(draft) !== savedRef.current;

  // Debounce timer + first-mount guard (don't autosave the initial value).
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const first = useRef(true);
  // Always-current draft for the debounced closure and saveNow().
  const draftRef = useRef(draft);
  draftRef.current = draft;

  const save = useCallback(
    async (manual: boolean) => {
      const snapshot = draftRef.current;
      const payload = JSON.stringify(snapshot);
      setStatus("saving");
      try {
        const res = await fetch(endpoint, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: payload,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        savedRef.current = payload;
        setLastSavedAt(Date.now());
        setStatus("saved");
        if (manual) {
          const t = toast({ title: "Saved", description: `${label} saved.` });
          setTimeout(() => t.dismiss(), 2500);
        }
      } catch {
        setStatus("error");
        const t = toast({
          variant: "destructive",
          title: "Save failed",
          description: `${label} could not be saved. Your edits are kept — try Save again.`,
        });
        setTimeout(() => t.dismiss(), 6000);
      }
    },
    [endpoint, label, toast],
  );

  // Debounced autosave on every draft change.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void save(false), 800);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [draft, save]);

  // Explicit flush — cancels any pending debounce and saves right away.
  const saveNow = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    void save(true);
  }, [save]);

  return { draft, setDraft, status, lastSavedAt, dirty, saveNow };
}

/** Format a save timestamp as a short local time, e.g. "2:47 PM". */
function formatTime(ts: number): string {
  try {
    return new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}

/**
 * Sticky-header save affordance shared by all admin editors: an explicit Save
 * button plus a status line (unsaved / saving / saved-at / failed). Autosave
 * still runs underneath; the button is an immediate flush + confirmation.
 */
export function SaveControls({
  status,
  dirty,
  lastSavedAt,
  onSave,
}: {
  status: SaveStatus;
  dirty: boolean;
  lastSavedAt: number | null;
  onSave: () => void;
}) {
  const saving = status === "saving";
  const statusText =
    status === "error"
      ? "⚠ Save failed"
      : saving
        ? "Saving…"
        : dirty
          ? "Unsaved changes"
          : lastSavedAt
            ? `✓ Saved · ${formatTime(lastSavedAt)}`
            : "";
  const statusColor =
    status === "error"
      ? "text-red-600"
      : dirty && !saving
        ? "text-amber-600"
        : status === "saved" && !dirty
          ? "text-cta"
          : "text-muted-2";

  return (
    <div className="flex items-center gap-2">
      {statusText && <span className={`text-xs font-semibold ${statusColor}`}>{statusText}</span>}
      <button
        type="button"
        onClick={onSave}
        disabled={saving || (!dirty && status !== "error")}
        className="rounded-lg bg-cta px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
