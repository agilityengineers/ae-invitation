# Agility Engineers — Front Page (Router) Concept

A new **entry-point page** that sits ahead of the existing structure and does exactly one
job: route any visitor to the correct side of the business in one click — **client** or
**project team / developer** — plus one standalone client CTA for people who are ready to
act and want to skip the choice.

This is a routing page, not a marketing page. Everything below is scoped to that.

> **Source of truth for brand:** tokens, fonts, and component treatments are extracted
> verbatim from this app (`src/index.css`, `src/components/landing/*`, `index.html`). The
> live marketing site (`www.agility-engineers.com`) blocks automated fetch (HTTP 403), so
> the in-repo design system — which already renders the client and talent landing pages —
> is the authoritative reference. Any assumption is flagged in **§7**.

---

## 1. Brand Tokens (handoff-ready)

Pulled directly from `src/index.css` `@theme` and the landing components. These are already
available as Tailwind utilities (`text-navy`, `bg-cta`, `font-display`, etc.) — **reuse them,
do not introduce new values.**

### Color

| Token | Hex | Role |
|---|---|---|
| `--color-navy-700` | `#063A5A` | Hero gradient start |
| `--color-navy` | `#08527F` | Hero gradient mid, headings on light |
| `--color-navy-900` | `#04293F` | Footer background, darkest surface |
| `--color-teal` | `#0F88A2` | Primary accent, eyebrow text, nav hover, links |
| `--color-teal-300` | `#1AA0BC` | Accent hover/step |
| `--color-teal-bright` | `#5FD0E6` | Network backdrop highlights |
| `--color-success` | `#5FE0A0` | Eyebrow status dot, "live" accents |
| `--color-cta` | `#2E8B57` | **Green — the single conversion button color** |
| `--color-ink` | `#0B2A38` | Body text |
| `--color-muted` | `#46565E` | Secondary text |
| `--color-muted-2` | `#5A6B73` | Tertiary / captions |
| `--color-bg-alt` | `#F2F5F7` | Light section background |
| `--color-line` | `#E2E8EB` | Borders, dividers |
| Base background | `#FFFFFF` | Page background |

**Hero gradient (verbatim):** `linear-gradient(160deg,#063A5A 0%,#08527F 55%,#0F88A2 130%)`
— apply the `.ae-aurora` class for the site's animated 16s aurora drift.

**Footer text colors:** body `#9FC3D4`, links `#BCD9E4`, legal row `#7FA6B8`.

### Typography

| | Family | Weights | Use |
|---|---|---|---|
| Display | `Archivo, system-ui, sans-serif` | 500–900 | All headings, nav links, buttons, eyebrows |
| Body | `"IBM Plex Sans", system-ui, sans-serif` | 400–700 | Paragraphs, sub-copy |

Loaded via Google Fonts in `index.html` (already present — no change needed).
Headline scale on hero: `clamp(34px, 4.6vw, 58px)`, weight 800, `line-height 1.04`,
`letter-spacing -.02em`. Eyebrow: 12.5px, 600, uppercase-ish tracking `.04em`.

### Spacing / Radius / Shape

| Token | Value | Use |
|---|---|---|
| `--radius-card` | `16px` | Path cards, media panels |
| `--radius-btn` | `10px` | Buttons |
| `--radius-pill` | `100px` | Eyebrow chips, badges |
| Content max-width | `1180px` | Matches `Nav` / `Hero` / `Footer` |
| Section padding X | `clamp(16px, 4vw, 56px)` | Horizontal gutters, site-wide |
| Section padding Y | `clamp(40px, 5vw, 72px)` | Vertical rhythm |

### Button (the one conversion treatment — reuse exactly)

```
background: #2E8B57;
color: #fff;
font: 700 16px/1 var(--font-display);
padding: 18px 28px;         /* hero size; nav size is 11px 18px @ 14px */
border-radius: 10px;
box-shadow: 0 12px 28px rgba(46,139,87,.4);
```

