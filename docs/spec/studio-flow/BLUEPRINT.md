# Studio Flow — Blueprint (Standard tier)

> **Status:** as-built. Live at `https://studio-flow-web.pages.dev/`.
> Custom domain `studioflow.concierge.studio` — pending parent zone.

## Project charter

A concept-site portfolio piece for `concierge.studio` showing the Standard
tier in a service-only shape (no products, just classes and bookings).
Studio Flow is a fictional yoga / pilates / breathwork studio in
Valletta. Four instructors. 12 classes. 5 packs. Live week-grid schedule
with capacity tracking. Sienna runs a five-question screen for new
visitors, then recommends one class with one instructor and one specific
session — and routes pregnancy / injury straight to a 30-min consult.

The differentiator from Casal Olives (the other Standard-tier portfolio
piece) is that Studio Flow's concierge **screens, doesn't sell**.

## Hard rule (verbatim per skill SKILL.md)

> No purchase, transfer, paid sign-up, paid plan upgrade, financial
> trade, or money movement is ever executed by an agent on the user's
> behalf without explicit confirmation in chat from the user, on a
> per-action basis. Pre-authorisations do not carry over.

For Studio Flow: checkout disabled. Booking requests go to
`portfolio@concierge.studio` and Sienna confirms manually. No card
data ever collected.

## Concept-site disclosures (mandatory)

1. Concept site by `concierge.studio` (Standard tier).
2. Brand is invented — no real Studio Flow business in Valletta.
3. Schedule, instructors, credentials are illustrative.
4. Checkout disabled — no real class is booked, no card is charged.

Implementation: footer disclosure on every page · first-visit
ConceptBanner · `/concept` page · `/checkout` returns disabled-state.

## v1.18 standards

- **Agent-first contract.** FrontHero on `/` first viewport. H1 "Tell
  Sienna what's going on." Block-on-fail audit probes.
- **Phase 6 audit non-negotiable.** No `continue-on-error` on gate
  stages. Stage-0 lint enforces.
- **Brand asset set generated.** Eight files via
  `generate-brand-assets.py --mark compass --accent #3f5c4f
  --bg #f8f7f4 --portfolio-palettes "olive,stone,sea"
  --portfolio-slugs "yoga,pilates,breathwork"`.

## Verification gates

| Phase | Gate | Pass |
| --- | --- | --- |
| 4 build | `pnpm validate:seed` + `validate:zod-seed` | 0 issues |
| 4 build | `audit-static.ts ../..` | 0 P0 |
| 4 build | `audit-analytics/{run,runtime.test}.ts` | 15+38 green |
| 4 build | `audit-brand-assets.sh` | 8 files present |
| 4 build | `pnpm test:unit` | green |
| 5 deploy | `curl /` | 200 + invitational h1 + canonical |
| 5 deploy | `curl /api/agent/probe` | `{"ok":true,"probe":true}` |
| 6 audit | `audit.ts $URL` (probeAgentFirstHero) | 0 P0 |

## Differentiators in the system prompt

- The five-question screen is a **non-negotiable gate** — coded into the
  prompt; the dialogue battery has 10+ paraphrases that all hit the gate.
- Pregnancy / injury / clinical concerns ALWAYS route to a Sienna
  consult — never a group class. This is the "legal-ish guardrail" of
  the build (per the brief).
- The /admin/live schedule heat-map is the demo moment — capacity per
  class, colour-coded cool/warm/hot/full.
