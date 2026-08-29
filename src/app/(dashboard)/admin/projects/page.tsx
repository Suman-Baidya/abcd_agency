import React, { Suspense } from "react";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/dashboard/StatCard";
import { Badge } from "@/components/ui/Badge";
import { NewProjectButton } from "@/components/dashboard/NewProjectButton";
import { ProjectTableRow } from "@/components/dashboard/ProjectTableRow";
import { ProjectFilters } from "@/components/dashboard/ProjectFilters";
import { ProjectPagination } from "@/components/dashboard/ProjectPagination";
import { CategoryManager } from "@/components/dashboard/CategoryManager";
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
  const sort = typeof resolvedParams?.sort === "string" ? resolvedParams.sort : "newest";
  const page = typeof resolvedParams?.page === "string" ? parseInt(resolvedParams.page, 10) : 1;
  const limit = typeof resolvedParams?.limit === "string" ? parseInt(resolvedParams.limit, 10) : 20;

  const where = {
    ...(q ? { title: { contains: q, mode: 'insensitive' as any } } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
  };

  let orderBy: any = { createdAt: "desc" };
  if (sort === "oldest") orderBy = { createdAt: "asc" };
  else if (sort === "a-z") orderBy = { title: "asc" };
  else if (sort === "z-a") orderBy = { title: "desc" };
  else if (sort === "progress") orderBy = { progress: "desc" };

  const [projects, totalProjects, projectCategories, allStatusGroup, totalAll] = await Promise.all([
    db.project.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.project.count({ where }),
    db.category.findMany({ orderBy: { name: 'asc' } }),
    db.project.groupBy({
      by: ['status'],
      _count: { _all: true },
      where: q ? { title: { contains: q, mode: 'insensitive' as any } } : undefined,
    }),
    db.project.count({
      where: q ? { title: { contains: q, mode: 'insensitive' as any } } : undefined,
    }),
  ]);

  const categoryNames = projectCategories.map(c => c.name);

  const statusCounts: Record<string, number> = {
    All: totalAll,
    "On Track": 0,
    "In Review": 0,
    "Delayed": 0,
    "On Hold": 0,
  };

  allStatusGroup.forEach((g: any) => {
    if (g.status) {
      statusCounts[g.status] = g._count._all;
    }
  });

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
        <div className="flex items-center gap-2">
          <CategoryManager categories={projectCategories} />
          <NewProjectButton categories={categoryNames} />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Projects" value={totalAll} />
        <StatCard label="On Track" value={statusCounts["On Track"] || 0} color="emerald" />
        <StatCard label="Delayed" value={statusCounts["Delayed"] || 0} color="amber" />
        <StatCard label="Total Budget" value="₹160.5k" />
      </div>

      {/* Projects Table */}
      <Card className="overflow-hidden !p-0 border border-[#E5E5E5] dark:border-[#262626] shadow-sm">
        <div className="p-4 sm:p-5 border-b border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A]">
          <Suspense fallback={<div className="h-10 w-full bg-[#F5F5F5] dark:bg-[#111111] animate-pulse rounded-md"></div>}>
            <ProjectFilters statusCounts={statusCounts} />
          </Suspense>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#262626] dark:text-neutral-300">
            <thead className="text-[11px] font-semibold uppercase tracking-wider text-[#525252] dark:text-[#A3A3A3] bg-[#F9F9F9] dark:bg-[#0E0E0E] border-b border-[#E5E5E5] dark:border-[#262626]">
              <tr>
                <th className="px-5 py-3.5 w-12 text-center">SL</th>
                <th className="px-5 py-3.5 w-80">Project Details</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 w-24">Progress</th>
                <th className="px-5 py-3.5">Budget</th>
                <th className="px-5 py-3.5">Deadline</th>
                <th className="px-5 py-3.5 text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#262626]">
              {projects.length > 0 ? projects.map((project: any, index: number) => (
                <ProjectTableRow 
                  key={project.id} 
                  project={project} 
                  serialNumber={(page - 1) * limit + index + 1} 
                  categories={categoryNames}
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
