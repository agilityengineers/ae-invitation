/**
 * Data source for the public portfolio page (/projects). The page renders one
 * card per entry, in order — to add a project, append an object here; no page
 * code changes needed.
 *
 * Screenshots live under public/assets/ (served from /assets/...). Until real
 * captures exist, entries point at the bundled hero placeholder.
 */
export interface Project {
  /** Product name shown as the card heading. */
  name: string;
  /** 2–3 sentences: what it is and the value it delivers. */
  blurb: string;
  /** Public path to the screenshot, e.g. "/assets/projects/acme.png". */
  screenshot: string;
  /** Meaningful alt text describing what the screenshot shows. */
  screenshotAlt: string;
  /** Live application URL — the card and its CTA open this in a new tab. */
  url: string;
  /** Optional short labels (stack, domain) rendered as pills on the card. */
  tags?: string[];
}

// TODO: Replace these placeholder entries with real shipped projects — real
// names, blurbs, live URLs, and screenshots dropped into public/assets/projects/.
export const projects: Project[] = [
  {
    name: "ClaimPilot",
    blurb:
      "A claims-intake and triage portal for a specialty insurance carrier. It replaced a spreadsheet-and-email workflow with guided intake, automatic routing, and live status for policyholders — cutting first-response time from days to hours.",
    // TODO: replace with a real screenshot at /assets/projects/claimpilot.png
    screenshot: "/assets/hero-placeholder.png",
    screenshotAlt: "ClaimPilot dashboard showing the claims triage queue",
    url: "https://example.com", // TODO: real live-app URL
    tags: ["Insurance", "React", "PostgreSQL"],
  },
  {
    name: "CrewBoard",
    blurb:
      "Scheduling and dispatch for a regional field-services company. Dispatchers drag jobs onto technician timelines and crews get routes and job details on their phones, eliminating the morning phone-call shuffle.",
    // TODO: replace with a real screenshot at /assets/projects/crewboard.png
    screenshot: "/assets/hero-placeholder.png",
    screenshotAlt: "CrewBoard dispatch view with technician schedules on a timeline",
    url: "https://example.com", // TODO: real live-app URL
    tags: ["Field services", "Mobile web"],
  },
  {
    name: "LedgerLink",
    blurb:
      "An integration hub that syncs invoices, payments, and customers between a client's ERP and QuickBooks. Nightly reconciliation reports flag mismatches before month-end close instead of after it.",
    // TODO: replace with a real screenshot at /assets/projects/ledgerlink.png
    screenshot: "/assets/hero-placeholder.png",
    screenshotAlt: "LedgerLink reconciliation report listing matched and flagged transactions",
    url: "https://example.com", // TODO: real live-app URL
    tags: ["Fintech", "Integrations", "Node.js"],
  },
  {
    name: "Enrollly",
    blurb:
      "Online enrollment and document collection for a benefits administrator. Members complete plan selection in one guided session with e-signature built in, and the back office gets clean, validated data instead of scanned paper forms.",
    // TODO: replace with a real screenshot at /assets/projects/enrollly.png
    screenshot: "/assets/hero-placeholder.png",
    screenshotAlt: "Enrollly guided enrollment flow on the plan-selection step",
    url: "https://example.com", // TODO: real live-app URL
    tags: ["Benefits", "E-signature"],
  },
];
