# audit-runbook — Studio Flow Phase 6 (v1.18)

8-step sequence per skill ref 38.

1. Environment + scope.
2. `pnpm validate:seed` + `pnpm tsx scripts/validate-seed.ts`.
3. Stage A: `audit-static.ts ../..` + `audit-secrets.sh` + `audit-route-integrity.sh` + `audit-brand-assets.sh`.
4. Analytics: `audit-analytics/run.ts` (15) + `audit-analytics/runtime.test.ts` (38).
5. Stage B (60s warm-up): `audit.ts $URL` + `audit-headers.sh`.
6. Visual walkthrough (10-step per skill ref 17).
7. Privacy review: processors itemised, retention stated, DSAR reachable.
8. Triage + gate. 0 P0 → PASS.
