# concierge.studio — execution plan

**What this is.** The website you sell websites through. The agent on it ("Front") qualifies leads. The proof is `the-tile.com`.

**Built using the agent-first-website skill (v1.10).** Phase 6 audit gates apply. Brand-apply pass not used (this is a greenfield design, not a rebuild — applyPolicy = `record-only`).

---

## Status — what's done in this hand-off (no credentials needed)

I've scaffolded the entire repo on disk. It includes:

- Next.js 14 app router on the Cloudflare Pages stack (mirroring the-tile)
- All 5 day-1 + day-2 public routes + 5 admin routes + 5 API routes + the agent sentinel
- Drizzle migration `0001_init.sql` for `leads`, `lead_messages`, `case_studies`, `pricing_tiers`, `audit_log`
- `Front` concierge wired to `/api/agent` (system prompt grounds in pricing + case studies + process)
- One case study (`content/case-studies/the-tile.mdx`) — the proof
- Three pricing tiers seeded (€2,400 / €4,800 / €9,600)
- Brand applied (palette: `#0A0A0A` ink, `#FAF7F2` paper, `#FF5C2E` signal orange, `#1F4D3C` forest, `#E8E4DB` stone; Instrument Serif + Inter fonts)
- Logomark placeholder + favicon + OG card generated in brand colors
- Phase 6 audit infra: `audit.ts` + `audit-static.ts` + nightly + on-PR workflow + post-deploy gate
- Hardened `lib/auth.ts`, `lib/revalidate-map.ts`, version-aware optimistic concurrency on every admin mutation
- README, RUNBOOK, .env.example, CONTRIBUTING

What's NOT done (because no credentials available in this session): GitHub repo creation, Cloudflare resource provisioning, DNS, secrets. All listed in "Phase 1 — When you're back" below.

---

## Phase 0 — Pre-flight check (10 min, when you return)

You'll need credentials handy. Have these ready before starting Phase 1:

| Credential | Where to get it | Used for |
|---|---|---|
| **GitHub PAT** with `repo`, `workflow`, `admin:repo_hook`, `read:org` scopes | github.com → Settings → Developer settings → Tokens (classic) | Creating the repo, pushing initial commit, setting Actions secrets |
| **Cloudflare API token** with `Account:Cloudflare Pages:Edit`, `Account:D1:Edit`, `Account:Workers R2 Storage:Edit`, `Zone:Zone Settings:Edit`, `Zone:DNS:Edit` | dash.cloudflare.com → My Profile → API Tokens → Create | Pages, D1, R2, custom domain, DNS |
| **Cloudflare account ID** | dash.cloudflare.com → right sidebar | Wrangler context |
| **Anthropic API key** | console.anthropic.com → API keys | The Front concierge |
| **Resend API key** | resend.com → API keys | Lead-notification emails |
| **Domain name** | concierge.studio recommended (or your pick) | Live URL |

You don't need a Plausible account on day 1 — `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` is optional; if unset, the analytics script doesn't load.

---

## Phase 1 — Provision (45 min)

Run from your laptop with the unzipped `concierge-studio/` repo as cwd. Replace `seb` and `concierge-studio` with your GitHub user/org and chosen repo name if different.

### 1.1 Create the GitHub repo

```bash
# Auth gh CLI if you haven't
gh auth login

# Create repo from the local directory
cd concierge-studio
gh repo create concierge-studio --private --source=. --remote=origin --push
```

Confirm: `gh repo view --web` opens the repo in your browser.

### 1.2 Provision Cloudflare resources

```bash
# Set env so wrangler picks up the right account
export CLOUDFLARE_ACCOUNT_ID=<your-account-id>
export CLOUDFLARE_API_TOKEN=<your-token>

# 1. D1 database
npx wrangler d1 create concierge-studio-db
# → copy the UUID into apps/web/wrangler.toml under [[d1_databases]] database_id
# Same for the preview DB:
npx wrangler d1 create concierge-studio-db-preview
# → copy the UUID into apps/web/wrangler.toml under [env.preview]

# 2. R2 bucket (for case study media + admin uploads)
npx wrangler r2 bucket create concierge-studio-media
npx wrangler r2 bucket create concierge-studio-media-preview

# 3. Apply migrations
cd apps/web
npx wrangler d1 migrations apply DB --remote
npx wrangler d1 migrations apply DB --local

# 4. Seed pricing tiers
pnpm tsx scripts/seed-pricing.ts
```

