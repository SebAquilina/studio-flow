import { NextResponse } from "next/server";
import { listClasses, listPacks } from "@/lib/classes/store";
export const runtime = "edge"; export const dynamic = "force-dynamic";
export async function GET() {
  return NextResponse.json({ ok: true, classes: await listClasses(), packs: await listPacks() }, { headers: { "Cache-Control": "no-store" } });
}
export async function OPTIONS() { return new NextResponse(null, { status: 204, headers: { Allow: "GET, OPTIONS" } }); }
