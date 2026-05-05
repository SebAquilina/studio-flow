import { notFound } from "next/navigation";
import { getLead } from "@/lib/leads/store";
import { listTags, listNotes, leadClientId } from "@/lib/customer/store";
import { customerTimeline } from "@/lib/analytics/queries";
import { CustomerTimeline } from "@/components/admin/CustomerTimeline";
import { CustomerTagsAndNotes } from "@/components/admin/CustomerTagsAndNotes";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function LeadDetail({ params }: { params: { id: string } }) {
  const lead = await getLead(params.id);
  if (!lead) notFound();

  const db = ((process.env as unknown as { DB?: D1Database }).DB ??
    (globalThis as unknown as { DB?: D1Database }).DB) as D1Database | undefined;
  const [tags, notes, clientId] = await Promise.all([
    listTags(params.id).catch(() => []),
    listNotes(params.id).catch(() => []),
    leadClientId(params.id).catch(() => null),
  ]);
  const timeline = db ? await customerTimeline(db, params.id, clientId) : [];

  return (
    <>
      <header className="admin-header">
        <h1>{String(lead.name)}</h1>
        <span className={`badge badge--${lead.status}`}>{String(lead.status)}</span>
      </header>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "var(--space-7)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
          <section className="admin-card">
            <h2 style={{ marginTop: 0 }}>Customer</h2>
            <dl style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: "0.6rem 1.5rem", margin: 0 }}>
              <dt className="muted">Email</dt><dd><a href={`mailto:${lead.email}`}>{String(lead.email)}</a></dd>
              <dt className="muted">Project type</dt><dd>{String(lead.project_type ?? "—")}</dd>
              <dt className="muted">When</dt><dd>{String(lead.when_label ?? "—")}</dd>
              <dt className="muted">Source</dt><dd>{String(lead.source)}</dd>
              <dt className="muted">Brief</dt><dd style={{ whiteSpace: "pre-wrap" }}>{String(lead.brief ?? "(none)")}</dd>
              <dt className="muted">Received</dt><dd>{new Date(Number(lead.created_at)).toLocaleString()}</dd>
            </dl>
          </section>

          <section className="admin-card">
            <h2 style={{ marginTop: 0 }}>Timeline</h2>
            <p className="muted" style={{ fontSize: "0.85em", marginTop: 0 }}>
              Every touchpoint with this person — pipeline events, concierge conversations, page views, discrete events.
            </p>
            <CustomerTimeline rows={timeline} />
          </section>
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
          <section className="admin-card">
            <h2 style={{ marginTop: 0, fontSize: "1.05em" }}>Tags &amp; notes</h2>
            <CustomerTagsAndNotes leadId={params.id} initialTags={tags} initialNotes={notes} />
          </section>
        </aside>
      </div>
    </>
  );
}
