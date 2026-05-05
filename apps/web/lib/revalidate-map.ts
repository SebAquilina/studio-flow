import { revalidatePath } from "next/cache";

export type MutationKey =
  | "lead.create"
  | "lead.update"
  | "availability.update"
  | "agent.regenerate";

const MAP: Record<MutationKey, string[]> = {
  "lead.create": [],            // admin-only data; no public revalidate needed
  "lead.update": [],
  "availability.update": ["/", "/api/agent/availability"],
  "agent.regenerate": [],
};

export function revalidatePaths(key: MutationKey): void {
  const paths = MAP[key] ?? [];
  for (const p of paths) {
    try { revalidatePath(p); } catch {}
  }
}
