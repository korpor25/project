import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.csexhibition.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep private/authenticated areas out of the index.
      disallow: ["/admin", "/login", "/register", "/bookings", "/forgot-password"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
 