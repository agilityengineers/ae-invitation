/* eslint-disable @next/next/no-img-element */
import type { Variant } from "@/config/schema";
import { Reveal } from "@/components/landing/Reveal";

/** Proof — quote + 2 metric tiles + case-study card, OR a single image on either side. */
export function Proof({ variant, separator }: { variant: Variant; separator?: string }) {
  const p = variant.copy.proof;
  const useImage = p.panel.mode === "image" && p.panel.imageUrl.trim();
  const imageLeft = p.panel.side === "left";

  const quoteBlock = (
    <Reveal axis="x" style={{ minWidth: 0 }}>
      {p.eyebrow && (
        <div style={{ font: "700 12px/1 var(--font-display)", letterSpacing: ".14em", textTransform: "uppercase", color: "#5FD0E6", marginBottom: 14 }}>{p.eyebrow}</div>
      )}
      <h2 style={{ font: "800 clamp(24px,2.8vw,38px)/1.18 var(--font-display)", color: "#fff", letterSpacing: "-.01em" }}>{p.heading}</h2>
      <blockquote style={{ margin: "22px 0 0", font: "500 clamp(18px,1.7vw,23px)/1.5 var(--font-body)", color: "#dbeef5", fontStyle: "italic" }}>
        {p.quote}
      </blockquote>
      {(p.attribution.name || p.attribution.company) && (
        <div style={{ marginTop: 16, font: "600 14px/1.4 var(--font-body)", color: "#9fc3d4" }}>
          {[p.attribution.name, p.attribution.title, p.attribution.company].filter(Boolean).join(" · ")}
        </div>
      )}
    </Reveal>
  );

  const panelBlock = useImage ? (
    <Reveal delay={1} style={{ minWidth: 0 }}>
      <img
        src={p.panel.imageUrl}
        alt={p.panel.imageAlt || "Agility Engineers proof"}
        style={{ width: "100%", borderRadius: 18, border: "1px solid rgba(255,255,255,.18)", display: "block", objectFit: "cover", aspectRatio: "16 / 12" }}
      />
    </Reveal>
  ) : (
    <Reveal delay={1} style={{ minWidth: 0, display: "grid", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {p.metrics.map((m, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.14)", borderRadius: 16, padding: "22px 20px" }}>
            <div style={{ font: "800 clamp(26px,3vw,38px)/1 var(--font-display)", color: "#5FE0A0" }}>{m.num}</div>
            <div style={{ marginTop: 8, font: "500 14px/1.4 var(--font-body)", color: "#bcd9e4" }}>{m.label}</div>
          </div>
        ))}
      </div>
      {p.caseStudy && (
        <div style={{ font: "600 13.5px/1.5 var(--font-body)", color: "#bcd9e4", background: "rgba(255,255,255,.04)", border: "1px dashed rgba(255,255,255,.18)", borderRadius: 12, padding: "16px 18px" }}>
          {p.caseStudy}
        </div>
      )}
    </Reveal>
  );

  return (
    <section style={{ background: "#063A5A", color: "#fff", padding: "clamp(40px,4.5vw,72px) clamp(16px,4vw,56px)", borderTop: separator }}>
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
        {imageLeft && useImage ? (
          <>
            <div style={{ order: 1 }}>{panelBlock}</div>
            <div style={{ order: 2 }}>{quoteBlock}</div>
          </>
        ) : (
          <>
            {quoteBlock}
            {panelBlock}
          </>
        )}
      </div>
    </section>
  );
}
