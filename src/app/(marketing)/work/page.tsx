import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { projectsData } from "@/data/projects";
import { Badge } from "@/components/ui/Badge";
import { CTASection } from "@/components/marketing/CTASection";

export const metadata = {
  title: "Case Studies & Work — ABCD Agency",
  description:
    "Explore our portfolio of web applications, SaaS dashboards, and automated business systems engineered for measurable growth.",
};

export default function WorkPage() {
  return (
    <div className="bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white transition-colors duration-200">
      {/* Hero Header */}
      <PageHeader
        subtitle="Engineering Portfolio"
        title="Selected client systems & software case studies."
        description="We design and ship high-impact digital systems. Review our architectural breakdowns, technical decisions, and tangible business outcomes below."
      />

      {/* Projects Grid */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {projectsData.map((project) => (
            <Link
              key={project.slug}
              href={`/work/${project.slug}`}
              className="group flex flex-col rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:hover:border-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-white"
            >
              {/* Project Preview Graphic */}
              <div className="h-56 bg-[#F5F5F5] dark:bg-[#161616] border-b border-[#E5E5E5] dark:border-[#262626] p-6 flex flex-col justify-between relative">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                    {project.category}
                  </span>
                  <Badge variant="solid" size="sm">
                    {project.impact}
                  </Badge>
                </div>

                <div className="my-auto py-2">
                  <div className="h-1.5 w-20 bg-[#0A0A0A] dark:bg-white rounded-full mb-2" />
                  <div className="h-1.5 w-36 bg-neutral-300 dark:bg-neutral-700 rounded-full" />
                </div>

                <div className="text-xs font-mono font-semibold text-[#0A0A0A] dark:text-white">
                  Read Deep Dive →
                </div>
              </div>

              {/* Project Info */}
              <div className="p-6 sm:p-8 flex flex-col flex-1 justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[#0A0A0A] dark:text-white tracking-tight group-hover:underline underline-offset-4 mb-2">
                    {project.title}
                  </h3>
                  <p className="text-sm font-medium text-[#0A0A0A] dark:text-neutral-200 mb-3">
                    {project.tagline}
                  </p>
                  <p className="text-xs text-[#737373] dark:text-neutral-400 leading-relaxed mb-6">
                    {project.summary}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-4 border-t border-[#E5E5E5] dark:border-[#262626]">
                  {project.techStack.map((tech) => (
                    <Badge key={tech} variant="outline" size="sm">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <CTASection />
    </div>
  );
}
