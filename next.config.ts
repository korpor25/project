import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const API_ORIGIN = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  // Re-enable once placeholder routes (/about, /contact, /terms, etc.) are implemented.
  typedRoutes: false,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${API_ORIGIN}/api/:path*`,
      },
      {
        source: "/health/:path*",
        destination: `${API_ORIGIN}/health/:path*`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
