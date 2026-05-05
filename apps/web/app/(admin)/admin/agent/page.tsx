import { SYSTEM_PROMPT } from "@/lib/agent/system-prompt";
import { KB } from "@/lib/agent/kb";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default function AgentPage() {
  return (
    <>
      <header className="admin-header"><h1>Concierge persona</h1></header>
      <p className="muted">
        On the Starter tier, Lina&rsquo;s persona + KB are source-controlled.
        Edit <code>lib/agent/system-prompt.ts</code> and <code>lib/agent/kb.ts</code> in
        the repo, push, and the next deploy applies it. The vocabulary smoke test
        (skill ref 26) gates every PR.
      </p>
      <section className="admin-card">
        <h2 style={{ marginTop: 0 }}>System prompt (read-only)</h2>
        <pre style={{ whiteSpace: "pre-wrap", fontFamily: "var(--font-mono)", fontSize: "0.78rem", background: "var(--color-bg)", padding: "var(--space-4)", borderRadius: "var(--radius-sm)", overflow: "auto", maxHeight: 380 }}>
          {SYSTEM_PROMPT}
        </pre>
      </section>
      <section className="admin-card">
        <h2 style={{ marginTop: 0 }}>Knowledge base (read-only)</h2>
        <pre style={{ whiteSpace: "pre-wrap", fontFamily: "var(--font-mono)", fontSize: "0.78rem", background: "var(--color-bg)", padding: "var(--space-4)", borderRadius: "var(--radius-sm)", overflow: "auto", maxHeight: 380 }}>
          {KB}
        </pre>
      </section>
    </>
  );
}
