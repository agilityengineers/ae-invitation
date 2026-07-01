import type { Variant } from "@/config/schema";
import { Reveal } from "@/components/landing/Reveal";
import { CtaButton } from "@/components/landing/CtaButton";

/** Plan — the three-stage approach, numbered badges with staggered pulse rings. */
export function Plan({ variant, separator }: { variant: Variant; separator?: string }) {
  const p = variant.copy.plan;
  return (
    <section
      style={{
        background: "linear-gradient(180deg,#F2F5F7,#fff)",
        padding: "clamp(40px,4.5vw,72px) clamp(16px,4vw,56px)",
        borderTop: separator,
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ textAlign: "center", maxWidth: 720, margin: "0 auto" }}>
          {p.eyebrow && (
            <Reveal as="div" style={{ font: "700 12px/1 var(--font-display)", letterSpacing: ".14em", textTransform: "uppercase", color: "#0F88A2", marginBottom: 14 }}>
              {p.eyebrow}
            </Reveal>
          )}
          <Reveal as="h2" delay={1} style={{ font: "800 clamp(26px,3vw,40px)/1.15 var(--font-display)", color: "#08527F", letterSpacing: "-.01em" }}>
            {p.heading}
          </Reveal>
          {p.subhead && (
            <Reveal as="p" delay={2} style={{ marginTop: 14, font: "500 clamp(16px,1.4vw,18px)/1.6 var(--font-body)", color: "#5A6B73" }}>
              {p.subhead}
            </Reveal>
          )}
        </div>

        <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 22 }}>
          {p.steps.map((s, i) => (
            <Reveal key={i} delay={((i % 3) + 1) as 1 | 2 | 3} className="ae-lift" style={{ background: "#fff", border: "1px solid var(--color-line)", borderRadius: 18, padding: "28px 24px" }}>
              <span
                className={`ae-ring${i === 1 ? " ae-ring2" : i === 2 ? " ae-ring3" : ""}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: "#08527F",
                  color: "#fff",
                  font: "800 22px/1 var(--font-display)",
                  marginBottom: 18,
                }}
              >
                {s.step}
              </span>
              <div style={{ font: "700 12px/1 var(--font-display)", letterSpacing: ".1em", textTransform: "uppercase", color: "#0F88A2", marginBottom: 8 }}>{s.kicker}</div>
              <h3 style={{ font: "700 20px/1.25 var(--font-display)", color: "#0B2A38" }}>{s.title}</h3>
              <p style={{ marginTop: 10, font: "500 15px/1.6 var(--font-body)", color: "#5A6B73" }}>{s.body}</p>
            </Reveal>
          ))}
        </div>

        <div style={{ marginTop: 36, textAlign: "center" }}>
          <CtaButton
            arrowBob
            style={{ background: "#2E8B57", color: "#fff", font: "700 16px/1 var(--font-display)", padding: "16px 26px", borderRadius: 10, boxShadow: "0 12px 28px rgba(46,139,87,.3)" }}
          >
            {p.ctaLabel}
          </CtaButton>
        </div>
      </div>
    </section>
  );
}
