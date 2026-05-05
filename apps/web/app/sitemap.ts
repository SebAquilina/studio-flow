import type { MetadataRoute } from "next";
export const runtime = "edge";
const CLASSES = ["slow-hatha", "yin", "vinyasa-flow", "mat-foundations", "breath-coherent"];
const INSTRUCTORS = ["sienna-borg", "marco-said", "lara-mizzi"];
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://studio-flow-web.pages.dev";
  const now = new Date();
  const paths = [
    "/", "/classes", "/instructors", "/schedule", "/contact",
    "/concept", "/privacy", "/terms", "/checkout",
    ...CLASSES.map((s) => `/classes/${s}`),
    ...INSTRUCTORS.map((s) => `/instructors/${s}`),
  ];
  return paths.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1.0 : 0.7,
  }));
}
