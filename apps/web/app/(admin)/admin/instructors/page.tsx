import { listInstructors } from "@/lib/instructors/store";
export const runtime = "edge"; export const dynamic = "force-dynamic";

export default async function InstructorsAdmin() {
  const ins = await listInstructors();
  return (
    <>
      <header className="admin-header"><div><h1>Instructors</h1><p className="muted">{ins.length} instructors. Edit via wrangler / d1 console; standard tier is read-only here.</p></div></header>
      <div className="admin-card" style={{ padding: 0 }}>
        <table className="admin-table">
          <thead><tr><th>Slug</th><th>Name</th><th>Specialties</th><th>Credentials</th><th>Privates</th></tr></thead>
          <tbody>{ins.map((i) => (
            <tr key={i.slug}><td><code>{i.slug}</code></td><td>{i.name}</td><td>{i.specialties}</td><td className="muted">{i.credentials}</td><td>€{(i.privates_eur/100).toFixed(0)}</td></tr>
          ))}</tbody>
        </table>
      </div>
    </>
  );
}
