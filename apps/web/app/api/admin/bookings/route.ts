import { NextResponse } from "next/server";
import { listBookings } from "@/lib/sessions/store";
export const runtime = "edge"; export const dynamic = "force-dynamic";
export async function GET() { return NextResponse.json({ ok: true, bookings: await listBookings() }); }
export async function OPTIONS() { return new NextResponse(null, { status: 204, headers: { Allow: "GET, OPTIONS" } }); }
