import { NextResponse } from "next/server";
import { listSessionsByDateRange } from "@/lib/sessions/store";
export const runtime = "edge"; export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const url = new URL(req.url);
  const from = url.searchParams.get("from") ?? new Date().toISOString();
  const to = url.searchParams.get("to") ?? new Date(Date.now() + 14*24*60*60*1000).toISOString();
  const sessions = await listSessionsByDateRange(from, to);
  return NextResponse.json({ ok: true, sessions });
}
export async function OPTIONS() { return new NextResponse(null, { status: 204, headers: { Allow: "GET, OPTIONS" } }); }
