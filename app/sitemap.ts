import type { MetadataRoute } from "next";
import { articles } from "@/lib/articles";
import { galleryVenues } from "@/lib/gallery";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.csexhibition.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/events`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/articles`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteUrl}/faq`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/gallery`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/contact`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const galleryRoutes: MetadataRoute.Sitemap = galleryVenues.map((v) => ({
    url: `${siteUrl}/gallery/${v.slug}`,
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${siteUrl}/articles/${encodeURIComponent(a.slug)}`,
    lastModified: new Date(a.updatedAt),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...galleryRoutes, ...articleRoutes];
}
 