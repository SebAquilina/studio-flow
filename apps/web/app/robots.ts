import type { MetadataRoute } from "next";

export const runtime = "edge";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://casal-olives-web.pages.dev";
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/admin/*", "/api/admin/*"] },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
