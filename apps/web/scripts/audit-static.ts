/**
 * audit-static.ts — pre-deploy static analysis (per ref 19).
 * No network. Fails the deploy on any P0 violation.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const ROOT = resolve(process.argv[2] || ".");
const findings: { sev: string; rule: string; file: string; detail: string }[] = [];
const fail = (sev: string, rule: string, file: string, detail: string) =>
  findings.push({ sev, rule, file, detail });

function walk(dir: string, fileFilter?: RegExp): string[] {
  let out: string[] = [];
  try {
    for (const e of readdirSync(dir)) {
      if (e === "node_modules" || e === ".next" || e === ".vercel" || e.startsWith(".")) continue;
      const p = join(dir, e);
      const s = statSync(p);
      if (s.isDirectory()) out.push(...walk(p, fileFilter));
      else if (!fileFilter || fileFilter.test(p)) out.push(p);
    }
  } catch { /* ignore */ }
  return out;
}
const read = (p: string) => readFileSync(p, "utf8");

// Class 1: no build-time seed/content imports in public surfaces
const PUBLIC_PATTERNS = [
  /apps\/web\/app\/\(public\)\//,
  /apps\/web\/app\/sitemap\.tsx?/,
  /apps\/web\/app\/robots\.tsx?/,
  /apps\/web\/app\/layout\.tsx?/,
  /apps\/web\/lib\/agent\//,
];
const SEED_RE = /from\s+['"][^'"]*\b(?:seed|content)\/[^'"]+\.json['"]/;
for (const f of walk(ROOT, /\.(ts|tsx|js|jsx)$/)) {
  const rel = relative(ROOT, f);
  if (PUBLIC_PATTERNS.some((p) => p.test(rel)) && SEED_RE.test(read(f))) {
    fail("P0", "no-build-time-seed", rel, "imports seed/content JSON directly");
  }
}

// Class 2a: public dynamic routes declare cache strategy
const PUBLIC_ROUTE_RE = /apps\/web\/app\/\(public\)\/.*\/page\.tsx$/;
for (const f of walk(ROOT, /\.tsx$/)) {
  const rel = relative(ROOT, f);
  if (!PUBLIC_ROUTE_RE.test(rel)) continue;
  const c = read(f);
  if (!/export\s+const\s+(revalidate|dynamic)\s*=/.test(c)) {
    fail("P0", "revalidate-explicit", rel, "no `revalidate` or `dynamic` export");
  }
}

// Class 8: no `< 500` heuristic
for (const f of [
  join(ROOT, "apps/web/scripts/audit.ts"),
  join(ROOT, "apps/web/app/status/route.ts"),
]) {
  try {
    const c = read(f);
    if (/<\s*500/.test(c)) fail("P0", "no-false-positive-probe", relative(ROOT, f), "uses '< 500'");
  } catch { /* missing file ok */ }
}

// Class 10: no `secrets.*` in workflow if:
for (const f of walk(join(ROOT, ".github/workflows"), /\.ya?ml$/)) {
  const lines = read(f).split("\n");
  lines.forEach((ln, i) => {
    if (/^\s*if:.*secrets\./.test(ln)) {
      fail("P0", "no-secrets-in-if", relative(ROOT, f), `line ${i + 1}: secrets.* in if:`);
    }
  });
}

const p0 = findings.filter((f) => f.sev === "P0");
const p1 = findings.filter((f) => f.sev === "P1");
console.log(`\n[audit-static] ${findings.length} findings (${p0.length} P0, ${p1.length} P1)`);
for (const f of findings) console.log(`  [${f.sev}] ${f.rule}: ${f.detail} (${f.file})`);
if (p0.length > 0) { console.error(`\n[audit-static] FAILED — ${p0.length} P0`); process.exit(1); }
console.log(`\n[audit-static] OK`);
