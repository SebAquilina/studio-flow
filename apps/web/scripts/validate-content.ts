import { readFileSync } from "node:fs";
import { resolve } from "node:path";
let issues = 0;
function check(file: string, mustContain: string[]) {
  let body: string;
  try { body = readFileSync(resolve(file), "utf8"); } catch { console.error(`✗ ${file} — not readable`); issues++; return; }
  for (const m of mustContain) {
    if (!body.includes(m)) { console.error(`✗ ${file} — missing: "${m}"`); issues++; }
  }
}
check("components/site/Footer.tsx", ["Concept site by", "concierge.studio", "VAT/MBR"]);
check("components/site/ConceptBanner.tsx", ["Studio Flow", "concierge.studio"]);
check("lib/agent/system-prompt.ts", ["Sienna", "Studio Flow", "five-question screen", "consult", "concept site"]);
check("lib/agent/kb.ts", ["Valletta", "Studio Flow", "instructors"]);
check("components/front/FrontHero.tsx", ["Tell Sienna", "Sienna", "Studio Flow"]);
check("app/(public)/page.tsx", ["FrontHero", "ClientIdField"]);
check("drizzle/migrations/0003_studio_flow.sql", ["classes", "instructors", "class_sessions", "bookings", "class_packs"]);
if (issues === 0) { console.log("[validate-content] OK"); process.exit(0); }
console.error(`[validate-content] FAILED — ${issues} issues`); process.exit(1);
