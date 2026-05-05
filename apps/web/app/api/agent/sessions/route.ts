import { NextResponse } from "next/server";
import { listAvailableNext } from "@/lib/sessions/store";
export const runtime = "edge"; export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Math.min(20, Number(url.searchParams.get("limit") ?? 8));
  const classSlug = url.searchParams.get("class_slug") ?? undefined;
  const sessions = await listAvailableNext(limit, classSlug ?? undefined);
  return NextResponse.json({ ok: true, sessions }, { headers: { "Cache-Control": "no-store" } });
}
export async function OPTIONS() { return new NextResponse(null, { status: 204, headers: { Allow: "GET, OPTIONS" } }); }
