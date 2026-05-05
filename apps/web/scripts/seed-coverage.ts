/**
 * seed-coverage.ts — % populated per high-impact field.
 * Emits a Markdown table the audit pastes into Step 4 of the report.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const SPEC_ROOT = resolve(__dirname, "../../../docs/spec/studio-vella");
function load(p: string): any { return JSON.parse(readFileSync(resolve(SPEC_ROOT, p), "utf8")); }

const brands = load("seed/brands.seed.json");
const content = load("seed/content.seed.json");
const products = load("seed/products.seed.json");

type Row = { field: string; populated: number; total: number };
const rows: Row[] = [];
const pct = (n: number, d: number) => d === 0 ? "0%" : `${Math.round((n/d)*100)}%`;

rows.push({ field: "brand.voice.rules", populated: brands.voice?.rules?.length ?? 0, total: 5 });
rows.push({ field: "brand.voice.bannedPhrases", populated: brands.voice?.bannedPhrases?.length ?? 0, total: 8 });
rows.push({ field: "content.frontHero.prompts", populated: content.frontHero?.prompts?.length ?? 0, total: 4 });
rows.push({ field: "content.work[]", populated: content.work?.length ?? 0, total: 3 });
rows.push({ field: "products.packages[]", populated: products.packages?.length ?? 0, total: 3 });
rows.push({ field: "products.addOns[]", populated: products.addOns?.length ?? 0, total: 3 });
rows.push({ field: "packages with scope ≥ 20 chars", populated: products.packages?.filter((p:any)=>p.scope?.length>=20).length ?? 0, total: products.packages?.length ?? 0 });
rows.push({ field: "packages with deliverables.finalImages", populated: products.packages?.filter((p:any)=>p.deliverables?.finalImages).length ?? 0, total: products.packages?.length ?? 0 });

console.log("| Field | Populated | Total | % |");
console.log("| --- | --- | --- | --- |");
for (const r of rows) console.log(`| ${r.field} | ${r.populated} | ${r.total} | ${pct(r.populated, r.total)} |`);

const incomplete = rows.filter(r => r.populated < r.total);
if (incomplete.length > 0) {
  console.error(`\n[seed-coverage] WARN — ${incomplete.length} fields below 100%`);
}
process.exit(0);
