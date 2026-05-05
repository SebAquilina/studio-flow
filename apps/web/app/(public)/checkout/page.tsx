export const dynamic = "force-static";
import Link from "next/link";

export const runtime = "edge";
export const metadata = { title: "Checkout", alternates: { canonical: "/checkout" } };

export default function CheckoutPage() {
  return (
    <section>
      <div className="container container--narrow" style={{ textAlign: "center", paddingTop: "var(--space-8)", paddingBottom: "var(--space-8)" }}>
        <p className="eyebrow">Checkout</p>
        <h1>Checkout is disabled.</h1>
        <p className="lead">Studio Flow is a concept site by concierge.studio — no class is actually booked, no card is charged. To find a real Maltese yoga or pilates studio, talk to Sienna (she'll point you at one).</p>
        <div className="hero-ctas" style={{ justifyContent: "center", marginTop: "var(--space-6)" }}>
          <Link href="/#concierge" className="btn btn-primary">Talk to Sienna →</Link>
          <Link href="/concept" className="btn btn-secondary">What is this site?</Link>
        </div>
      </div>
    </section>
  );
}
