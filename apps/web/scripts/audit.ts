/**
 * audit.ts — concierge.studio network audit (per ref 17 + ref 19).
 * Sentinel POST to /api/agent/probe (no false-positive 405).
 */

const AUDIT_SCRIPT_VERSION = "1.0.0";
const BASE_URL = (process.env.BASE_URL || "https://concierge-studio-web.pages.dev").replace(/\/$/, "");
const PER_FETCH_TIMEOUT_MS = 5000;

type Severity = "P0" | "P1" | "P2";
type Finding = { severity: Severity; route?: string; check: string; detail: string };

const findings: Finding[] = [];
const passed: string[] = [];

const fail = (s: Severity, c: string, d: string, r?: string) => findings.push({ severity: s, check: c, detail: d, route: r });
const pass = (c: string) => passed.push(c);

async function fetchText(url: string, init?: RequestInit) {
  const r = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(PER_FETCH_TIMEOUT_MS), ...init });
  return { status: r.status, headers: r.headers, text: await r.text().catch(() => "") };
}

async function probeRobots() {
  try {
    const res = await fetchText(`${BASE_URL}/robots.txt`);
    if (res.status !== 200) { fail("P0", "robots.reachable", `${res.status}`); return; }
    pass("robots.reachable");
    if (!res.text.includes("Sitemap:")) fail("P1", "robots.sitemap", "no Sitemap: line");
    const m = res.text.match(/Sitemap:\s*(\S+)/);
    if (m && !m[1].startsWith(BASE_URL)) fail("P0", "robots.sitemapHost", `Sitemap ${m[1]} not on ${BASE_URL}`);
  } catch (e) { fail("P0", "robots.reachable", (e as Error).name); }
}

async function probeSitemap(): Promise<string[]> {
  try {
    const res = await fetchText(`${BASE_URL}/sitemap.xml`);
    if (res.status !== 200) { fail("P0", "sitemap.reachable", `${res.status}`); return []; }
    pass("sitemap.reachable");
    const urls = Array.from(res.text.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]);
    if (urls.length === 0) fail("P0", "sitemap.nonempty", "no <loc>");
    const wrong = urls.filter((u) => !u.startsWith(BASE_URL));
    if (wrong.length) fail("P0", "sitemap.baseUrl", `${wrong.length} URLs not on ${BASE_URL}, e.g. ${wrong[0]}`);
    return urls;
  } catch (e) { fail("P0", "sitemap.reachable", (e as Error).name); return []; }
}

async function probeAgentFirstHero() {
  try {
    const res = await fetchText(BASE_URL);
    if (res.status !== 200) { fail("P0", "agent-first.home-reachable", `${res.status}`); return; }
    pass("agent-first.home-reachable");
    const h1 = res.text.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    if (!h1) { fail("P0", "agent-first.h1-present", "no <h1> on /"); return; }
    pass("agent-first.h1-present");
    const h1Text = h1[1].replace(/<[^>]+>/g, " ").trim();
    const invitational = /\b(ask|tell|talk to|chat|what.*help|how can|let.*know)\b/i;
    if (!invitational.test(h1Text)) {
      fail("P0", "agent-first.h1-invitational", `H1 "${h1Text.slice(0, 80)}" is not invitational`);
    } else {
      pass("agent-first.h1-invitational");
    }
    // Concierge input above the fold (inline server-rendered)
    if (!/(<input|<textarea)[^>]*(?:placeholder|aria-label)="[^"]*(ask|message|tell)/i.test(res.text)) {
      fail("P0", "agent-first.input-on-first-paint", "no concierge-referencing input found in / HTML");
    } else {
      pass("agent-first.input-on-first-paint");
    }
  } catch (e) {
    fail("P1", "agent-first.fetch", String(e));
  }
}

async function probeRoute(url: string) {
  try {
    const res = await fetchText(url);
    if (res.status < 200 || res.status >= 400) { fail("P0", "route.reachable", `${res.status}`, url); return; }
    pass(`route.reachable ${url}`);
    if (!/<title>[^<]+<\/title>/.test(res.text)) fail("P1", "meta.title", "missing", url);
    if (!/<meta\s+name="description"/.test(res.text)) fail("P1", "meta.description", "missing", url);
    if (!/<link\s+rel="canonical"\s+href="(https?:\/\/[^"]+)"/.test(res.text)) fail("P1", "meta.canonical", "missing/empty", url);
    if (!res.headers.get("x-content-type-options")) fail("P1", "header.xcto", "missing", url);
    if (!res.headers.get("referrer-policy")) fail("P1", "header.referrerPolicy", "missing", url);
  } catch (e) { fail("P0", "route.reachable", (e as Error).name, url); }
}

async function probeAgentSentinel() {
  try {
    const res = await fetch(`${BASE_URL}/api/agent/probe`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ probe: true }),
      signal: AbortSignal.timeout(PER_FETCH_TIMEOUT_MS),
    });
    if (res.status !== 200) { fail("P0", "agent.bound", `expected 200, got ${res.status}`); return; }
    const j = (await res.json().catch(() => null)) as { ok?: boolean; probe?: boolean } | null;
    if (!j?.ok || !j?.probe) { fail("P0", "agent.bound", `unexpected body ${JSON.stringify(j)}`); return; }
    if (res.headers.get("cache-control") !== "no-store") fail("P1", "agent.no-store", "missing");
    pass("agent.bound");
  } catch (e) { fail("P0", "agent.bound", (e as Error).name); }
}

async function probeStatus() {
  try {
    const res = await fetchText(`${BASE_URL}/status`);
    if (res.status !== 200) { fail("P0", "status.reachable", `${res.status}`); return; }
    if (res.headers.get("cache-control") !== "no-store") fail("P1", "status.no-store", "missing");
    const parsed = JSON.parse(res.text) as { ok?: boolean; agent?: string; agentDetail?: string };
    if (!parsed.ok) fail("P0", "status.ok", `ok=${parsed.ok}`);
    if (parsed.agent === "down") fail("P0", "status.agent", `down — ${parsed.agentDetail}`);
    else pass(`status.agent (${parsed.agent})`);
  } catch (e) { fail("P0", "status.reachable", (e as Error).name); }
}

async function main() {
  console.log(`[audit ${AUDIT_SCRIPT_VERSION}] BASE_URL = ${BASE_URL}`);
  await probeRobots();
  const urls = await probeSitemap();
  await probeAgentSentinel();
  await probeAgentFirstHero();
  await probeStatus();
  for (const u of urls.slice(0, 12)) await probeRoute(u);

  const p0 = findings.filter((f) => f.severity === "P0");
  const p1 = findings.filter((f) => f.severity === "P1");
  const p2 = findings.filter((f) => f.severity === "P2");
  console.log(`\n[audit] passed: ${passed.length}`);
  console.log(`[audit] findings: ${p0.length} P0 · ${p1.length} P1 · ${p2.length} P2\n`);
  for (const f of findings) console.log(`  [${f.severity}] ${f.check}: ${f.detail}${f.route ? ` (${f.route})` : ""}`);
  if (p0.length > 0) { console.error(`\n[audit] FAILED — ${p0.length} P0`); process.exit(1); }
  console.log(`\n[audit] OK`);
}

main().catch((e) => { console.error(e); process.exit(2); });
