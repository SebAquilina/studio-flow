import { NextResponse } from "next/server";
import { listInstructors } from "@/lib/instructors/store";
export const runtime = "edge"; export const dynamic = "force-dynamic";
export async function GET() { return NextResponse.json({ ok: true, instructors: await listInstructors() }); }
export async function OPTIONS() { return new NextResponse(null, { status: 204, headers: { Allow: "GET, OPTIONS" } }); }
