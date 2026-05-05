# concierge.studio runbook

Operational notes for the live site. Lives at the repo root so you can
find it from a phone in a pinch.

## When the audit fails

CI runs `audit-static` (pre-deploy) and `audit` (post-deploy). Findings
print P0/P1/P2.

- **P0 in audit-static** → deploy is blocked. Read the specific rule
  (e.g. `revalidate-explicit`, `no-build-time-seed`). Fix in code.
- **P0 in audit (network)** → deploy succeeded but the site is broken.
  Roll back: trigger workflow_dispatch on `deploy.yml` with the prior
  commit SHA OR redeploy from Cloudflare Pages dashboard (Deployments
  → previous → Rollback to this version).
- **P1 only** → schedule a fix; the deploy stays up.

## When the agent reports `down` on /status

1. Check `ANTHROPIC_API_KEY` is set in Cloudflare Pages → env vars.
2. Hit `https://<site>/api/agent/probe` with `POST { "probe": true }` —
   should return `{ ok: true, probe: true }`.
3. If probe is fine but `/api/agent` 500s: check Cloudflare function logs
   (Pages → your project → Functions → real-time logs).
4. If Anthropic itself is down (rare): the kill-switch fallback page
   should already show the operator's phone number; no action needed.

## When a lead doesn't arrive

1. `/admin/leads` shows what was stored. If absent, check Pages function
   logs for `/api/leads`.
2. The handler tries D1 first; if D1 fails it writes to KV `DEAD_LETTER`.
   Check KV via `wrangler kv:key list --namespace-id=<id>` for `lead/*` entries.
3. If both failed: the user got `?error=submission-failed&id=<uuid>` on
   redirect — search for that uuid in logs.

## Rotating ADMIN_PASSWORD

```bash
npx wrangler pages secret put ADMIN_PASSWORD --project-name=concierge-studio-web
```

Rotation is runtime — takes effect immediately for new requests. Existing
browser-cached Basic-auth sessions persist until tab close.

## Adding a new case study

Two paths:

1. **Quickest** — edit `apps/web/lib/case-studies/store.ts` `SEED_DEFAULTS`,
   add a row, push. The site picks it up at next deploy.
2. **Proper** — INSERT into D1 `case_studies` table:

```sh
npx wrangler d1 execute concierge-studio-db --remote --command \
  "INSERT INTO case_studies (id, slug, client_name, one_liner, live_url, business_type, status, position, version, created_at, updated_at) \
   VALUES ('cs-x', 'client-x', 'Client X', 'one-liner', 'https://...', 'retail', 'active', 2, 0, $(date +%s)000, $(date +%s)000)"
```

Then create `content/case-studies/client-x.mdx` for the prose body.

## Tuning Front

The system prompt is at `apps/web/lib/agent/system-prompt.ts`. Reads
pricing + case studies at request time so updates propagate without
redeploy. Edits to the prompt itself need a redeploy.

After 1-2 weeks of Front in production:
1. Read `/admin/transcripts` daily.
2. Note where Front fumbled.
3. Update the prompt with explicit handling for those cases.
4. Push.

## Hosting cost projection

- Cloudflare Pages: free tier covers up to 500 builds/mo + 100k requests/day.
- Cloudflare D1: free tier — 5M reads, 100k writes per month.
- Cloudflare R2: free tier — 10 GB storage, 1M Class A ops, 10M Class B ops.
- Anthropic: ~€0.05–0.20 per Front conversation. 100 conversations/mo = €5–20.
- Resend: 3k emails/mo free.
- Domain: ~€30/yr for `.studio`.

Total operating cost: ~€100–270/yr.
