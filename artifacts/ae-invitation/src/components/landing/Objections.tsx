import type { Variant } from "@/config/schema";
import { Reveal } from "@/components/landing/Reveal";

/** Objections — FAQ accordion (native <details>, no JS). */
export function Objections({ variant, separator }: { variant: Variant; separator?: string }) {
  const o = variant.copy.objections;
  return (
    <section style={{ background: "#fff", padding: "clamp(40px,4.5vw,72px) clamp(16px,4vw,56px)", borderTop: separator }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <Reveal as="h2" style={{ font: "800 clamp(26px,3vw,40px)/1.15 var(--font-display)", color: "#08527F", letterSpacing: "-.01em", textAlign: "center" }}>
          {o.heading}
        </Reveal>
        <div style={{ marginTop: 32, display: "grid", gap: 12 }}>
          {o.items.map((item, i) => (
            <Reveal key={i} delay={((i % 3) + 1) as 1 | 2 | 3}>
              <details style={{ border: "1px solid var(--color-line)", borderRadius: 14, background: "#fff", padding: "4px 4px" }}>
                <summary
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 14,
                    padding: "16px 18px",
                    font: "700 16.5px/1.4 var(--font-display)",
                    color: "#0B2A38",
                  }}
                >
                  {item.q}
                  <span className="ae-faqplus" style={{ color: "#0F88A2", fontSize: 22, transition: "transform .2s ease", flex: "none" }}>
                    +
                  </span>
                </summary>
                <p style={{ padding: "0 18px 18px", font: "500 15px/1.65 var(--font-body)", color: "#5A6B73" }}>{item.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
