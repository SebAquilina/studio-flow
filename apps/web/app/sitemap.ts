import type { MetadataRoute } from "next";

export const runtime = "edge";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://casal-olives-web.pages.dev";
  const now = new Date();
  return [
    "/", "/oils", "/grove", "/journal", "/contact",
    "/concept", "/privacy", "/terms", "/checkout",
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: path === "/" ? 1.0 : 0.7,
  }));
}
