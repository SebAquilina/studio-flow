import Link from "next/link";
import { notFound } from "next/navigation";
import { listClasses } from "@/lib/classes/store";
import { listInstructors } from "@/lib/instructors/store";
import { listAvailableNext } from "@/lib/sessions/store";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const PRINCIPLES: Record<string, { who_for: string[]; not_for: string[]; what_to_bring: string[]; first_class: string[] }> = {
  "slow-hatha": {
    who_for: ["Beginners — and people returning after time off.", "Anyone who wants every pose taught from the ground up.", "Pregnancy in trimester one (with screen)."],
    not_for: ["Advanced practitioners looking for flow.", "People who find slow pacing frustrating."],
    what_to_bring: ["Mat (we have spares).", "Bare feet.", "Water bottle (filled at the studio if you forgot)."],
    first_class: ["Sienna runs the screen first — five questions, sixty seconds.", "Class is 75 minutes; first 10 are introductions and grounding.", "We end on the floor, eyes closed, for 6 minutes."],
  },
  "yin": {
    who_for: ["People who feel cumulatively held in the body.", "Anyone after a long week of desk work.", "Side practice for cyclists, runners, climbers."],
    not_for: ["Pregnancy past trimester one (the long passive holds aren't safe).", "People with active flares of joint inflammation (ask Sienna)."],
    what_to_bring: ["Mat, two blocks (provided), one bolster (provided)."],
    first_class: ["Each pose held 3-5 minutes.", "We are quiet between poses.", "Wear something warm for the floor work."],
  },
  "pilates-foundations": {
    who_for: ["Anyone learning core mechanics from scratch.", "People rehabbing low back issues (with screen)."],
    not_for: ["Advanced reformer practitioners — book Pilates Build instead."],
    what_to_bring: ["Mat, fitted top (we cue the spine and need to see)."],
    first_class: ["Marco starts on the floor — pelvic tilts, neutral spine.", "We don't move past supine work in the first session."],
  },
  "coherent-breathing": {
    who_for: ["Anxiety, sleep, recovery from overtraining.", "Office workers trying to break shallow-breath patterns."],
    not_for: ["No exclusions — we have versions for pregnancy, asthma, post-COVID."],
    what_to_bring: ["Yourself. Mats and bolsters provided."],
    first_class: ["30 minutes only.", "Six in, six out — we count out loud the first ten breaths."],
  },
};

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const classes = await listClasses().catch(() => []);
  const c = classes.find((x) => x.slug === params.slug);
  if (!c) return { title: "Class — Studio Flow" };
  return {
    title: `${c.name} — Studio Flow`,
    description: c.hook ?? undefined,
    alternates: { canonical: `/classes/${params.slug}` },
  };
}

export default async function ClassDetail({ params }: { params: { slug: string } }) {
  const [classes, instructors, allSessions] = await Promise.all([
    listClasses().catch(() => []),
    listInstructors().catch(() => []),
    listAvailableNext(20).catch(() => []),
  ]);
  const c = classes.find((x) => x.slug === params.slug);
  if (!c) notFound();
  const upcoming = allSessions.filter((s) => s.class_slug === c.slug).slice(0, 4);
  const principles = PRINCIPLES[c.slug] ?? null;
  const inst = instructors.find((i) => upcoming.some((s) => s.instructor_slug === i.slug));

  return (
    <>
      <section style={{ padding: "var(--space-9) 0 var(--space-5)" }}>
        <div className="container">
          <p className="eyebrow">{c.duration_min} minutes</p>
          <h1 style={{ marginTop: "var(--space-3)" }}>{c.name}.</h1>
          {c.hook && <p className="lead" style={{ marginTop: "var(--space-4)", maxWidth: "44rem", lineHeight: 1.55 }}>{c.hook}</p>}
        </div>
      </section>

      {principles && (
        <section>
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-6)" }}>
              <div>
                <p className="eyebrow">Who it's for</p>
                <ul style={{ listStyle: "none", padding: 0, marginTop: "var(--space-3)" }}>
                  {principles.who_for.map((x, i) => <li key={i} style={{ borderTop: "1px solid var(--color-line)", padding: "var(--space-3) 0" }}>✓  {x}</li>)}
                </ul>
              </div>
              <div>
                <p className="eyebrow">Who it's not for</p>
                <ul style={{ listStyle: "none", padding: 0, marginTop: "var(--space-3)" }}>
                  {principles.not_for.map((x, i) => <li key={i} style={{ borderTop: "1px solid var(--color-line)", padding: "var(--space-3) 0" }}>✕  {x}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {principles && (
        <section style={{ background: "var(--color-surface)" }}>
          <div className="container container--narrow">
            <p className="eyebrow">First class</p>
            <h2 style={{ marginTop: "var(--space-2)" }}>What happens.</h2>
            <ul style={{ listStyle: "none", padding: 0, marginTop: "var(--space-4)" }}>
              {principles.first_class.map((x, i) => <li key={i} style={{ borderTop: "1px solid var(--color-line)", padding: "var(--space-3) 0", lineHeight: 1.55 }}>{i+1}. {x}</li>)}
            </ul>
            <p className="eyebrow" style={{ marginTop: "var(--space-5)" }}>What to bring</p>
            <ul style={{ listStyle: "none", padding: 0, marginTop: "var(--space-3)" }}>
              {principles.what_to_bring.map((x, i) => <li key={i} style={{ borderTop: "1px solid var(--color-line)", padding: "var(--space-3) 0" }}>{x}</li>)}
            </ul>
          </div>
        </section>
      )}

      <section>
        <div className="container">
          <p className="eyebrow">Next sessions</p>
          {upcoming.length === 0 ? (
            <p className="muted" style={{ marginTop: "var(--space-3)" }}>None scheduled in the next two weeks. Sienna can put you on the new schedule when it drops.</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, marginTop: "var(--space-3)" }}>
              {upcoming.map((s) => {
                const date = new Date(s.starts_at);
                const i = instructors.find((x) => x.slug === s.instructor_slug);
                return (
                  <li key={s.id} style={{ borderTop: "1px solid var(--color-line)", padding: "var(--space-4) 0", display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "var(--space-4)", alignItems: "baseline" }}>
                    <strong>{date.toLocaleDateString("en-MT", { weekday: "short", day: "numeric", month: "short" })}</strong>
                    <span style={{ fontFamily: "var(--font-mono)" }}>{date.toLocaleTimeString("en-MT", { hour: "2-digit", minute: "2-digit", hour12: false })}</span>
                    <span className="muted">{i?.name ?? "TBA"}</span>
                    <Link href="/#concierge" className="btn btn-primary btn-sm">Book</Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <section style={{ background: "var(--color-surface)" }}>
        <div className="container container--narrow" style={{ textAlign: "center" }}>
          <h2>Talk to Sienna.</h2>
          <p className="muted" style={{ marginTop: "var(--space-3)" }}>Pregnancy, injury, returning after a break? Sienna runs the screen first.</p>
          <Link href="/#concierge" className="btn btn-primary btn-lg" style={{ marginTop: "var(--space-5)" }}>Ask Sienna →</Link>
        </div>
      </section>
    </>
  );
}
