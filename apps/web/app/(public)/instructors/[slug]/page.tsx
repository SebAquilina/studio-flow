import Link from "next/link";
import { notFound } from "next/navigation";
import { listInstructors } from "@/lib/instructors/store";
import { listClasses } from "@/lib/classes/store";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const BIOS: Record<string, { headline: string; story: string[]; teaches: string[] }> = {
  "sienna-borg": {
    headline: "Founder. Teaches Slow Hatha and the screen-call clinic.",
    story: [
      "Sienna trained as a physiotherapist in Manchester (BSc, 2008) before a back injury sent her to a yoga studio in Dharamsala for what was meant to be six weeks. She stayed nine months.",
      "Studio Flow is her second studio; the first was a small room above a café in Birkirkara from 2017-2022. The current Valletta space opened in October 2023 with three classes a week. It's now twenty-eight.",
      "She still takes physio appointments two mornings a week — the screen-call clinic before group classes is her version of a no-cost 30-minute consult."
    ],
    teaches: ["slow-hatha", "yin"],
  },
  "marco-said": {
    headline: "Pilates and breathwork. Former dancer.",
    story: [
      "Marco trained at the Royal Conservatoire The Hague and danced with NDT for six years. After a knee injury, he retrained in Stott Pilates and breath physiology.",
      "He runs the Pilates Foundations and Coherent Breathing classes. Quiet, precise, leaves nothing to interpretation.",
    ],
    teaches: ["pilates-foundations", "coherent-breathing", "yin"],
  },
};

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const insts = await listInstructors().catch(() => []);
  const i = insts.find((x) => x.slug === params.slug);
  if (!i) return { title: "Instructor" };
  return {
    title: `${i.name}`,
    description: i.bio_md ?? undefined,
    alternates: { canonical: `/instructors/${params.slug}` },
  };
}

export default async function InstructorDetail({ params }: { params: { slug: string } }) {
  const [insts, classes] = await Promise.all([listInstructors().catch(() => []), listClasses().catch(() => [])]);
  const i = insts.find((x) => x.slug === params.slug);
  if (!i) notFound();
  const bio = BIOS[i.slug] ?? null;
  const teachesSlugs = bio?.teaches ?? [];
  const teaches = classes.filter((c) => teachesSlugs.includes(c.slug));

  return (
    <>
      <section style={{ padding: "var(--space-9) 0 var(--space-5)" }}>
        <div className="container">
          <p className="eyebrow">Instructor</p>
          <h1 style={{ marginTop: "var(--space-3)" }}>{i.name}.</h1>
          {bio && <p className="lead muted" style={{ marginTop: "var(--space-4)", maxWidth: "44rem" }}>{bio.headline}</p>}
        </div>
      </section>

      {bio && (
        <section>
          <div className="container container--narrow">
            {bio.story.map((p, idx) => (
              <p key={idx} style={{ lineHeight: 1.65, fontSize: "1.0625rem", marginTop: idx === 0 ? 0 : "var(--space-4)" }}>{p}</p>
            ))}
          </div>
        </section>
      )}

      {teaches.length > 0 && (
        <section style={{ background: "var(--color-surface)" }}>
          <div className="container">
            <p className="eyebrow">Teaches</p>
            <h2 style={{ marginTop: "var(--space-2)" }}>{teaches.length} classes.</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "var(--space-4)", marginTop: "var(--space-4)" }}>
              {teaches.map((c) => (
                <Link key={c.slug} href={`/classes/${c.slug}`} className="session-card" style={{ textDecoration: "none", color: "inherit" }}>
                  <p className="meta">{c.duration_min} min</p>
                  <h3 style={{ marginTop: "0.4rem" }}>{c.name}</h3>
                  <p className="muted" style={{ marginTop: "0.6rem", fontSize: "0.9375rem" }}>{c.hook}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="container container--narrow" style={{ textAlign: "center" }}>
          <h2>Book with {i.name.split(" ")[0]}.</h2>
          <Link href="/#concierge" className="btn btn-primary btn-lg" style={{ marginTop: "var(--space-5)" }}>Ask Sienna →</Link>
        </div>
      </section>
    </>
  );
}
