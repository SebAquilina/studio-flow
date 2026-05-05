import { NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// Sentinel for the Phase 6 audit (skill ref 19) — never returns 405.
// audit.ts uses this to verify the agent route exists without firing
// a real Gemini call.
export async function POST() {
  return NextResponse.json({ ok: true, probe: true });
}

export async function GET() {
  return NextResponse.json({ ok: true, probe: true });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: { Allow: "GET, POST, OPTIONS" } });
}
