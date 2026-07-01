import type { Variant } from "@/config/schema";
import { Logo } from "@/components/landing/Logo";
import { CtaButton } from "@/components/landing/CtaButton";

/**
 * Header: logo (links to the main site) + admin-managed nav links (navigation,
 * NOT conversions) + one compact conversion CTA. On a dark band (hero/cta) it
 * sits transparent above the section.
 */
export function Nav({ variant }: { variant: Variant }) {
  const links = (variant.headerLinks ?? []).filter((l) => l.label.trim());
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
        <Logo treatment="chip" />
        <nav className="ae-navlinks" style={{ display: "flex", alignItems: "center", gap: 22 }}>
          {links.map((l, i) => (
            <a key={i} className="ae-nav" href={l.url || "#"}>
              {l.label}
            </a>
          ))}
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
        </nav>
      </header>
    </div>
  );
}

function shortCta(variant: Variant): string {
  return variant.templateType === "talent" ? "Join the directory" : "Book a meeting";
}
