import Link from "next/link";
import { listBookings } from "@/lib/sessions/store";
export const runtime = "edge"; export const dynamic = "force-dynamic";

export default async function BookingsAdmin() {
  const rows = await listBookings();
  return (
    <>
      <header className="admin-header"><div><h1>Bookings</h1><p className="muted">{rows.length} bookings (last 200). Status: requested = awaiting confirmation. Concept site — no payment is taken.</p></div></header>
      {rows.length === 0 ? (
        <div className="admin-card"><p className="muted">No bookings yet. They populate as visitors ask Sienna to hold a class.</p></div>
      ) : (
        <div className="admin-card" style={{ padding: 0 }}>
          <table className="admin-table">
            <thead><tr><th>When</th><th>Class</th><th>Instructor</th><th>Name</th><th>Email</th><th>Pack</th><th>Status</th></tr></thead>
            <tbody>{rows.map((b) => (
              <tr key={String(b.id)}>
                <td className="muted">{b.starts_at ? new Date(String(b.starts_at)).toLocaleString("en-MT") : "—"}</td>
                <td>{String(b.class_slug ?? "—")}</td>
                <td>{String(b.instructor_slug ?? "—")}</td>
                <td>{String(b.name ?? "—")}</td>
                <td className="muted">{String(b.email ?? "—")}</td>
                <td>{String(b.pack_slug ?? "—")}</td>
                <td><span className={`badge badge--${b.status === "confirmed" ? "won" : "qualified"}`}>{String(b.status)}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </>
  );
}
