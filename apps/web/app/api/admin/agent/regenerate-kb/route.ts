import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export const runtime = "edge";

export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;
  return NextResponse.json({ ok: true, note: "KB is source-controlled on Starter tier — edit via /admin/agent and commit." });
}
