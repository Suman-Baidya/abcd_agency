import React from "react";
import { db } from "@/lib/prisma";
import { EcoSystemManager } from "@/components/dashboard/EcoSystemManager";

export const metadata = {
  title: "EcoSystem Platforms — ABCD Digital Hub Admin",
};

export default async function AdminEcoSystemPage() {
  let platforms: any[] = [];
  try {
    platforms = await db.ecoSystemPlatform.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
  } catch (err) {
    console.error("Error loading EcoSystem platforms in admin:", err);
    platforms = [];
  }

  const serialized = platforms.map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    tagline: p.tagline,
    description: p.description,
    category: p.category,
    status: p.status,
    statusColor: p.statusColor,
    appUrl: p.appUrl,
    demoEmail: p.demoEmail,
    demoPassword: p.demoPassword,
    thumbnailUrl: p.thumbnailUrl,
    screenshots: Array.isArray(p.screenshots) ? p.screenshots : [],
    features: Array.isArray(p.features) ? p.features : [],
    techStack: Array.isArray(p.techStack) ? p.techStack : [],
    targetAudience: p.targetAudience,
    pricingModel: p.pricingModel,
    isFeatured: Boolean(p.isFeatured),
    isPublished: Boolean(p.isPublished),
    order: p.order || 0,
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
  }));

  return <EcoSystemManager initialPlatforms={serialized} />;
}
