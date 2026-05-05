export const runtime = "edge";
export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return (
    <>
      <header className="admin-header"><h1>Settings</h1></header>
      <section className="admin-card">
        <h2 style={{ marginTop: 0 }}>Email routing</h2>
        <p className="muted">All contact-form submissions land at:</p>
        <p><code>portfolio@concierge.studio</code></p>
        <p className="muted" style={{ fontSize: "0.9em" }}>
          (Concept-site fixed routing — the spec mandates this for the portfolio.
          To change for a real client build, edit <code>app/api/leads/route.ts</code>.)
        </p>
      </section>
      <section className="admin-card">
        <h2 style={{ marginTop: 0 }}>Voice charter</h2>
        <ul style={{ paddingLeft: "1.4rem" }}>
          <li>First person (&ldquo;I&rdquo;), never &ldquo;we.&rdquo;</li>
          <li>No exclamation marks. Anywhere.</li>
          <li>Specific over poetic.</li>
        </ul>
        <p className="muted">Banned vocabulary:</p>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.85em" }}>
          passion, lovingly, journey, premium, experience as verb, stunning, elevate, capture as marketing verb, bespoke, curated, exclusive
        </p>
      </section>
    </>
  );
}
