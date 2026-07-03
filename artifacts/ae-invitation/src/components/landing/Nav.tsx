import { useEffect, useState } from "react";
import type { Variant } from "@/config/schema";
import { sectionStartsDark, visibleSections } from "@/lib/section-tones";
import { Logo, HEADER_LOGO_SIZE } from "@/components/landing/Logo";
import { CtaButton } from "@/components/landing/CtaButton";

/**
 * Header: logo (links to the main site) + admin-managed nav links (navigation,
 * NOT conversions) + one compact conversion CTA. On desktop the links sit inline;
 * on mobile (≤720px) they collapse into a hamburger-toggled dropdown so the
 * header never overflows and navigation stays reachable.
 *
 * The header is immersive: it has no bar of its own. When the page opens on a
 * dark band (the aurora hero) it floats transparently inside that band with the
 * white logo treatment, then condenses into a frosted navy strip on scroll.
 * Pages that open light get the frosted strip from the start.
 */
export function Nav({ variant }: { variant: Variant }) {
  const links = (variant.headerLinks ?? []).filter((l) => l.label.trim());
  const [open, setOpen] = useState(false);
  const first = visibleSections(variant.sections)[0];
  const overlay = first != null && sectionStartsDark(first);

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
    // The open mobile menu forces the solid surface so the dropdown never
    // floats transparently over page content.
    <HeaderShell overlay={overlay} forceSolid={open}>
      <header
        style={{
          position: "relative",
          maxWidth: 1180,
          margin: "0 auto",
          padding: "14px clamp(16px,4vw,56px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        {/* The header sits inside a dark band, so the logo is always the white
            treatment; the footer.logo setting governs the dark footer's own. */}
        <Logo treatment="white" size={HEADER_LOGO_SIZE} />

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
    </HeaderShell>
  );
}

/**
 * Sticky shell shared by every site header (landing Nav, FrontHeader). With
 * `overlay` the shell takes no layout space (negative bottom margin) so the
 * dark band below slides up behind it; the opening section then pads its top
 * by `--ae-header-h` (see Hero.tsx). Scrolling — or `forceSolid`, or a page
 * that opens light — switches on the frosted navy surface.
 */
export function HeaderShell({
  overlay = true,
  forceSolid = false,
  children,
}: {
  overlay?: boolean;
  forceSolid?: boolean;
  children: React.ReactNode;
}) {
  const scrolled = useScrolled();
  const solid = !overlay || forceSolid || scrolled;
  return (
    <div
      className={
        "ae-header" +
        (overlay ? " ae-header--overlay" : "") +
        (solid ? " ae-header--solid" : "")
      }
    >
      {children}
    </div>
  );
}

/** True once the page has scrolled past the threshold. */
function useScrolled(threshold = 12): boolean {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

function shortCta(variant: Variant): string {
  return variant.templateType === "talent" ? "Join the directory" : "Book a meeting";
}
