export const dynamic = "force-static";

import { PrivacyRequestForm } from "@/components/site/PrivacyRequestForm";

export const runtime = "edge";

export const metadata = { title: "Privacy", alternates: { canonical: "/privacy" } };

const PROCESSORS = [
  { name: "Cloudflare", role: "Hosting (Pages, D1, KV)", region: "EU + global edge", data: "page requests, D1 rows, KV dead-letter, hashed IPs" },
  { name: "Google AI (Gemini Flash-Lite)", role: "Concierge agent inference", region: "USA", data: "your message text + transcript ID; no name or email unless you typed it" },
  { name: "Resend", role: "Email delivery", region: "USA", data: "to/from/subject/body of the lead-notification email" },
];

const RETENTION = [
  { dataset: "leads (D1)", window: "18 months from last contact", action: "anonymise on request via DSAR" },
  { dataset: "transcript_messages (D1)", window: "12 months", action: "purge on request" },
  { dataset: "analytics_pageviews / events", window: "90 days, then aggregated", action: "no PII; daily-rotating salt on IP hash" },
  { dataset: "DEAD_LETTER (KV)", window: "7 days", action: "auto-expire" },
  { dataset: "audit_log", window: "13 months", action: "operator records only; never deleted" },
];

export default function PrivacyPage() {
  return (
    <section>
      <div className="container container--narrow">
        <p className="eyebrow">privacy</p>
        <h1>Privacy policy</h1>
        <p className="muted">
          Studio Vella is a concept site by concierge.studio. The data controller is
          concierge.studio (sole trader, Malta). Last reviewed 2026-05-04.
        </p>

        <h2>What we collect</h2>
        <p>
          Only what you give us via the contact form (name, email, project type,
          notes, consent flag), what you say to Lina (the agent transcript), and
          anonymous analytics — pageviews, prompt clicks, agent answer/no-answer
          events. IPs are SHA-256 hashed with a daily-rotating salt before storage.
        </p>

        <h2>Why we collect it</h2>
        <p>
          To reply to you. To know whether the concierge is doing its job (the
          no-answer rate). To stop spam (rate limit on the lead form).
        </p>

        <h2>Processors</h2>
        <table className="rates-table" aria-label="Subprocessors">
          <thead>
            <tr><th>Processor</th><th>Role</th><th>Region</th><th>Data</th></tr>
          </thead>
          <tbody>
            {PROCESSORS.map((p) => (
              <tr key={p.name}><th>{p.name}</th><td>{p.role}</td><td>{p.region}</td><td className="muted">{p.data}</td></tr>
            ))}
          </tbody>
        </table>

        <h2>Retention</h2>
        <table className="rates-table" aria-label="Retention windows">
          <thead>
            <tr><th>Dataset</th><th>Window</th><th>Deletion path</th></tr>
          </thead>
          <tbody>
            {RETENTION.map((r) => (
              <tr key={r.dataset}><th>{r.dataset}</th><td>{r.window}</td><td className="muted">{r.action}</td></tr>
            ))}
          </tbody>
        </table>

        <h2>Your rights (GDPR + Malta DPA)</h2>
        <p>
          You can ask us to <strong>export</strong> or <strong>delete</strong>
          everything we hold about you. Use the form below — we respond within
          30 days. If you'd rather, email{" "}
          <a href="mailto:portfolio@concierge.studio">portfolio@concierge.studio</a>{" "}
          and we'll do it manually.
        </p>

        <h2>Data subject access request</h2>
        <PrivacyRequestForm />

        <p className="muted" style={{ marginTop: "var(--space-6)" }}>
          Studio Vella is a portfolio piece — no goods or services are sold. The
          contact form lands at a real inbox, but no payment data is ever
          collected on this site.
        </p>
      </div>
    </section>
  );
}
