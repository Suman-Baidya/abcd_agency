import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { projectsData } from "@/data/projects";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CTASection } from "@/components/marketing/CTASection";

export function generateStaticParams() {
  return projectsData.map((project) => ({
    slug: project.slug,
  }));
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projectsData.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white transition-colors duration-200">
      {/* Case Study Hero */}
      <section className="pt-16 pb-16 md:pt-24 md:pb-20 border-b border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              href="/work"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white transition-colors mb-6"
            >
              <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to all case studies
            </Link>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-xs font-mono uppercase tracking-widest text-[#737373] dark:text-neutral-400">
                {project.category}
              </span>
              <Badge variant="solid" size="sm">
                {project.impact}
              </Badge>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#0A0A0A] dark:text-white leading-tight mb-4">
              {project.title}
            </h1>
            <p className="text-lg sm:text-xl text-[#737373] dark:text-neutral-400 leading-relaxed">
              {project.summary}
            </p>
          </div>

          {/* Metadata Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-8 border-t border-[#E5E5E5] dark:border-[#262626]">
            <div>
              <p className="text-xs font-mono uppercase text-[#737373] dark:text-neutral-400">Client</p>
              <p className="text-sm font-semibold text-[#0A0A0A] dark:text-white mt-1">{project.client}</p>
            </div>
            <div>
              <p className="text-xs font-mono uppercase text-[#737373] dark:text-neutral-400">Sprint Timeline</p>
              <p className="text-sm font-semibold text-[#0A0A0A] dark:text-white mt-1">{project.timeline}</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-xs font-mono uppercase text-[#737373] dark:text-neutral-400">Primary Outcome</p>
              <p className="text-sm font-semibold text-[#0A0A0A] dark:text-white mt-1">{project.impact}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* The Problem */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] dark:text-white mb-4">
            The Challenge &amp; Bottleneck
          </h2>
          <p className="text-base sm:text-lg text-[#262626] dark:text-neutral-300 leading-relaxed">
            {project.problem}
          </p>
        </div>

        {/* The Architecture & Solution */}
        <div className="p-8 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#111111]">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] dark:text-white mb-4">
            Engineering Solution &amp; Architecture
          </h2>
          <p className="text-base text-[#262626] dark:text-neutral-300 leading-relaxed mb-6">
            {project.solution}
          </p>

          <h3 className="text-xs font-mono uppercase tracking-widest text-[#737373] dark:text-neutral-400 mb-3">
            Core Features &amp; Modules
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {project.features.map((feat) => (
              <li key={feat} className="text-xs font-medium text-[#0A0A0A] dark:text-neutral-200 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0A0A0A] dark:bg-white" />
                {feat}
              </li>
            ))}
          </ul>
        </div>

        {/* Measurable Results */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] dark:text-white mb-6">
            Measurable Results &amp; ROI
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {project.results.map((res, i) => (
              <div
                key={i}
                className="p-6 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] flex items-start gap-4 shadow-xs"
              >
                <div className="w-6 h-6 rounded-full bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  ✓
                </div>
                <p className="text-sm font-medium text-[#0A0A0A] dark:text-neutral-200 leading-relaxed">
                  {res}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack Chips */}
        <div className="pt-8 border-t border-[#E5E5E5] dark:border-[#262626]">
          <p className="text-xs font-mono uppercase tracking-widest text-[#737373] dark:text-neutral-400 mb-4">
            Technologies &amp; Frameworks Deployed
          </p>
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <Badge key={tech} variant="outline" size="md">
                {tech}
              </Badge>
            ))}
          </div>
        </div>

        <div className="pt-8 flex justify-center">
          <Button href="/contact" variant="primary" size="lg">
            Start a Similar Project
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection />
    </div>
  );
}
