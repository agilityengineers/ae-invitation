import { useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Lightbulb, Code2 } from "lucide-react";
import type { FrontPage as FrontPageConfig, FrontPageCard, Variant } from "@/config/schema";
import { frontPageDefault, clientDefault } from "@/config/defaults";
import { openBooking } from "@/lib/booking";
import { Logo, HEADER_LOGO_SIZE } from "@/components/landing/Logo";
import { NetworkBackdrop } from "@/components/landing/NetworkBackdrop";

/**
 * The site's public front page (/). One job: route a visitor to the right side of
 * the business in one click — client vs. developer/team — plus a standalone client
 * CTA for people ready to act. Its copy is admin-editable: it fetches the
 * singleton front-page config (falling back to the bundled default), so admins
 * keep it current the same way they edit the landing pages. The "book a meeting"
 * CTA opens the CLIENT default's scheduler directly, so it stays in sync whenever
 * the admin changes the client scheduler. It reuses the site's brand tokens,
 * `.ae-*` classes, Logo, and the hero NetworkBackdrop so it feels native.
 */
export default function FrontPage() {
  const { data, isError } = useQuery({
    queryKey: ["frontpage"],
    queryFn: async () => {
      const res = await fetch("/api/public/frontpage");
      if (!res.ok) throw new Error("unavailable");
      return (await res.json()) as { frontPage: FrontPageConfig };
    },
    retry: false,
  });

  // The client default backs the "book a meeting" CTA's scheduler destination.
  const clientQuery = useQuery({
    queryKey: ["default-variant", "client"],
    queryFn: async () => {
      const res = await fetch("/api/public/defaults/client");
      if (!res.ok) throw new Error("unavailable");
      return (await res.json()) as { variant: Variant };
    },
    retry: false,
  });

  const config = isError ? frontPageDefault : data?.frontPage ?? frontPageDefault;
  const clientVariant = clientQuery.isError ? clientDefault : clientQuery.data?.variant ?? clientDefault;

  useEffect(() => {
    document.title = config.meta.title;
  }, [config.meta.title]);

  const onBook = () => openBooking(clientVariant.booking, clientVariant.slug);

  return (
    <div style={{ fontFamily: "var(--font-body)", color: "var(--color-ink)", background: "#fff" }}>
      <FrontHeader />
      <Hero config={config} onBook={onBook} />
      <FrontFooter config={config} />
    </div>
  );
}

/* ── Header ──────────────────────────────────────────────────────────────────
   Reuses Nav.tsx's exact white-bar wrapper geometry, but renders only the logo —
   no nav links and no conversion CTA, so the routing choice below is the page. */
function FrontHeader() {
  return (
    <div style={{ background: "#fff", borderBottom: "1px solid var(--color-line)" }}>
      <header
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "14px clamp(16px,4vw,56px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <Logo treatment="chip" size={HEADER_LOGO_SIZE} />
      </header>
    </div>
  );
}

/* ── Hero + the two-path choice ───────────────────────────────────────────────
   Navy aurora band identical to the landing hero: gradient + NetworkBackdrop.
   Holds the eyebrow, headline, subhead, the two path cards, and the standalone
   client CTA — all above the fold on desktop. All copy comes from the config. */
function Hero({ config, onBook }: { config: FrontPageConfig; onBook: () => void }) {
  return (
    <section
      className="ae-aurora"
      style={{
        position: "relative",
        background: "linear-gradient(160deg,#063A5A 0%,#08527F 55%,#0F88A2 130%)",
        color: "#fff",
        overflow: "hidden",
      }}
    >
      <NetworkBackdrop />
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1180,
          margin: "0 auto",
          padding: "clamp(40px,5vw,72px) clamp(16px,4vw,56px)",
        }}
      >
        {/* Eyebrow */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(255,255,255,.12)",
            border: "1px solid rgba(255,255,255,.22)",
            padding: "7px 14px",
            borderRadius: "var(--radius-pill)",
            font: "600 12.5px/1 var(--font-body)",
            letterSpacing: ".04em",
          }}
        >
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--color-success)" }} />
          {config.eyebrow}
        </div>

        {/* Headline + subhead */}
        <h1
          style={{
            marginTop: 22,
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(34px,4.6vw,58px)",
            lineHeight: 1.04,
            letterSpacing: "-.02em",
            maxWidth: 900,
          }}
        >
          {config.headline}
        </h1>
        <p
          style={{
            marginTop: 20,
            fontSize: "clamp(17px,1.4vw,20px)",
            lineHeight: 1.55,
            color: "#d7ecf3",
            maxWidth: 660,
          }}
        >
          {config.subhead}
        </p>

        {/* Two path cards — client first (leads on mobile, sits left on desktop) */}
        <div
          style={{
            marginTop: "clamp(28px,4vw,44px)",
            display: "grid",
            gap: "clamp(16px,2vw,24px)",
            gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
          }}
        >
          <PathCard
            card={config.clientCard}
            accent="navy"
            icon={<Lightbulb size={22} strokeWidth={2.2} />}
          />
          <PathCard
            card={config.talentCard}
            accent="teal"
            icon={<Code2 size={22} strokeWidth={2.2} />}
          />
        </div>

        {/* Standalone client CTA — the one green action; opens the client scheduler
            directly (in sync with the client default's booking config). */}
        <div style={{ marginTop: "clamp(28px,4vw,40px)", textAlign: "center" }}>
          <p style={{ font: "600 14px/1.4 var(--font-body)", color: "#d7ecf3" }}>
            {config.cta.prompt}
          </p>
          <button
            type="button"
            onClick={onBook}
            className="ae-cta"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              marginTop: 12,
              border: "none",
              cursor: "pointer",
              background: "var(--color-cta)",
              color: "#fff",
              font: "700 16px/1 var(--font-display)",
              padding: "18px 28px",
              borderRadius: "var(--radius-btn)",
              boxShadow: "0 12px 28px rgba(46,139,87,.4)",
            }}
          >
            {config.cta.label}
            <span className="ae-arrow" style={{ fontSize: 18 }} aria-hidden>
              &rarr;
            </span>
          </button>
          <p style={{ marginTop: 12, font: "500 12.5px/1.5 var(--font-body)", color: "#a9cede" }}>
            {config.cta.footnote}
          </p>
        </div>
      </div>
    </section>
  );
}