### 1.3 Create the Cloudflare Pages project

```bash
# From repo root
npx wrangler pages project create concierge-studio-web \
  --production-branch=main \
  --compatibility-date=2024-09-23
```

Now connect the GitHub repo to the Pages project (Cloudflare dashboard → Pages → concierge-studio-web → Settings → Source). This enables the Pages-built-in CI mirror; we'll use the GitHub Actions workflow as the canonical deploy path so feel free to leave the Pages git integration disabled.

### 1.4 Set GitHub Actions secrets

```bash
gh secret set CLOUDFLARE_ACCOUNT_ID --body "$CLOUDFLARE_ACCOUNT_ID"
gh secret set CLOUDFLARE_API_TOKEN --body "$CLOUDFLARE_API_TOKEN"
gh secret set ANTHROPIC_API_KEY --body "<your-key>"
gh secret set RESEND_API_KEY --body "<your-key>"
gh secret set ADMIN_USER --body "seb"
gh secret set ADMIN_PASSWORD --body "$(openssl rand -base64 24)"  # save this somewhere
gh secret set ADMIN_OWNER_EMAILS --body "seb.aquilina@gmail.com"
```

Set Pages env vars (these are runtime bindings; rotation doesn't require redeploy):

```bash
npx wrangler pages secret put ANTHROPIC_API_KEY --project-name=concierge-studio-web
npx wrangler pages secret put RESEND_API_KEY --project-name=concierge-studio-web
npx wrangler pages secret put ADMIN_USER --project-name=concierge-studio-web
npx wrangler pages secret put ADMIN_PASSWORD --project-name=concierge-studio-web
npx wrangler pages secret put ADMIN_OWNER_EMAILS --project-name=concierge-studio-web
```

### 1.5 First deploy

```bash
git push origin main
```

The `deploy.yml` workflow runs: actionlint → install → validate-seed → audit-static → migrate → build → deploy → post-deploy audit. If post-deploy audit fails, the deploy is left up but a `audit-regression` issue is opened automatically.

Confirm: visit `https://concierge-studio-web.pages.dev` (or whatever Cloudflare assigned). Front should respond on the home page. `/api/agent/probe` returns `{ ok: true, probe: true }`.

---

## Phase 2 — Domain + DNS (when you have the domain)

```bash
# In the Cloudflare dashboard, add your domain to Cloudflare DNS first.
# Then bind to Pages:
npx wrangler pages deployment domain add concierge.studio --project-name=concierge-studio-web
npx wrangler pages deployment domain add www.concierge.studio --project-name=concierge-studio-web

# Set the public site URL secret
gh secret set NEXT_PUBLIC_SITE_URL --body "https://concierge.studio"
npx wrangler pages secret put NEXT_PUBLIC_SITE_URL --project-name=concierge-studio-web
```

Then push a no-op commit to trigger a redeploy that picks up the new env var.

---

## Phase 3 — Day-1 verification (15 min)

After deploy succeeds, walk this checklist by hand. The audit catches most of it but the visual half needs eyes.

- [ ] Home loads, hero is above fold at 1366×768
- [ ] Front opens after 8s on hero
- [ ] Ask Front "what kind of business is this for" → it asks back, doesn't info-dump
- [ ] Ask "what does the Standard tier include" → it reads from `/pricing`, doesn't make up numbers
- [ ] Click `/work/the-tile` → renders the case study with all sections
- [ ] Click `/pricing` → three tiers visible, "talk to Front" CTAs
- [ ] Submit contact form with a test email → arrives in your inbox via Resend
- [ ] `/admin` prompts for HTTP Basic; `seb` + your `ADMIN_PASSWORD` works
- [ ] `/admin/leads` shows the test lead from above
- [ ] `/admin/transcripts` shows the test Front conversation
- [ ] `/api/agent/probe` returns `{ ok: true, probe: true }`
- [ ] `/status` returns `{ ok: true, agent: "reachable" }`

---

## Phase 4 — Add a second case study (when ready)

Each new client site you ship gets a case study under `content/case-studies/<slug>.mdx`. Use `the-tile.mdx` as the template. Front automatically picks up new case studies on next deploy (the system prompt re-bundles them).

Or: use the admin at `/admin/case-studies/new` — it commits the MDX file via the GitHub API and triggers a deploy.

---

## Phase 5 — Tune Front (week 2)

Open `/admin/transcripts` daily for the first 2 weeks. Patterns to look for:

- Questions Front fumbles → add an FAQ entry to the system prompt
- Lead types we don't want → add a polite-decline branch
- Magic moments where Front nailed it → screenshot for a future case study or social post
- Conversion drop-off points → adjust the qualifying questions

Edit the prompt at `apps/web/lib/agent/system-prompt.ts`. Future: an admin UI to edit it without a deploy.

---

## Phase 6 — Audit gate, ongoing

Same as the-tile: Phase 6 audit runs nightly + on PR + post-deploy. The static probe `audit-static.ts` blocks the deploy if any v1.10 SOP is violated (build-time seed imports, missing revalidatePath, secrets-in-if, false-positive probes). The network probe `audit.ts` blocks merge if a P0 surfaces against the deployed URL.

Audit reports go to `docs/spec/concierge-studio/audit-report-<date>.md` automatically. Every change you ship gets one. Diff against the prior report tells you what regressed.

---

## What's intentionally NOT in day-1

- `/about`, `/process`, `/manifesto` — content drafts, ship week 2
- A blog — adds CMS surface area; defer until you have something to say
- Analytics dashboard inside admin — Plausible's own dashboard is fine for now
- Multi-staff admin / SSO — single operator for now (HTTP Basic stopgap per ref 18 §11.3)
- E-commerce / Stripe checkout — not needed; quotes go via email
- Newsletter signup — defer until launch
- Image lightbox / video case studies — defer

If a feature you want isn't here, log it as a GitHub issue tagged `v2`. Nothing is dropped — just not on day 1.

---

## Failure modes the audit catches

The Phase 6 SOP (ref 17 + ref 19) gates against:

- Front returning false-positive "reachable" when it's actually broken
- Cover/case-study image overwrites that don't propagate (cache immutable on fixed key)
- Two-tab admin edits silently overwriting each other (no version column)
- Privacy-request silent drops (KV dead-letter wired)
- Build-time seed-JSON imports in public surfaces (greps the source tree)
- Missing `revalidatePath` after admin mutations
- `secrets.*` in workflow `if:` lines (silent-killer pattern)

---

## Decisions I made on your behalf (because you're away)

I picked sensible defaults grounded in the planning agent's spec. Each is reversible — none locks you in.

| Decision | What I picked | Reverse by |
|---|---|---|
| Project slug | `concierge-studio` | Search-and-replace + repo rename |
| Default domain | `concierge.studio` | Pages dashboard → custom domain |
| Pricing tiers | €2,400 / €4,800 / €9,600 (Starter / Standard / Premium) | Edit `lib/pricing/seeds.ts` + run seed script |
| Voice register | Opinionated-friendly | Edit `lib/agent/system-prompt.ts` |
| Front opening trigger | After 8s on hero, or scroll past fold | Edit `components/front/Front.tsx` |
| Brand palette | Ink + Paper + Signal orange + Forest + Stone | Edit `apps/web/styles/tokens.css` |
| Fonts | Instrument Serif + Inter | Edit `apps/web/app/layout.tsx` `<link>` |
| Admin auth | HTTP Basic with single owner | Roadmap to ref 18 § 11.3 (users + 2FA) |
| Logo | Lowercase `c.` in Signal orange (placeholder PNG generated) | Replace `apps/web/public/brand/concierge-studio-logo.png` |
| Single-operator | Yes; no team accounts | Roadmap to ref 18 § 11.3 |
| MDX-as-CMS for case studies | Yes; case studies live in repo | Migrate to D1 once you have >10 |

---

## Cost projection

Cloudflare Pages: free tier covers this volume.
Cloudflare D1: free tier (5M reads, 100k writes / month).
Cloudflare R2: free tier (10 GB storage, 1M Class A ops, 10M Class B ops / month).
Anthropic: pay-per-use; estimate €0.05–0.20 per Front conversation. 100/mo = €5–20/mo.
Resend: 3k emails/mo free. Lead notifications + future newsletter fits.
Domain: `.studio` is ~€20–35/yr at most registrars.

Total: domain (~€30/yr) + Anthropic spend (~€60–240/yr) = roughly **€100–270/yr** for the operating site.

---

*This plan was generated 2026-04-28. It's reproducible — Phase 1 takes ~45 min from a clean machine.*
