import Link from "next/link";
import { listInstructors } from "@/lib/instructors/store";
import { listClasses } from "@/lib/classes/store";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Instructors",
  description: "Four instructors, hired for what they teach. Sienna, Marco, Lara, Adam.",
  alternates: { canonical: "/instructors" },
};

function md(s: string): string {
  return s.split(/\n{2,}/).map((b) => `<p>${b.replace(/\n/g, "<br/>").replace(/&/g,"&amp;").replace(/</g,"&lt;")}</p>`).join("\n");
}

export default async function InstructorsPage() {
  const [instructors, classes] = await Promise.all([listInstructors(), listClasses()]);
  const classBySlug = Object.fromEntries(classes.map((c) => [c.slug, c]));
  const eur = (c: number) => `€${(c / 100).toFixed(0)}`;

  return (
    <>
      <section>
        <div className="container container--narrow">
          <p className="eyebrow">Instructors</p>
          <h1>Four people who run the studio.</h1>
          <p className="lead muted">Hired for what they teach. Credentials are illustrative for the concept site.</p>
        </div>
      </section>

      {instructors.map((i) => (
        <section id={i.slug} key={i.slug} style={{ paddingTop: 0 }}>
          <div className="container container--narrow">
            <article className="instructor-card">
              <div className="instructor-img" style={{ background: "var(--color-line)" }} aria-hidden="true" />
              <div>
                <p className="meta">{i.specialties}</p>
                <h2>{i.name} <span className="muted" style={{ fontFamily: "var(--font-sans)", fontSize: "1rem", fontStyle: "normal" }}>· {i.pronouns}</span></h2>
                <p className="meta muted">{i.credentials}</p>
                <div dangerouslySetInnerHTML={{ __html: md(i.bio_md) }} />
                <p className="meta" style={{ marginTop: "var(--space-3)" }}>
                  <strong>Teaches:</strong>{" "}
                  {i.classes_taught.split(",").map((s, idx, arr) => {
                    const c = classBySlug[s.trim()];
                    return (
                      <span key={s}>
                        {c?.name ?? s}
                        {idx < arr.length - 1 ? " · " : ""}
                      </span>
                    );
                  })}
                </p>
                <div className="oil-card-foot" style={{ marginTop: "var(--space-4)" }}>
                  <Link href={`/#concierge`} className="btn btn-primary btn-sm">Book a private with {i.name.split(" ")[0]} → {eur(i.privates_eur)}</Link>
                </div>
              </div>
            </article>
          </div>
        </section>
      ))}
    </>
  );
}
