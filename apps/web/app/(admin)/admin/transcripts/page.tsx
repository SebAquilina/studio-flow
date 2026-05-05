import Link from "next/link";
import type { D1Database } from "@cloudflare/workers-types";

export const runtime = "edge";
export const dynamic = "force-dynamic";

function db(): D1Database | null {
  const env = process.env as unknown as { DB?: D1Database };
  const g = globalThis as unknown as { DB?: D1Database };
  return env.DB ?? g.DB ?? null;
}

type TranscriptRow = {
  id: string;
  started_at: number | string | null;
  ended_at: number | string | null;
  message_count: number | null;
  escalated: number | null;
  lead_id: string | null;
};

type MessagePreview = {
  transcript_id: string;
  role: string;
  content: string;
  created_at: number;
};

function fmt(ts: number | string | null) {
  if (!ts) return "—";
  const n = typeof ts === "string" ? Date.parse(ts) : Number(ts);
  if (!Number.isFinite(n) || n <= 0) return String(ts);
  return new Date(n).toLocaleString("en-MT", { dateStyle: "medium", timeStyle: "short" });
}

export default async function TranscriptsPage() {
  const d = db();
  let transcripts: TranscriptRow[] = [];
  let firstMessages: Record<string, MessagePreview> = {};
  let totalRows = 0;

  if (d) {
    try {
      const r = await d
        .prepare(
          `SELECT id, started_at, ended_at, message_count, escalated, lead_id
           FROM transcripts ORDER BY started_at DESC LIMIT 100`,
        )
        .all<TranscriptRow>();
      transcripts = r.results ?? [];
      totalRows = transcripts.length;
    } catch { /* table may not exist on first deploy */ }

    if (transcripts.length > 0) {
      try {
        const ids = transcripts.map((t) => `'${String(t.id).replace(/'/g, "''")}'`).join(",");
        const m = await d
          .prepare(
            `SELECT transcript_id, role, content, created_at
             FROM transcript_messages
             WHERE transcript_id IN (${ids})
             AND role = 'user'
             ORDER BY created_at ASC`,
          )
          .all<MessagePreview>();
        for (const row of m.results ?? []) {
          if (!firstMessages[row.transcript_id]) firstMessages[row.transcript_id] = row;
        }
      } catch { /* messages table optional */ }
    }
  }

  return (
    <>
      <header className="admin-header">
        <div>
          <h1>Conversations</h1>
          <p className="muted">
            Every Lina session, newest first. Bound leads link through to the lead detail.
          </p>
        </div>
        <div className="muted">{totalRows} transcripts (last 100)</div>
      </header>

      {totalRows === 0 ? (
        <div className="admin-card">
          <p className="muted" style={{ margin: 0 }}>
            No transcripts yet. They populate as visitors talk to Lina from the FrontHero or the floating launcher.
          </p>
        </div>
      ) : (
        <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Started</th>
                <th>Ended</th>
                <th>Msgs</th>
                <th>Escalated</th>
                <th>First user message</th>
                <th>Bound lead</th>
              </tr>
            </thead>
            <tbody>
              {transcripts.map((t) => {
                const fm = firstMessages[t.id];
                return (
                  <tr key={t.id}>
                    <td>{fmt(t.started_at)}</td>
                    <td className="muted">{fmt(t.ended_at)}</td>
                    <td>{t.message_count ?? 0}</td>
                    <td>
                      {t.escalated ? (
                        <span className="badge badge--qualified">yes</span>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                    <td className="muted" style={{ maxWidth: 360, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {fm?.content?.slice(0, 120) ?? "—"}
                    </td>
                    <td>
                      {t.lead_id ? (
                        <Link href={`/admin/leads/${t.lead_id}`}>{t.lead_id.slice(0, 18)}…</Link>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