/* ── Path card ────────────────────────────────────────────────────────────────
   The whole card is a base-aware wouter <Link>. The "button" is a non-interactive
   visual affordance (a styled span) — never a nested link — styled as an outline,
   NOT green, so the single green CTA above stays the unambiguous "commit" signal. */
function PathCard({
  card,
  accent,
  icon,
}: {
  card: FrontPageCard;
  accent: "navy" | "teal";
  icon: React.ReactNode;
}) {
  const accentColor = accent === "navy" ? "var(--color-navy)" : "var(--color-teal)";
  return (
    <Link
      href={card.href}
      className="ae-lift"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        background: "#fff",
        border: "1px solid var(--color-line)",
        borderRadius: "var(--radius-card)",
        padding: "clamp(24px,3vw,36px)",
        textDecoration: "none",
        color: "var(--color-ink)",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 44,
          height: 44,
          borderRadius: 12,
          background: "var(--color-bg-alt)",
          color: accentColor,
        }}
      >
        {icon}
      </span>
      <span
        style={{
          font: "700 11.5px/1 var(--font-display)",
          letterSpacing: ".08em",
          textTransform: "uppercase",
          color: accentColor,
        }}
      >
        {card.eyebrow}
      </span>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 800,
          fontSize: "clamp(20px,2vw,25px)",
          lineHeight: 1.15,
          color: "var(--color-navy)",
        }}
      >
        {card.heading}
      </span>
      <span style={{ font: "400 15.5px/1.55 var(--font-body)", color: "var(--color-muted)" }}>
        {card.body}
      </span>
      <span
        style={{
          marginTop: 6,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          alignSelf: "flex-start",
          border: `1.5px solid ${accentColor}`,
          color: accentColor,
          font: "700 14.5px/1 var(--font-display)",
          padding: "12px 20px",
          borderRadius: "var(--radius-btn)",
        }}
      >
        {card.action}
        <span className="ae-arrow" aria-hidden>
          &rarr;
        </span>
      </span>
    </Link>
  );
}

/* ── Footer ───────────────────────────────────────────────────────────────────
   Reuses Footer.tsx's navy-900 band styling and the site tagline / legal row, but
   without the variant-bound qualifier CtaButton. */
function FrontFooter({ config }: { config: FrontPageConfig }) {
  const year = new Date().getFullYear();
  return (
    <footer
      style={{
        background: "#04293F",
        color: "#9fc3d4",
        padding: "clamp(36px,4vw,56px) clamp(16px,4vw,56px)",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ maxWidth: 460 }}>
          <Logo treatment="white" />
          <p style={{ marginTop: 16, font: "500 15px/1.6 var(--font-body)", color: "#9fc3d4" }}>
            {config.footer.tagline}
          </p>
        </div>
        <div
          style={{
            marginTop: 28,
            paddingTop: 20,
            borderTop: "1px solid rgba(255,255,255,.1)",
            font: "500 13px/1.6 var(--font-body)",
            color: "#7fa6b8",
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <span>&copy; {year} | Agility Engineers, LLC | All Rights Reserved |</span>
          <a
            href={config.footer.termsUrl}
            style={{ color: "#bcd9e4", textDecoration: "underline" }}
          >
            Terms of Use
          </a>
          <span>|</span>
          <a
            href={config.footer.privacyUrl}
            style={{ color: "#bcd9e4", textDecoration: "underline" }}
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
}
