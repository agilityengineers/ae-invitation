import type { Variant } from "@/config/schema";

/**
 * Default "Client Target" variant — audience: CEOs / owners / operators.
 * Single conversion: book a meeting with a client advisor.
 *
 * Copy transcribed from templates/client-target-page.dc.html; qualifier from
 * templates/ae-admin.js DEFAULTQUIZ + DEFSET. Doubles as the AI few-shot
 * example and the seeded `default-client` row. [needs your data] markers are
 * preserved deliberately — never invent stats, names, or proof points.
 */
export const clientDefault: Variant = {
  templateType: "client",
  slug: "default-client",
  label: "Client Target — default",
  published: false,
  isDefault: false,
  targeting: {
    industry: "",
    title: "CEOs, owners & operators",
    company: "",
    painPoints: [],
  },
  audience: "CEOs, owners & operators",
  sections: {
    hero: true,
    problem: true,
    guide: true,
    plan: true,
    proof: true,
    objections: true,
    cta: true,
    footer: true,
  },
  headerLinks: [
    { label: "About Us", url: "https://agilityengineers.com/" },
    { label: "Directory", url: "https://www.agility-engineers.com/" },
  ],
  copy: {
    hero: {
      eyebrow: "For CEOs, owners & operators",
      headline: "Your best ideas shouldn't die in a backlog.",
      subhead:
        "Agility Engineers takes the ideas your business is counting on — and moves them to production, efficiently and without the guesswork. From proof of concept to live, supported software.",
      ctaLabel: "Book a meeting with a client advisor",
      footnote: "30 minutes · No pitch — Tell us what you want to build · Walk away with a plan",
      badge: "Idea → production in one clear path",
      media: { type: "image", imageUrl: "", imageAlt: "", videoUrl: "" },
    },
    problem: {
      heading: "The idea is clear. Getting it built is where it stalls.",
      subhead:
        "You know what the business needs. But turning that into working software means budget you can't fully predict, timelines that slip, and teams that move slower than the market does.",
      cards: [
        {
          icon: "⏳",
          title: "Projects that drag",
          body: "Waterfall plans and long build cycles mean you're committing real money long before you see anything that works.",
        },
        {
          icon: "◷",
          title: "Unclear cost & risk",
          body: "Big estimates, vague scope, and no way to prove the concept works before you've spent the budget.",
        },
        {
          icon: "⤬",
          title: "Teams stuck in old ways",
          body: "The journey from waterfall to agile is hard to make alone — and a half-finished transition costs more than no transition.",
        },
      ],
    },
    guide: {
      eyebrow: "Why Agility Engineers",
      heading: "You don't have to figure it out alone",
      paragraphs: [
        "We're the engineers who've made this journey before. Agility Engineers exists to move ideas to production — efficiently, cost-effectively, and with the discipline that comes from doing it across teams and industries. We've guided the path from waterfall to agile, from project to product, more times than we can count.",
        "You bring the vision and the business context. We bring the engineering, the method, and a plan that de-risks every step.",
      ],
      chips: ["Agile transformation", "DevOps & delivery", "Production support"],
      stat1: { num: "120+", label: "ideas moved to production" },
      stat2: { num: "60%", label: "faster to first working build" },
      credentials: "Certifications, partners & credentials row [needs your data]",
      panel: { mode: "stats", imageUrl: "", imageAlt: "" },
    },
    plan: {
      eyebrow: "The plan",
      heading: "Three stages. One clear path from idea to production.",
      subhead:
        "No giant upfront commitment. You prove it works, then scale it, then keep it running.",
      steps: [
        {
          step: "1",
          kicker: "Prove it",
          title: "Proof of Concept",
          body: "We build a working proof of your idea fast — so you see it run and validate the investment before committing the full budget.",
        },
        {
          step: "2",
          kicker: "Scale it",
          title: "Team positioning",
          body: "We position the right team and method around the proven concept — building delivery capability that moves at the speed your market demands.",
        },
        {
          step: "3",
          kicker: "Keep it running",
          title: "Production support",
          body: "We support the software in production — so the thing you built keeps delivering value instead of becoming the next thing that needs fixing.",
        },
      ],
      ctaLabel: "Map this to your idea — book a call",
    },
    proof: {
      eyebrow: "Proof it works",
      heading: "Real results — in your customers' words.",
      quote:
        "[Client quote — pending your research doc. A short, specific outcome in the leader's own voice lands hardest here.]",
      attribution: { name: "[Name, Title]", title: "", company: "[Company]" },
      metrics: [
        { num: "[metric]", label: "outcome label" },
        { num: "[metric]", label: "outcome label" },
      ],
      caseStudy: "Case-study card / before→after [needs your data]",
      panel: { mode: "metrics", imageUrl: "", imageAlt: "", side: "right" },
    },
    objections: {
      heading: "The questions every leader asks us first.",
      items: [
        {
          q: "Is this just another expensive consulting engagement?",
          a: "No. We start small and prove value with a working proof of concept before you commit a full budget. You see results before you scale spend — not the other way around.",
        },
        {
          q: "What does the call actually cover?",
          a: "30 minutes with a client advisor. You describe the idea or the bottleneck; we tell you the most direct path to production and what stage one looks like. No slides, no pitch.",
        },
        {
          q: "We already have an internal team. Where do you fit?",
          a: "We position around your team, not over it — strengthening delivery, method, and DevOps so your people move faster, then handing back capability you keep.",
        },
        {
          q: "How fast can we see something working?",
          a: "The proof-of-concept stage is built to get a working result in front of you quickly. Exact timing depends on scope — the call is where we give you a straight answer. [confirm typical timeframe with your data]",
        },
      ],
    },
    cta: {
      heading: "Move your idea forward this quarter — not next year.",
      body: "Every quarter an idea sits in the backlog is a quarter a competitor could ship it first. One conversation is all it takes to see the fastest path to production.",
      bullets: [
        "A clear, no-obligation path to production",
        "30 minutes with a real client advisor",
        "No pitch, no jargon, no pressure",
      ],
      cardHeading: "Book a meeting with a client advisor",
      cardSubhead:
        "Pick a time that works for you — you'll get a calendar invite and a short prep note, nothing more.",
      ctaLabel: "Schedule my call",
    },
    footer: {
      tagline: "From project to product. Moving real ideas to production.",
      phone: "(404) 476-7800",
      logo: "chip",
      termsUrl: "https://www.agility-engineers.com/about/terms",
      privacyUrl: "https://www.agility-engineers.com/about/privacy",
    },
  },
  booking: { provider: "calendly", mode: "link", url: "", embedCode: "" },
  meta: {
    title: "Move your best ideas to production | Agility Engineers",
    description:
      "Agility Engineers moves the ideas your business is counting on from proof of concept to live, supported software — efficiently, without the guesswork. Book a meeting with a client advisor.",
    ogTitle: "Your best ideas shouldn't die in a backlog.",
    ogDescription:
      "From proof of concept to live, supported software. Book a meeting with a client advisor.",
    ogImage: "",
    canonical: "",
  },
  qualifier: {
    questions: [
      {
        id: "industry",
        q: "Which best describes your company's industry?",
        options: [
          { label: "Specialty / Regional Insurance Carrier", pts: 25 },
          { label: "Third-Party Logistics (3PL) or Warehousing", pts: 24 },
          { label: "Funded B2B SaaS (Series-A+)", pts: 24 },
          { label: "Commercial Real Estate / PropTech", pts: 20 },
          { label: "Niche Healthcare / Clinical Network", pts: 18 },
          { label: "Other mid-market business", pts: 10 },
          {
            label: "Pre-seed / bootstrapped, enterprise bank, or B2C e-commerce",
            pts: 0,
            kill: "industry",
          },
        ],
      },
      {
        id: "stage",
        q: "What is the current stage of your software or system architecture?",
        options: [
          {
            label:
              "A concept or clickable prototype we need turned into a secure, production-grade app",
            pts: 15,
          },
          {
            label:
              'An AI / vibe-coded prototype hitting bugs, security gaps, and "context rot" at scale',
            pts: 15,
          },
          {
            label: "Drowning in manual spreadsheets — we need a custom operational system",
            pts: 10,
          },
          {
            label: "A legacy / undocumented codebase or monolith we need to modernize or migrate",
            pts: 15,
          },
        ],
      },
      {
        id: "po",
        q: "Do you have a dedicated internal Product Owner / Project Manager for this initiative?",
        options: [
          { label: "Yes — an internal Product Owner is fully accountable for the roadmap", pts: 20 },
          { label: "No, but we're planning to hire or assign one", pts: 10 },
          {
            label: "No — we expect our development partner to act as sole Product Owner",
            pts: 0,
            flag: "discovery",
          },
        ],
      },
      {
        id: "budget",
        q: "What is your estimated development budget for this initiative?",
        options: [
          { label: "$200,000+", pts: 25 },
          { label: "$80,000 – $200,000", pts: 22 },
          { label: "$40,000 – $80,000", pts: 18 },
          { label: "$15,000 – $40,000", pts: 10 },
          { label: "Under $15,000", pts: 0, kill: "budget" },
        ],
      },
      {
        id: "team",
        q: "How is your internal technical / engineering team structured?",
        options: [
          { label: "A lean internal team, fully consumed by daily ops and maintenance", pts: 10 },
          { label: "No in-house developers — we need a full cross-functional delivery team", pts: 10 },
          {
            label: 'We want low-cost hourly staff augmentation ("body-rental") under our direction',
            pts: 0,
            kill: "bodyrental",
          },
        ],
      },
      {
        id: "compliance",
        q: "Does your application require specialized security or regulatory compliance?",
        options: [
          { label: "Yes — data compliance such as HIPAA, GDPR, or SOC 2", pts: 5 },
          {
            label:
              "Yes — technical standards such as RESO Web API or statutory insurance reporting",
            pts: 5,
          },
          { label: "No — standard cloud security is sufficient", pts: 2 },
        ],
      },
    ],
    settings: {
      killOn: true,
      killTiming: "end",
      showScore: false,
      resourceOn: true,
      eliteThreshold: 80,
      moderateThreshold: 50,
    },
  },
  provenance: { provider: null, model: "", generatedAt: "" },
};
