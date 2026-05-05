import { NextResponse } from "next/server";
import { listClasses, listPacks } from "@/lib/classes/store";
export const runtime = "edge"; export const dynamic = "force-dynamic";
export async function GET() {
  const [classes, packs] = await Promise.all([listClasses(), listPacks()]);
  return NextResponse.json({ ok: true, classes, packs });
}
export async function OPTIONS() { return new NextResponse(null, { status: 204, headers: { Allow: "GET, OPTIONS" } }); }
