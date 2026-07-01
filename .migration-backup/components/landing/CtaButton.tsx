"use client";

import type { CSSProperties, ReactNode } from "react";

/**
 * The single conversion action, repeated across the page. Every CTA opens the
 * qualifier (via a window event the QualifierRoot listens for) — never a
 * competing destination. Header nav links are plain <a> and are NOT this.
 */
export const OPEN_QUALIFIER_EVENT = "ae:open-qualifier";

export function openQualifier() {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(OPEN_QUALIFIER_EVENT));
}

export function CtaButton({
  children,
  className = "",
  style,
  arrowBob = false,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  arrowBob?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={openQualifier}
      className={`ae-cta ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        cursor: "pointer",
        border: "none",
        textDecoration: "none",
        ...style,
      }}
    >
      {children}
      <span className={`ae-arrow ${arrowBob ? "ae-bob" : ""}`} style={{ fontSize: 18 }} aria-hidden>
        →
      </span>
    </button>
  );
}
