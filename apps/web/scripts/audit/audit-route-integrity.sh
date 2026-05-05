#!/usr/bin/env bash
# audit-route-integrity.sh — every API route has a UI/lib caller; every
# UI link/fetch resolves to an existing page or route.
# Per skill ref 33. Aware of (admin) route groups + template-literal
# fetch URLs.
set -euo pipefail

cd "$(dirname "$0")/../.."

# Routes that exist for audit/sentinel purposes only (no UI caller required)
AUDIT_ONLY="/api/agent/probe /api/agent/classes /api/agent/sessions /api/admin/agent/regenerate-kb /api/admin/classes /api/admin/instructors /api/admin/sessions /api/admin/bookings"

fail=0

api_routes=$(find app/api -name "route.ts" 2>/dev/null | sed -E 's|app/api/||;s|/route\.ts||;s|/$||')
echo "=== API routes ==="
for r in $api_routes; do
  pat="/api/${r}"
  case " $AUDIT_ONLY " in *" $pat "*) echo "  [OK]   $pat (audit-sentinel)"; continue;; esac

  # Strip the [id] segment so we can grep for the prefix as a template-literal
  prefix=$(echo "$pat" | sed -E 's|/\[[^]]+\]|/${[A-Za-z_][A-Za-z0-9_]*}|g; s|/\[[^]]+\]|.*|g')
  prefix_simple=$(echo "$pat" | sed -E 's|/\[[^]]+\].*$||')
  if grep -rEq --include="*.ts" --include="*.tsx" -e "['\"\`]${pat}['\"\`/?]" -e "${pat}" -e "${prefix_simple}/" components app lib 2>/dev/null; then
    echo "  [OK]   $pat"
  else
    echo "  [MISS] $pat — no UI/lib caller"
    fail=$((fail+1))
  fi
done

echo "=== UI hrefs ==="
ui_paths=$(grep -rEoh --include="*.tsx" --include="*.ts" 'href="/[a-z][^"]*"' app components 2>/dev/null | sort -u | sed -E 's/href="([^"]+)"/\1/' | grep -v '^/$' | grep -v '^/#')
for p in $ui_paths; do
  base="${p%%#*}"
  base="${base%%\?*}"
  if [ -z "$base" ] || [ "$base" = "/" ]; then continue; fi
  case "$base" in
    /api/*) found=$(find app${base} -name "route.ts" 2>/dev/null | head -1);;
    *)
      # Try every supported route group prefix
      found=""
      for prefix in "app/(public)" "app/(admin)" "app"; do
        candidate="${prefix}${base}/page.tsx"
        if [ -f "$candidate" ]; then found="$candidate"; break; fi
      done
      ;;
  esac
  if [ -n "$found" ] && [ -e "$found" ]; then
    echo "  [OK]   $base → $found"
  else
    echo "  [MISS] $base — no matching page or route"
    fail=$((fail+1))
  fi
done

if [ "$fail" -gt 0 ]; then
  echo "[audit-route-integrity] FAILED — $fail issue(s)"
  exit 1
fi
echo "[audit-route-integrity] OK"
