import type { Variant } from "@/config/schema";
import { Logo } from "@/components/landing/Logo";
import { CtaButton } from "@/components/landing/CtaButton";

/** Footer — logo treatment, tagline, CTA, tracking phone, legal row with auto-updating year. */
export function Footer({ variant, separator }: { variant: Variant; separator?: string }) {
  const f = variant.copy.footer;
  const year = new Date().getFullYear();
  return (
    <footer style={{ background: "#04293F", color: "#9fc3d4", padding: "clamp(36px,4vw,56px) clamp(16px,4vw,56px)", borderTop: separator }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
          <div style={{ maxWidth: 460 }}>
            <Logo treatment={f.logo} />
            <p style={{ marginTop: 16, font: "500 15px/1.6 var(--font-body)", color: "#9fc3d4" }}>{f.tagline}</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12 }}>
            <CtaButton
              style={{ background: "#2E8B57", color: "#fff", font: "700 15px/1 var(--font-display)", padding: "14px 22px", borderRadius: 10, boxShadow: "0 12px 26px rgba(46,139,87,.3)" }}
            >
              {variant.copy.cta.cardHeading}
            </CtaButton>
            {f.phone && (
              <a href={`tel:${f.phone.replace(/[^0-9+]/g, "")}`} style={{ font: "600 15px/1 var(--font-display)", color: "#cfe3ec", textDecoration: "none" }}>
                {f.phone}
              </a>
            )}
          </div>
        </div>
        <div style={{ marginTop: 28, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,.1)", font: "500 13px/1.6 var(--font-body)", color: "#7fa6b8", display: "flex", flexWrap: "wrap", gap: 8 }}>
          <span>© {year} | Agility Engineers, LLC — Directory | All Rights Reserved |</span>
          <a href={f.termsUrl} style={{ color: "#bcd9e4", textDecoration: "underline" }}>Terms of Use</a>
          <span>|</span>
          <a href={f.privacyUrl} style={{ color: "#bcd9e4", textDecoration: "underline" }}>Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
}
