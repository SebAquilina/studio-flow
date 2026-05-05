#!/usr/bin/env bash
# audit-headers.sh — assert security/cache headers on the deploy.
set -euo pipefail
URL="${1:-https://studio-vella-web.pages.dev}"
fail=0
for path in / /admin /api/agent/probe; do
  out=$(curl -fsS -i "$URL$path" 2>/dev/null || true)
  case "$path" in
    /admin)
      echo "$out" | grep -qi "WWW-Authenticate" || { echo "[audit-headers] $path missing WWW-Authenticate"; fail=$((fail+1)); };;
    /)
      echo "$out" | grep -qiE "x-frame-options|content-security-policy" || { echo "[audit-headers] $path missing security header"; fail=$((fail+1)); };;
  esac
done
[ "$fail" = 0 ] && echo "[audit-headers] OK" && exit 0
exit 1