Wrap in the existing `.ae-cta` class for the hover sheen + lift + arrow nudge. Append a
trailing `→` (the site's convention). **Green = action. Never use green for the two routing
paths** (see §3 rationale).

### Motion / component classes to reuse

- `.ae-aurora` — animated hero gradient
- `.ae-lift` — card hover (translateY -8px + shadow + teal border) — **use on path cards**
- `.ae-cta` / `.ae-arrow` / `.ae-bob` — button sheen, arrow slide, arrow bob
- `.ae-nav` — header link with teal underline-on-hover
- `<NetworkBackdrop />` (`src/components/landing/NetworkBackdrop.tsx`) — the animated node
  network behind the hero; reuse for instant visual continuity
- All motion already respects `prefers-reduced-motion` — inherit it, add nothing.

### Assets

- Logo: `/assets/agility-logo.png` (28px tall), via `<Logo treatment="chip" />` on white,
  `treatment="white"` on the navy hero. Links to `https://agilityengineers.com/`.
- Phone (footer): `(404) 476-7800`
- Terms: `https://www.agility-engineers.com/about/terms`
- Privacy: `https://www.agility-engineers.com/about/privacy`

---

## 2. Recommended labels (edge-case call)

The task's working names are "potential client" and "project team / developer." The site's
own IA already names these audiences — I recommend **adopting the site's vocabulary** so the
front page and its destinations feel like one system:

| Task framing | Recommended front-page label | Why |
|---|---|---|
| Potential client | **"I'm exploring a partner to build software"** → routes to the **Client** side | The app's client variant targets "CEOs, owners & operators." A leader self-identifies by *intent* ("I want something built/supported"), not by the word "client." Avoids making them decode a label. |
| Project team / developer | **"I'm a developer or on a delivery team"** → routes to the **Directory** | "Directory" is the site's established term (it's in the nav and footer of every landing page). Developers, architects, PMs, scrum masters, and delivery leads all live here. "Project team" alone is ambiguous to an outside developer; "Directory" + role list is unambiguous. |

**Card headers stay human, not internal jargon:** the visitor sees "For business leaders" /
"For developers & delivery teams," never "Client Target" / "Talent Variant."

---

## 3. Page structure at a glance

```
┌─────────────────────────────────────────────────────────┐
│  HEADER  (reused Nav: logo chip · minimal links · —)     │  ← no conversion CTA in nav here
├─────────────────────────────────────────────────────────┤
│                                                         │
│   HERO (navy aurora + NetworkBackdrop)                  │
│   eyebrow · headline · one-line subhead                 │  ← who AE is, above the fold
│                                                         │
│   ┌───────── TWO PATH CARDS (side by side) ─────────┐   │
│   │  Business leaders     │   Developers / teams    │   │  ← the one job
│   │  self-ID line         │   self-ID line          │   │
│   │  [ Explore services → ]│  [ Go to the directory →]│   │
│   └───────────────────────┴─────────────────────────┘   │
│                                                         │
│   — Ready to talk? [ Book a meeting → ]  (standalone)   │  ← bypass for ready clients
│                                                         │
├─────────────────────────────────────────────────────────┤
│  TRUST STRIP  (one line: "Moving real ideas to          │  ← minimal orientation only
│  production." + credential row placeholder)             │
├─────────────────────────────────────────────────────────┤
│  FOOTER  (reused Footer: navy-900, tagline, legal)      │
└─────────────────────────────────────────────────────────┘
```

Everything above sits **above the fold on desktop**; on mobile the two cards stack and the
standalone CTA follows (see §6).

---

## 4. Section-by-section spec + copy

### 4.1 Header

- **Reuse `src/components/landing/Nav.tsx`**, with one change: the front page has **no
  competing conversion CTA in the nav.** The routing choice *is* the page; a "Book a meeting"
  button in the header would pre-empt it. Render the logo (`treatment="chip"`) + optional
  minimal links (`About Us` → `agilityengineers.com`, `Directory` → the directory) and drop
  the nav's green CTA on this page only.
- White bar, `1px solid var(--color-line)` bottom border — identical to every landing page.
- **Rationale:** the header is the seam between this page and the rest of the site. Keeping it
  byte-for-byte identical is what makes the front page feel native rather than like a splash
  screen. Removing only the nav CTA keeps the page honest to its single job.

### 4.2 Hero — who AE is + the choice (above the fold)

**Visual:** navy aurora band — `background: linear-gradient(160deg,#063A5A,#08527F 55%,#0F88A2 130%)`
with `.ae-aurora` and `<NetworkBackdrop />` behind, exactly like the landing hero. White text.
Content max-width `1180px`, centered. This band holds the eyebrow, headline, subhead, **and**
the two path cards — so the choice is unmistakably above the fold.

**Copy:**

- **Eyebrow** (pill, success-dot): `Agility Engineers`
- **Headline** (Archivo 800, clamp 34–58px):
  > **Moving real ideas to production.**
- **Subhead** (IBM Plex, ~19px, `#D7ECF3`, max-width 620px):
  > We help companies design, build, and support software — and we build the teams that do it.
  > Tell us which one you are, and we'll point you the right way.

**Rationale:** The headline is the company's actual line ("Moving real ideas to production" is
the site's own tagline from `index.html` and the footer). It establishes *who AE is* in four
words so a first-time visitor is oriented before they choose. The subhead names both audiences
in plain language ("build software" / "build the teams") and states the page's promise —
low-commitment, one decision. No stats, no service list; those live on the destinations.

### 4.3 The two path cards (the one job)

