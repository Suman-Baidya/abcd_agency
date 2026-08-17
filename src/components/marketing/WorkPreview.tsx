import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { SectionHeader } from "@/components/ui/SectionHeader";

interface ProjectItem {
  title: string;
  slug: string;
  category: string;
  tagline: string;
  description: string;
  impact: string;
  tags: string[];
}

const projects: ProjectItem[] = [
  {
    title: "RGYCSP Education Portal",
    slug: "rgycsp-portal",
    category: "Web Application & ERP",
    tagline: "40% increase in student admissions & verification speed",
    description:
      "A complete digitalization of student enrollment, fee collection, and digital diploma verification across 50+ study centers.",
    impact: "+40% Enrollment Rate",
    tags: ["Next.js", "PostgreSQL", "Prisma", "Auth.js"],
  },
  {
    title: "ApexFlow SaaS Analytics",
    slug: "apexflow-saas",
    category: "SaaS Product & Dashboard",
    tagline: "Sub-50ms analytics query latency across 100k daily events",
    description:
      "High-throughput multi-tenant SaaS dashboard for tracking real-time operations, subscription metering, and cloud telemetry.",
    impact: "<50ms Latency",
    tags: ["TypeScript", "Tailwind CSS", "Neon DB", "Vercel AI"],
  },
  {
    title: "Nexus Automation Engine",
    slug: "nexus-ai-engine",
    category: "AI & Workflow Automation",
    tagline: "85% reduction in manual customer qualification time",
    description:
      "Autonomous lead scoring and routing system built on Google Gemini 2.5 and automated Resend transactional email workflows.",
    impact: "85% Time Saved",
    tags: ["Google Gemini", "Resend", "Next.js 15", "Cloudinary"],
  },
];

export function WorkPreview() {
  return (
    <section className="py-20 md:py-32 bg-white dark:bg-[#0A0A0A] transition-colors duration-200" id="work">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div className="flex-1">
            <SectionHeader
              subtitle="Featured Case Studies"
              title="Engineered for measurable impact."
              align="left"
            />
          </div>
          <Link
            href="/work"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#0A0A0A] dark:text-white hover:underline underline-offset-4"
          >
            View all work
            <svg
              className="w-4 h-4 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <Link
              key={project.slug}
              href={`/work/${project.slug}`}
              className="group flex flex-col rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:hover:border-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-white"
            >
              {/* Project Preview Graphic */}
              <div className="h-52 bg-[#F5F5F5] dark:bg-[#161616] border-b border-[#E5E5E5] dark:border-[#262626] p-6 flex flex-col justify-between relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                    {project.category}
                  </span>
                  <Badge variant="solid" size="sm">
                    {project.impact}
                  </Badge>
                </div>

                {/* Abstract Visual Pattern */}
                <div className="my-auto py-2">
                  <div className="h-1.5 w-16 bg-[#0A0A0A] dark:bg-white rounded-full mb-2" />
                  <div className="h-1.5 w-32 bg-neutral-300 dark:bg-neutral-700 rounded-full" />
                </div>

                <div className="text-[11px] font-mono text-[#737373] dark:text-neutral-400">
                  Case Study →
                </div>
              </div>

              {/* Project Details */}
              <div className="p-6 sm:p-8 flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[#0A0A0A] dark:text-white tracking-tight group-hover:underline underline-offset-4 mb-2">
                    {project.title}
                  </h3>
                  <p className="text-sm font-medium text-[#0A0A0A] dark:text-neutral-200 mb-3">
                    {project.tagline}
                  </p>
                  <p className="text-xs text-[#737373] dark:text-neutral-400 leading-relaxed mb-6">
                    {project.description}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-4 border-t border-[#E5E5E5] dark:border-[#262626]">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="outline" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
