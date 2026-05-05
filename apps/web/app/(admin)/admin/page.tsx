import Link from "next/link";
export const runtime = "edge"; export const dynamic = "force-dynamic";
export default function AdminIndex() {
  return (
    <>
      <header className="admin-header"><div><h1>Studio Flow admin</h1><p className="muted">Standard tier. Catalogue, schedule, bookings, live capacity heat-map.</p></div></header>
      <div className="admin-card">
        <p>The most-used sections:</p>
        <ul>
          <li><Link href="/admin/live">Live</Link> — who's on the site right now + which class is filling.</li>
          <li><Link href="/admin/sessions">Sessions</Link> — next-14-days schedule with capacity heat-map.</li>
          <li><Link href="/admin/bookings">Bookings</Link> — every spot Sienna held for a visitor.</li>
          <li><Link href="/admin/leads">Leads</Link> — contact form + form-to-lead pipeline.</li>
          <li><Link href="/admin/classes">Catalogue</Link> — 12 classes + 5 pricing packs.</li>
          <li><Link href="/admin/instructors">Instructors</Link> — Sienna, Marco, Lara, Adam.</li>
        </ul>
      </div>
    </>
  );
}
