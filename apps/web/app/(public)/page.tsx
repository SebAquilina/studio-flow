import Link from "next/link";
import { FrontHero } from "@/components/front/FrontHero";
import { ClientIdField } from "@/components/analytics/ClientIdField";
import { listInstructors } from "@/lib/instructors/store";
import { listClasses } from "@/lib/classes/store";
import { listAvailableNext } from "@/lib/sessions/store";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const PRINCIPLES = [
  { title: "No two bodies fit the same class.", body: "Beginners aren't put in the same room as the regulars. Pregnant clients aren't told to 'just modify.' Knee problems are screened, not ignored." },
  { title: "Every class is taught, not just led.", body: "Instructors cue alignment, walk the room, and adjust by hand when invited. We hire from physiotherapy, dance, and rehab backgrounds — not from yoga teacher mills." },
  { title: "We screen at the door.", body: "First time? Sienna runs a five-question screen via the concierge. Pregnancy or injury? You go to a 30-minute consult before a group class." },
];

const FAQS = [
  { q: "First-time fit?", a: "Talk to Sienna above. She runs a five-question screen and gives you one class." },
  { q: "Cancellation?", a: "Free up to 6 hours before. Inside 6 hours, the class counts. Memberships have unlimited cancellation." },
  { q: "Pregnancy?", a: "Prenatal class only. Sienna teaches every session." },
  { q: "Recent injury or surgery?", a: "Consult with Sienna first — €70, 30 minutes. No group-class commitment." },
];

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-MT", { hour: "2-digit", minute: "2-digit", hour12: false });
}
function fmtDay(iso: string) {
  return new Date(iso).toLocaleDateString("en-MT", { weekday: "short", day: "numeric", month: "short" });
}

export default async function Home() {
  const [classes, instructors, today] = await Promise.all([
    listClasses().catch(() => []),
    listInstructors().catch(() => []),
    listAvailableNext(3).catch(() => []),
  ]);
  const classBySlug = Object.fromEntries(classes.map((c) => [c.slug, c]));
  const instBySlug = Object.fromEntries(instructors.map((i) => [i.slug, i]));

  return (
    <>
      <FrontHero />

      <section id="schedule" className="schedule-strip">
        <div className="container">
          <p className="eyebrow">Next sessions</p>
          <h2>The next three classes.</h2>
          {today.length === 0 ? (
            <p className="muted">No upcoming sessions in the next two months. Sienna can book you onto the new schedule when it drops.</p>
          ) : (
            <div className="next-sessions-grid">
              {today.map((s) => {
                const c = classBySlug[s.class_slug];
                const inst = instBySlug[s.instructor_slug];
                if (!c) return null;
                return (
                  <article key={s.id} className="session-card">
                    <p className="meta">{fmtDay(s.starts_at)} · {fmtTime(s.starts_at)} · {c.duration_min} min</p>
                    <h3>{c.name}</h3>
                    <p className="muted">{c.hook}</p>
                    <p className="meta">
                      <strong>{inst?.name ?? s.instructor_slug}</strong> · {s.capacity - s.booked} spots left
                    </p>
                    <Link href="/#concierge" className="btn btn-primary btn-sm">Talk to Sienna →</Link>
                  </article>
                );
              })}
            </div>
          )}
          <div className="oils-cta-row">
            <Link href="/schedule" className="btn btn-secondary">See the full week →</Link>
          </div>
        </div>
      </section>

      <section id="principles" style={{ background: "var(--color-surface)" }}>
        <div className="container">
          <p className="eyebrow">Three principles</p>
          <h2>How Studio Flow runs.</h2>
          <div className="story-cards">
            {PRINCIPLES.map((p) => (
              <div key={p.title} className="story-card">
                <h3>{p.title}</h3>
                <p>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="instructors-strip">
        <div className="container">
          <p className="eyebrow">Four instructors</p>
          <h2>Hired for what they teach.</h2>
          <div className="oils-grid">
            {instructors.map((i) => (
              <article key={i.slug} className="oil-card">
                <div className="oil-card-img" style={{ background: "var(--color-line)" }} aria-hidden="true" />
                <div className="oil-card-body">
                  <h3>{i.name}</h3>
                  <p className="meta muted">{i.specialties}</p>
                  <p className="muted" style={{ flex: 1 }}>{i.credentials}</p>
                  <div className="oil-card-foot">
                    <Link href={`/instructors#${i.slug}`} className="btn btn-secondary btn-sm">Read more →</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" style={{ background: "var(--color-surface)" }}>
        <div className="container container--narrow">
          <p className="eyebrow">Quick answers</p>
          <h2>FAQ.</h2>
          <dl className="faq-list">
            {FAQS.map((f) => (
              <div key={f.q} className="faq-item">
                <dt>{f.q}</dt>
                <dd>{f.a}</dd>
              </div>
            ))}
          </dl>
          <p className="muted" style={{ marginTop: "var(--space-5)" }}>
            <Link href="/classes">More questions →</Link>
          </p>
        </div>
      </section>

      <section id="book" className="contact-section">
        <div className="container container--narrow">
          <p className="eyebrow">Tell us what you need</p>
          <h2>Press, partnerships, anything else.</h2>
          <p className="muted">For class questions, talk to Sienna above. For everything else, drop a note here.</p>
          <form action="/api/leads" method="post" className="form-grid">
            <ClientIdField />
            <div className="form-row"><label>Your name <input type="text" name="name" required autoComplete="name" /></label></div>
            <div className="form-row"><label>Email <input type="email" name="email" required autoComplete="email" /></label></div>
            <div className="form-row">
              <label>About
                <select name="project_type" required defaultValue="other">
                  <option value="press">Press / interviews</option>
                  <option value="partnership">Partnership / hire-the-studio</option>
                  <option value="other">Something else</option>
                </select>
              </label>
            </div>
            <div className="form-row"><label>Notes <textarea name="brief" rows={4} placeholder="Anything else."></textarea></label></div>
            <div className="form-row">
              <label className="checkbox">
                <input type="checkbox" name="consent" value="true" required />
                <span>OK to use my details to reply to this enquiry. I won't be added to any list.</span>
              </label>
            </div>
            <button type="submit" className="btn btn-primary">Send →</button>
          </form>
        </div>
      </section>
    </>
  );
}
