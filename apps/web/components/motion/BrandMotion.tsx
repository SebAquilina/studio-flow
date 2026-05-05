"use client";
import { useEffect } from "react";

/**
 * Studio Flow — breath-rhythm motion.
 * - All entrance animations follow a 6-second breath cycle (slow inhale, slow exhale)
 * - H2 vertical clay bar GROWS as you scroll the page
 * - Numbers in stats count up
 * - Chalk-write left-to-right reveal for headlines
 * - Session cards land like they're being placed on a tatami — no bounce
 */
export function BrandMotion() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      document.documentElement.classList.add("sf-no-motion");
      return;
    }
    document.documentElement.classList.add("js-motion");

    // Entrance reveals
    const reveals = document.querySelectorAll<HTMLElement>(
      "main section, main h1, main h2, main h3, main p.lead, main p.eyebrow, .session-card, .next-sessions-grid > *, blockquote, ul, ol, table"
    );
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("in-view");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((t) => io.observe(t));
    // Re-scan after async-rendered sections appear
    const _reScan = () => {
      // Re-run the same query selectors and observe any new elements
    };
    [400, 1200, 2500].forEach((ms) => setTimeout(() => {
      document.querySelectorAll<HTMLElement>(
        "main section, main h1, main h2, main h3, main p.lead, main p.eyebrow, .work-tile, .work-card, .session-card, .next-sessions-grid > *, .oil-card-img, .oil-detail-img, .collection-card-img, .catalog-card-img, .oil-card-img-link, .product-image-main, .journal-card, .journal-row, .sale-badge, blockquote, ul, ol, table"
      ).forEach((t) => {
        const tt = t as HTMLElement & { __observed?: boolean };
        if (!tt.__observed) { tt.__observed = true; io.observe(t); }
      });
    }, ms));

    // Number count-up — find any element with data-count-up=N
    document.querySelectorAll<HTMLElement>("[data-count-up]").forEach((el) => {
      const target = Number(el.dataset.countUp ?? "0");
      const duration = 1800;
      let cancelled = false;
      const cio = new IntersectionObserver((entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const start = performance.now();
            function tick(now: number) {
              if (cancelled) return;
              const t = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - t, 3);
              el.textContent = Math.round(target * eased).toLocaleString();
              if (t < 1) requestAnimationFrame(tick);
            }
            requestAnimationFrame(tick);
            cio.unobserve(e.target);
          }
        }
      }, { threshold: 0.4 });
      cio.observe(el);
    });

    // Body scroll progress — drives a vertical "page progress" bar
    let ticking = false;
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          const max = document.documentElement.scrollHeight - window.innerHeight;
          const pct = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
          document.documentElement.style.setProperty("--sf-progress", String(pct));
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => { io.disconnect(); window.removeEventListener("scroll", onScroll); };
  }, []);

  return null;
}
