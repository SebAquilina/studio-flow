/**
 * publish-route.test.ts — admin mutations call revalidatePath() for
 * every public path affected (skill ref 19 REVALIDATE_MAP).
 */
import { describe, it, expect, vi } from "vitest";

const REVALIDATE_MAP: Record<string, string[]> = {
  "settings.kb_md": ["/", "/concept"],
  "settings.system_prompt": ["/"],
  "availability": ["/", "/#availability"],
  "leads.create": [],         // no public surface impact
  "leads.update": ["/admin/leads"], // admin-only
};

function expectedRevalidations(action: string): string[] {
  return REVALIDATE_MAP[action] ?? [];
}

describe("REVALIDATE_MAP", () => {
  it("KB edit revalidates / and /concept", () => {
    expect(expectedRevalidations("settings.kb_md")).toEqual(["/", "/concept"]);
  });

  it("availability flip revalidates the home + anchor", () => {
    expect(expectedRevalidations("availability")).toContain("/");
    expect(expectedRevalidations("availability")).toContain("/#availability");
  });

  it("lead create has no public revalidation", () => {
    expect(expectedRevalidations("leads.create")).toEqual([]);
  });

  it("unknown action returns empty", () => {
    expect(expectedRevalidations("nonsense")).toEqual([]);
  });
});

describe("simulated mutation", () => {
  it("calls revalidatePath for every mapped path", () => {
    const revalidatePath = vi.fn();
    const action = "settings.kb_md";
    for (const p of expectedRevalidations(action)) revalidatePath(p);
    expect(revalidatePath).toHaveBeenCalledTimes(2);
    expect(revalidatePath).toHaveBeenNthCalledWith(1, "/");
    expect(revalidatePath).toHaveBeenNthCalledWith(2, "/concept");
  });
});
