import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { packages } from "@/lib/packages";

const BASE = "https://helanka.co";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/packages`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/destinations`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/build`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/group-experiences`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/blog`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/contact`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/cancellation-policy`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const packagePages: MetadataRoute.Sitemap = packages.map((pkg) => ({
    url: `${BASE}/packages/${pkg.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const dynamicPages: MetadataRoute.Sitemap = [];

  if (db) {
    const destinations = await db.destination.findMany({
      select: { slug: true, updatedAt: true },
    });
    for (const d of destinations) {
      dynamicPages.push({
        url: `${BASE}/destinations/${d.slug}`,
        lastModified: d.updatedAt,
        changeFrequency: "monthly",
        priority: 0.8,
      });
    }

    const posts = await db.blogPost.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    });
    for (const p of posts) {
      dynamicPages.push({
        url: `${BASE}/blog/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return [...staticPages, ...packagePages, ...dynamicPages];
}
