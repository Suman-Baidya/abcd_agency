import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Projects — ABCD Agency",
};

const projects = [
  {
    name: "ApexFlow Dashboard",
    client: "ApexFlow Inc.",
    status: "On Track",
    statusColor: "emerald",
    progress: 75,
    budget: "$18,000",
    deadline: "Sep 30, 2026",
  },
  {
    name: "Nexus AI Pipeline",
    client: "Nexus Labs",
    status: "In Review",
    statusColor: "neutral",
    progress: 90,
    budget: "$32,500",
    deadline: "Aug 28, 2026",
  },
  {
    name: "RGYCSP Portal",
    client: "Govt Sector",
    status: "Delayed",
    statusColor: "amber",
    progress: 40,
    budget: "$45,000",
    deadline: "Dec 15, 2026",
  },
  {
    name: "FinEdge Mobile App",
    client: "FinEdge Capital",
    status: "On Track",
    statusColor: "emerald",
    progress: 55,
    budget: "$28,000",
    deadline: "Nov 01, 2026",
  },
  {
    name: "Meridian CRM",
    client: "Meridian Group",
    status: "On Hold",
    statusColor: "neutral",
    progress: 20,
    budget: "$15,000",
    deadline: "Jan 10, 2027",
  },
  {
    name: "CloudSync Integration",
    client: "CloudSync Ltd.",
    status: "On Track",
    statusColor: "emerald",
    progress: 65,
    budget: "$22,000",
    deadline: "Oct 20, 2026",
  },
];

function statusBadge(status: string, color: string) {
  if (color === "emerald") {
    return (
      <Badge
        variant="solid"
        className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-none"
      >
        {status}
      </Badge>
    );
  }
  if (color === "amber") {
    return (
      <Badge
        variant="solid"
        className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-none"
      >
        {status}
      </Badge>
    );
  }
  return <Badge variant="outline">{status}</Badge>;
}

export default function ProjectsPage() {
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
        <Button variant="primary" size="sm">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Project
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="!p-4">
          <p className="text-xs font-semibold text-[#737373] dark:text-neutral-400 uppercase tracking-wider">
            Total
          </p>
          <p className="text-xl font-bold text-[#0A0A0A] dark:text-white mt-1">
            {projects.length}
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
            $160.5k
          </p>
        </Card>
      </div>

      {/* Projects Table */}
      <Card className="overflow-hidden !p-0">
        <div className="p-5 sm:p-6 border-b border-[#E5E5E5] dark:border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-[#0A0A0A] dark:text-white">
            All Projects
          </h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <svg
                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search projects..."
                className="pl-9 pr-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white w-48"
              />
            </div>
            <select className="text-xs border border-[#E5E5E5] dark:border-[#262626] bg-transparent rounded-md px-3 py-2 font-medium text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white cursor-pointer">
              <option>All Status</option>
              <option>On Track</option>
              <option>In Review</option>
              <option>Delayed</option>
              <option>On Hold</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#262626] dark:text-neutral-300">
            <thead className="text-xs font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400 bg-[#FBFBFB] dark:bg-[#111111] border-b border-[#E5E5E5] dark:border-[#262626]">
              <tr>
                <th className="px-6 py-3.5">Project</th>
                <th className="px-6 py-3.5">Client</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Progress</th>
                <th className="px-6 py-3.5">Budget</th>
                <th className="px-6 py-3.5">Deadline</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#262626]">
              {projects.map((project) => (
                <tr
                  key={project.name}
                  className="hover:bg-[#FBFBFB] dark:hover:bg-[#1A1A1A] transition-colors"
                >
                  <td className="px-6 py-4 font-semibold text-[#0A0A0A] dark:text-white whitespace-nowrap">
                    {project.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {project.client}
                  </td>
                  <td className="px-6 py-4">
                    {statusBadge(project.status, project.statusColor)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <div className="flex-1 h-1.5 bg-[#E5E5E5] dark:bg-[#262626] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0A0A0A] dark:bg-white rounded-full transition-all"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-[#737373] dark:text-neutral-400 w-8 text-right">
                        {project.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono whitespace-nowrap">
                    {project.budget}
                  </td>
                  <td className="px-6 py-4 text-xs whitespace-nowrap">
                    {project.deadline}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 text-[#737373] hover:text-[#0A0A0A] dark:text-neutral-400 dark:hover:text-white transition-colors rounded-md hover:bg-[#F5F5F5] dark:hover:bg-[#262626]">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-[#E5E5E5] dark:border-[#262626] flex items-center justify-between">
          <p className="text-xs text-[#737373] dark:text-neutral-400">
            Showing {projects.length} of {projects.length} projects
          </p>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1.5 text-xs font-medium border border-[#E5E5E5] dark:border-[#262626] rounded-md text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white hover:border-[#0A0A0A] dark:hover:border-white transition-colors">
              Previous
            </button>
            <button className="px-3 py-1.5 text-xs font-medium bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] rounded-md">
              1
            </button>
            <button className="px-3 py-1.5 text-xs font-medium border border-[#E5E5E5] dark:border-[#262626] rounded-md text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white hover:border-[#0A0A0A] dark:hover:border-white transition-colors">
              Next
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
