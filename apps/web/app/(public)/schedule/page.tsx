import Link from "next/link";
import { listSessionsByDateRange } from "@/lib/sessions/store";
import { listClasses } from "@/lib/classes/store";
import { listInstructors } from "@/lib/instructors/store";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Schedule — Studio Flow",
  description: "Week view. Mon–Sun, 6am–9pm. Tap any class to talk to Sienna about booking.",
  alternates: { canonical: "/schedule" },
};

function startOfWeek(d: Date) {
  const x = new Date(d); x.setHours(0,0,0,0);
  const dow = (x.getDay() + 6) % 7; // Mon = 0
  x.setDate(x.getDate() - dow);
  return x;
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
}
function fmtDayLabel(d: Date) {
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

export default async function SchedulePage() {
  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekEnd.getDate() + 7);
  const fromIso = weekStart.toISOString();
  const toIso = weekEnd.toISOString();

  const [sessions, classes, instructors] = await Promise.all([
    listSessionsByDateRange(fromIso, toIso),
    listClasses(),
    listInstructors(),
  ]);
  const classBySlug = Object.fromEntries(classes.map((c) => [c.slug, c]));
  const instBySlug = Object.fromEntries(instructors.map((i) => [i.slug, i]));

  // Group sessions by day-of-week (0..6)
  const byDay: Record<number, typeof sessions> = {0:[],1:[],2:[],3:[],4:[],5:[],6:[]};
  for (const s of sessions) {
    const d = new Date(s.starts_at);
    const dow = (d.getDay() + 6) % 7;
    byDay[dow].push(s);
  }
  for (const dow of Object.keys(byDay)) byDay[+dow].sort((a,b)=>a.starts_at.localeCompare(b.starts_at));

  const days = Array.from({length:7}, (_,i) => {
    const d = new Date(weekStart); d.setDate(d.getDate()+i); return d;
  });

  return (
    <>
      <section>
        <div className="container">
          <p className="eyebrow">Week of {fmtDayLabel(weekStart)} — {fmtDayLabel(new Date(weekEnd.getTime()-1))}</p>
          <h1>This week's schedule.</h1>
          <p className="lead muted">{sessions.length} classes scheduled. Spots remaining in each card. Tap any class to talk to Sienna.</p>
        </div>
      </section>

      <section style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="schedule-grid">
            {days.map((d, i) => (
              <div key={i} className="schedule-day">
                <div className="schedule-day-head">
                  <strong>{d.toLocaleDateString("en-GB", { weekday: "long" })}</strong>
                  <span className="muted">{d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                </div>
                {byDay[i].length === 0 ? (
                  <p className="muted">— no classes —</p>
                ) : byDay[i].map((s) => {
                  const c = classBySlug[s.class_slug];
                  const inst = instBySlug[s.instructor_slug];
                  const left = s.capacity - s.booked;
                  const isPast = new Date(s.starts_at) < now;
                  return (
                    <div key={s.id} className={`schedule-cell ${left===0?'is-full':''} ${isPast?'is-past':''}`}>
                      <div className="schedule-time">{fmtTime(s.starts_at)}</div>
                      <div className="schedule-class">
                        <strong>{c?.name ?? s.class_slug}</strong>
                        <span className="meta">{inst?.name?.split(" ")[0] ?? s.instructor_slug} · {c?.duration_min} min</span>
                        <span className="meta">{left > 0 ? `${left} left` : "full"}</span>
                      </div>
                      {!isPast && left > 0 && (
                        <Link href="/#concierge" className="schedule-book">Book →</Link>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
