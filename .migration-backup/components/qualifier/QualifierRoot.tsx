"use client";

import { useEffect, useState } from "react";
import type { Variant } from "@/config/schema";
import { OPEN_QUALIFIER_EVENT } from "@/components/landing/CtaButton";
import { Qualifier } from "@/components/qualifier/Qualifier";

/**
 * Mounts on every landing page and opens the interactive qualifier when any CTA
 * fires the open event. Locks scroll while open.
 */
export function QualifierRoot({ variant }: { variant: Variant }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener(OPEN_QUALIFIER_EVENT, handler);
    return () => window.removeEventListener(OPEN_QUALIFIER_EVENT, handler);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;
  return <Qualifier variant={variant} onClose={() => setOpen(false)} />;
}
