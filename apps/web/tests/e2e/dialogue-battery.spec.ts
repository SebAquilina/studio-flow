import { test, expect, type APIRequestContext } from "@playwright/test";
import battery from "../dialogue-battery.json";

interface BatteryTest {
  id: string; category: string; severity: string;
  prompt?: string;
  multiTurn?: { role: "user" | "assistant"; content: string }[];
  expectedReplyContains?: string[];
  mustNotContain?: string[];
  expectedActions?: string[];
}

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

// Per ref 25 § Lessons Baked In — these tests REQUIRE a real Gemini key.
// Skip when SKIP_DIALOGUE_BATTERY=1 (CI without secret) so the suite stays
// green; run with PLAYWRIGHT_BASE_URL=<live-url> to exercise.
const SKIP = process.env.SKIP_DIALOGUE_BATTERY === "1";

async function callAgent(request: APIRequestContext, messages: { role: string; content: string }[]): Promise<string> {
  const res = await request.post(`${BASE}/api/agent`, {
    data: { messages },
    headers: { "content-type": "application/json" },
    timeout: 30_000,
  });
  const body = (await res.json()) as { ok: boolean; content?: string; fallback?: boolean };
  return body.content ?? "";
}

for (const t of battery.tests as BatteryTest[]) {
  const tag = t.severity === "CRITICAL" ? "@critical" : t.severity === "HIGH" ? "@high" : "@medium";
  test(`[${t.severity}] ${t.id} ${tag}`, async ({ request }) => {
    test.skip(SKIP, "SKIP_DIALOGUE_BATTERY=1");
    const reply = t.multiTurn
      ? await callAgent(request, t.multiTurn.filter((m) => m.content !== "[any]"))
      : t.prompt
      ? await callAgent(request, [{ role: "user", content: t.prompt }])
      : (() => { throw new Error(`Test ${t.id} missing prompt`); })();
    const lower = reply.toLowerCase();
    for (const phrase of t.mustNotContain ?? []) {
      expect(lower, `mustNotContain in ${t.id}: ${phrase}`).not.toContain(phrase.toLowerCase());
    }
    for (const phrase of t.expectedReplyContains ?? []) {
      expect(lower, `expectedReplyContains in ${t.id}: ${phrase}`).toContain(phrase.toLowerCase());
    }
  });
}
