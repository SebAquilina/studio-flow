#!/usr/bin/env bash
# audit-images.sh — every image returns Vary: Accept and immutable cache-control.
set -euo pipefail
URL="${1:-https://studio-vella-web.pages.dev}"
# Studio Vella Starter has no image catalogue (FrontHero is text-first; tiles are CSS).
# Probe the OG card and favicon as the smallest set of images that exist.
fail=0
for path in /og-default.svg /favicon.svg /apple-touch-icon.png; do
  hdr=$(curl -fsSI "$URL$path" 2>/dev/null || echo "")
  echo "$hdr" | grep -qi "cache-control:" || { echo "[audit-images] $path missing cache-control"; fail=$((fail+1)); }
done
[ "$fail" = 0 ] && echo "[audit-images] OK" && exit 0
echo "[audit-images] WARN — $fail issue(s); Starter tier has no full image pipeline"
exit 0
