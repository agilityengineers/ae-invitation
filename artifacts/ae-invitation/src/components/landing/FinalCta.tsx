import type { Variant } from "@/config/schema";
import { NetworkBackdrop } from "@/components/landing/NetworkBackdrop";
import { CtaButton } from "@/components/landing/CtaButton";
import { Reveal } from "@/components/landing/Reveal";

/** Final CTA — value recap + booking/signup card. The single conversion, repeated. */
export function FinalCta({ variant, separator }: { variant: Variant; separator?: string }) {
  const c = variant.copy.cta;
  return (
    <section
      id="book"
      className="ae-aurora"
      style={{
        position: "relative",
        background: "linear-gradient(150deg,#08527F,#0F88A2)",
        color: "#fff",
        overflow: "hidden",
        scrollMarginTop: 70,
        borderTop: separator,
      }}
    >
      <NetworkBackdrop />
      <div
        style={{
          position: "relative",
          maxWidth: 1180,
          margin: "0 auto",
          padding: "clamp(44px,5vw,80px) clamp(16px,4vw,56px)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
          gap: "clamp(32px,5vw,64px)",
          alignItems: "center",
        }}
      >
        <Reveal axis="x" style={{ minWidth: 0 }}>
          <h2 style={{ font: "800 clamp(28px,3.4vw,46px)/1.1 var(--font-display)", letterSpacing: "-.02em" }}>{c.heading}</h2>
          <p style={{ marginTop: 18, font: "500 clamp(16px,1.4vw,19px)/1.6 var(--font-body)", color: "#dbeef5", maxWidth: 520 }}>{c.body}</p>
          <ul style={{ marginTop: 22, listStyle: "none", padding: 0, display: "grid", gap: 12 }}>
            {c.bullets.map((b, i) => (
              <li key={i} style={{ display: "flex", alignItems: "center", gap: 12, font: "500 15.5px/1.4 var(--font-body)", color: "#eaf6fa" }}>
                <span style={{ color: "#5FE0A0" }}>✓</span> {b}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={1} style={{ minWidth: 0 }}>
          <div style={{ background: "#fff", color: "#0B2A38", borderRadius: 20, padding: "clamp(24px,5vw,30px) clamp(20px,5vw,28px)", boxShadow: "0 30px 60px rgba(0,0,0,.3)" }}>
            <h3 style={{ font: "800 clamp(20px,2.6vw,22px)/1.25 var(--font-display)", color: "#08527F" }}>{c.cardHeading}</h3>
            <p style={{ marginTop: 10, font: "500 14.5px/1.6 var(--font-body)", color: "#5A6B73" }}>{c.cardSubhead}</p>
            <CtaButton
              arrowBob
              style={{
                marginTop: 22,
                width: "100%",
                justifyContent: "center",
                background: "#2E8B57",
                color: "#fff",
                font: "700 16px/1 var(--font-display)",
                padding: "16px",
                borderRadius: 11,
                boxShadow: "0 12px 26px rgba(46,139,87,.3)",
              }}
            >
              {c.ctaLabel}
            </CtaButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
