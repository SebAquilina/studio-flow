import { listClasses, listPacks } from "@/lib/classes/store";
export const runtime = "edge"; export const dynamic = "force-dynamic";

export default async function ClassesAdmin() {
  const [classes, packs] = await Promise.all([listClasses(), listPacks()]);
  return (
    <>
      <header className="admin-header"><div><h1>Catalogue</h1><p className="muted">12 classes · 5 pricing packs</p></div></header>
      <div className="admin-card" style={{ padding: 0 }}>
        <table className="admin-table">
          <thead><tr><th>Slug</th><th>Class</th><th>Cat</th><th>Duration</th><th>Level</th><th>Cap</th></tr></thead>
          <tbody>{classes.map((c) => (
            <tr key={c.slug}><td><code>{c.slug}</code></td><td>{c.name}</td><td>{c.category}</td><td>{c.duration_min} min</td><td>{c.level}</td><td>{c.capacity}</td></tr>
          ))}</tbody>
        </table>
      </div>
      <header className="admin-header" style={{ marginTop: "var(--space-6)" }}><h2>Pricing</h2></header>
      <div className="admin-card" style={{ padding: 0 }}>
        <table className="admin-table">
          <thead><tr><th>Slug</th><th>Plan</th><th>Price</th><th>Includes</th><th>Validity</th></tr></thead>
          <tbody>{packs.map((p) => (
            <tr key={p.slug}><td><code>{p.slug}</code></td><td>{p.name}</td><td>€{(p.price_cents/100).toFixed(0)}</td><td>{p.classes_included ?? "unlimited"}</td><td>{p.validity_days ? `${p.validity_days}d` : "—"}</td></tr>
          ))}</tbody>
        </table>
      </div>
    </>
  );
}
