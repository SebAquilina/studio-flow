import Link from "next/link";
import { requireAdminPage } from "@/lib/auth";

export const runtime = "edge";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  return (
    <div className="admin-shell">
      <nav className="admin-nav" aria-label="Admin">
        <h2>studio<span style={{ color: "var(--color-accent)", fontStyle: "italic" }}> flow</span></h2>
        <Link href="/admin">Dashboard</Link>
        <hr style={{ borderColor: "rgba(255,255,255,0.1)", margin: "1rem 0" }} />
        <p className="muted" style={{ fontSize: "0.7em", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 0.4rem" }}>Behavior</p>
        <Link href="/admin/live">Live View</Link>
        <Link href="/admin/analytics">Analytics</Link>
        <Link href="/admin/insights">Insights</Link>
        <hr style={{ borderColor: "rgba(255,255,255,0.1)", margin: "1rem 0" }} />
        <p className="muted" style={{ fontSize: "0.7em", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 0.4rem" }}>Pipeline</p>
        <Link href="/admin/leads">Leads</Link>
        <Link href="/admin/bookings">Bookings</Link>
        <Link href="/admin/sessions">Sessions</Link>
        <hr style={{ borderColor: "rgba(255,255,255,0.1)", margin: "1rem 0" }} />
        <p className="muted" style={{ fontSize: "0.7em", textTransform: "uppercase", letterSpacing: 1, margin: "0 0 0.4rem" }}>Content</p>
        <Link href="/admin/classes">Catalogue</Link>
        <Link href="/admin/instructors">Instructors</Link>
        <Link href="/admin/agent">Concierge</Link>
        <Link href="/admin/transcripts">Transcripts</Link>
        <Link href="/admin/settings">Settings</Link>
        <hr style={{ borderColor: "rgba(255,255,255,0.1)", margin: "1rem 0" }} />
        <Link href="/" target="_blank">View site →</Link>
      </nav>
      <div className="admin-main">{children}</div>
    </div>
  );
}
