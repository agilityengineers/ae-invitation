import { useState } from "react";
import type { Variant } from "@/config/schema";
import { Logo, HEADER_LOGO_SIZE } from "@/components/landing/Logo";
import { CtaButton } from "@/components/landing/CtaButton";

/**
 * Header: logo (links to the main site) + admin-managed nav links (navigation,
 * NOT conversions) + one compact conversion CTA. On desktop the links sit inline;
 * on mobile (≤720px) they collapse into a hamburger-toggled dropdown so the
 * header never overflows and navigation stays reachable. On a dark band
 * (hero/cta) it sits transparent above the section.
 */
export function Nav({ variant }: { variant: Variant }) {
  const links = (variant.headerLinks ?? []).filter((l) => l.label.trim());
  const [open, setOpen] = useState(false);

  const cta = (
    <CtaButton
      style={{
        background: "#2E8B57",
        color: "#fff",
        font: "700 14px/1 var(--font-display)",
        padding: "11px 18px",
        borderRadius: 9,
        boxShadow: "0 8px 20px rgba(46,139,87,.3)",
      }}
    >
      {shortCta(variant)}
    </CtaButton>
  );

  return (
    <div style={{ background: "#fff", borderBottom: "1px solid var(--color-line)" }}>
      <header
        style={{
          position: "relative",
          zIndex: 5,
          maxWidth: 1180,
          margin: "0 auto",
          padding: "14px clamp(16px,4vw,56px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        {/* Header sits on a white bar, so the logo is always the chip treatment;
            the footer.logo setting governs the dark footer's treatment. */}
        <Logo treatment="chip" size={HEADER_LOGO_SIZE} />

        {/* Desktop: inline links + CTA (hidden ≤720px via CSS). */}
        <nav className="ae-navlinks">
          {links.map((l, i) => (
            <a key={i} className="ae-nav" href={l.url || "#"}>
              {l.label}
            </a>
          ))}
          {cta}
        </nav>

        {/* Mobile: hamburger toggle (hidden >720px via CSS). */}
        <button
          type="button"
          className="ae-navtoggle"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="ae-mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span aria-hidden style={{ fontSize: 20, lineHeight: 1 }}>{open ? "✕" : "☰"}</span>
        </button>
      </header>

      {/* Mobile dropdown menu — rendered only when open; CSS keeps it off desktop. */}
      {open && (
        <nav id="ae-mobile-menu" className="ae-navmenu">
          <div className="ae-navmenu-inner">
            {links.map((l, i) => (
              <a
                key={i}
                className="ae-navmenu-link"
                href={l.url || "#"}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <div onClick={() => setOpen(false)} style={{ marginTop: links.length ? 6 : 0 }}>
              {cta}
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}

function shortCta(variant: Variant): string {
  return variant.templateType === "talent" ? "Join the directory" : "Book a meeting";
}
