import type { D1Database } from "@cloudflare/workers-types";

interface Day { date: string; status: string; note: string | null; updated_at: number; }

function db(): D1Database | null {
  const env = process.env as unknown as { DB?: D1Database };
  const g = globalThis as unknown as { DB?: D1Database };
  return env.DB ?? g.DB ?? null;
}

export async function listAvailability(days = 90): Promise<Day[]> {
  const d = db();
  if (!d) return [];
  const r = await d.prepare(
    `SELECT * FROM availability WHERE date >= date('now') AND date <= date('now', '+${days} days')
     ORDER BY date ASC`
  ).all();
  return ((r.results as unknown) as Day[]) ?? [];
}

export async function upsertAvailability(date: string, status: string, note: string | null): Promise<void> {
  const d = db();
  if (!d) return;
  const now = Date.now();
  await d.prepare(
    `INSERT INTO availability (date, status, note, updated_at) VALUES (?1, ?2, ?3, ?4)
     ON CONFLICT(date) DO UPDATE SET status = ?2, note = ?3, updated_at = ?4`
  ).bind(date, status, note, now).run();
}
