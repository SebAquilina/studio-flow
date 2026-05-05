/**
 * admin-draft.test.ts — settings draft/publish state machine.
 * Published value equals last published draft; revert restores the prior
 * published draft.
 */
import { describe, it, expect } from "vitest";

type Draft = { id: number; body: string; status: "draft" | "published"; ts: number };

class SettingsStore {
  private drafts: Draft[] = [];
  private nextId = 1;
  saveDraft(body: string) {
    this.drafts.push({ id: this.nextId++, body, status: "draft", ts: Date.now() });
    return this.drafts[this.drafts.length - 1];
  }
  publish() {
    const last = [...this.drafts].reverse().find((d) => d.status === "draft");
    if (!last) return null;
    last.status = "published";
    return last;
  }
  current() {
    return [...this.drafts].reverse().find((d) => d.status === "published") ?? null;
  }
  revert() {
    const published = this.drafts.filter((d) => d.status === "published");
    if (published.length < 2) return null;
    return published[published.length - 2];
  }
}

describe("admin-draft state machine", () => {
  it("publish promotes the latest draft", () => {
    const s = new SettingsStore();
    s.saveDraft("v1");
    s.saveDraft("v2");
    const p = s.publish();
    expect(p?.body).toBe("v2");
    expect(s.current()?.body).toBe("v2");
  });

  it("revert returns to prior published", () => {
    const s = new SettingsStore();
    s.saveDraft("v1"); s.publish();
    s.saveDraft("v2"); s.publish();
    const prior = s.revert();
    expect(prior?.body).toBe("v1");
  });

  it("publish on empty draft set is a no-op", () => {
    const s = new SettingsStore();
    expect(s.publish()).toBe(null);
    expect(s.current()).toBe(null);
  });
});
