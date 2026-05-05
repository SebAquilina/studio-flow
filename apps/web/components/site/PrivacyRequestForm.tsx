"use client";

import { useState } from "react";

export function PrivacyRequestForm() {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<null | { ok: boolean; msg: string }>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setDone(null);
    const fd = new FormData(e.currentTarget);
    const body = {
      action: String(fd.get("action") || ""),
      email: String(fd.get("email") || ""),
      reason: String(fd.get("reason") || ""),
    };
    try {
      const res = await fetch("/api/privacy/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = (await res.json()) as { ok?: boolean; msg?: string };
      setDone({ ok: !!j.ok, msg: j.msg || (j.ok ? "Got it. We'll respond within 30 days." : "Something went wrong.") });
    } catch (err) {
      setDone({ ok: false, msg: "Network error — email portfolio@concierge.studio instead." });
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <p className={done.ok ? "" : "muted"} role="status">
        {done.msg}
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="form-grid" aria-label="Data subject access request">
      <div className="form-row">
        <label>
          What do you want?
          <select name="action" required defaultValue="">
            <option value="" disabled>Choose one…</option>
            <option value="export">Export everything you have on me</option>
            <option value="delete">Delete everything you have on me</option>
            <option value="correct">Correct what you have on me</option>
          </select>
        </label>
      </div>
      <div className="form-row">
        <label>
          Email you used
          <input type="email" name="email" required autoComplete="email" />
        </label>
      </div>
      <div className="form-row">
        <label>
          Anything we should know? <span className="muted">(optional)</span>
          <textarea name="reason" rows={3} />
        </label>
      </div>
      <button type="submit" className="btn btn-primary" disabled={busy}>
        {busy ? "Sending…" : "Send request →"}
      </button>
      <p className="muted" style={{ fontSize: "0.85rem" }}>
        We respond within 30 days. If we can't reach you at this email, we'll reply to the same address you wrote in.
      </p>
    </form>
  );
}
