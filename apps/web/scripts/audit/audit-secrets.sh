#!/usr/bin/env bash
# audit-secrets.sh — guard against leaked credentials in the repo.
set -euo pipefail
cd "$(dirname "$0")/../.."
fail=0
patterns='AIza[0-9A-Za-z_-]{35}|sk_live_[A-Za-z0-9]{20,}|sk_test_[A-Za-z0-9]{20,}|re_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{60,}|cf_token_[A-Za-z0-9_-]{30,}'
hits=$(grep -rEoh --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json" --include="*.md" --include="*.yml" --include="*.toml" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next --exclude-dir=.vercel "$patterns" . || true)
if [ -n "$hits" ]; then
  echo "[audit-secrets] LEAK detected:"
  echo "$hits" | head -5
  fail=1
fi
[ "$fail" = 0 ] && echo "[audit-secrets] OK" && exit 0
exit 1
