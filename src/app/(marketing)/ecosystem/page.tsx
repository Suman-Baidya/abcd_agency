import React, { Suspense } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { CTASection } from "@/components/marketing/CTASection";
import { Layers, Sparkles, Cpu, CheckCircle } from "lucide-react";
import { EcoSystemGallery } from "@/components/marketing/EcoSystemGallery";
import { db } from "@/lib/prisma";

export const metadata = {
  title: "EcoSystem & Proprietary Platforms",
  description:
    "Explore our ecosystem of proprietary multi-tenant web applications, AI-powered automation workflows, and specialized business platforms.",
};

export default async function EcoSystemPage() {
  let rawPlatforms: any[] = [];
  try {
    rawPlatforms = await db.ecoSystemPlatform.findMany({
      where: { isPublished: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });
  } catch (error) {
    console.error("[EcoSystemPage] Error fetching platforms:", error);
    rawPlatforms = [];
  }

  const serializedPlatforms = rawPlatforms.map((p: any) => ({
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
    <div className="bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white transition-colors duration-200">
      {/* Page Hero Header */}
      <PageHeader
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Ecosys", href: "/ecosystem" },
        ]}
        title="Ecosys Platforms"
        description="Proprietary multi-tenant SaaS platforms and autonomous AI systems ready for instant adoption."
        icon={<Layers className="w-32 h-32" />}
      />

      {/* Main Showcase Section */}
      <section className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Engineering Benchmark Strip (Unboxed & Smart) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E5E5E5] dark:border-[#262626]">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0A0A0A] dark:text-white">
              Proprietary Systems
            </span>
            <span className="text-[#E5E5E5] dark:text-neutral-800">/</span>
            <span className="text-xs font-mono text-[#737373] dark:text-neutral-400">
              Turnkey Multi-Tenant SaaS &amp; Autonomous AI
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#737373] dark:text-neutral-400">
            <span>[ Production Hardened ]</span>
            <span>[ Dedicated Instances Available ]</span>
          </div>
        </div>

        {/* Dynamic Gallery */}
        <EcoSystemGallery initialPlatforms={serializedPlatforms} />
      </section>

      {/* CTA Section */}
      <CTASection />
    </div>
  );
}
