import { listSessionsByDateRange } from "@/lib/sessions/store";
import { listClasses } from "@/lib/classes/store";
import { listInstructors } from "@/lib/instructors/store";
export const runtime = "edge"; export const dynamic = "force-dynamic";

export default async function SessionsAdmin() {
  const now = new Date();
  const past = new Date(now); past.setDate(past.getDate() - 1);
  const future = new Date(now); future.setDate(future.getDate() + 14);
  const [sessions, classes, instructors] = await Promise.all([
    listSessionsByDateRange(past.toISOString(), future.toISOString()),
    listClasses(),
    listInstructors(),
  ]);
  const cBy = Object.fromEntries(classes.map((c) => [c.slug, c]));
  const iBy = Object.fromEntries(instructors.map((i) => [i.slug, i]));

  return (
    <>
      <header className="admin-header">
        <div>
          <h1>Sessions — next 14 days</h1>
          <p className="muted">{sessions.length} sessions. Capacity is capacity − bookings; cells fill as visitors book.</p>
        </div>
      </header>
      <div className="admin-card" style={{ padding: 0 }}>
        <table className="admin-table">
          <thead><tr><th>When</th><th>Class</th><th>Instructor</th><th>Booked</th><th>Capacity</th><th>Status</th></tr></thead>
          <tbody>{sessions.map((s) => {
            const fillPct = (s.booked / s.capacity) * 100;
            const heat = fillPct >= 100 ? "full" : fillPct >= 75 ? "hot" : fillPct >= 40 ? "warm" : "cool";
            return (
              <tr key={s.id}>
                <td>{new Date(s.starts_at).toLocaleString("en-MT", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                <td>{cBy[s.class_slug]?.name ?? s.class_slug}</td>
                <td>{iBy[s.instructor_slug]?.name ?? s.instructor_slug}</td>
                <td><span className={`heat heat--${heat}`}>{s.booked} / {s.capacity}</span></td>
                <td>{s.capacity}</td>
                <td>{s.status}</td>
              </tr>
            );
          })}</tbody>
        </table>
      </div>
    </>
  );
}
