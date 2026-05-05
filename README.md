# concierge.studio

The agency website that sells agent-first websites. Built with the
[`agent-first-website` skill (v1.11)](../agent-first-website-v1.11.skill).

## What this is

A long-form sales site applying Alex Hormozi's value-stack offer pattern:
- Hero, pain agitation, the shift, show-don't-tell, value-stack offer,
  bonuses, risk-reversal guarantee, proof, FAQ, final CTA.
- One concierge ("Front") that qualifies leads in chat, hands off to /contact.
- Admin shell for leads, transcripts, case studies, pricing.
- Phase 6 audit gates every deploy (sentinel POST, no false-positive 405).

## Stack

- Next.js 14 (app router) on Cloudflare Pages
- Cloudflare D1 (leads, transcripts, pricing, case studies, audit log)
- Cloudflare R2 (media)
- Anthropic Claude Haiku (Front)
- Resend (lead notifications)
- Plausible (analytics, optional)

## Quickstart

See [`EXECUTION-PLAN.md`](./EXECUTION-PLAN.md) for the full provisioning
sequence (~45 min from a clean machine to live URL).

```bash
pnpm install
cd apps/web
pnpm dev
```

## Brand decision (deferred)

Tokens in `apps/web/styles/tokens.css` are neutral on purpose. To re-skin,
edit the four `--brand-*` tokens at the top of that file plus the `--font-display`.
Everything else (greys, semantics, spacing) is structural.

## Audit

```bash
pnpm audit:static     # pre-deploy static analysis
BASE_URL=https://… pnpm audit  # network audit against deployed URL
```

CI runs both on PR + nightly.

## License

Proprietary — © 2026 concierge.studio. Code is not for redistribution.
