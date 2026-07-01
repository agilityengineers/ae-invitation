"use client";

import { useEffect, useRef } from "react";

/**
 * Renders an admin-pasted scheduler embed and re-executes its <script> tags so
 * Calendly / SmartScheduler widgets initialize (innerHTML alone won't run them).
 * The embed code is admin-supplied (trusted), mirroring the engines' renderEmbedPage.
 */
export function EmbedHost({ embedCode }: { embedCode: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    host.innerHTML = embedCode;
    const scripts = Array.from(host.querySelectorAll("script"));
    for (const old of scripts) {
      const s = document.createElement("script");
      if (old.src) s.src = old.src;
      else s.textContent = old.textContent;
      for (const attr of Array.from(old.attributes)) {
        if (attr.name !== "src") s.setAttribute(attr.name, attr.value);
      }
      old.parentNode?.replaceChild(s, old);
    }
  }, [embedCode]);

  return <div ref={ref} style={{ minHeight: 640, background: "#F2F5F7" }} />;
}
