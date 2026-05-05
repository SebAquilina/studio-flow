import { z } from "zod";
import type { D1Database } from "@cloudflare/workers-types";

export const LeadInput = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(254),
  business: z.string().max(200).optional(),
  business_url: z.string().url().max(300).optional(),
  project_type: z.enum(["residential","commercial","hospitality","other"]).default("other"),
  when_label: z.enum(["this_month","next_month","q+1","exploring"]).default("exploring"),
  brief: z.string().max(2000).optional(),
  consent: z.boolean(),
  source: z.enum(["form","front-handoff","direct-email"]).default("form"),
  cc_cid: z.string().regex(/^[0-9a-f-]{20,40}$/i).optional(),
});
export type LeadInput = z.infer<typeof LeadInput>;

function db(): D1Database | null {
  const env = process.env as unknown as { DB?: D1Database };
  const g = globalThis as unknown as { DB?: D1Database };
  return env.DB ?? g.DB ?? null;
}
function uuid() { return crypto.randomUUID(); }

export async function createLead(
  input: LeadInput,
  meta: { ip?: string; ua?: string }
): Promise<{ id: string; via: "primary" | "dead-letter" | "failed" }> {
  const id = `lead-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const now = Date.now();
  const d = db();
  if (!d) return { id, via: "failed" };
  try {
    await d.prepare(
      `INSERT INTO leads (id, name, email, business_name, business_url, business_type,
        project_type, when_label, brief, source, ip, ua, status, version, created_at, updated_at)
       VALUES (?1,?2,?3,?4,?5,'photography',?6,?7,?8,?9,?10,?11,'new',0,?12,?12)`
    ).bind(
      id, input.name, input.email, input.business ?? null, input.business_url ?? null,
      input.project_type, input.when_label, input.brief ?? null, input.source,
      meta.ip ?? null, meta.ua ?? null, now
    ).run();
    return { id, via: "primary" };
  } catch (e) {
    console.warn("[leads] D1 insert failed:", (e as Error).message);
    return { id, via: "failed" };
  }
}

export async function getLead(id: string): Promise<Record<string, unknown> | null> {
  const d = db();
  if (!d) return null;
  const r = await d.prepare(`SELECT * FROM leads WHERE id = ?1`).bind(id).first();
  return r as Record<string, unknown> | null;
}

export async function listLeads(): Promise<Record<string, unknown>[]> {
  const d = db();
  if (!d) return [];
  const r = await d.prepare(`SELECT * FROM leads ORDER BY created_at DESC LIMIT 200`).all();
  return (r.results as Record<string, unknown>[]) ?? [];
}

export async function updateLeadStatus(id: string, status: string): Promise<void> {
  const d = db();
  if (!d) return;
  const now = Date.now();
  const lead = await getLead(id);
  if (!lead) return;
  await d.prepare(`UPDATE leads SET status = ?1, version = version + 1, updated_at = ?2 WHERE id = ?3`)
    .bind(status, now, id).run();
  await d.prepare(
    `INSERT INTO lead_activity (id, lead_id, kind, from_value, to_value, created_at)
     VALUES (?1,?2,'status_change',?3,?4,?5)`
  ).bind(uuid(), id, lead.status as string, status, now).run();
}
