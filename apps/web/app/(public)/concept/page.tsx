export const dynamic = "force-static";
import Link from "next/link";

export const runtime = "edge";
export const metadata = { title: "Concept", alternates: { canonical: "/concept" } };

export default function ConceptPage() {
  return (
    <section>
      <div className="container container--narrow">
        <p className="eyebrow">Concept site</p>
        <h1>What you're looking at.</h1>
        <p>
          Studio Flow is a concept site by{" "}
          <a href="https://concierge.studio" target="_blank" rel="noreferrer">concierge.studio</a>.
          The brand, the studio space, the four instructors, the schedule — all invented for this
          portfolio piece. Everything else is exactly what a real Studio Flow client would get on
          the Standard tier.
        </p>
        <p>
          What's <strong>real</strong>: the concierge with the five-question screen, the admin,
          the analytics, the booking pipeline. Sienna runs on Gemini Flash-Lite. The contact
          form lands at <a href="mailto:portfolio@concierge.studio">portfolio@concierge.studio</a>.
          /admin/* is a working Shopify-grade panel with a real-time class capacity heat-map.
        </p>
        <p>
          What's <strong>not</strong>: no class is actually booked. No payment is taken. No real
          instructor exists with these names — credentials shown are realistic certifications
          but illustrative for the concept.
        </p>
        <p>
          Want one of these for your own business?{" "}
          <Link href="https://concierge.studio">See pricing →</Link>
        </p>
      </div>
    </section>
  );
}
