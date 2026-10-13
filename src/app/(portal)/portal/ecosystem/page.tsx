import React from "react";
import Link from "next/link";
import { db } from "@/lib/prisma";
import { ShieldCheck, Send } from "lucide-react";
import { EcoSystemCard } from "@/components/marketing/EcoSystemCard";

export const metadata = {
  title: "Apps & Software Systems — ABCD Digital Hub Portal",
  description: "Explore our proprietary multi-tenant SaaS engines and AI marketing automations ready for enterprise deployment.",
};

export const dynamic = "force-dynamic";

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

  const source = platforms.length > 0 ? platforms : defaultPlatforms;

  const serialized = source.map((p: any) => {
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
    <div className="space-y-6">
      {/* Page Header */}
      <div id="portal-ecosystem-header">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">
          Ecosys Platforms
        </h1>
        <p className="text-xs sm:text-sm text-[#737373] dark:text-neutral-400 mt-1">
          Explore ready-to-deploy platforms and autonomous AI systems built by ABCD Digital Hub for instant client adoption.
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
