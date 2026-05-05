import type { D1Database } from "@cloudflare/workers-types";

export type Instructor = {
  slug: string; name: string; pronouns: string | null;
  credentials: string; specialties: string; bio_md: string;
  classes_taught: string; privates_eur: number; active: number; sort_order: number;
};

function db(): D1Database | null {
  const env = process.env as unknown as { DB?: D1Database };
  const g = globalThis as unknown as { DB?: D1Database };
  return env.DB ?? g.DB ?? null;
}

export async function listInstructors(): Promise<Instructor[]> {
  const d = db(); if (!d) return [];
  const r = await d.prepare("SELECT * FROM instructors WHERE active = 1 ORDER BY sort_order").all<Instructor>();
  return r.results ?? [];
}
export async function getInstructor(slug: string): Promise<Instructor | null> {
  const d = db(); if (!d) return null;
  return await d.prepare("SELECT * FROM instructors WHERE slug = ?").bind(slug).first<Instructor>() ?? null;
}
