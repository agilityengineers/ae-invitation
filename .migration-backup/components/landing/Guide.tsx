/* eslint-disable @next/next/no-img-element */
import type { Variant } from "@/config/schema";
import { Reveal } from "@/components/landing/Reveal";

/** Guide — authority + empathy; right panel is 2 stat cards + credentials OR a single image. */
export function Guide({ variant, separator }: { variant: Variant; separator?: string }) {
  const g = variant.copy.guide;
  const useImage = g.panel.mode === "image" && g.panel.imageUrl.trim();

  return (
    <section style={{ background: "#fff", padding: "clamp(40px,4.5vw,72px) clamp(16px,4vw,56px)", borderTop: separator }}>
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
          gap: "clamp(32px,4vw,56px)",
          alignItems: "center",
        }}
      >
        <Reveal axis="x" style={{ minWidth: 0 }}>
          {g.eyebrow && (
            <div style={{ font: "700 12px/1 var(--font-display)", letterSpacing: ".14em", textTransform: "uppercase", color: "#0F88A2", marginBottom: 14 }}>
              {g.eyebrow}
            </div>
          )}
          <h2 style={{ font: "800 clamp(26px,3vw,40px)/1.15 var(--font-display)", color: "#08527F", letterSpacing: "-.01em" }}>{g.heading}</h2>
          {g.paragraphs.map((para, i) => (
            <p key={i} style={{ marginTop: 18, font: "500 clamp(16px,1.3vw,18px)/1.65 var(--font-body)", color: "#46565E" }}>
              {para}
            </p>
          ))}
          <div style={{ marginTop: 22, display: "flex", flexWrap: "wrap", gap: 10 }}>
            {g.chips.map((chip, i) => (
              <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 7, font: "600 13.5px/1 var(--font-body)", color: "#08527F", background: "#EAF1F8", padding: "8px 14px", borderRadius: 100 }}>
                ✓ {chip}
              </span>
            ))}
          </div>
        </Reveal>

        {useImage ? (
          <Reveal delay={1} style={{ minWidth: 0 }}>
            <img
              src={g.panel.imageUrl}
              alt={g.panel.imageAlt || "Agility Engineers"}
              style={{ width: "100%", borderRadius: 18, border: "1px solid var(--color-line)", display: "block", objectFit: "cover", aspectRatio: "16 / 12" }}
            />
          </Reveal>
        ) : (
          <Reveal delay={1} style={{ minWidth: 0, display: "grid", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[g.stat1, g.stat2].map((s, i) => (
                <div key={i} className="ae-lift" style={{ background: "#F2F5F7", border: "1px solid var(--color-line)", borderRadius: 16, padding: "22px 20px" }}>
                  <div style={{ font: "800 clamp(28px,3vw,40px)/1 var(--font-display)", color: "#0F88A2" }}>{s.num}</div>
                  <div style={{ marginTop: 8, font: "500 14px/1.4 var(--font-body)", color: "#5A6B73" }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, font: "600 13px/1.5 var(--font-body)", color: "#5A6B73", background: "#fff", border: "1px dashed var(--color-line)", borderRadius: 12, padding: "14px 16px" }}>
              <span style={{ color: "#0F88A2" }}>★</span> {g.credentials}
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
