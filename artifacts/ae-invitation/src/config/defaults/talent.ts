import type { Variant } from "@/config/schema";

/**
 * Default "Talent / Directory" variant — audience: developers, architects, PMs,
 * scrum masters, program/product managers. Single conversion: join the directory.
 *
 * Copy transcribed from templates/talent-page.dc.html; qualifier from
 * templates/ae-talent.js DEFAULTQUIZ + DEFSET (kill-switches & resource page
 * OFF by default — inclusive intake). Placeholder weights; client supplies final
 * talent questions. [needs your data] markers preserved deliberately.
 */
export const talentDefault: Variant = {
  templateType: "talent",
  slug: "default-talent",
  label: "Talent / Directory — default",
  published: false,
  isDefault: false,
  targeting: {
    role: "developers, architects, PMs & delivery teams",
    discipline: "",
    seniority: "",
    location: "",
  },
  audience: "developers, architects, PMs & delivery teams",
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
      eyebrow: "For developers, architects, PMs & delivery teams",
      headline: "Get found by the teams building what's next.",
      subhead:
        "Agility Engineers connects skilled developers, architects, and delivery leaders with companies moving real ideas to production. Add your profile to the directory and put your name in front of the teams that need it.",
      ctaLabel: "Join the Agility Engineers directory",
      footnote: "2 minutes · No fees — Build your profile · Get discovered by hiring teams",
      badge: "Profile → directory, get discovered by teams",
      media: { type: "image", imageUrl: "", imageAlt: "", videoUrl: "" },
    },
    problem: {
      heading: "You're great at what you do. Getting found is the hard part.",
      subhead:
        "The best projects rarely reach the best people. Your skills get lost in a pile of résumés, the good work comes and goes in waves, and most recruiters don't understand your craft.",
      cards: [
        {
          icon: "⏳",
          title: "Lost in the noise",
          body: "Your profile sits in the same pile as everyone else's, and the opportunities worth your time never make it to you.",
        },
        {
          icon: "◷",
          title: "Feast or famine",
          body: "Between projects, chasing the next good engagement eats the time you'd rather spend doing the work you're great at.",
        },
        {
          icon: "⤬",
          title: "Mismatched roles",
          body: "Recruiters who don't understand your craft keep sending roles that waste everyone's time.",
        },
      ],
    },
    guide: {
      eyebrow: "Why Agility Engineers",
      heading: "You don't have to job-hunt alone",
      paragraphs: [
        "We connect skilled people with teams that need them. Agility Engineers builds and staffs the teams that move ideas to production. When we need a developer, architect, scrum master, or product owner, the directory is the first place we look — and we open it to the companies we work with too.",
        "You bring the craft. We bring the relationships, the projects, and a steady stream of teams looking for exactly what you do.",
      ],
      chips: ["Vetted network", "Real projects", "Agile teams"],
      stat1: { num: "120+", label: "engineers in the network" },
      stat2: { num: "60%", label: "roles filled from the directory" },
      credentials: "Skills, certifications & specialties row [needs your data]",
      panel: { mode: "stats", imageUrl: "", imageAlt: "" },
    },
    plan: {
      eyebrow: "How it works",
      heading: "Three steps. From profile to your next project.",
      subhead: "No fees, no gatekeeping. Build your profile, get matched, do great work.",
      steps: [
        {
          step: "1",
          kicker: "Sign up",
          title: "Create your profile",
          body: "Tell us your role, skills, and availability. Two minutes, no fees — and you're in the network.",
        },
        {
          step: "2",
          kicker: "Get matched",
          title: "Get matched",
          body: "When a team needs your skills, you're in the first pool we contact — matched to projects that fit your craft, not just any opening.",
        },
        {
          step: "3",
          kicker: "Get to work",
          title: "Do great work",
          body: "Join a project, deliver alongside a strong agile team, and build your reputation in the network — so the next match comes faster.",
        },
      ],
      ctaLabel: "Add your profile to the directory — it's free",
    },
    proof: {
      eyebrow: "Why join",
      heading: "Real work — in our members' words.",
      quote:
        "[Member quote — pending your data. A short, specific story from a placed engineer in their own voice lands hardest here.]",
      attribution: { name: "[Name, Title]", title: "", company: "[Company]" },
      metrics: [
        { num: "[metric]", label: "outcome label" },
        { num: "[metric]", label: "outcome label" },
      ],
      caseStudy: "Member spotlight / placement story [needs your data]",
      panel: { mode: "metrics", imageUrl: "", imageAlt: "", side: "right" },
    },
    objections: {
      heading: "The questions engineers ask us first.",
      items: [
        {
          q: "Does it cost anything to join?",
          a: "No. Joining the directory is free. We earn when we place you on paid work — never from membership.",
        },
        {
          q: "What happens after I sign up?",
          a: "We add your profile to the network. When a project matches your skills and availability, a member of our team reaches out — no spam in between.",
        },
        {
          q: "I already have a job. Should I still join?",
          a: "Yes. Plenty of members list to stay visible for the right opportunity, fractional work, or future projects — you control your availability at all times.",
        },
        {
          q: "What kind of work comes through?",
          a: "Real engagements on agile delivery teams — building and supporting software that moves to production. The exact mix depends on demand. [confirm typical roles with your data]",
        },
      ],
    },
    cta: {
      heading: "Put your name where the work is.",
      body: "The best projects go to the people teams already know. Add your profile to the directory and be one of them — it takes two minutes and costs nothing.",
      bullets: [
        "Free to join, always",
        "Matched to work that fits your craft",
        "You control your availability",
      ],
      cardHeading: "Join the Agility Engineers directory",
      cardSubhead:
        "Add your profile and we'll match you to projects as they come up — no fees, no spam.",
      ctaLabel: "Complete my directory profile",
    },
    footer: {
      tagline:
        "From project to product. Join the directory and connect with teams moving real ideas to production.",
      phone: "(404) 476-7800",
      logo: "chip",
      termsUrl: "https://www.agility-engineers.com/about/terms",
      privacyUrl: "https://www.agility-engineers.com/about/privacy",
    },
  },
  // Talent's conversion is the directory signup — modeled as a custom scheduler URL.
  booking: {
    provider: "custom",
    mode: "link",
    url: "https://www.agility-engineers.com/",
    embedCode: "",
  },
  meta: {
    title: "Join the Agility Engineers directory | Get found by teams building what's next",
    description:
      "Developers, architects, PMs and delivery leaders: add your profile to the Agility Engineers directory and get matched to real projects on agile teams. Free to join.",
    ogTitle: "Get found by the teams building what's next.",
    ogDescription:
      "Add your profile to the Agility Engineers directory and get matched to real projects. Free to join.",
    ogImage: "",
    canonical: "",
  },
  qualifier: {
    questions: [
      {
        id: "role",
        q: "Which role best describes you?",
        options: [
          { label: "Software Developer / Engineer", pts: 18 },
          { label: "Architect (Solutions / Cloud / Data)", pts: 18 },
          { label: "Project Manager", pts: 16 },
          { label: "Scrum Master / Agile Coach", pts: 16 },
          { label: "Program Manager", pts: 16 },
          { label: "Product Manager / Product Owner", pts: 16 },
          { label: "Other delivery-team role", pts: 12 },
        ],
      },
      {
        id: "experience",
        q: "How many years of professional experience do you have?",
        options: [
          { label: "10+ years", pts: 20 },
          { label: "6-10 years", pts: 18 },
          { label: "3-5 years", pts: 14 },
          { label: "1-2 years", pts: 9 },
          { label: "Less than 1 year", pts: 5 },
        ],
      },
      {
        id: "focus",
        q: "Where do you do your strongest work?",
        options: [
          { label: "Backend / APIs / cloud infrastructure", pts: 18 },
          { label: "Frontend / web / mobile", pts: 18 },
          { label: "Full-stack delivery", pts: 18 },
          { label: "Data / ML / analytics", pts: 18 },
          { label: "Delivery leadership (agile, program, product)", pts: 16 },
        ],
      },
      {
        id: "availability",
        q: "What is your current availability?",
        options: [
          { label: "Available now", pts: 16 },
          { label: "Available within 30 days", pts: 14 },
          { label: "Open to the right opportunity", pts: 11 },
          { label: "Not looking, but want to be listed", pts: 8 },
        ],
      },
      {
        id: "model",
        q: "How do you prefer to work?",
        options: [
          { label: "Full-time contract / consulting", pts: 14 },
          { label: "Part-time or fractional", pts: 12 },
          { label: "Project-based", pts: 12 },
          { label: "Open to any model", pts: 14 },
        ],
      },
      {
        id: "agile",
        q: "How would you describe your experience on agile delivery teams?",
        options: [
          { label: "Deep - led or coached agile teams", pts: 14 },
          { label: "Strong - worked on agile teams for years", pts: 12 },
          { label: "Some - a few agile projects", pts: 8 },
          { label: "New to agile", pts: 5 },
        ],
      },
    ],
    settings: {
      killOn: false,
      killTiming: "end",
      showScore: false,
      resourceOn: false,
      eliteThreshold: 80,
      moderateThreshold: 50,
    },
  },
  provenance: { provider: null, model: "", generatedAt: "" },
};
