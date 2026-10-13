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

export const dynamic = "force-dynamic";

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

  // Turnkey baseline platforms if database is initially empty
  const defaultPlatforms = [
    {
      id: "default-exam-hub",
      name: "ABCD Exam Hub",
      slug: "abcd-exam-hub",
      tagline: "Smarter Exams, Seamless Management, Better Learning Outcomes.",
      description: "ABCD Exam Hub is an AI-powered exam management platform that simplifies question creation, teacher collaboration, student data management, online examinations, automated evaluation, and performance tracking for educational institutions.",
      category: "EdTech SaaS",
      status: "Live Platform",
      statusColor: "emerald",
      appUrl: "https://abcd-exam-hub.abcddigitalhub.com",
      demoEmail: "demo@abcd-exam-hub.com",
      demoPassword: "ExamHub2026!Demo",
      thumbnailUrl: "/images/ecosystem/eduexam_1.jpg",
      screenshots: [
        "/images/ecosystem/eduexam_1.jpg",
        "/images/ecosystem/eduexam_2.jpg"
      ],
      features: [
        "AI-Powered Question Generator & Automatic Grading Engine",
        "Real-Time Anti-Cheat Camera & Browser Screen Proctoring",
        "Multi-Tenant Portals for Schools, Teachers & Students",
        "Instant Exam Publishing & Granular Performance Analytics",
        "Secure Encrypted Question Banks & Bulk Excel Onboarding",
        "Live Exam Countdown Timer, Question Palette & Auto-Submit"
      ],
      techStack: ["Next.js 15", "PostgreSQL", "WebRTC", "Google Gemini AI", "Tailwind CSS", "Redis"],
      targetAudience: "Schools, Universities, Coaching Centers, Online Academies",
      pricingModel: "SaaS & Custom White-Label Licensing",
      isFeatured: true,
      isPublished: true,
      order: 1,
    },
    {
      id: "default-automate-growth",
      name: "AutomateGrowth AI",
      slug: "automate-growth-ai",
      tagline: "Autonomous Multi-Channel Marketing & Lead Conversion Engine.",
      description: "AutomateGrowth AI unifies outbound campaigns, inbound lead scoring, intelligent email and WhatsApp drips, and dynamic personalization to turn cold visitors into high-value closed deals autonomously.",
      category: "Marketing Automation",
      status: "Live Platform",
      statusColor: "emerald",
      appUrl: "https://automate-growth.abcddigitalhub.com",
      demoEmail: "demo@automategrowth.ai",
      demoPassword: "Growth2026!Demo",
      thumbnailUrl: "/images/ecosystem/automate_1.jpg",
      screenshots: [
        "/images/ecosystem/automate_1.jpg",
        "/images/ecosystem/automate_2.jpg"
      ],
      features: [
        "Omnichannel Lead Capture & Automated Scoring Engine",
        "Multi-Step Email, SMS & WhatsApp Sequence Automations",
        "AI Copywriting & Dynamic Personalization Merge Fields",
        "Real-Time Campaign Attribution & ROI Tracking Dashboard",
        "Two-Way Sync with HubSpot, Salesforce & Custom Webhooks",
        "Visual Drag-and-Drop Workflow & Trigger Automation Builder"
      ],
      techStack: ["Next.js 15", "Node.js", "Resend API", "Meta Cloud API", "PostgreSQL", "Vercel AI"],
      targetAudience: "Digital Agencies, E-Commerce Brands, B2B Sales Teams, SaaS Startups",
      pricingModel: "Tiered SaaS & Enterprise Whitelabel",
      isFeatured: true,
      isPublished: true,
      order: 2,
    }
  ];

  const platformsSource = rawPlatforms.length > 0 ? rawPlatforms : defaultPlatforms;

  const serializedPlatforms = platformsSource.map((p: any) => {
    // Dynamic feature generator if features array is empty
    let features = Array.isArray(p.features) && p.features.length > 0 ? p.features : [];
    if (features.length === 0) {
      if (p.category?.toLowerCase().includes("edtech") || p.name?.toLowerCase().includes("exam") || p.slug?.includes("exam")) {
        features = [
          "AI-Powered Question Generator & Automatic Grading Engine",
          "Real-Time Anti-Cheat Camera & Browser Screen Proctoring",
          "Multi-Tenant Portals for Schools, Teachers & Students",
          "Instant Exam Publishing & Granular Performance Analytics",
          "Secure Encrypted Question Banks & Bulk Excel Onboarding",
          "Live Exam Countdown Timer, Question Palette & Auto-Submit"
        ];
      } else if (p.category?.toLowerCase().includes("marketing") || p.name?.toLowerCase().includes("automate") || p.slug?.includes("automate")) {
        features = [
          "Omnichannel Lead Capture & Automated Scoring Engine",
          "Multi-Step Email, SMS & WhatsApp Sequence Automations",
          "AI Copywriting & Dynamic Personalization Merge Fields",
          "Real-Time Campaign Attribution & ROI Tracking Dashboard",
          "Two-Way Sync with HubSpot, Salesforce & Custom Webhooks",
          "Visual Drag-and-Drop Workflow & Trigger Automation Builder"
        ];
      }
    }

    // Dynamic screenshot collection
    let screenshots = Array.isArray(p.screenshots) && p.screenshots.length > 0 ? p.screenshots : [];
    if (screenshots.length === 0) {
      if (p.slug?.includes("automate") || p.category?.toLowerCase().includes("marketing")) {
        screenshots = ["/images/ecosystem/automate_1.jpg", "/images/ecosystem/automate_2.jpg"];
      } else {
        screenshots = ["/images/ecosystem/eduexam_1.jpg", "/images/ecosystem/eduexam_2.jpg"];
      }
    }

    return {
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
      thumbnailUrl: p.thumbnailUrl || screenshots[0],
      screenshots,
      features,
      techStack: Array.isArray(p.techStack) && p.techStack.length > 0 ? p.techStack : [],
      targetAudience: p.targetAudience,
      pricingModel: p.pricingModel,
      isFeatured: Boolean(p.isFeatured),
      isPublished: Boolean(p.isPublished),
      order: p.order || 0,
    };
  });

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
