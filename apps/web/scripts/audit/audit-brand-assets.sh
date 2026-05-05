#!/usr/bin/env bash
# audit-brand-assets.sh — every standard build ships eight brand assets
# (per skill ref 39).
set -euo pipefail
cd "$(dirname "$0")/../.."
fail=0
required=(favicon.svg favicon.ico apple-touch-icon.png og-default.png og-default.svg logo-wordmark.svg)
for f in "${required[@]}"; do
  if [ ! -f "public/$f" ]; then
    echo "[brand-assets] MISSING: public/$f"
    fail=$((fail+1))
  fi
done
# Portfolio placeholder dir (work or oils or products)
if [ ! -d public/work ] && [ ! -d public/oils ] && [ ! -d public/products ]; then
  echo "[brand-assets] MISSING: portfolio placeholder dir (public/{work,oils,products})"
  fail=$((fail+1))
fi
# Header lockup wired
if ! grep -q "wordmark-mark" components/site/Header.tsx; then
  echo "[brand-assets] Header.tsx missing wordmark-mark SVG lockup"
  fail=$((fail+1))
fi
# OG card minimum size 1200x630
if [ -f public/og-default.png ]; then
  size=$(wc -c < public/og-default.png 2>/dev/null || echo 0)
  if [ "$size" -lt 5000 ]; then
    echo "[brand-assets] og-default.png too small ($size bytes — must be a real card)"
    fail=$((fail+1))
  fi
fi
if [ "$fail" -gt 0 ]; then
  echo "[brand-assets] FAILED — $fail issue(s). Run: python3 ../../scripts-skill-shared/generate-brand-assets.py"
  exit 1
fi
echo "[brand-assets] OK"
