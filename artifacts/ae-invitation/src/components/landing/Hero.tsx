/* eslint-disable @next/next/no-img-element */
import type { Variant } from "@/config/schema";
import { NetworkBackdrop } from "@/components/landing/NetworkBackdrop";
import { CtaButton } from "@/components/landing/CtaButton";
import { videoEmbedSrc } from "@/lib/video";

/** Hero band — aurora gradient, network backdrop, headline, single CTA, media. */
export function Hero({ variant, separator }: { variant: Variant; separator?: string }) {
  const h = variant.copy.hero;
  const media = h.media;
  const videoSrc = media.type !== "image" ? videoEmbedSrc(media.type, media.videoUrl) : "";
  const imgSrc = media.imageUrl?.trim() || "/assets/hero-placeholder.png";
  const imgAlt = media.imageAlt?.trim() || "Agility Engineers — moving ideas to production";

  return (
    <section
      className="ae-aurora"
      style={{
        position: "relative",
        background: "linear-gradient(160deg,#063A5A 0%,#08527F 55%,#0F88A2 130%)",
        color: "#fff",
        overflow: "hidden",
        borderTop: separator,
      }}
    >
      <NetworkBackdrop />
      <div
        style={{
          position: "relative",
          maxWidth: 1180,
          margin: "0 auto",
          padding: "clamp(24px,3.5vw,46px) clamp(16px,4vw,56px) clamp(40px,5vw,72px)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
          gap: "clamp(32px,5vw,64px)",
          alignItems: "center",
        }}
      >
        <div style={{ minWidth: 0 }}>
          {h.eyebrow && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(255,255,255,.12)",
                border: "1px solid rgba(255,255,255,.22)",
                padding: "7px 14px",
                borderRadius: 100,
                font: "600 12.5px/1 var(--font-body)",
                letterSpacing: ".04em",
                marginBottom: 22,
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#5FE0A0" }} />
              {h.eyebrow}
            </div>
          )}
          <h1
            style={{
              fontWeight: 800,
              fontSize: "clamp(34px,4.6vw,58px)",
              lineHeight: 1.04,
              letterSpacing: "-.02em",
            }}
          >
            {h.headline}
          </h1>
          <p
            style={{
              marginTop: 22,
              fontSize: "clamp(17px,1.4vw,20px)",
              lineHeight: 1.55,
              color: "#d7ecf3",
              maxWidth: 560,
            }}
          >
            {h.subhead}
          </p>
          <div style={{ marginTop: 34, display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center" }}>
            <CtaButton
              arrowBob
              style={{
                background: "#2E8B57",
                color: "#fff",
                font: "700 16px/1 var(--font-display)",
                padding: "18px 28px",
                borderRadius: 10,
                boxShadow: "0 12px 28px rgba(46,139,87,.4)",
              }}
            >
              {h.ctaLabel}
            </CtaButton>
          </div>
        </div>

        <div className="ae-hero-media" style={{ minWidth: 0, position: "relative" }}>
          <div style={{ position: "relative" }}>
            <div
              style={{
                position: "relative",
                borderRadius: 20,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,.18)",
                aspectRatio: videoSrc ? "16 / 9" : "16 / 11",
                boxShadow: "0 30px 60px rgba(0,0,0,.3)",
                background: "#063A5A",
              }}
            >
              {videoSrc ? (
                <iframe
                  src={videoSrc}
                  title="Agility Engineers background video"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    border: 0,
                  }}
                />
              ) : (
                <img
                  src={imgSrc}
                  alt={imgAlt}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              )}
            </div>
            {h.badge && (
              <div
                className="ae-float"
                style={{
                  position: "absolute",
                  bottom: -56,
                  left: -14,
                  background: "#fff",
                  color: "#0B2A38",
                  borderRadius: 14,
                  padding: "16px 18px",
                  boxShadow: "0 18px 40px rgba(0,0,0,.25)",
                  display: "flex",
                  alignItems: "center",
                  gap: 13,
                }}
              >
                <span
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    background: "#E8F6EE",
                    color: "#2E8B57",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    flex: "none",
                  }}
                >
                  ✓
                </span>
                <div style={{ font: "600 14px/1.2 var(--font-display)" }}>{h.badge}</div>
              </div>
            )}
          </div>
          {h.footnote && (
            <p
              style={{
                marginTop: h.badge ? 78 : 24,
                textAlign: "center",
                font: "500 13.5px/1.6 var(--font-body)",
                color: "#bcd9e4",
              }}
            >
              {h.footnote}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
