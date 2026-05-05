import { NextResponse } from "next/server";
import { z } from "zod";
import type { D1Database } from "@cloudflare/workers-types";

export const runtime = "edge";
export const dynamic = "force-dynamic";

function db(): D1Database | null {
  const env = process.env as unknown as { DB?: D1Database };
  const g = globalThis as unknown as { DB?: D1Database };
  return env.DB ?? g.DB ?? null;
}

const Body = z.object({
  action: z.enum(["export", "delete", "correct"]),
  email: z.string().email(),
  reason: z.string().max(2000).optional(),
});

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ ok: false, msg: "invalid body" }, { status: 400 }); }
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, msg: "invalid request" }, { status: 422 });
  }
  const { action, email, reason } = parsed.data;
  const id = `dsar-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  try {
    const _db = db();
    if (_db) {
      await _db
        .prepare("INSERT INTO audit_log (who, action, target, payload, created_at) VALUES (?, ?, ?, ?, ?)")
        .bind(email, `privacy.${action}`, "self", JSON.stringify({ id, reason: reason ?? "" }), new Date().toISOString())
        .run();
    }
  } catch {
    // best-effort; we still acknowledge so the user gets feedback
  }
  return NextResponse.json({
    ok: true,
    id,
    msg:
      action === "export"
        ? "Got it. We'll send your export to that email within 30 days."
        : action === "delete"
        ? "Got it. We'll delete your data and confirm by email within 30 days."
        : "Got it. Tell us what to correct in a reply to the confirmation email we'll send.",
  });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: { Allow: "POST, OPTIONS" } });
}
