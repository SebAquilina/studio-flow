import { NextResponse } from "next/server";
import { Resend } from "resend";
import { LeadInput, createLead } from "@/lib/leads/store";
import { limit, clientIp } from "@/lib/rate-limit";
import { revalidatePaths } from "@/lib/revalidate-map";

export const runtime = "edge";

function getEnv(k: string): string | undefined {
  const g = globalThis as unknown as Record<string, unknown>;
  return (typeof g[k] === "string" ? g[k] as string : undefined) ?? process.env[k];
}

export async function POST(req: Request) {
  // Body cap (skill ref 30)
  const cl = Number(req.headers.get("content-length") || 0);
  if (cl > 32 * 1024) {
    return NextResponse.json({ ok: false, error: "payload_too_large" }, { status: 413 });
  }
  // Rate limit
  const ip = clientIp(req.headers);
  const rl = limit(`leads:${ip}`, 5, 3600);
  if (!rl.ok) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } });
  }

  const ct = req.headers.get("content-type") || "";
  let payload: Record<string, unknown> = {};
  try {
    if (ct.includes("application/json")) {
      payload = await req.json();
    } else {
      const fd = await req.formData();
      payload = Object.fromEntries(fd.entries());
    }
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  // Honeypot
  if (typeof payload.website === "string" && payload.website.length > 0) {
    return NextResponse.redirect(new URL("/?ok=1#book", req.url), 303);
  }

  const consentRaw = payload.consent;
  const consent = consentRaw === "true" || consentRaw === "on" || consentRaw === true;

  const draft = {
    name: String(payload.name || ""),
    email: String(payload.email || ""),
    business: payload.business ? String(payload.business) : undefined,
    business_url: payload.business_url ? String(payload.business_url) : undefined,
    project_type: String(payload.project_type || "other"),
    when_label: String(payload.when_label || "exploring"),
    brief: payload.brief ? String(payload.brief) : undefined,
    source: "form" as const,
    consent,
    cc_cid: typeof payload.cc_cid === "string" ? payload.cc_cid : undefined,
  };

  const parsed = LeadInput.safeParse(draft);
  if (!parsed.success) {
    return NextResponse.redirect(new URL("/?error=missing_fields#book", req.url), 303);
  }
  if (!parsed.data.consent) {
    return NextResponse.redirect(new URL("/?error=consent_required#book", req.url), 303);
  }

  const result = await createLead(parsed.data, {
    ip: req.headers.get("cf-connecting-ip") || undefined,
    ua: req.headers.get("user-agent") || undefined,
  });

  // Bind active analytics session to this lead (best-effort)
  if (parsed.data.cc_cid) {
    try {
      const { bindSessionToLead } = await import("@/lib/analytics/track");
      const db = ((process.env as unknown as { DB?: D1Database }).DB ??
        (globalThis as unknown as { DB?: D1Database }).DB) as D1Database | undefined;
      if (db) await bindSessionToLead(db, parsed.data.cc_cid, result.id);
    } catch (e) {
      console.warn("[leads] bind session failed:", (e as Error).message);
    }
  }

  // Resend best-effort
  const resendKey = getEnv("RESEND_API_KEY");
  if (resendKey) {
    try {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: "Studio Vella <hello@mail.concierge.studio>",
        to: "portfolio@concierge.studio",
        replyTo: parsed.data.email,
        subject: `[Studio Vella] ${parsed.data.name} — ${parsed.data.project_type}`,
        text: [
          `Name: ${parsed.data.name}`,
          `Email: ${parsed.data.email}`,
          `Project: ${parsed.data.project_type}`,
          `When: ${parsed.data.when_label}`,
          `Brief: ${parsed.data.brief ?? "(none)"}`,
          `Lead id: ${result.id}`,
        ].join("\n"),
      });
    } catch (e) {
      console.warn("[leads] resend failed:", (e as Error).message);
    }
  }

  revalidatePaths("lead.create");

  return NextResponse.redirect(new URL("/?ok=1&id=" + result.id + "#book", req.url), 303);
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: { Allow: "POST, OPTIONS" } });
}
