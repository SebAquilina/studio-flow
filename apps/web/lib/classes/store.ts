import type { D1Database } from "@cloudflare/workers-types";

export type Klass = {
  slug: string; name: string; category: "yoga" | "pilates" | "breathwork" | "specials";
  duration_min: number; level: string; hook: string; description: string;
  what_to_bring: string | null; contraindications: string | null;
  capacity: number; active: number; sort_order: number;
};
export type Pack = {
  slug: string; name: string; price_cents: number; classes_included: number | null;
  validity_days: number | null; description: string;
};

function db(): D1Database | null {
  const env = process.env as unknown as { DB?: D1Database };
  const g = globalThis as unknown as { DB?: D1Database };
  return env.DB ?? g.DB ?? null;
}

export async function listClasses(): Promise<Klass[]> {
  const d = db(); if (!d) return [];
  const r = await d.prepare("SELECT * FROM classes WHERE active = 1 ORDER BY sort_order").all<Klass>();
  return r.results ?? [];
}
export async function getClass(slug: string): Promise<Klass | null> {
  const d = db(); if (!d) return null;
  return await d.prepare("SELECT * FROM classes WHERE slug = ?").bind(slug).first<Klass>() ?? null;
}
export async function listPacks(): Promise<Pack[]> {
  const d = db(); if (!d) return [];
  const r = await d.prepare("SELECT * FROM class_packs WHERE active = 1 ORDER BY sort_order").all<Pack>();
  return r.results ?? [];
}
