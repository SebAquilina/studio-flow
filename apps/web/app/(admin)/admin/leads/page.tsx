import Link from "next/link";
import { listLeads } from "@/lib/leads/store";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export default async function LeadsInbox() {
  const leads = await listLeads().catch(() => []);
  return (
    <>
      <header className="admin-header">
        <h1>Leads</h1>
        <span className="muted">{leads.length} total</span>
      </header>
      {leads.length === 0 ? (
        <p className="muted">No leads yet. Submit the public contact form from another tab to test.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Project</th>
              <th>When</th>
              <th>Status</th>
              <th>Received</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={String(l.id)}>
                <td>{String(l.name)}</td>
                <td><a href={`mailto:${l.email}`}>{String(l.email)}</a></td>
                <td>{String(l.project_type ?? "—")}</td>
                <td>{String(l.when_label ?? "—")}</td>
                <td><span className={`badge badge--${l.status}`}>{String(l.status)}</span></td>
                <td className="muted">{new Date(Number(l.created_at)).toLocaleString()}</td>
                <td><Link href={`/admin/leads/${l.id}`}>Open →</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
