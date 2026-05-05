import Link from "next/link";

export function Header() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="wordmark wordmark--with-mark" aria-label="Studio Flow — home">
          <svg
            className="wordmark-mark"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 64 64"
            width="32"
            height="32"
            aria-hidden="true"
          >
            {/* Open-circle "o" mark — the brand's logo replacement for the o in "flow" */}
            <circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="120 12" />
          </svg>
          <span className="wordmark-text">studio fl<span aria-hidden="true">○</span>w</span>
          <span className="visually-hidden">studio flow</span>
        </Link>
        <Link href="/#concierge" className="btn btn-primary btn-sm">Talk to Sienna →</Link>
      </div>
    </header>
  );
}
