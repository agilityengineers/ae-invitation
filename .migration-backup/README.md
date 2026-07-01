# Handoff: Agility Engineers Landing-Page Generator (Client + Talent templates)

> **✅ Implemented.** This repo now contains the full Next.js app built to the spec below.
> To run, configure, and deploy it, see **[`docs/DEPLOY.md`](docs/DEPLOY.md)**. The spec below
> remains the source of truth for *what* was built; `docs/DEPLOY.md` covers *how to run it*.


> **For the coding agent (Claude Code):** This bundle is a **design + behavior reference**, exported from Claude Design. The two `.dc.html` files are **working HTML prototypes** — they show the exact look, copy, motion, and admin behavior the client wants. **Do not ship the HTML as-is.** Recreate it in the target codebase using that codebase's patterns. The target codebase already exists (see "Repos to match" below) — you are **extending it**, not greenfielding.

---

## 0. TL;DR — what to build

Add **two new StoryBrand landing-page templates** — a **Client Target** page and a **Talent / Directory** page — to the company's existing config-driven landing-page generator, so a non-technical admin can:

1. **Generate** a new page variant with AI (admin chooses **Claude or OpenAI** per generation), pre-filled from a **target** (client: industry + title/role + company; talent: role + discipline + seniority).
2. **Edit** every piece of copy, toggle sections on/off, choose images, set the scheduler/CTA, and set SEO/social meta — all per variant.
3. **Publish** the variant to its own SEO-optimized URL.
4. **Capture leads** from an interactive qualifier and route them out (Zapier-first).

The two prototypes in `templates/` are the **canonical visual + behavioral spec** for those templates. Everything an admin can do in the prototype's gear-icon panel must become a **server-persisted, per-variant config field** in production.

---

## 1. Repos to match (architecture — match 100%)

The client has **two existing repos** that already implement this exact pattern. **Read both before designing the schema.** The new Agility Engineers generator must be consistent with how these are structured.

### A. `agilityengineers/fabp-landing-pages` (primary architectural match)
Next.js 15 App Router per-industry landing-page generator. Key pieces to mirror:
- **`app/[industry]/page.tsx`** — public page reads `config/industries/<slug>.json` at request time and composes sections from `components/landing/*` based on a **`sections` toggle map**. `generateStaticParams` pre-renders every slug; `app/sitemap.ts` emits only **published** variants. **This is the SEO-optimal pattern** (static per-slug + sitemap) — see §8.
- **`config/schema.ts`** — strict **Zod schema** is the source of truth; both AI generations and admin saves validate against it. Update the schema first when the data shape changes.
- **`config/base.json`** — brand-wide info (founder bio, brand name, phone) shared across variants.
- **`lib/config.ts`** — the only module that touches the filesystem for configs.
- **`lib/claude.ts`** — `generateIndustryConfig` (few-shots off an existing config, strips fences, `schema.parse`, retries once on validation failure) + `regenerateSection` (partial regen of one section). `SYSTEM_PROMPT` encodes brand voice.
- **`app/admin/*`** + **`components/admin/*`** — list / create / edit / publish / delete; cookie auth via `middleware.ts`; mutating API routes re-check the cookie inline.
- **`app/api/*`** — `/auth/login`, `/industries` CRUD, `/generate`, `/regenerate`, `/applications` (form intake).
- **Leads** — `lib/leads.ts`, `lib/forms.ts`: writes a lead row first, then external sync (Brilliant Directories + Brand Voice Interview). Retry + alert webhooks. Postgres tables.
- **Tailwind v4**, design tokens in `app/globals.css`, per-variant `accent` theme.

### B. `agilityengineers/Content-Authority` ("The Authority Desk")
Vite + React 18 + **Express 5** + node-postgres generator. Take these patterns specifically:
- **Multi-provider AI** — `server/ai.ts` exposes **Anthropic + OpenAI**, validates output against `contentSchema`, and `availableProviders()` reports which keys are set. **This is the "admin chooses Claude or OpenAI" requirement.**
- **Per-variant rows in Postgres** (`variants` table): `slug` PK (`""` = default), `label`, `audience`, `accent`, toggle columns, `booking_url`, `content` (jsonb — a **full** content object), `meta` (jsonb), `published`, timestamps. Seeds from bundled defaults `ON CONFLICT DO NOTHING`.
- **Per-request SEO/social meta injection** into the HTML so shared links + crawlers get per-variant titles/descriptions.
- **`{audience}` interpolation** — store tokens, interpolate at render. Mirrors how each generated page is "targeted."
- **Instant paint + fallback** — paint from bundled default, fetch the DB variant, re-render; on fetch failure keep the bundled default.
- **Recursive field editor** (`components/admin/fields.tsx`) — renders an input for every leaf of the content object so the admin can edit **all** copy without a hand-written form per field. **Reuse this idea** for the large Agility content objects.
- **Tri-state toggles** (`true` / `false` / `null`=inherit base).

