"use client";

/**
 * FrontHero — agent-first primary surface for Studio Flow.
 * Per skill v1.18 ref 37: home `/` first viewport IS the concierge.
 * Sienna runs a 5-question screen for new visitors.
 */

import { useEffect, useRef, useState } from "react";
import { trackEvent } from "@/components/analytics/TrackingPixel";

type Msg = { role: "user" | "assistant"; content: string };

const WELCOME: Msg = {
  role: "assistant",
  content:
    "I'm Sienna. New here? I'll ask five quick questions and find the right class. Or ask me anything — schedule, prices, instructors, what fits a sore back.",
};

const PROMPTS = [
  "I'm new — help me find my first class",
  "I'm pregnant, second trimester",
  "Returning after a knee injury",
  "What's the next Slow Hatha?",
];

export function FrontHero() {
  const [messages, setMessages] = useState<Msg[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [opened, setOpened] = useState(false);
  const transcriptIdRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (opened) messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, opened]);

  function pick(text: string) {
    trackEvent("prompt_click", { label: text, source: "hero" });
    void send(text);
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    if (!opened) {
      setOpened(true);
      trackEvent("front_open", { source: "hero" });
    }
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
      const escalated = /(consult|portfolio@concierge|send.*email|reach out|i don't know|book_consult)/.test(lo);
      const hadAnswer = j.ok !== false && reply.length > 0 && !escalated;
      trackEvent("front_question", {
        text: trimmed.slice(0, 200),
        had_answer: hadAnswer ? 1 : 0,
        source: "hero",
      });
      if (!hadAnswer)
        trackEvent("front_no_answer", { text: trimmed.slice(0, 200), source: "hero", fallback_kind: escalated ? "escalation" : "empty" });
    } catch (e) {
      setMessages((p) => [
        ...p,
        { role: "assistant", content: "I couldn't reach the model. Send your details to portfolio@concierge.studio and I'll come back to you." },
      ]);
      trackEvent("front_question", { text: trimmed.slice(0, 200), had_answer: 0, source: "hero" });
      trackEvent("front_no_answer", { text: trimmed.slice(0, 200), source: "hero", fallback_kind: "fetch_error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="concierge" aria-label="Talk to Sienna, the Studio Flow concierge" className="front-hero">
      <div className="front-hero-inner">
        <p className="eyebrow">Studio Flow · Valletta</p>
        <h1 className="front-hero-headline">
          Tell Sienna what's going on.
          <span className="front-hero-sub">
            Yoga, pilates, and breathwork in Valletta. The studio that asks
            what's wrong before it asks what you want. Sienna is the founder
            and the concierge here — she'll screen you for injury and
            pregnancy, then pick a class. Scroll if you'd rather browse.
          </span>
        </h1>

        <div className="front-hero-thread" aria-live="polite">
          {messages.map((m, i) => (
            <div key={i} className={`front-hero-msg ${m.role === "user" ? "is-user" : "is-asst"}`}>
              {m.content}
            </div>
          ))}
          {busy && <div className="front-hero-msg is-asst is-busy">…</div>}
          <div ref={messagesEndRef} />
        </div>

        {!opened && (
          <div className="front-hero-prompts" role="list">
            {PROMPTS.map((p) => (
              <button key={p} type="button" className="front-hero-chip" onClick={() => pick(p)}>{p}</button>
            ))}
          </div>
        )}

        <form className="front-hero-form" onSubmit={(e) => { e.preventDefault(); void send(input); }}>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Sienna about classes, instructors, schedule…"
            disabled={busy}
            aria-label="Message Sienna"
            className="front-hero-input"
            autoComplete="off"
          />
          <button type="submit" disabled={busy || !input.trim()} className="btn btn-primary">Send →</button>
        </form>

        <div className="front-hero-foot">
          <a href="#schedule" className="front-hero-browse">Or see today's schedule ↓</a>
          <span className="front-hero-foot-sep">·</span>
          <span className="front-hero-foot-note">
            Concept site by{" "}
            <a href="https://concierge.studio" target="_blank" rel="noreferrer">concierge.studio</a> · checkout disabled
          </span>
        </div>
      </div>
    </section>
  );
}
