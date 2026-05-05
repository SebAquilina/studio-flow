/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    serverComponentsExternalPackages: ["@anthropic-ai/sdk"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "**.pages.dev" },
      { protocol: "https", hostname: "concierge.studio" },
    ],
  },
};

if (process.env.NODE_ENV === "development") {
  await import("@cloudflare/next-on-pages/next-dev").then((m) =>
    m.setupDevPlatform()
  );
}

export default nextConfig;
