/**
 * action-executor.test.ts — submit-lead writes; add-to-save-list no-ops
 * for Studio Vella; link-to-page validates path against the route table.
 */
import { describe, it, expect } from "vitest";

const STUDIO_VELLA_ROUTES = ["/", "/concept", "/privacy", "/terms", "/checkout"];

type Action = { name: string; args: Record<string, unknown> };

function exec(action: Action, db: { leads: any[]; saved: any[] }) {
  switch (action.name) {
    case "submit-lead": {
      const a = action.args as any;
      if (!a?.email || !a?.project_type) return { ok: false, reason: "invalid args" };
      db.leads.push({ ...a, ts: Date.now() });
      return { ok: true };
    }
    case "add-to-save-list":
      // Studio Vella has no save list — no-op success
      return { ok: true, noop: true };
    case "link-to-page": {
      const p = (action.args as any)?.path;
      if (typeof p !== "string" || !STUDIO_VELLA_ROUTES.includes(p)) return { ok: false, reason: "unknown path" };
      return { ok: true };
    }
    case "email-list": {
      const a = action.args as any;
      if (!a?.to || !a?.subject) return { ok: false, reason: "missing to/subject" };
      return { ok: true };
    }
    default:
      return { ok: false, reason: "unknown action" };
  }
}

describe("action-executor", () => {
  it("submit-lead writes a row", () => {
    const db = { leads: [], saved: [] };
    const r = exec({ name: "submit-lead", args: { email: "a@b.co", project_type: "residential" } }, db);
    expect(r.ok).toBe(true);
    expect(db.leads).toHaveLength(1);
  });

  it("submit-lead refuses missing fields", () => {
    const db = { leads: [], saved: [] };
    const r = exec({ name: "submit-lead", args: { email: "a@b.co" } }, db);
    expect(r.ok).toBe(false);
  });

  it("add-to-save-list is a no-op for Studio Vella", () => {
    const r = exec({ name: "add-to-save-list", args: { slug: "x" } }, { leads: [], saved: [] });
    expect(r.ok).toBe(true);
    expect((r as any).noop).toBe(true);
  });

  it("link-to-page rejects invented paths", () => {
    const r = exec({ name: "link-to-page", args: { path: "/imaginary" } }, { leads: [], saved: [] });
    expect(r.ok).toBe(false);
  });

  it("link-to-page accepts a real path", () => {
    const r = exec({ name: "link-to-page", args: { path: "/concept" } }, { leads: [], saved: [] });
    expect(r.ok).toBe(true);
  });
});
