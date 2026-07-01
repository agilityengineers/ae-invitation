import { frontPageSchema, type FrontPage } from "@/config/schema";

/**
 * Bundled default content for the public front page (/). Used as the fallback
 * whenever /api/public/frontpage is unavailable — mirrors how client.tsx falls
 * back to `clientDefault`. This is the copy the front page shipped with before it
 * became admin-editable.
 */
export const frontPageDefault: FrontPage = frontPageSchema.parse({
  meta: { title: "Agility Engineers — Moving real ideas to production." },
  eyebrow: "Agility Engineers",
  headline: "Moving real ideas to production.",
  subhead:
    "We help companies design, build, and support software — and we build the teams that do it. Tell us which one you are, and we'll point you the right way.",
  clientCard: {
    eyebrow: "For CEOs, owners & operators",
    heading: "I have something to build or support",
    body: "You're evaluating a partner to take an idea from proof of concept to live, supported software.",
    action: "Explore what we build",
    href: "/client",
  },
  talentCard: {
    eyebrow: "For developers, architects & delivery teams",
    heading: "I'm a developer or on a delivery team",
    body: "You're joining a project, need team resources, or want to get found for the next one.",
    action: "Go to the directory",
    href: "/talent",
  },
  cta: {
    prompt: "Already know you want to talk?",
    label: "Book a meeting with a client advisor",
    footnote: "30 minutes · No pitch · Walk away with a plan",
  },
  footer: {
    tagline: "From project to product. Moving real ideas to production.",
    termsUrl: "https://www.agility-engineers.com/about/terms",
    privacyUrl: "https://www.agility-engineers.com/about/privacy",
  },
});
