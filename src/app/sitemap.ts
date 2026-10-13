import { MetadataRoute } from "next";
import { db } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://abcddigitalhub.com";
  const lastModified = new Date();

  // Core public marketing pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}`, lastModified, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/services`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/work`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/pricing`, lastModified, changeFrequency: "weekly", priority: 0.85 },
    { url: `${baseUrl}/ecosystem`, lastModified, changeFrequency: "weekly", priority: 0.85 },
    { url: `${baseUrl}/blog`, lastModified, changeFrequency: "daily", priority: 0.85 },
    { url: `${baseUrl}/contact`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/careers`, lastModified, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/privacy`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/refund`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/cookies`, lastModified, changeFrequency: "yearly", priority: 0.3 },
  ];

  try {
    const [publishedPosts, publishedProjects] = await Promise.all([
      db.blogPost.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
      db.project.findMany({
        where: { isPublished: true },
        select: { slug: true, updatedAt: true },
      }),
    ]);

    const postRoutes: MetadataRoute.Sitemap = (publishedPosts as Array<{ slug: string; updatedAt: Date | null }>).map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt || lastModified,
      changeFrequency: "weekly",
      priority: 0.75,
    }));

    const projectRoutes: MetadataRoute.Sitemap = (publishedProjects as Array<{ slug: string; updatedAt: Date | null }>).map((proj) => ({
      url: `${baseUrl}/work/${proj.slug}`,
      lastModified: proj.updatedAt || lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    }));

    return [...staticRoutes, ...postRoutes, ...projectRoutes];
  } catch (err) {
    console.warn("Could not query dynamic sitemap routes, returning static fallback:", err);
    return staticRoutes;
  }
}
