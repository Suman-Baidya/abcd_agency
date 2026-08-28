import React, { Suspense } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { NewProjectButton } from "@/components/dashboard/NewProjectButton";
import { ProjectTableRow } from "@/components/dashboard/ProjectTableRow";
import { ProjectFilters } from "@/components/dashboard/ProjectFilters";
import { ProjectPagination } from "@/components/dashboard/ProjectPagination";
import { db } from "@/lib/prisma";

export const metadata = {
  title: "Projects — ABCD Agency",
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
}) {
  const resolvedParams = await searchParams;
  const q = typeof resolvedParams?.q === "string" ? resolvedParams.q : undefined;
  const statusFilter = typeof resolvedParams?.status === "string" ? resolvedParams.status : undefined;
  const page = typeof resolvedParams?.page === "string" ? parseInt(resolvedParams.page, 10) : 1;
  const limit = typeof resolvedParams?.limit === "string" ? parseInt(resolvedParams.limit, 10) : 20;

  const where = {
    ...(q ? { title: { contains: q, mode: 'insensitive' as any } } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
  };

  const [projects, totalProjects, allProjectsForCategories] = await Promise.all([
    db.project.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.project.count({ where }),
    db.project.findMany({ select: { category: true } }) // Needed for unique categories datalist
  ]);

  const uniqueCategories = Array.from(new Set(allProjectsForCategories.map((p) => p.category)));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">
            Projects
          </h1>
          <p className="text-sm text-[#737373] dark:text-neutral-400 mt-1">
            Manage and monitor all agency projects.
          </p>
        </div>
        <NewProjectButton categories={uniqueCategories} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="!p-4">
          <p className="text-xs font-semibold text-[#737373] dark:text-neutral-400 uppercase tracking-wider">
            Total
          </p>
          <p className="text-xl font-bold text-[#0A0A0A] dark:text-white mt-1">
            {totalProjects}
          </p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs font-semibold text-[#737373] dark:text-neutral-400 uppercase tracking-wider">
            On Track
          </p>
          <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
            {projects.filter((p) => p.status === "On Track").length}
          </p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs font-semibold text-[#737373] dark:text-neutral-400 uppercase tracking-wider">
            Delayed
          </p>
          <p className="text-xl font-bold text-amber-700 dark:text-amber-400 mt-1">
            {projects.filter((p) => p.status === "Delayed").length}
          </p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs font-semibold text-[#737373] dark:text-neutral-400 uppercase tracking-wider">
            Total Budget
          </p>
          <p className="text-xl font-bold text-[#0A0A0A] dark:text-white mt-1">
            ₹160.5k
          </p>
        </Card>
      </div>

      {/* Projects Table */}
      <Card className="overflow-hidden !p-0">
        <div className="p-5 sm:p-6 border-b border-[#E5E5E5] dark:border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-[#0A0A0A] dark:text-white">
            All Projects
          </h2>
          <Suspense fallback={<div className="h-9 w-64 bg-[#F5F5F5] dark:bg-[#111111] animate-pulse rounded-md"></div>}>
            <ProjectFilters />
          </Suspense>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#262626] dark:text-neutral-300">
            <thead className="text-[11px] font-semibold uppercase tracking-wider text-[#525252] dark:text-[#A3A3A3] bg-neutral-200/80 dark:bg-[#0A0A0A]/70 backdrop-blur-md border-b border-[#E5E5E5] dark:border-[#262626]">
              <tr>
                <th className="px-6 py-3.5 w-16">SL</th>
                <th className="px-6 py-3.5 w-80">Project Details</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 w-24">Progress</th>
                <th className="px-6 py-3.5">Budget</th>
                <th className="px-6 py-3.5">Deadline</th>
                <th className="px-6 py-3.5 text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#262626]">
              {projects.length > 0 ? projects.map((project, index) => (
                <ProjectTableRow 
                  key={project.id} 
                  project={project} 
                  serialNumber={(page - 1) * limit + index + 1} 
                  categories={uniqueCategories}
                />
              )) : (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[#737373]">
                    No projects found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Suspense fallback={<div className="h-16 border-t border-[#E5E5E5] dark:border-[#262626]"></div>}>
          <ProjectPagination totalItems={totalProjects} />
        </Suspense>
      </Card>
    </div>
  );
}
