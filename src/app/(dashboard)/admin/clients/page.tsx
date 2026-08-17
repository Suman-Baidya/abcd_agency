import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Clients — ABCD Agency",
};

const clients = [
  {
    name: "ApexFlow Inc.",
    email: "contact@apexflow.com",
    projects: 3,
    totalSpend: "$48,500",
    status: "Active",
    joined: "Jan 12, 2025",
    initials: "AF",
  },
  {
    name: "Nexus Labs",
    email: "hello@nexuslabs.ai",
    projects: 2,
    totalSpend: "$64,000",
    status: "Active",
    joined: "Mar 05, 2025",
    initials: "NL",
  },
  {
    name: "Govt Sector (RGYCSP)",
    email: "admin@rgycsp.gov",
    projects: 1,
    totalSpend: "$45,000",
    status: "Active",
    joined: "Jun 18, 2025",
    initials: "GS",
  },
  {
    name: "FinEdge Capital",
    email: "team@finedge.com",
    projects: 1,
    totalSpend: "$28,000",
    status: "Active",
    joined: "Sep 01, 2025",
    initials: "FC",
  },
  {
    name: "Meridian Group",
    email: "ops@meridian.io",
    projects: 1,
    totalSpend: "$15,000",
    status: "Inactive",
    joined: "Nov 14, 2025",
    initials: "MG",
  },
  {
    name: "CloudSync Ltd.",
    email: "dev@cloudsync.co",
    projects: 2,
    totalSpend: "$36,000",
    status: "Active",
    joined: "Feb 22, 2026",
    initials: "CS",
  },
  {
    name: "Brightpath Digital",
    email: "info@brightpath.com",
    projects: 1,
    totalSpend: "$12,000",
    status: "Active",
    joined: "Apr 10, 2026",
    initials: "BD",
  },
  {
    name: "Orion Ventures",
    email: "partners@orionv.com",
    projects: 0,
    totalSpend: "$0",
    status: "Prospect",
    joined: "Jul 28, 2026",
    initials: "OV",
  },
];

export default function ClientsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">
            Clients
          </h1>
          <p className="text-sm text-[#737373] dark:text-neutral-400 mt-1">
            Manage your client relationships and accounts.
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
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
            />
          </svg>
          Add Client
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="!p-4">
          <p className="text-xs font-semibold text-[#737373] dark:text-neutral-400 uppercase tracking-wider">
            Total Clients
          </p>
          <p className="text-xl font-bold text-[#0A0A0A] dark:text-white mt-1">
            {clients.length}
          </p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs font-semibold text-[#737373] dark:text-neutral-400 uppercase tracking-wider">
            Active
          </p>
          <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">
            {clients.filter((c) => c.status === "Active").length}
          </p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs font-semibold text-[#737373] dark:text-neutral-400 uppercase tracking-wider">
            Prospects
          </p>
          <p className="text-xl font-bold text-[#0A0A0A] dark:text-white mt-1">
            {clients.filter((c) => c.status === "Prospect").length}
          </p>
        </Card>
        <Card className="!p-4">
          <p className="text-xs font-semibold text-[#737373] dark:text-neutral-400 uppercase tracking-wider">
            Total Revenue
          </p>
          <p className="text-xl font-bold text-[#0A0A0A] dark:text-white mt-1">
            $248.5k
          </p>
        </Card>
      </div>

      {/* Client Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {clients.map((client) => (
          <Card
            key={client.name}
            hoverEffect
            className="!p-0 overflow-hidden"
          >
            <div className="p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] flex items-center justify-center text-xs font-bold shrink-0">
                  {client.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#0A0A0A] dark:text-white truncate">
                    {client.name}
                  </p>
                  <p className="text-xs text-[#737373] dark:text-neutral-400 truncate">
                    {client.email}
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#737373] dark:text-neutral-400">
                    Projects
                  </span>
                  <span className="font-semibold text-[#0A0A0A] dark:text-white">
                    {client.projects}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#737373] dark:text-neutral-400">
                    Total Spend
                  </span>
                  <span className="font-semibold font-mono text-[#0A0A0A] dark:text-white">
                    {client.totalSpend}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#737373] dark:text-neutral-400">
                    Joined
                  </span>
                  <span className="text-[#737373] dark:text-neutral-400">
                    {client.joined}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#E5E5E5] dark:border-[#262626] flex items-center justify-between bg-[#FBFBFB] dark:bg-[#0A0A0A]">
              {client.status === "Active" ? (
                <Badge
                  variant="solid"
                  className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-none"
                >
                  Active
                </Badge>
              ) : client.status === "Prospect" ? (
                <Badge
                  variant="solid"
                  className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-none"
                >
                  Prospect
                </Badge>
              ) : (
                <Badge variant="outline">Inactive</Badge>
              )}
              <button className="text-xs font-semibold text-[#737373] hover:text-[#0A0A0A] dark:text-neutral-400 dark:hover:text-white transition-colors">
                View →
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
