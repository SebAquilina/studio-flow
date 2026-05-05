import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: [
    // Match all routes except API + static assets — apply security headers
    "/((?!api|_next/static|_next/image|favicon|apple-touch|og-default|brand|work|oils|_headers|robots\\.txt|sitemap\\.xml).*)",
  ],
};

function unauth() {
  return new NextResponse("Unauthorized", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="admin"', "Cache-Control": "no-store" },
  });
}
function tseq(a: string, b: string) {
  if (a.length !== b.length) {
    let acc = 1;
    for (let i = 0; i < Math.max(a.length, b.length); i++) acc |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
    return false;
  }
  let acc = 0;
  for (let i = 0; i < a.length; i++) acc |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return acc === 0;
}
function getEnv(k: string): string | undefined {
  const g = globalThis as unknown as Record<string, unknown>;
  return (typeof g[k] === "string" ? g[k] as string : undefined) ?? process.env[k];
}

function withSecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
  return res;
}

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Admin auth gate
  if (path.startsWith("/admin")) {
    const u = getEnv("ADMIN_USER");
    const p = getEnv("ADMIN_PASSWORD");
    if (!u || !p) return unauth();
    const auth = req.headers.get("authorization");
    if (!auth?.startsWith("Basic ")) return unauth();
    let decoded: string;
    try { decoded = atob(auth.slice("Basic ".length)); } catch { return unauth(); }
    const i = decoded.indexOf(":");
    if (i < 0) return unauth();
    const user = decoded.slice(0, i);
    const pass = decoded.slice(i + 1);
    if (!(tseq(user, u) && tseq(pass, p))) return unauth();
  }

  return withSecurityHeaders(NextResponse.next());
}
