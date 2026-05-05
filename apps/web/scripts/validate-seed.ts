/**
 * validate-seed.ts — Zod gate over docs/spec/studio-flow/seed/*.json
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";

const SPEC_ROOT = resolve(__dirname, "../../../docs/spec/studio-flow");

const BrandSeed = z.object({
  name: z.string().min(3),
  slug: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
  voice: z.object({
    rules: z.array(z.string()).min(3),
    bannedPhrases: z.array(z.string()).min(1),
  }),
  palette: z.object({ bg: z.string(), ink: z.string(), accent: z.string(), muted: z.string() }),
  concept: z.object({
    isConceptSite: z.literal(true),
    operator: z.string(),
    tier: z.enum(["Starter", "Lite", "Standard", "Plus"]),
    checkoutEnabled: z.literal(false),
    leadInbox: z.string().email(),
  }),
});

const ContentSeed = z.object({
  siteUrl: z.string().url(),
  frontHero: z.object({
    h1: z.string().refine((v) => /\b(ask|tell|talk to|chat|what.*help|how can|let.*know)\b/i.test(v), "FrontHero H1 must be invitational"),
    sub: z.string().min(80),
    prompts: z.array(z.string().min(10)).min(3).max(6),
  }),
});

const ProductsSeed = z.object({
  oils: z.array(z.object({
    slug: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
    name: z.string().min(3),
    kind: z.enum(["oil", "gift", "experience"]),
    price_cents: z.number().int().min(100).max(50000),
  })).min(3),
});

let issues = 0;
function check(name: string, schema: z.ZodTypeAny, file: string) {
  const path = resolve(SPEC_ROOT, file);
  if (!existsSync(path)) { console.warn(`⚠ ${file} not yet present (will be on next spec push)`); return; }
  let body: unknown;
  try { body = JSON.parse(readFileSync(path, "utf8")); }
  catch (e) { console.error(`✗ ${file} — not parseable: ${(e as Error).message}`); issues++; return; }
  const r = schema.safeParse(body);
  if (!r.success) {
    console.error(`✗ ${name} — ${r.error.issues.length} issue(s):`);
    for (const i of r.error.issues) console.error(`    [${i.path.join(".")}] ${i.message}`);
    issues++;
  } else {
    console.log(`✓ ${name}`);
  }
}

check("brands.seed.json", BrandSeed, "seed/brands.seed.json");
check("content.seed.json", ContentSeed, "seed/content.seed.json");
check("products.seed.json", ProductsSeed, "seed/products.seed.json");

if (issues > 0) { console.error(`[validate-seed] FAILED — ${issues} issue(s)`); process.exit(1); }
console.log("[validate-seed] OK"); process.exit(0);