Two equal cards, side by side, sitting in the lower half of the hero band on a subtle
translucent surface so they read as *the* interactive element. Each card is a large click
target (entire card is a link, not just the button).

**Card treatment:** `background: #fff` (or `rgba(255,255,255,.06)` glass on the navy — pick
white for maximum contrast and legibility), `border-radius: var(--radius-card)` (16px),
`border: 1px solid var(--color-line)`, `padding: clamp(24px,3vw,36px)`, class `.ae-lift` for
the site's hover (lift + teal border + shadow). Icon top-left (use `lucide-react`, already a
dependency).

| | **Card A — Business leaders** | **Card B — Developers & teams** |
|---|---|---|
| Icon | `Rocket` / `Lightbulb` | `Users` / `Code` |
| Eyebrow | `FOR CEOS, OWNERS & OPERATORS` | `FOR DEVELOPERS, ARCHITECTS & DELIVERY TEAMS` |
| Heading | **I have something to build or support** | **I'm a developer or on a delivery team** |
| Self-ID line | "You're evaluating a partner to take an idea from proof of concept to live, supported software." | "You're joining a project, need team resources, or want to get found for the next one." |
| Action (outline btn) | `Explore what we build →` | `Go to the directory →` |
| Links to | `/client` (admin's default client page) | `/talent` (admin's default talent page) |

**Button treatment for the two paths:** **outline/secondary, not green.** Use
`border: 1.5px solid var(--color-navy)` with navy text (Card A) and teal (Card B), filling on
hover. **Rationale:** the routing choices must read as *navigation*, and the single green
`#2E8B57` button must remain the unambiguous "commit now" signal (§4.4). Two green buttons +
a green CTA = three competing greens and no hierarchy. Differentiating the paths by icon,
eyebrow color, and copy — while reserving green for the standalone action — keeps one clear
visual hierarchy.

**Self-identification, not thinking:** each card leads with a first-person "I…" heading and a
single behavioral line. A CEO reads "take an idea… to live, supported software" and knows.
A developer reads "get found for the next one" and knows. Neither has to interpret an internal
label.

### 4.4 Standalone client CTA (the bypass)

Directly beneath the two cards, centered, with a thin divider or "Already know you're ready?"
lead-in:

- **Lead-in** (small, `#D7ECF3`): `Already know you want to talk?`
- **Button** (the one green treatment, `.ae-cta`, arrow):
  > **Book a meeting with a client advisor →**
- **Micro-footnote** (12px, muted): `30 minutes · No pitch · Walk away with a plan`
  *(verbatim from the client variant hero — keeps the promise consistent with the destination.)*

**Placement rationale:** It's *below* the fork, not competing with it, so first-timers make
the routing choice while ready-to-act clients skip straight to conversion. It gets the only
green button on the page, so it's visually the "hottest" action without a second green
fighting it. The footnote is lifted verbatim from the client landing so the promise the
visitor reads here is the promise they meet on arrival — no bait-and-switch. This is the
"button that points to a client" from the brief, given its own prominence and the site's
strongest CTA styling.

**Destination:** `/client` — the same generic client page as Card A, just given the one green
(hottest) treatment so a ready client can skip the fork in one click. The client side
intentionally has two entries (card + standalone CTA); that is emphasis, not an error.

### 4.5 Trust strip (minimal orientation — optional)

One quiet light band (`bg-alt #F2F5F7`) under the hero:

- Centered line (Archivo 600, navy): **From project to product. Moving real ideas to production.**
- Optional single row of credential/partner logos — **placeholder only**, wired to the same
  `[needs your data]` slot the landing pages use. Do **not** invent logos, stats, or names.

**Rationale:** A first-time visitor who's never heard of AE needs one beat of "these are real
engineers" before committing to a path — but no more than one. This is the ceiling on
supporting content; anything heavier turns the router into a marketing page and violates the
one-job constraint. If no credential assets are ready, ship the tagline line alone or omit the
strip entirely.

### 4.6 Footer

- A **lightweight `FrontFooter`** that mirrors `Footer.tsx`'s navy-900 band, `Logo`, tagline
  ("From project to product. Moving real ideas to production."), auto-year legal row, and Terms +
  Privacy links — but **without** the variant-bound qualifier `CtaButton` (the front page has no
  variant/qualifier). Visually identical band; no competing conversion action.

---

## 5. Interaction & routing behavior

- **Whole card is the link.** The inner button is a visual affordance; the entire card is
  clickable (larger target, better mobile).
- **No modal, no qualifier on this page.** Unlike the landing pages (where every CTA opens the
  qualifier), the front page's job is to *hand off*. Path clicks are plain navigations to the
  destination; the qualifier lives on the destination as it does today.
- **The standalone green CTA** navigates to `/client` (a base-aware wouter `<Link>`), same as
  Card A.
