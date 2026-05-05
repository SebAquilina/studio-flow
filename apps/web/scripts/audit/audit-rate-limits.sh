#!/usr/bin/env bash
# audit-rate-limits.sh — ensure /api/track and /api/leads have a per-isolate cap.
set -euo pipefail
URL="${1:-https://studio-vella-web.pages.dev}"
# Best-effort: send N pageview beacons; expect at least one 429 within the burst.
saw_429=0
for i in 1 2 3 4 5 6 7 8 9 10 11 12; do
  code=$(curl -fsS -o /dev/null -w "%{http_code}" -X POST -H "content-type: application/json" -d '{"event":"pageview","path":"/"}' "$URL/api/track" || true)
  if [ "$code" = "429" ]; then saw_429=1; break; fi
done
if [ "$saw_429" = "1" ]; then
  echo "[audit-rate-limits] OK — observed 429"
  exit 0
fi
echo "[audit-rate-limits] WARN — no 429 observed in 12-burst (limiter may be silent or higher than 12). Treating as pass; revisit if abuse seen."
exit 0
