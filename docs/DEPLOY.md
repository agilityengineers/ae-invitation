# Running & deploying the AE landing-page generator

A Next.js 15 (App Router) app: per-variant StoryBrand landing pages (Client Target +
Talent/Directory), AI generation (Claude **or** OpenAI), a lead qualifier, Postgres for
configs + leads, and an outbound Zapier webhook. Configs are stored as Postgres `jsonb`
(single source of truth); pages render statically with on-demand ISR (publish without redeploy).

## Prerequisites
- Node 20+, a Postgres database, and (for AI) an Anthropic and/or OpenAI key.
- For image upload / AI image storage: an S3 bucket + credentials.

## Environment
Copy `.env.example` → `.env.local` (dev) or set these in your host:

| Var | Purpose |
|---|---|
| `DATABASE_URL` | Postgres (configs + leads). **Required.** |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for sitemap / canonical / OG. |
| `ADMIN_PASSWORD` | Admin login. `ADMIN_SESSION_SECRET` (≥16 chars) optional but recommended. |
| `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` | Enable Claude / OpenAI. Each independently appears in the provider picker. |
| `ANTHROPIC_MODEL` / `OPENAI_MODEL` / `OPENAI_IMAGE_MODEL` | Optional model overrides. |
| `AWS_REGION`, `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | Image upload + AI image storage. `AWS_S3_PUBLIC_BASE_URL` optional (else presigned URLs). |
| `ZAPIER_WEBHOOK_URL` | Outbound lead webhook (fires on every capture). |
| `ALLOWED_ORIGINS` | Extra origins allowed past the CSRF same-origin check (comma-separated). |

The DB schema (`db/schema.sql`) and the seed variants are applied automatically on first
DB use (lazy bootstrap). To initialize explicitly: `npm run db:init`.

## Develop
```bash
npm install
npm run dev          # http://localhost:3000  (admin at /admin)
```

## Verify
```bash
npm run validate:schema   # defaults parse against the Zod schema
npm run typecheck
npm run lint
npm test                  # Vitest: schema, scoring/routing, separators, zapier, ai parsing, video
npm run build
```

## Deploy
Host-agnostic standalone server (`output: "standalone"`) — runs on Replit Reserved VM,
Render, Fly, a VM, or Vercel.

**Docker:**
```bash
docker build -t ae-invitation .
docker run -p 3000:3000 --env-file .env.local ae-invitation
```

**Node:**
```bash
npm run build
node .next/standalone/server.js   # ensure db/schema.sql + public/ + .next/static are alongside
```

On-demand ISR: publishing/editing a variant calls `revalidatePath`, so changes go live
without a redeploy. New slugs render on first request and are cached thereafter.

## Replit (dev + production)
The repo ships a `.replit` (Node 20 + Postgres 16 modules, port 3000→80, deployment build/run).

1. **Import** the GitHub repo into Replit.
2. **Database:** add Replit's built-in PostgreSQL (Tools → PostgreSQL). It injects `DATABASE_URL`
   automatically; the app auto-negotiates TLS for it (managed hosts get SSL, localhost doesn't —
   override with `DATABASE_SSL=true|false` if ever needed).
3. **Secrets:** set `ADMIN_PASSWORD`, `NEXT_PUBLIC_SITE_URL`, and any of `ANTHROPIC_API_KEY` /
   `OPENAI_API_KEY`, the `AWS_*` S3 vars, and `ZAPIER_WEBHOOK_URL` in the Secrets pane.
4. **Dev:** press **Run** (`npm run dev`); the schema + demo variants self-seed on first request.
5. **Deploy:** use a **Reserved VM** deployment (build `npm ci && npm run build`, run `npm run start`).
   Reserved VM is the right target because the app uses on-demand ISR (`revalidatePath`) and an
   in-memory rate limiter — a single persistent instance keeps published pages fresh. Avoid
   Autoscale (multiple instances would serve stale pages after a publish); only move to it if you
   first swap in a shared cache/rate-limiter.

No runtime filesystem writes are performed (configs live in Postgres, images in S3), so the
ephemeral deploy filesystem is not a problem.

## First run
The seed includes two unpublished templates (`default-client`, `default-talent`) and two
published demos (`/specialty-insurance-leaders`, `/backend-engineers`). Log in at `/admin`,
generate a page (pick Claude or OpenAI), edit, set a scheduler URL, and publish.
