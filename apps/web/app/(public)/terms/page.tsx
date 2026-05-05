export const dynamic = "force-static";
export const runtime = "edge";
export const metadata = { title: "Terms", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return (
    <section>
      <div className="container container--narrow">
        <p className="eyebrow">Terms</p>
        <h1>Concept-site terms.</h1>
        <p>Studio Flow is a concept site by concierge.studio — a portfolio piece. No goods or services are sold. No class is actually booked. The contact form sends an email to a real inbox.</p>
        <h2>Cancellation (illustrative)</h2>
        <p>Free up to 6 hours before class — pack credit returns. Inside 6 hours, the class counts. Memberships have unlimited cancellation by class.</p>
        <h2>Privacy</h2>
        <p>See <a href="/privacy">/privacy</a>.</p>
      </div>
    </section>
  );
}
