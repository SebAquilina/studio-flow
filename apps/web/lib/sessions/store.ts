import type { D1Database } from "@cloudflare/workers-types";
import { z } from "zod";

export type Session = {
  id: string; class_slug: string; instructor_slug: string;
  starts_at: string; ends_at: string; capacity: number; booked: number;
  status: "open" | "full" | "cancelled"; notes: string | null;
};

function db(): D1Database | null {
  const env = process.env as unknown as { DB?: D1Database };
  const g = globalThis as unknown as { DB?: D1Database };
  return env.DB ?? g.DB ?? null;
}

export async function listSessionsByDateRange(fromIso: string, toIso: string): Promise<Session[]> {
  const d = db(); if (!d) return [];
  const r = await d.prepare(
    "SELECT * FROM class_sessions WHERE status != 'cancelled' AND starts_at >= ? AND starts_at <= ? ORDER BY starts_at"
  ).bind(fromIso, toIso).all<Session>();
  return r.results ?? [];
}

export async function listAvailableNext(limit = 8, classSlug?: string): Promise<Session[]> {
  const d = db(); if (!d) return [];
  const now = new Date().toISOString();
  const sql = classSlug
    ? "SELECT * FROM class_sessions WHERE status = 'open' AND booked < capacity AND starts_at >= ? AND class_slug = ? ORDER BY starts_at LIMIT ?"
    : "SELECT * FROM class_sessions WHERE status = 'open' AND booked < capacity AND starts_at >= ? ORDER BY starts_at LIMIT ?";
  const stmt = classSlug ? d.prepare(sql).bind(now, classSlug, limit) : d.prepare(sql).bind(now, limit);
  const r = await stmt.all<Session>();
  return r.results ?? [];
}

export const BookingInput = z.object({
  session_id: z.string().min(5),
  name: z.string().min(2).max(120),
  email: z.string().email().max(254),
  party_size: z.number().int().min(1).max(2).default(1),
  pack_slug: z.string().optional(),
  notes: z.string().max(500).optional(),
});
export type BookingInput = z.infer<typeof BookingInput>;

export async function createBooking(input: BookingInput): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const d = db(); if (!d) return { ok: false, error: "no_db" };
  const s = await d.prepare("SELECT capacity, booked, starts_at FROM class_sessions WHERE id = ? AND status = 'open'").bind(input.session_id).first<{ capacity: number; booked: number; starts_at: string }>();
  if (!s) return { ok: false, error: "session_not_found" };
  if (s.booked + input.party_size > s.capacity) return { ok: false, error: "session_full" };
  const id = `bk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await d.batch([
    d.prepare("INSERT INTO bookings (id, session_id, name, email, party_size, pack_slug, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, 'requested')")
     .bind(id, input.session_id, input.name, input.email, input.party_size, input.pack_slug ?? null, input.notes ?? null),
    d.prepare("UPDATE class_sessions SET booked = booked + ? WHERE id = ?").bind(input.party_size, input.session_id),
  ]);
  return { ok: true, id };
}

export async function listBookings(): Promise<Array<Record<string, unknown>>> {
  const d = db(); if (!d) return [];
  const r = await d.prepare(`
    SELECT b.id, b.session_id, b.name, b.email, b.party_size, b.pack_slug, b.status, b.created_at,
           cs.starts_at, cs.class_slug, cs.instructor_slug
    FROM bookings b
    LEFT JOIN class_sessions cs ON b.session_id = cs.id
    ORDER BY b.created_at DESC LIMIT 200
  `).all();
  return (r.results as Array<Record<string, unknown>>) ?? [];
}
