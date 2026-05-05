"use client";

import { useEffect, useRef, useState } from "react";
import { trackEvent } from "@/components/analytics/TrackingPixel";

type Msg = { role: "user" | "assistant"; content: string };

const WELCOME: Msg = {
  role: "assistant",
  content: "I'm Lina. Ask me about rates, scope, or availability — or pick one below."
};

const PROMPTS = [
  "How much for a 4-room apartment in St Julian's?",
  "We're a 12-room hotel. What package?",
  "Can you shoot our wedding next August?",
];

export function Front() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const transcriptIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  function open_() {
    trackEvent("front_open", { source: "launcher" });
    setOpen(true);
  }

  function clickPrompt(text: string) {
    trackEvent("prompt_click", { label: text });
    trackEvent("front_open", { source: "prompt" });
    setOpen(true);
    void send(text);
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    if (!transcriptIdRef.current) transcriptIdRef.current = crypto.randomUUID();
    const next: Msg[] = [...messages, { role: "user", content: trimmed }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: next.filter((m) => m !== WELCOME),
          transcript_id: transcriptIdRef.current,
        }),
      });
      const j = (await res.json()) as { ok?: boolean; content?: string };
      const reply = j.content || "I'm slower than usual — give me a moment, or send your details to portfolio@concierge.studio.";
      setMessages((p) => [...p, { role: "assistant", content: reply }]);
      const lo = reply.toLowerCase();
      const escalated = /(i don't know|i'm not sure|i can't answer|let me get someone|reach out|send.*email|portfolio@concierge|tom borg|sarah cassar)/.test(lo);
      const hadAnswer = j.ok !== false && reply.length > 0 && !escalated;
      trackEvent("front_question", { text: trimmed.slice(0, 200), had_answer: hadAnswer ? 1 : 0 });
      if (!hadAnswer) trackEvent("front_no_answer", { text: trimmed.slice(0, 200), fallback_kind: escalated ? "escalation" : "empty" });
    } catch (e) {
      setMessages((p) => [...p, { role: "assistant", content: "I couldn't reach the model. Send your project details to portfolio@concierge.studio and I'll get back to you." }]);
      trackEvent("front_question", { text: trimmed.slice(0, 200), had_answer: 0 });
      trackEvent("front_no_answer", { text: trimmed.slice(0, 200), fallback_kind: "fetch_error", error: (e as Error).message.slice(0, 80) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {open && (
        <div role="dialog" aria-label="Talk to Lina" style={panelStyle}>
          <header style={panelHeader}>
            <strong style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}>Lina</strong>
            <button onClick={() => setOpen(false)} aria-label="Close" style={closeBtn}>×</button>
          </header>
          <div style={messagesArea}>
            {messages.map((m, i) => (
              <div key={i} style={{ ...msgStyle, ...(m.role === "user" ? userMsg : asstMsg) }}>
                {m.content}
              </div>
            ))}
            {busy && <div style={{ ...msgStyle, ...asstMsg }}>…</div>}
            <div ref={messagesEndRef} />
          </div>
          {messages.length === 1 && (
            <div style={{ padding: "0 12px 8px", display: "flex", flexDirection: "column", gap: 4 }}>
              {PROMPTS.map((p) => (
                <button key={p} onClick={() => clickPrompt(p)} style={promptBtn}>{p}</button>
              ))}
            </div>
          )}
          <form onSubmit={(e) => { e.preventDefault(); void send(input); }} style={inputForm}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask Lina…" disabled={busy} aria-label="Message Lina" style={inputBox} />
            <button type="submit" disabled={busy || !input.trim()} className="btn btn-primary btn-sm">Send</button>
          </form>
        </div>
      )}
      {!open && (
        <button onClick={open_} aria-label="Talk to Lina" style={launcherStyle}>
          L<span style={{ fontStyle: "italic" }}>.</span>
        </button>
      )}
    </>
  );
}

const launcherStyle: React.CSSProperties = {
  position: "fixed", bottom: 24, right: 24, zIndex: 50,
  width: 56, height: 56, borderRadius: "50%",
  background: "var(--color-accent)", color: "white",
  border: "none", cursor: "pointer",
  fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 500,
  boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
};
const panelStyle: React.CSSProperties = {
  position: "fixed", bottom: 24, right: 24, zIndex: 51,
  width: 380, maxWidth: "calc(100vw - 32px)", height: 540, maxHeight: "85vh",
  background: "var(--color-surface)", borderRadius: "var(--radius-lg)",
  boxShadow: "0 20px 50px rgba(0,0,0,0.22)",
  display: "flex", flexDirection: "column", overflow: "hidden",
};
const panelHeader: React.CSSProperties = {
  padding: "12px 16px",
  borderBottom: "1px solid var(--color-line)",
  display: "flex", justifyContent: "space-between", alignItems: "center",
};
const closeBtn: React.CSSProperties = { background: "transparent", border: "none", fontSize: 24, color: "var(--color-ink-muted)", cursor: "pointer", padding: 0, lineHeight: 1 };
const messagesArea: React.CSSProperties = { flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 10 };
const msgStyle: React.CSSProperties = { padding: "8px 12px", borderRadius: 12, maxWidth: "82%", fontSize: "0.92rem", lineHeight: 1.45 };
const userMsg: React.CSSProperties = { alignSelf: "flex-end", background: "var(--color-accent)", color: "white" };
const asstMsg: React.CSSProperties = { alignSelf: "flex-start", background: "var(--color-bg)", color: "var(--color-ink)", border: "1px solid var(--color-line)" };
const promptBtn: React.CSSProperties = { textAlign: "left", background: "var(--color-bg)", border: "1px solid var(--color-line)", borderRadius: 6, padding: "8px 10px", fontSize: "0.85rem", cursor: "pointer", color: "var(--color-ink)" };
const inputForm: React.CSSProperties = { padding: 12, borderTop: "1px solid var(--color-line)", display: "flex", gap: 8 };
const inputBox: React.CSSProperties = { flex: 1, padding: "8px 10px", border: "1px solid var(--color-line-strong)", borderRadius: "var(--radius-sm)", fontFamily: "var(--font-sans)", fontSize: "0.95rem" };
