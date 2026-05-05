import Link from "next/link";
import { listClasses, listPacks } from "@/lib/classes/store";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Classes — Studio Flow",
  description: "12 classes across yoga, pilates, breathwork. Filtered by level and what you're recovering from.",
  alternates: { canonical: "/classes" },
};

const CATEGORY_ORDER = ["yoga", "pilates", "breathwork", "specials"];
const CATEGORY_TITLES: Record<string, string> = {
  yoga: "Yoga", pilates: "Pilates", breathwork: "Breathwork", specials: "Privates",
};

const REVIEWS = [
  { name: "K., 41, Sliema", body: "Tried a 'power yoga' class three years ago and didn't go back. Sienna put me in Slow Hatha. I've come every Wednesday since.", role: "concept review" },
  { name: "M., 28, Valletta", body: "Knee surgery in February. Adam's privates got me back on the reformer in eight sessions. I'm in the intermediate group now.", role: "concept review" },
  { name: "R., 33, Floriana", body: "Third trimester. The Prenatal class is the only studio in Malta where I'm not the only pregnant person in the room.", role: "concept review" },
  { name: "T., 49, St Julian's", body: "Burnt out from work. Marco's Coherent Breathing on Tuesday lunches is the cheapest therapy in the city.", role: "concept review" },
  { name: "L., 36, Birkirkara", body: "Lara cued me through a single side-plank for fifteen minutes. I've never been so well-corrected. I've been a regular for six months.", role: "concept review" },
];

export default async function ClassesPage() {
  const [classes, packs] = await Promise.all([listClasses(), listPacks()]);
  const grouped: Record<string, typeof classes> = {};
  for (const c of classes) {
    grouped[c.category] = grouped[c.category] ?? [];
    grouped[c.category].push(c);
  }
  const eur = (c: number) => `€${(c / 100).toFixed(0)}`;

  return (
    <>
      <section>
        <div className="container">
          <p className="eyebrow">Classes</p>
          <h1>12 classes, four categories.</h1>
          <p className="lead muted">Filter by what fits. The concierge above will pick one for you if you'd rather not browse.</p>
        </div>
      </section>

      {CATEGORY_ORDER.map((cat) => (grouped[cat]?.length ?? 0) > 0 && (
        <section key={cat} style={{ paddingTop: 0 }}>
          <div className="container">
            <h2 style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontWeight: 500, fontSize: "1.8rem", margin: "0 0 var(--space-4)" }}>
              {CATEGORY_TITLES[cat]}
            </h2>
            <div className="classes-grid">
              {grouped[cat].map((c) => (
                <article id={c.slug} key={c.slug} className="class-card">
                  <div className="class-card-head">
                    <span className="pill">{c.level}</span>
                    <span className="meta">{c.duration_min} min · cap {c.capacity}</span>
                  </div>
                  <h3>{c.name}</h3>
                  <p className="muted">{c.hook}</p>
                  <p style={{ marginTop: "var(--space-3)" }}>{c.description}</p>
                  {c.contraindications && (
                    <p className="meta" style={{ marginTop: "var(--space-3)", color: "var(--color-warn)" }}>
                      <strong>Contraindications:</strong> {c.contraindications}
                    </p>
                  )}
                  {c.what_to_bring && (
                    <p className="meta">
                      <strong>Bring:</strong> {c.what_to_bring}
                    </p>
                  )}
                  <div className="oil-card-foot" style={{ marginTop: "var(--space-4)" }}>
                    <Link href="/#concierge" className="btn btn-primary btn-sm">Tell Sienna →</Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section style={{ background: "var(--color-surface)" }}>
        <div className="container container--narrow">
          <p className="eyebrow">Pricing</p>
          <h2>Five plans.</h2>
          <table className="rates-table">
            <thead><tr><th>Plan</th><th>What's in it</th><th className="price">Price</th></tr></thead>
            <tbody>
              {packs.map((p) => (
                <tr key={p.slug}>
                  <th>{p.name}</th>
                  <td className="muted">{p.description}</td>
                  <td className="price">{eur(p.price_cents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="muted" style={{ marginTop: "var(--space-4)" }}>
            Concept site — VAT shown is illustrative; no real money is collected. Cancellation: 6h notice for free reschedule from a pack; inside 6h, the class counts.
          </p>
        </div>
      </section>

      <section>
        <div className="container container--narrow">
          <p className="eyebrow">Concept reviews</p>
          <h2>What people say.</h2>
          <p className="muted">All five are illustrative — written for this concept site, not real clients.</p>
          <ul className="reviews-list">
            {REVIEWS.map((r) => (
              <li key={r.name} className="review">
                <p>"{r.body}"</p>
                <p className="meta">— {r.name} <span className="muted">· {r.role}</span></p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
