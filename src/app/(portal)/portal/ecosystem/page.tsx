import React from "react";
import Link from "next/link";
import { db } from "@/lib/prisma";
import { ShieldCheck, Send } from "lucide-react";
import { EcoSystemCard } from "@/components/marketing/EcoSystemCard";

export const metadata = {
  title: "Apps & Software Systems — ABCD Agency Portal",
  description: "Explore our proprietary multi-tenant SaaS engines and AI marketing automations ready for enterprise deployment.",
};

export default async function PortalEcoSystemPage() {
  let platforms: any[] = [];
  try {
    platforms = await db.ecoSystemPlatform.findMany({
      where: { isPublished: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
  } catch (err) {
    console.error("Error loading EcoSystem platforms in portal:", err);
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
    thumbnailUrl: p.thumbnailUrl || (p.slug.includes("automate") ? "/images/ecosystem/automate_1.jpg" : "/images/ecosystem/eduexam_1.jpg"),
    screenshots: Array.isArray(p.screenshots) && p.screenshots.length > 0
      ? p.screenshots
      : (p.slug.includes("automate")
          ? ["/images/ecosystem/automate_1.jpg", "/images/ecosystem/automate_2.jpg"]
          : ["/images/ecosystem/eduexam_1.jpg", "/images/ecosystem/eduexam_2.jpg"]),
    features: Array.isArray(p.features) ? p.features : [],
    techStack: Array.isArray(p.techStack) ? p.techStack : [],
    targetAudience: p.targetAudience,
    pricingModel: p.pricingModel,
    isFeatured: Boolean(p.isFeatured),
    isPublished: Boolean(p.isPublished),
    order: p.order || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div id="portal-ecosystem-header">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">
          Ecosys Platforms
        </h1>
        <p className="text-xs sm:text-sm text-[#737373] dark:text-neutral-400 mt-1">
          Explore ready-to-deploy platforms and autonomous AI systems built by ABCD Agency for instant client adoption.
        </p>
      </div>

      {/* Client Benefit Benchmark Strip (Unboxed & Clean) */}
      <div id="portal-ecosystem-benefit-banner" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E5E5] dark:border-[#262626]">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0A0A0A] dark:text-white">
            Client Tier Benefit
          </span>
          <span className="text-[#E5E5E5] dark:text-neutral-800">/</span>
          <span className="text-xs font-mono text-[#737373] dark:text-neutral-400">
            Preferential White-Label Terms &amp; Dedicated Deployment
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#737373] dark:text-neutral-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Priority White-Label SLA Included</span>
        </div>
      </div>

      {/* Platforms Showcase */}
      <div id="portal-ecosystem-showcase-list">
        {serialized.length > 0 ? (
          serialized.map((platform, idx) => (
            <EcoSystemCard key={platform.id} platform={platform} index={idx} />
          ))
        ) : (
          <div className="p-10 border border-dashed border-[#E5E5E5] dark:border-[#262626] rounded-xl text-center text-xs text-[#737373]">
            No platforms currently published in the catalog.
          </div>
        )}
      </div>
    </div>
  );
}
