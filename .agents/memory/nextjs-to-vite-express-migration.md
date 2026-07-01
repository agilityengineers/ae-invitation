---
name: Next.js → Vite+Express migration (pnpm workspace)
description: Non-obvious gotchas when porting an imported Next.js app into the Replit pnpm_workspace stack (Vite+React frontend artifact + Express API artifact)
---

# Porting Next.js apps into the pnpm_workspace stack

Two-artifact split: frontend → Vite+React SPA (previewPath `/`), API routes → Express (previewPath/paths `/api`). Same-origin through the Replit proxy, so relative `/api/*` fetches and cookies work without CORS/credentials tweaks.

## Gotchas worth remembering
- **Express 5 `req.params.x` is typed `string | string[]`.** Passing it to a `(s: string)` function fails `tsc`. Wrap with `String(req.params.x)`. esbuild bundles fine without it — only `tsc --noEmit` catches it, so always run typecheck, not just build.
- **Vite scaffold `vite.config.ts` throws at config-load if `PORT` is unset.** `pnpm --filter <fe> run build` fails locally for that reason; it is NOT a real error — the dev workflow and deploy inject `PORT`. Use `run typecheck` as the real frontend verification signal.
- **`"use client";` directives are harmless** left in copied components — they're just top-of-file string literals under Vite/esbuild. No need to strip them.
- **`import "server-only";` must be stripped** from any lib copied into either artifact — it hard-throws outside Next.
- **next/link → wouter `Link`** (`import { Link } from "wouter"`); prop shape (`href`, `className`, `target`) is compatible. next/font → load fonts via Google Fonts `<link>` in `index.html` and set the CSS font vars directly in the `@theme` block.
- **Next middleware gating is gone** — replicate per-page: an `AdminShell` wrapper calls `GET /api/auth/session` and redirects to login when `!authed`; gated data routes still return 401 server-side as the real guard.
- **Admin session secret / password**: dev fallback password is `"admin"` when `ADMIN_PASSWORD` unset (backend degrades gracefully; AI/S3/Zapier also no-op without their secrets).

**Why:** these cost multiple debug cycles and none are discoverable by reading the final code — they're stack-boundary behaviors.
