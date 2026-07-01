import type { Variant } from "@/config/schema";
import { Reveal } from "@/components/landing/Reveal";

const ACCENTS = [
  { bg: "#FDECEC", fg: "#C0392B" },
  { bg: "#FDF3E2", fg: "#B9770C" },
  { bg: "#EAF1F8", fg: "#08527F" },
];

/** Problem — three StoryBrand "villain" cards. */
export function Problem({ variant, separator }: { variant: Variant; separator?: string }) {
  const p = variant.copy.problem;
  return (
    <section
      style={{
        background: "#F2F5F7",
        padding: "clamp(40px,4.5vw,72px) clamp(16px,4vw,56px)",
        borderTop: separator,
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <Reveal as="h2" style={{ font: "800 clamp(26px,3vw,40px)/1.15 var(--font-display)", color: "#08527F", letterSpacing: "-.01em", maxWidth: 760 }}>
          {p.heading}
        </Reveal>
        {p.subhead && (
          <Reveal as="p" delay={1} style={{ marginTop: 16, font: "500 clamp(16px,1.4vw,18px)/1.6 var(--font-body)", color: "#5A6B73", maxWidth: 720 }}>
            {p.subhead}
          </Reveal>
        )}
        <div
          style={{
            marginTop: 36,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
            gap: 20,
          }}
        >
          {p.cards.map((c, i) => {
            const accent = ACCENTS[i % ACCENTS.length];
            return (
              <Reveal
                key={i}
                delay={((i % 3) + 1) as 1 | 2 | 3}
                className="ae-lift"
                style={{
                  background: "#fff",
                  border: "1px solid var(--color-line)",
                  borderRadius: 16,
                  padding: "26px 24px",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 46,
                    height: 46,
                    borderRadius: 12,
                    background: accent.bg,
                    color: accent.fg,
                    fontSize: 22,
                    marginBottom: 16,
                  }}
                >
                  {c.icon || "•"}
                </span>
                <h3 style={{ font: "700 19px/1.3 var(--font-display)", color: "#0B2A38" }}>{c.title}</h3>
                <p style={{ marginTop: 10, font: "500 15px/1.6 var(--font-body)", color: "#5A6B73" }}>{c.body}</p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
