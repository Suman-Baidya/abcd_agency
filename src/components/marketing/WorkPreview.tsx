import React from "react";
import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { db } from "@/lib/prisma";

export async function WorkPreview() {
  // Fetch up to 3 featured projects from the database
  const projects = await db.project.findMany({
    where: { isFeatured: true },
    take: 3,
    orderBy: { createdAt: "desc" },
    select: {
      title: true,
      slug: true,
      category: true,
      tagline: true,
      summary: true,
      impact: true,
      techStack: true,
    }
  });

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
          {projects.length > 0 ? (
            projects.map((project: any) => (
              <ProjectCard key={project.slug} project={project} />
            ))
          ) : (
            <div className="col-span-3 py-12 text-center text-[#737373] dark:text-neutral-400 border border-dashed border-[#E5E5E5] dark:border-[#262626] rounded-xl">
              No featured projects found. Check your dashboard.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
