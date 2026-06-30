"use client";

import { useEffect, useState } from "react";
import type { Variant } from "@/config/schema";
import { OPEN_QUALIFIER_EVENT } from "@/components/landing/CtaButton";

/**
 * Mounts on every landing page and opens the interactive qualifier when any CTA
 * fires the open event. The full multi-step flow (questions → lead capture →
 * scoring/routing → scheduler) is implemented in Phase 4; this is the listener
 * + open-state shell it plugs into.
 */
export function QualifierRoot({ variant }: { variant: Variant }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener(OPEN_QUALIFIER_EVENT, handler);
    return () => window.removeEventListener(OPEN_QUALIFIER_EVENT, handler);
  }, []);

  if (!open) return null;
  // Phase 4 replaces this body with the full Qualifier component.
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={() => setOpen(false)}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "rgba(4,33,51,.62)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 20, padding: 32, maxWidth: 480 }}>
        <p style={{ font: "700 16px/1.4 var(--font-display)", color: "#08527F" }}>
          Qualifier for {variant.label} — coming in the next build step.
        </p>
      </div>
    </div>
  );
}
