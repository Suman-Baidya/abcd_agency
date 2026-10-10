import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://abcddigitalhub.com";
  const lastModified = new Date();

  // Core public marketing pages
  const routes = [
    { path: "", changeFrequency: "weekly" as const, priority: 1.0 },
    { path: "/services", changeFrequency: "weekly" as const, priority: 0.9 },
    { path: "/process", changeFrequency: "monthly" as const, priority: 0.8 },
    { path: "/work", changeFrequency: "weekly" as const, priority: 0.85 },
    { path: "/pricing", changeFrequency: "weekly" as const, priority: 0.85 },
    { path: "/contact", changeFrequency: "monthly" as const, priority: 0.9 },
    { path: "/careers", changeFrequency: "monthly" as const, priority: 0.6 },
    { path: "/privacy", changeFrequency: "yearly" as const, priority: 0.3 },
    { path: "/terms", changeFrequency: "yearly" as const, priority: 0.3 },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
