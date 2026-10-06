import React, { Suspense } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { CTASection } from "@/components/marketing/CTASection";
import { Briefcase } from "lucide-react";
import { WorkGallery, WorkGallerySkeleton, SerializedProject } from "@/components/marketing/WorkGallery";
import { db } from "@/lib/prisma";

export const metadata = {
  title: "Case Studies & Work — ABCD Agency",
  description:
    "Explore our portfolio of web applications, SaaS dashboards, and automated business systems engineered for measurable growth.",
};
export default async function WorkPage() {
  let rawProjects: any[] = [];
  try {
    rawProjects = await db.project.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      select: {
        title: true,
        slug: true,
        client: true,
        category: true,
        tagline: true,
        summary: true,
        impact: true,
        techStack: true,
        thumbnailUrl: true,
        projectType: true,
        demoUrl: true,
        demoEmail: true,
        demoPassword: true,
        demoRole: true,
        createdAt: true,
      },
    });
  } catch (error: any) {
    console.warn("[WorkPage] Primary query failed, falling back to base fields:", error?.message);
    try {
      rawProjects = await db.project.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
        select: {
          title: true,
          slug: true,
          client: true,
          category: true,
          tagline: true,
          summary: true,
          impact: true,
          techStack: true,
          projectType: true,
          demoUrl: true,
          demoEmail: true,
          demoPassword: true,
          demoRole: true,
          createdAt: true,
        },
      });
    } catch (fallbackError) {
      console.error("[WorkPage] Critical error fetching projects:", fallbackError);
      rawProjects = [];
    }
  }

  const serializedProjects: SerializedProject[] = rawProjects.map((p: any) => ({
    title: p.title,
    slug: p.slug,
    client: p.client,
    category: p.category,
    tagline: p.tagline,
    summary: p.summary,
    impact: p.impact,
    techStack: p.techStack,
    thumbnailUrl: p.thumbnailUrl || null,
    projectType: p.projectType || "SANDBOX",
    demoUrl: p.demoUrl || null,
    demoEmail: p.demoEmail || null,
    demoPassword: p.demoPassword || null,
    demoRole: p.demoRole || null,
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
  }));

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

      {/* Interactive Projects Gallery Section */}
      <section className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<WorkGallerySkeleton />}>
          <WorkGallery initialProjects={serializedProjects} />
        </Suspense>
      </section>

      {/* CTA Section */}
      <CTASection />
    </div>
  );
}

