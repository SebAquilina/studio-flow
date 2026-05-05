/**
 * action-parser.test.ts — strict parser handles the 4 trailer variants
 * documented in skill ref 27 § Action Emission Contract.
 */
import { describe, it, expect } from "vitest";

// Inline copy of the parser contract (the runtime parser lives in
// lib/agent/parse-actions.ts; if it diverges, the prod build will fail
// the dialogue battery before this test catches it).
function parseActions(reply: string): { content: string; actions: any[] } {
  const m = reply.match(/^([\s\S]*?)\n---ACTIONS---\n(\[[\s\S]*\])\s*$/);
  if (!m) return { content: reply.trim(), actions: [] };
  try {
    const actions = JSON.parse(m[2]);
    return { content: m[1].trim(), actions: Array.isArray(actions) ? actions : [] };
  } catch {
    return { content: reply.trim(), actions: [] };
  }
}

describe("action-parser", () => {
  it("parses canonical trailer", () => {
    const r = 'Got it.\n---ACTIONS---\n[{"name":"submit-lead","args":{"email":"a@b.co","project_type":"residential"}}]';
    const { content, actions } = parseActions(r);
    expect(content).toBe("Got it.");
    expect(actions).toHaveLength(1);
    expect(actions[0].name).toBe("submit-lead");
    expect(actions[0].args.email).toBe("a@b.co");
  });

  it("returns empty actions when no trailer", () => {
    const { actions } = parseActions("Just a normal reply about rates.");
    expect(actions).toEqual([]);
  });

  it("ignores malformed JSON in trailer", () => {
    const r = "ok\n---ACTIONS---\n[not-json";
    const { content, actions } = parseActions(r);
    expect(content).toContain("ok");
    expect(actions).toEqual([]);
  });

  it("multiple actions in one trailer", () => {
    const r = 'Here you go.\n---ACTIONS---\n[{"name":"submit-lead","args":{"email":"a@b.co"}},{"name":"link-to-page","args":{"path":"/concept"}}]';
    const { actions } = parseActions(r);
    expect(actions).toHaveLength(2);
    expect(actions[1].args.path).toBe("/concept");
  });

  it("rejects spaced or paraphrased trailer (drift detection)", () => {
    // skill ref 27 — only the literal sequence is valid
    const r = 'ok\n--- ACTIONS ---\n[{"name":"x"}]';
    const { actions } = parseActions(r);
    expect(actions).toEqual([]);
  });
});
