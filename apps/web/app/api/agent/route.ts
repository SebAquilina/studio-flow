import { NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/agent/system-prompt";
import { KB } from "@/lib/agent/kb";
import { limit, clientIp } from "@/lib/rate-limit";

export const runtime = "edge";
function jsonNoStore(body: unknown, init?: { status?: number }) {
  return NextResponse.json(body, {
    status: init?.status,
    headers: { "Cache-Control": "no-store" },
  });
}


function getEnv(k: string): string | undefined {
  const g = globalThis as unknown as Record<string, unknown>;
  return (typeof g[k] === "string" ? g[k] as string : undefined) ?? process.env[k];
}

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";

export async function POST(req: Request) {
  const cl = Number(req.headers.get("content-length") || 0);
  if (cl > 64 * 1024) return jsonNoStore({ ok: false, error: "payload_too_large" }, { status: 413 });
  const ip = clientIp(req.headers);
  const rl = limit(`agent:${ip}`, 10, 60);
  if (!rl.ok) return jsonNoStore({ ok: false, error: "rate_limited" }, { status: 429 });

  const apiKey = getEnv("GEMINI_API_KEY");
  if (!apiKey) {
    return jsonNoStore({
      ok: false,
      content: "I'm offline right now — drop me an email at portfolio@concierge.studio and I'll get back to you.",
    });
  }

  let body: { messages?: Array<{ role: string; content: string }>; transcript_id?: string };
  try { body = await req.json(); } catch { return jsonNoStore({ ok: false, error: "bad_json" }, { status: 400 }); }
  const messages = (body.messages || []).slice(-32);
  const promptText = SYSTEM_PROMPT.replace("[KB inserted at runtime]", KB);
  const contents = [
    { role: "user", parts: [{ text: promptText }] },
    { role: "model", parts: [{ text: "Understood. I'm Lina." }] },
    ...messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
  ];
  try {
    const r = await fetch(`${ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: { temperature: 0.4, maxOutputTokens: 200, topP: 0.9 },
      }),
    });
    if (!r.ok) {
      const t = await r.text().catch(() => "");
      console.warn("[agent] gemini error", r.status, t.slice(0, 200));
      return jsonNoStore({
        ok: false,
        content: "I'm slower than usual. Try again in a moment, or send your details to portfolio@concierge.studio.",
      });
    }
    const j = (await r.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    const text = j.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("").trim() ?? "";
    return jsonNoStore({ ok: true, content: text, transcript_id: body.transcript_id });
  } catch (e) {
    console.error("[agent] failed", e);
    return jsonNoStore({ ok: false, content: "Connection error. Try again or email portfolio@concierge.studio." });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: { Allow: "POST, OPTIONS" } });
}
