import React from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { CTASection } from "@/components/marketing/CTASection";
import { Briefcase } from "lucide-react";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { db } from "@/lib/prisma";

export const metadata = {
  title: "Case Studies & Work — ABCD Agency",
  description:
    "Explore our portfolio of web applications, SaaS dashboards, and automated business systems engineered for measurable growth.",
};

export default async function WorkPage() {
  const projects = await db.project.findMany({
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
    <div className="bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white transition-colors duration-200">
      {/* Hero Header */}
      <PageHeader
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Work", href: "/work" },
        ]}
        title="Client Systems"
        description="Explore our selection of high-velocity web platforms, automated systems, and highly detailed architectural case studies."
        icon={<Briefcase className="w-32 h-32" />}
      />

      {/* Projects Grid */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {projects.length > 0 ? (
            projects.map((project: any) => (
              <ProjectCard key={project.slug} project={project} />
            ))
          ) : (
            <div className="col-span-3 py-12 text-center text-[#737373] dark:text-neutral-400 border border-dashed border-[#E5E5E5] dark:border-[#262626] rounded-xl">
              No projects found. Check your dashboard.
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <CTASection />
    </div>
  );
}
