/**
 * seed-pricing.ts — writes the SEED_DEFAULTS pricing tiers into D1.
 * Run once after `wrangler d1 migrations apply DB --remote`.
 *
 * Usage: pnpm tsx scripts/seed-pricing.ts
 *
 * Requires CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN env vars.
 */

const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID;
const TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const DB_NAME = process.env.D1_DATABASE_NAME || "concierge-studio-db";

if (!ACCOUNT || !TOKEN) {
  console.error("Set CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN");
  process.exit(1);
}

const TIERS = [
  ["tier-starter", "starter", "Starter", 1, 2400, "one-time", "For solo operators with one location, one language, fewer than 20 pages of content.", JSON.stringify(["Rebuild on Cloudflare Pages, up to 8 pages","Front concierge — single language, up to 20 pages of knowledge","Lead handoff to email","Domain + DNS migration, zero-downtime","30 days of post-launch prompt tuning","GitHub repo handover — you own everything","Lighthouse 95+ on mobile (audit-green guarantee)"]), null, 2, "30 days bug-fix", 0, "active"],
  ["tier-standard", "standard", "Standard", 2, 4800, "one-time", "Most buyers pick this. Up to 80 pages of knowledge, multi-channel handoff, full analytics.", JSON.stringify(["Everything in Starter, plus —","Up to 80 pages of knowledge ingestion","Handoff to email, WhatsApp, or CRM","Analytics + lead-source dashboard","SEO baseline (Lighthouse 95+, schema, OG)","90-day prompt revision credit (unlimited within window)","Loom walkthrough so you can edit copy yourself"]), null, 2, "90 days + revisions", 1, "active"],
  ["tier-premium", "premium", "Premium", 3, 9600, "one-time", "Multi-location, multilingual, or e-commerce. Complex legacy migrations, white-glove cutover.", JSON.stringify(["Everything in Standard, plus —","Multilingual concierge (up to 3 languages)","E-commerce / booking-engine handoff","Complex legacy migration","90-day post-launch tuning, weekly transcript review","White-glove DNS cutover with rollback plan","6 months of priority support"]), null, 3, "6 months retainer", 0, "active"],
];

async function exec(sql: string, params: unknown[]) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/d1/database/${DB_NAME}/query`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "content-type": "application/json" },
    body: JSON.stringify({ sql, params }),
  });
  const j = await res.json();
  if (!res.ok || !(j as { success?: boolean }).success) {
    throw new Error(`D1 query failed: ${JSON.stringify(j)}`);
  }
}

async function main() {
  const now = Date.now();
  for (const t of TIERS) {
    const params = [...t, 0, now, now]; // version, created_at, updated_at
    await exec(
      `INSERT OR REPLACE INTO pricing_tiers (
         id, slug, name, position, price_eur, unit, blurb, features_json,
         not_included_json, timeline_weeks, aftercare, is_featured, status,
         version, created_at, updated_at
       ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      params
    );
    console.log(`✓ ${t[1]} — €${t[4]}`);
  }
  console.log("[seed-pricing] OK");
}

main().catch((e) => { console.error(e); process.exit(1); });
