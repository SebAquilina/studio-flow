# When you return — concierge.studio

You left for a few hours. Here's where things stand.

## TL;DR

A complete, deployable agent-first agency site is in this directory.
Hormozi-applied long-form home. Three pricing tiers. Front concierge wired
to Anthropic. Admin shell. Phase 6 audit infra. Brand-deferred (neutral
greyscale + a single placeholder accent).

**Your job when you're back: ~45 minutes of credential-pasting + clicking deploy.**

## What's already in this repo (no credentials needed)

- 10 public routes: `/`, `/work`, `/work/the-tile`, `/pricing`, `/process`, `/about`, `/contact`, `/free-audit`, `/privacy`, `/terms`
- 5 admin routes: `/admin`, `/admin/leads`, `/admin/leads/[id]`, `/admin/case-studies`, `/admin/pricing`, `/admin/transcripts`
- API: `/api/agent`, `/api/agent/probe`, `/api/leads`, `/status`
- Front concierge component (auto-opens after 8s on first visit; the
  "try this" home buttons seed prompts directly into Front)
- D1 schema (leads, transcripts, pricing, case studies, audit log)
- R2 binding for media
- KV `DEAD_LETTER` for lead-submission fallback
- Phase 6 audit: `audit-static.ts` + `audit.ts` + nightly + on-PR + post-deploy gate
- Sentry release job (skipped when no token)
- README, EXECUTION-PLAN, RUNBOOK, .env.example, .gitignore

## What the site says (Hormozi structure)

The home page is long-form deliberately:

1. Hero — "Your website should answer questions at 2am. Yours doesn't. I fix that in 14 days."
2. Pain agitation — the five questions answered at 11pm
3. The shift — "the navbar is 1998"
4. Show don't tell — three Try-Front buttons that pre-fill the chat
5. Value stack — 11 components, €9,200 total, you pay €4,800
6. Bonuses — three free additions (€1,300 of value)
7. Risk reversal — audit-green in 14 days or refund
8. Proof — the-tile.com case study
9. FAQ — eight buyer questions
10. Final CTA — "two builds a month, currently booking"

## When you're back: ~45 minutes to live URL

Follow `EXECUTION-PLAN.md` step-by-step. Summary:

1. **Pre-flight** (10 min): generate the credentials in the table at the
   top of EXECUTION-PLAN.md — GitHub PAT, Cloudflare API token, Anthropic
   key, Resend key.
2. **Phase 1 — provision** (35 min): `gh repo create` from this directory,
   create D1 + R2 + KV resources, paste IDs into wrangler.toml, set GitHub
   Actions secrets + Cloudflare Pages env vars, push to main, deploy runs.
3. **Phase 2 — domain** (when you have the domain): bind concierge.studio
   to Pages, set NEXT_PUBLIC_SITE_URL, redeploy.
4. **Phase 3 — verify** (15 min): walk the day-1 checklist in EXECUTION-PLAN.md.

## Brand decisions deferred — what to do later

Tokens at `apps/web/styles/tokens.css` are intentionally neutral. Only four
rows determine the brand identity:

```css
--brand-fg: #111111;       /* primary text + ink */
--brand-bg: #ffffff;       /* page background */
--brand-accent: #d04a1a;   /* CTAs, Front, accent */
--font-display: ui-serif, Georgia, ...;
```

When you've decided:
1. Edit those four rows.
2. Drop a real logo at `apps/web/public/brand/logo.svg` and update
   `components/site/Logo.tsx` to use `<Image>`.
3. Replace `apps/web/public/{og-default,apple-touch-icon,favicon.ico}`
   with brand-aligned versions (the current ones are placeholders).
4. Push. Audit re-runs.

The Hormozi-applied copy holds for any palette — none of the page bodies
reference specific colors.

## What's NOT done (intentional, day-1 scope)

- Domain not bound (you don't own concierge.studio yet — Pages serves at
  `concierge-studio-web.pages.dev` until DNS).
- No second case study (only the-tile is live; the work index has a
  default-state card if D1 is empty).
- Admin is read-only on case studies and pricing — edit via D1 / git for
  v1; full CRUD ships when you actually need it.
- No blog, no manifesto page, no /process variations — minimal surface
  area until the offer converts.
- No Sentry DSN — wired but optional, set later if you want error tracking.
- No Cloudflare Access on /admin — using HTTP Basic for v1 (single
  operator). Migrate to CF Access or a real users table per ref 18 § 11.3
  when team grows.

## Things to test on day 1

Walk this exact sequence post-deploy:

```
1. Open https://concierge-studio-web.pages.dev
2. Wait 8 seconds → Front opens automatically.
3. Click "What's the cheapest tier..." → Front replies with Starter €2,400.
4. Visit /pricing → three tiers, Standard featured.
5. Visit /work/the-tile → full case study renders.
6. Visit /contact → submit a test form with your email.
7. Check inbox → Resend email arrives.
8. Visit /admin/leads → test lead is there.
9. Visit /admin/transcripts → Front conversation is there.
10. curl /api/agent/probe -X POST -d '{"probe":true}' → 200 + ok:true.
11. curl /status → 200 + agent:"reachable".
```

If any step fails, RUNBOOK.md has the diagnostic path.

## Cost (live)

Day 1: ~€0–10/month while you're testing.
With traffic: ~€20–60/month.
Domain: ~€30/year.

That's it. See you in a few hours.
