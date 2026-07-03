import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ProjectsPage as ProjectsPageConfig, Project } from "@/config/schema";
import { frontPageDefault, projectsDefault } from "@/config/defaults";
import { FrontHeader, FrontFooter } from "@/components/frontpage/FrontPage";
import { NetworkBackdrop } from "@/components/landing/NetworkBackdrop";

/**
 * Public portfolio page (/projects). A showcase of production software Agility
 * Engineers has shipped: an intro band framing the page, then one card per
 * project linking out to the live app. The content is admin-managed — it fetches
 * the portfolio config (falling back to the bundled `projectsDefault`), the same
 * way the front page fetches its config, so admins keep it current from
 * /admin/projects. Reuses the front page's header/footer, brand tokens, and
 * `.ae-*` classes so it reads as a native section of the site.
 */
export default function ProjectsPage() {
  const { data, isError } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/public/projects");
      if (!res.ok) throw new Error("unavailable");
      return (await res.json()) as { projects: ProjectsPageConfig };
    },
    retry: false,
  });

  const config = isError ? projectsDefault : data?.projects ?? projectsDefault;

  useEffect(() => {
    document.title = "Our Work — Agility Engineers";
  }, []);

  return (
    <div style={{ fontFamily: "var(--font-body)", color: "var(--color-ink)", background: "#fff" }}>
      <FrontHeader links={[{ label: "Home", href: "/" }, { label: "Our Work", href: "/projects" }]} />
      <Intro intro={config.intro} />
      <main
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "clamp(40px,5vw,64px) clamp(16px,4vw,56px)",
        }}
      >
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "grid",
            gap: "clamp(16px,2vw,24px)",
            gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
          }}
        >
          {config.items.map((project, i) => (
            <li key={project.id || project.name || i} style={{ display: "flex" }}>
              <ProjectCard project={project} />
            </li>
          ))}
        </ul>
      </main>
      <FrontFooter config={frontPageDefault} />
    </div>
  );
}

/* ── Intro band ───────────────────────────────────────────────────────────────
   Same navy aurora treatment as the front-page hero (gradient + NetworkBackdrop),
   scaled down: eyebrow pill, headline, and one framing paragraph. Copy is
   admin-editable, passed in from the portfolio config. */
function Intro({ intro }: { intro: ProjectsPageConfig["intro"] }) {
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
          // Top padding reserves room for the immersive header floating over
          // this band (see HeaderShell in Nav.tsx).
          padding:
            "calc(var(--ae-header-h) + clamp(20px,3.5vw,36px)) clamp(16px,4vw,56px) clamp(36px,4.5vw,60px)",
        }}
      >
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
          {intro.eyebrow}
        </div>
        <h1
          style={{
            marginTop: 22,
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(30px,4vw,48px)",
            lineHeight: 1.06,
            letterSpacing: "-.02em",
            maxWidth: 820,
          }}
        >
          {intro.headline}
        </h1>
        <p
          style={{
            marginTop: 18,
            fontSize: "clamp(16px,1.3vw,19px)",
            lineHeight: 1.55,
            color: "#d7ecf3",
            maxWidth: 660,
          }}
        >
          {intro.subhead}
        </p>
      </div>
    </section>
  );
}

/* ── Project card ─────────────────────────────────────────────────────────────
   Follows the front page's PathCard pattern: the whole card is one external
   link (new tab, noopener noreferrer) with the .ae-lift hover/focus treatment,
   and the CTA is a non-interactive visual affordance (a styled span) — never a
   nested link — so there is exactly one tab stop per project. */
function ProjectCard({ project }: { project: Project }) {
  return (
    <a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className="ae-lift"
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        background: "#fff",
        border: "1px solid var(--color-line)",
        borderRadius: "var(--radius-card)",
        overflow: "hidden",
        textDecoration: "none",
        color: "var(--color-ink)",
      }}
    >
      <img
        src={project.screenshot || "/assets/hero-placeholder.png"}
        alt={project.screenshotAlt}
        loading="lazy"
        decoding="async"
        width={640}
        height={400}
        style={{
          display: "block",
          width: "100%",
          height: "auto",
          aspectRatio: "16 / 10",
          objectFit: "cover",
          borderBottom: "1px solid var(--color-line)",
          background: "var(--color-bg-alt)",
        }}
      />
      <span
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          flex: 1,
          padding: "clamp(20px,2.4vw,28px)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(19px,1.8vw,23px)",
            lineHeight: 1.15,
            color: "var(--color-navy)",
          }}
        >
          {project.name}
        </span>
        {project.tags && project.tags.length > 0 && (
          <span style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {project.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  background: "var(--color-bg-alt)",
                  color: "var(--color-navy)",
                  font: "600 11.5px/1 var(--font-display)",
                  letterSpacing: ".04em",
                  textTransform: "uppercase",
                  padding: "6px 12px",
                  borderRadius: "var(--radius-pill)",
                }}
              >
                {tag}
              </span>
            ))}
          </span>
        )}
        <span style={{ font: "400 15.5px/1.55 var(--font-body)", color: "var(--color-muted)" }}>
          {project.blurb}
        </span>
        <span
          style={{
            marginTop: "auto",
            paddingTop: 6,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            alignSelf: "flex-start",
            border: "1.5px solid var(--color-teal)",
            color: "var(--color-teal)",
            font: "700 14.5px/1 var(--font-display)",
            padding: "12px 20px",
            borderRadius: "var(--radius-btn)",
          }}
        >
          Visit the live app
          <span className="ae-arrow" aria-hidden>
            &rarr;
          </span>
        </span>
      </span>
    </a>
  );
}