### Which stack for the new generator?
Both repos are valid precedents. **Recommendation: follow the `fabp-landing-pages` Next.js App Router pattern** as the base (it has the stronger SEO story — static per-slug rendering + `sitemap.ts` + per-route metadata), and **port the multi-provider `server/ai.ts` pattern** from Content-Authority into it (Claude **or** OpenAI selectable per generation). **The client explicitly deferred the final stack/routing decision to you** ("choose what's best for SEO… let Claude Code decide based on how it understands the project, and ask me questions as you go"). Confirm the routing model (static export vs. dynamic route vs. hybrid) with the client before building.

---

## 2. About the design files / Fidelity

- **Fidelity: High.** Final brand colors, type, spacing, motion, and copy. Recreate pixel-faithfully using the target codebase's component system (the prototypes use inline styles + two vanilla-JS engine files purely because the design tool streams HTML — **do not** carry that structure over; map it to React components + the Zod config).
- `templates/client-target-page.dc.html` — **Client Target** page (audience: CEOs, owners, operators; conversion: *book a meeting with a client advisor*).
- `templates/talent-page.dc.html` — **Talent / Directory** page (audience: developers, architects, PMs, scrum masters, program/product managers; conversion: *join the Agility Engineers directory*).
- `templates/ae-admin.js` / `templates/ae-talent.js` — the prototype "admin + qualifier" engines. **These encode the per-variant config contract and the qualifier scoring/routing logic.** Read them as the behavioral spec, not as code to keep. They are namespaced so the two pages never collide (separate `localStorage` keys) — in production that namespacing becomes **two template types sharing one schema**, with per-variant rows.
- `.dc.html` files load a runtime called `support.js` (the design tool's renderer). **Ignore it** — it is not part of the deliverable. The real content lives in the markup + the two engine files.

---

## 3. The two templates — section by section

Both pages share the **same section system, brand, motion, and admin model**; only audience + copy + conversion differ. Sections, in order:

| # | Section | Client copy intent | Talent copy intent |
|---|---------|--------------------|--------------------|
| 1 | **Hero** | "Get found by the teams building what's next." headline + subhead + single CTA + media (image or autoplay-muted background video) + floating badge + footnote | Talent headline + directory CTA |
| 2 | **Problem** | 3 pain cards (StoryBrand "villains") | 3 talent pain cards (lost in the noise / feast or famine / mismatched roles) |
| 3 | **Guide** | Authority + empathy; right panel = **2 stat cards + credentials row** OR **a single image** (admin toggle) | Same structure, talent copy |
| 4 | **Plan** | 3-stage approach (Proof of Concept → Team positioning → Production support), numbered badges w/ staggered pulse | "How it works" (Create profile → Get matched → Do great work) |
| 5 | **Proof** | Quote + **2 metric tiles + case-study card** OR **a single image on either side** (admin toggle + side select) | Member quote / placement metrics, same toggle |
| 6 | **Objections (FAQ)** | 4 `<details>` accordion items | 4 talent FAQs |
| 7 | **Final CTA** | Value recap + booking card (single conversion action) | Directory signup card |
| 8 | **Footer** | Logo (admin-controlled treatment), tagline, CTA, phone (admin-editable tracking number), legal row with auto-updating year | Same |

**Spec/Build header** (dark band at top of each prototype) is a **design-time reference only** — it is `data-ae-section="spec"` and must **not** ship on the public page (it's the panel that lists tokens / CTA variants / section map for the designer).

### Single-conversion rule (critical)
Each page has **exactly one** conversion action repeated across every CTA (`href="#book"` in the prototype). No competing CTAs. Header nav links (About Us, Directory) are **navigation**, not conversions. In production every CTA triggers the **qualifier → booking/signup** flow (see §5).

### Motion (recreate, respect `prefers-reduced-motion`)
Aurora gradient drift on hero/CTA; dashes flowing along SVG "network" lines; twinkling nodes; scroll-reveal (fade+rise, staggered) via scroll-driven animations with a visible fallback; hover-lift on cards; CTA sheen sweep + arrow nudge; staggered pulse rings on the plan's numbered badges; gentle bob on the hero CTA arrow; floating badge on hero media.

---

## 4. Per-variant config = source of truth

Everything below must be a **validated config object** (Zod) persisted per variant (Postgres jsonb, mirroring both repos). The prototype's gear panel **"Export config (JSON)"** button emits a representative shape — use it as the starting contract. Fields:

### 4.1 Envelope / targeting
- `templateType`: `"client"` | `"talent"`
- `slug`, `label`, `published`, timestamps
- **Client targeting:** `industry`, `title` (job title/role of the target reader), `company` / `accountName` (optional, for 1:1 ABM pages), `painPoints[]` (optional seed hints)
- **Talent targeting:** `role` (developer / architect / PM / scrum master / program manager / product manager / other), `discipline` (backend / frontend / full-stack / data-ML / delivery-leadership), `seniority`, `location` (optional)
- `audience` token string used for `{audience}`-style interpolation across copy (Content-Authority pattern)

### 4.2 Sections toggle map
`sections: { hero, problem, guide, plan, proof, objections, cta, footer }` → each `true` / `false` (fabp pattern). Hiding a section must **auto-insert a separator** when two same-background sections become adjacent (the prototype computes this from each section's top/bottom edge color — port the logic in `ae-admin.js` → `sepSweep()`).

### 4.3 Copy (every section)
Hero (eyebrow, headline, subhead, CTA label, footnote), Problem (heading, subhead, 3× {icon,title,body}), Guide (eyebrow, heading, 2 paragraphs, 3 chips, stat1/stat2 {num,label}, credentials line), Plan (eyebrow, heading, subhead, 3× {step#, kicker, title, body}, CTA label), Proof (eyebrow, heading, quote, attribution {name,title,company}, 2 metrics, case-study line), Objections (heading + 4× {q,a}), Final CTA (heading, body, 3 bullets, card heading, card subhead, CTA label), Footer (tagline, phone, legal links).

### 4.4 Media
- `hero.media`: `{ type: "image"|"youtube"|"vimeo", imageUrl, videoUrl }`. Video renders as **autoplay, muted, looping, controls-off background** (parse YouTube/Vimeo IDs from any common URL form; see `vidSrc()` in the engines).
- `guide.panel`: `{ mode: "stats"|"image", imageUrl }`.
- `proof.panel`: `{ mode: "metrics"|"image", imageUrl, side: "left"|"right" }`.
- Footer logo treatment: `"chip"|"white"|"hide"`.
- **Image source = URL today** (matches hero pattern). The admin asked about **AI image generation / selection** — wire `hero/guide/proof` image fields to either a URL, an uploaded asset (S3 — `@aws-sdk/client-s3` is already a fabp dependency), or an AI-generated image. Provider/flow is your call; confirm with client.

### 4.5 Header links (fully admin-managed)
`headerLinks: [{ label, url }]` — add/edit/remove any number; empty list hides the nav. Defaults: **About Us → https://agilityengineers.com/**, **Directory → https://www.agility-engineers.com/**. Logo links to the main site by default.

### 4.6 Scheduler / booking (modular — critical)
`booking: { provider: "calendly"|"smartscheduler"|"custom", mode: "link"|"embed", url, embedCode }`
- **`link`** → CTA opens the scheduler URL.
- **`embed`** → build a **dedicated in-app booking page/route** that renders the pasted embed (re-execute embed `<script>`s) so all CTAs land there.
- **Calendly is the current default.** **SmartScheduler.ai** (https://smart-scheduler.ai/, the client's own Calendly alternative) must be a first-class selectable provider. Keep it modular so a future **Calendly API / SmartScheduler API** integration can drop in without reworking the flow. Per-variant `booking_url` mirrors Content-Authority.

### 4.7 SEO / social meta (per variant)
`meta: { title, description, ogTitle, ogDescription, ogImage, canonical }` injected per route (Next metadata API) / per request (Content-Authority pattern). Include in `sitemap` only when `published`.

### 4.8 Qualifier (questions + scoring weights — see §5)
`qualifier: { questions: [...], settings: {...} }` — fully admin-editable (the prototype ships a JSON editor; production should offer the recursive field editor and/or a structured editor).

---

## 5. The lead qualifier → booking/signup flow

Every CTA opens an interactive **multi-step qualifier** (modal overlay in the prototype). Logic lives in `ae-admin.js` (client) / `ae-talent.js` (talent) — read `renderQuestion`, `renderLead`, `compute`, `renderResult`, `renderBooking`, `renderResource`, `openScheduler`.

### Flow
1. **N questions** (each option carries a point weight; options may carry a `kill` flag or a `flag`).
2. **Lead capture** (name, work email, company, phone) — **after** the questions.
3. **Compute**: sum points → **Fit Score (0–100)**; apply **kill-switches**; assign tier.
4. **Route**:
   - **Client:** Elite (≥80) → booking; Moderate (50–79) → booking w/ "paid discovery" framing; Low (<50) or any kill-switch (when enabled) → **resource/referral page** (modular, can be off).
   - **Talent:** kill-switches & resource page **default off** (inclusive intake); everyone routes to "complete your directory profile" → directory URL.
5. **Lead persisted** with answers + score + tier (prototype uses `localStorage`; **production → DB + Zapier**, see §6). Score is **admin-visible**; **showing the score to the prospect is an admin toggle**, and when shown it's framed to drive booking an advisor.

### Admin-configurable qualifier settings (per variant)
- Scheduler provider/mode/url/embed (§4.6)
- **Kill-switches on/off** + **timing** (`immediate` bounce vs. `end` route) — the client wants these toggleable per campaign
- **Show Fit Score to prospect** on/off
- **Resource page** on/off
- **Edit questionnaire** — questions, options, point weights, kill/flag markers

### Default questionnaires (starting content — fully editable)
- **Client** (`ae-admin.js` `DEFAULTQUIZ`): industry, system stage, internal product owner, budget, team structure, compliance — with kill-switches on industry/budget/"body-rental" and a discovery flag. *(These are the client's real qualifying criteria from the conversation; preserve them as defaults.)*
- **Talent** (`ae-talent.js` `DEFAULTQUIZ`): role, years of experience, strongest-work focus, availability, work-model preference, agile-team experience — all positive weights, no kill-switches by default. *(Placeholder weights — the client will supply final talent questions; keep them admin-editable.)*

---

## 6. Leads, persistence & Zapier

- Prototype persists config + leads in `localStorage` (keys `aeAdminConfig_v1`, `aeQuizSettings_v1`, `aeQuizConfig_v1`, `aeLeads_v1`; talent uses `aeTalent*`). **Production replaces all of this with the DB + admin dashboard pattern from the two repos** (per-variant rows; leads tables like fabp's `invitation_leads` / `playbook_leads`).
- **Lead destination = Zapier-first.** The client wants a **Zapier hook** so leads fan out to other apps. Implement a generic outbound webhook (Zapier catch hook URL in env/config) that fires on lead capture with the full payload (lead + answers + score + tier + variant slug + targeting). Keep it modular so the existing BVI / Brilliant Directories syncs in fabp can coexist or be swapped per client direction.
- Persist every generation's **provider** (claude/openai), **model**, and **targeting inputs** alongside the variant for auditability.

---

## 7. AI generation

- **Admin picks the provider per generation: Claude or OpenAI** (port `server/ai.ts` + `availableProviders()` from Content-Authority; each key independently enables its provider). Models env-overridable.
- **Input:** the targeting envelope (§4.1). The AI should **use what it knows about the industry/title (client) or role/discipline (talent) to pre-fill** the entire content object — headlines, problem villains, guide copy, plan, proof framing, FAQ, CTAs, **and SEO meta** — then the admin reviews/edits before publish.
- **Output:** a full config object **validated against the Zod schema** (strip code fences, parse, retry once on failure with the error appended — fabp pattern). Provide a **per-section regenerate** too.
- **Brand voice:** encode Agility Engineers' voice in the system prompt — professional, confident, **no jargon, no buzzwords, no fluff, no AI-tells**, StoryBrand structure (reader = hero, Agility = guide, 3-stage approach = the plan, one CTA with stakes). Do **not** invent stats, client names, or proof points — leave `[needs your data]` placeholders for the admin (the prototype marks these explicitly).

---

## 8. SEO guidance (client priority)

The client repeatedly chose "whatever is best for SEO" and deferred specifics to you. Recommendation:
- **Static per-slug rendering** (`generateStaticParams`) + **per-route metadata** + **`sitemap.ts` (published only)** + **robots** — the fabp pattern. This beats a purely client-rendered SPA for crawlers.
- Per-variant **canonical**, **OG/Twitter** tags, semantic headings (one `<h1>` per page = the hero headline), descriptive `alt` on all images, fast LCP (the hero media should be `priority`/preloaded; defer the background video).
- If a fully dynamic route is needed for scale, use **ISR / on-demand revalidation** so pages stay static-fast while editable. **Confirm static-export vs. dynamic-route vs. hybrid with the client before building** — they explicitly want you to weigh in and may answer questions mid-build.

---

## 9. Design tokens

```
Colors
--teal        #0F88A2   (primary accent, eyebrows, links)
--teal-300    #1AA0BC
--teal-bright #5FD0E6 / #5FE0A0  (on-dark accents / success dot)
--navy        #08527F   (headings, primary brand)
--navy-700    #063A5A   (dark sections, hero gradient start)
--navy-900    #04293F   (footer)
--cta         #2E8B57   (the single conversion green — buttons only)
--ink         #0B2A38   (body text on light)
--muted       #46565E / #5A6B73   (secondary text)
--bg-alt      #F2F5F7   (light section background)
--line        #E2E8EB   (hairlines, card borders)
Problem-card accents: #FDECEC/#C0392B, #FDF3E2/#B9770C, #EAF1F8/#08527F

Typography
Display / headings: "Archivo", 700–900   (H1 clamp 34→58px, H2 clamp 26→40px)
Body / UI:          "IBM Plex Sans", 400–600   (17–19px body, line-height ~1.6)
Mono (spec only):   ui-monospace

Radii:  cards 14–20px · pills 100px · buttons 8–11px
Shadow: cards 0 10px 30px rgba(8,82,127,.06); CTA 0 12px 28px rgba(46,139,87,.3); float 0 18–40px rgba(0,0,0,.25)
Section padding: clamp(28px,3.5vw,50px) vertical · clamp(16px,4vw,56px) horizontal
Min tap target: 44px
Breakpoints (match fabp/Tailwind): sm640 md768 lg1024 xl1280
```
Logo links to the main site. Footer legal row: `© <auto year> | Agility Engineers, LLC — Directory | All Rights Reserved | Terms of Use | Privacy Policy`, with **Terms → https://www.agility-engineers.com/about/terms** and **Privacy → https://www.agility-engineers.com/about/privacy**, and the year rendered with `new Date().getFullYear()` (never hardcoded).

## 10. Assets
- `templates/assets/agility-logo.png` — wordmark (teal #0F88A2 + navy #08527F). Use the official brand asset in production.
- `templates/assets/hero-placeholder.png` — generated on-brand placeholder; replace with real photography/video or AI-generated imagery per variant.
- Fonts: Archivo + IBM Plex Sans (Google Fonts). The repos use different display/body fonts — **keep Agility's Archivo/IBM Plex Sans** for these templates unless the client unifies them.

## 11. Files in this bundle
```
README.md                              ← this file (self-sufficient spec)
templates/client-target-page.dc.html   ← Client Target template (hi-fi prototype)
templates/talent-page.dc.html          ← Talent/Directory template (hi-fi prototype)
templates/ae-admin.js                  ← Client engine: admin config + qualifier + scoring/routing (behavioral spec)
templates/ae-talent.js                 ← Talent engine: same, namespaced + talent defaults
templates/assets/agility-logo.png
templates/assets/hero-placeholder.png
```

## 12. Open items to confirm with the client
1. Final routing/SEO model (static export vs. dynamic route vs. hybrid/ISR).
2. Final **talent** qualifier questions + weights (placeholders shipped).
3. Real proof points, stats, case studies, client/member names (all `[needs your data]` today — do not invent).
4. Image strategy per section: URL vs. uploaded asset (S3) vs. AI-generated.
5. Zapier payload shape + which downstream apps; whether to keep the existing BVI / Brilliant Directories syncs.
6. Whether the two templates live in the fabp repo, the Content-Authority repo, or a new repo that borrows both patterns.
```