- Focus order: skip-link → header → Card A → Card B → standalone CTA → footer. Both cards are
  reachable and operable by keyboard; `.ae-lift` hover has a matching `:focus-visible` state.

---

## 6. Responsive

- **≥ 760px:** two cards side by side (`grid-template-columns: repeat(2,1fr)`), standalone CTA
  centered below, all above the fold.
- **< 760px:** cards **stack vertically**, full-width, Card A (client) first — the higher
  commercial-intent path leads on small screens. Standalone CTA follows the stack. Hero type
  scales via the existing `clamp()` values. This mirrors the site's own `auto-fit,minmax(300px,1fr)`
  behavior, so no new breakpoint logic is needed.
- Header collapses its links under 720px exactly as `.ae-navlinks` already does.

**Edge-case note:** I kept the "two cards" pattern rather than a segmented toggle or dropdown.
For a two-audience fork with a bypass, side-by-side (desktop) / stacked (mobile) cards give the
biggest, clearest targets with zero interaction cost — no state, no reveal, no decoding. A
toggle would hide one option behind an interaction; a dropdown buries both. Cards win for a
pure router.

---

## 7. Resolved decisions (as built)

Every open question from the first draft is now settled and implemented:

1. **Front page location.** `/` is the public front page (`FrontPage.tsx`), replacing the old
   internal generator index (`src/pages/home.tsx`, deleted). The admin CMS is reached by typing
   `/admin` — **no visible admin link** on the public page.
2. **Client path destination.** Both the client card and the standalone green CTA → **`/client`**.
3. **Developer/team path destination.** The developer/team card → **`/talent`**.
4. **`/client` and `/talent` serve the admin-designated default.** Each renders whichever variant
   the admin has marked **default** for that template type (see §7a), falling back to the bundled
   generic template so the route never 404s.
5. **Audience #2 scope.** Internal team members and external developers share the one Directory
   destination (`/talent`) for now. If they later need to diverge, `/talent` is the place that
   default page can itself fork — the front page doesn't change.
6. **Trust strip.** Omitted to hold the one-job ceiling; the site tagline lives in the footer. No
   invented logos/stats. (The optional strip in §4.5 remains a drop-in if real credentials arrive.)
7. **Footer.** The front page uses a lightweight footer with **no** qualifier CTA (§4.6).

### 7a. New capability: "default page per template type"

`/client` and `/talent` don't hard-code content — they serve an admin-chosen page. This required a
small, `published`-mirroring addition across the stack:

- **Schema**: `isDefault: boolean` added to `variantSchema` (both the frontend and api-server
  copies of `src/config/schema.ts`).
- **DB**: `is_default` column on `variants` + a partial unique index
  (`... (template_type) WHERE is_default`) enforcing **at most one default per type** (bootstrap +
  `db/schema.sql`).
- **Backend** (`api-server/src/lib/config.ts`): `getDefaultVariant(type)` and a transactional
  `setAsDefault(slug)` (clears the old default of that type, sets the new one). `saveVariant`
  persists the column.
- **API**: `POST /api/variants { action: "markDefault" }` (admin) and
  `GET /api/public/defaults/:type` (public; returns the default or the bundled fallback, always 200).
- **Admin UI** (`VariantsTable`): a **"Default"** badge and a **"Set as default"** row action.

**Rule to remember:** `isDefault` is **independent of `published`** — a page marked default is
served at `/client`//talent` even if unpublished; publishing still only governs the page's own
`/:slug` and the published list. This is intentional (marking default is the explicit act of
choosing the public generic page), not a bug.

---

## 8. Implementation summary (as built)

- **Front page**: `src/components/frontpage/FrontPage.tsx` — `FrontHeader` (logo only), hero
  (navy aurora + `NetworkBackdrop`), two `PathCard`s (client first), standalone green CTA,
  `FrontFooter`. Reuses `Logo`, `NetworkBackdrop`, and the `.ae-*` classes; does **not** import
  `Nav`/`Footer`/`CtaButton`/`QualifierRoot` (all variant/qualifier-bound). All internal links are
  base-aware wouter `<Link>`s.
- **Routes**: `src/pages/client.tsx` + `src/pages/talent.tsx` fetch `/api/public/defaults/:type`
  and render `<LandingPage>`, with the bundled default as a hard fallback. Registered in `App.tsx`
  before the `/:slug` catch-all.
- **Buttons**: two path affordances are **outline** (navy / teal); the one standalone CTA is the
  green `.ae-cta` treatment. No new colors, fonts, or radii — all from `@theme` in `src/index.css`.
  A `.ae-lift:focus-visible` rule was added for keyboard parity on the cards.
- **DOM stays light**: hero, two cards, one CTA, tagline footer — nothing beyond the one-job ceiling.
