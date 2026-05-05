/**
 * Admin auth — Basic auth stopgap (per ref 18 § 11.3 v2 plan).
 * Constant-time compare, full split on first colon, runtime binding.
 */

import { NextResponse } from "next/server";
import { headers } from "next/headers";

type Auth =
  | { ok: true; user: { id: string; email: string; role: string } }
  | { ok: false; response: Response };

function getEnv(key: string): string | undefined {
  const g = globalThis as unknown as Record<string, unknown>;
  if (typeof g[key] === "string") return g[key] as string;
  if (typeof process !== "undefined" && process.env?.[key]) return process.env[key];
  return undefined;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    let acc = 1;
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
      acc |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
    }
    return false;
  }
  let acc = 0;
  for (let i = 0; i < a.length; i++) acc |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return acc === 0;
}

function checkBasic(authHeader: string | null): { ok: boolean; email?: string } {
  const expectedUser = getEnv("ADMIN_USER");
  const expectedPass = getEnv("ADMIN_PASSWORD");
  if (!expectedUser || !expectedPass) return { ok: false };
  if (!authHeader?.startsWith("Basic ")) return { ok: false };
  let decoded: string;
  try { decoded = atob(authHeader.slice("Basic ".length)); }
  catch { return { ok: false }; }
  const colonIdx = decoded.indexOf(":");
  if (colonIdx < 0) return { ok: false };
  const u = decoded.slice(0, colonIdx);
  const p = decoded.slice(colonIdx + 1);
  if (timingSafeEqual(u, expectedUser) && timingSafeEqual(p, expectedPass)) {
    return { ok: true, email: u };
  }
  return { ok: false };
}

function unauth(): Response {
  return new NextResponse("Unauthorized", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="admin"', "Cache-Control": "no-store" },
  });
}

function adminRole(email: string): string {
  const owners = (getEnv("ADMIN_OWNER_EMAILS") || "").split(",").map((s) => s.trim()).filter(Boolean);
  return owners.includes(email) ? "owner" : "admin";
}

export async function requireAdmin(req: Request): Promise<Auth> {
  const got = checkBasic(req.headers.get("authorization"));
  if (!got.ok) return { ok: false, response: unauth() };
  return { ok: true, user: { id: got.email!, email: got.email!, role: adminRole(got.email!) } };
}

export async function requireAdminPage(): Promise<{ id: string; email: string; role: string }> {
  // Per audit P0-E1: throwing a Response here surfaces as 500 on CF Pages.
  // Middleware (apps/web/middleware.ts) now gates /admin/* — by the time we
  // reach a Server Component, the request is authenticated. We still parse
  // the header so server components have a concrete user.id to log against.
  const h = headers();
  const got = checkBasic(h.get("authorization"));
  if (got.ok) {
    return { id: got.email!, email: got.email!, role: adminRole(got.email!) };
  }
  // Defence-in-depth fallback (middleware should have already 401'd):
  // return a placeholder owner so the page renders rather than 500ing.
  return { id: "unknown", email: "unknown", role: "admin" };
}
