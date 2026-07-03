import { projectsPageSchema, type ProjectsPage } from "@/config/schema";

/**
 * Bundled default content for the public portfolio page (/projects). Used as the
 * fallback whenever /api/public/projects is unavailable — mirrors how the front
 * page falls back to `frontPageDefault`. Also the seed row inserted into
 * `site_content` (key 'projects') on first run, after which admins manage the
 * portfolio from /admin/projects.
 *
 * TODO: Replace these placeholder entries with real shipped projects — real
 * names, blurbs, live URLs, and screenshots (upload them in the admin, which
 * stores each screenshot as an S3 URL).
 */
export const projectsDefault: ProjectsPage = projectsPageSchema.parse({
  intro: {
    eyebrow: "Shipped & in production",
    headline: "Software we've moved to production.",
    subhead:
      "These are real applications Agility Engineers designed, built, and launched for clients — live, supported, and doing work every day. Browse the projects below and click any card to open the live application.",
  },
  items: [
    {
      id: "claimpilot",
      name: "ClaimPilot",
      blurb:
        "A claims-intake and triage portal for a specialty insurance carrier. It replaced a spreadsheet-and-email workflow with guided intake, automatic routing, and live status for policyholders — cutting first-response time from days to hours.",
      // TODO: replace with a real screenshot (upload in admin) or /assets/projects/claimpilot.png
      screenshot: "/assets/hero-placeholder.png",
      screenshotAlt: "ClaimPilot dashboard showing the claims triage queue",
      url: "https://example.com", // TODO: real live-app URL
      tags: ["Insurance", "React", "PostgreSQL"],
    },
    {
      id: "crewboard",
      name: "CrewBoard",
      blurb:
        "Scheduling and dispatch for a regional field-services company. Dispatchers drag jobs onto technician timelines and crews get routes and job details on their phones, eliminating the morning phone-call shuffle.",
      // TODO: replace with a real screenshot (upload in admin) or /assets/projects/crewboard.png
      screenshot: "/assets/hero-placeholder.png",
      screenshotAlt: "CrewBoard dispatch view with technician schedules on a timeline",
      url: "https://example.com", // TODO: real live-app URL
      tags: ["Field services", "Mobile web"],
    },
    {
      id: "ledgerlink",
      name: "LedgerLink",
      blurb:
        "An integration hub that syncs invoices, payments, and customers between a client's ERP and QuickBooks. Nightly reconciliation reports flag mismatches before month-end close instead of after it.",
      // TODO: replace with a real screenshot (upload in admin) or /assets/projects/ledgerlink.png
      screenshot: "/assets/hero-placeholder.png",
      screenshotAlt: "LedgerLink reconciliation report listing matched and flagged transactions",
      url: "https://example.com", // TODO: real live-app URL
      tags: ["Fintech", "Integrations", "Node.js"],
    },
    {
      id: "enrollly",
      name: "Enrollly",
      blurb:
        "Online enrollment and document collection for a benefits administrator. Members complete plan selection in one guided session with e-signature built in, and the back office gets clean, validated data instead of scanned paper forms.",
      // TODO: replace with a real screenshot (upload in admin) or /assets/projects/enrollly.png
      screenshot: "/assets/hero-placeholder.png",
      screenshotAlt: "Enrollly guided enrollment flow on the plan-selection step",
      url: "https://example.com", // TODO: real live-app URL
      tags: ["Benefits", "E-signature"],
    },
  ],
});
