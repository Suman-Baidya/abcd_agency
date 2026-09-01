"use client";

import React, { useState, useEffect, useMemo } from "react";
import { getPortalData } from "../actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/dashboard/StatCard";
import { TablePagination } from "@/components/ui/TablePagination";
import { 
  FolderKanban, 
  ListTodo, 
  Layers, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Search,
  ArrowUpDown,
  Filter,
  ExternalLink,
  ChevronRight,
  Send,
  X
} from "lucide-react";
import Link from "next/link";
import { formatProjectDeadline } from "@/lib/formatDate";

const KANBAN_COLUMNS = [
  { id: "Planning", title: "Planning & Architecture", color: "border-t-blue-500" },
  { id: "In Progress", title: "Active Sprint / Development", color: "border-t-amber-500" },
  { id: "In Review", title: "QA & Client Review", color: "border-t-purple-500" },
  { id: "Completed", title: "Delivered & Live", color: "border-t-emerald-500" },
];

export default function PortalProjectsPage() {
  const [data, setData] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [loading, setLoading] = useState(true);

  // Table filters, search & pagination state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusTab, setSelectedStatusTab] = useState("all");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "progress-desc" | "progress-asc" | "budget-desc">("date-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  useEffect(() => {
    getPortalData().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  const client = data?.client;
  const isProspect = data?.user?.role === "USER";
  const projects: any[] = useMemo(() => client?.projects || [], [client]);

  // Stat metrics
  const totalProjects = projects.length;
  const inProgressProjects = projects.filter((p) => p.status === "In Progress" || p.status === "On Track").length;
  const inReviewProjects = projects.filter((p) => p.status === "In Review").length;
  const completedProjects = projects.filter((p) => p.status === "Completed" || p.progress === 100).length;

  // Filter and sort projects for table
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    // Status Tab Filter
    if (selectedStatusTab !== "all") {
      result = result.filter((p) => {
        if (selectedStatusTab === "active") return p.status === "In Progress" || p.status === "On Track";
        if (selectedStatusTab === "review") return p.status === "In Review";
        if (selectedStatusTab === "completed") return p.status === "Completed" || p.progress === 100;
        return true;
      });
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.summary?.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "date-desc") {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (sortBy === "date-asc") {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      if (sortBy === "progress-desc") {
        return (b.progress || 0) - (a.progress || 0);
      }
      if (sortBy === "progress-asc") {
        return (a.progress || 0) - (b.progress || 0);
      }
      if (sortBy === "budget-desc") {
        const numA = parseInt((a.budget || "").replace(/[^0-9]/g, "") || "0", 10);
        const numB = parseInt((b.budget || "").replace(/[^0-9]/g, "") || "0", 10);
        return numB - numA;
      }
      return 0;
    });

    return result;
  }, [projects, selectedStatusTab, searchQuery, sortBy]);

  // Paginated slice
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProjects.slice(start, start + pageSize);
  }, [filteredProjects, currentPage, pageSize]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#737373] dark:text-neutral-400">Loading project deliverables & sprint ledger...</p>
      </div>
    );
  }

  if (isProspect) {
    return (
      <div className="space-y-6 animate-in fade-in">
        <div className="border-b border-[#E5E5E5] dark:border-[#262626] pb-6">
          <h1 className="text-2xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">Project Workspaces</h1>
          <p className="text-xs text-[#737373] mt-1">
            Projects are unlocked once your organization account is officially promoted to an Active Client.
          </p>
        </div>

        <Card className="p-8 text-center space-y-4 max-w-lg mx-auto border border-[#E5E5E5] dark:border-[#262626]">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
            <FolderKanban className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#0A0A0A] dark:text-white">No Active Sprints Assigned Yet</h3>
          <p className="text-xs text-[#737373]">
            Submit a project brief or consultation request to set up your dedicated project repository and sprint deliverables.
          </p>
          <Link
            href="/portal/inquiries"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] text-xs font-bold rounded-lg hover:opacity-90 transition-opacity"
          >
            <Send className="w-3.5 h-3.5" />
            Submit Project Brief
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">
            Projects & Workspaces
          </h1>
          <p className="text-sm text-[#737373] dark:text-neutral-400 mt-1">
            Manage your digital deliverables, milestone timelines, and sprint progress.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-[#F5F5F5] dark:bg-[#151515] rounded-xl border border-[#E5E5E5] dark:border-[#262626]">
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "table"
                ? "bg-white dark:bg-[#262626] text-[#0A0A0A] dark:text-white shadow-xs"
                : "text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white"
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            Data Table
          </button>
          <button
            onClick={() => setViewMode("kanban")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === "kanban"
                ? "bg-white dark:bg-[#262626] text-[#0A0A0A] dark:text-white shadow-xs"
                : "text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white"
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5" />
            Kanban Board
          </button>
        </div>
      </div>

      {/* StatCards KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Projects" value={totalProjects} color="default" />
        <StatCard label="Active Sprints" value={inProgressProjects} color="amber" />
        <StatCard label="In QA Review" value={inReviewProjects} color="blue" />
        <StatCard label="Delivered & Live" value={completedProjects} color="emerald" />
      </div>

      {/* ========================================================================= */}
      {/* 1. DATA TABLE VIEW */}
      {/* ========================================================================= */}
      {viewMode === "table" && (
        <Card className="overflow-hidden !p-0 rounded-xl border border-[#E5E5E5] dark:border-[#262626] shadow-xs bg-white dark:bg-[#0A0A0A]">
          {/* Controls Bar: Search, Status Tabs, Sort */}
          <div className="p-4 sm:p-5 border-b border-[#E5E5E5] dark:border-[#262626] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0A0A0A]">
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {[
                { id: "all", label: "All", count: totalProjects },
                { id: "active", label: "In Progress", count: inProgressProjects },
                { id: "review", label: "In Review", count: inReviewProjects },
                { id: "completed", label: "Completed", count: completedProjects },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSelectedStatusTab(tab.id);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                    selectedStatusTab === tab.id
                      ? "bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] shadow-xs"
                      : "text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.2 text-[10px] rounded-md font-mono ${
                    selectedStatusTab === tab.id
                      ? "bg-white/20 text-white dark:bg-black/20 dark:text-black"
                      : "bg-[#E5E5E5] text-[#0A0A0A] dark:bg-[#262626] dark:text-neutral-300"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search and Sort controls */}
            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              <div className="relative flex-1 sm:w-72">
                <Search className="w-4 h-4 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-9 pr-8 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-xs border border-[#E5E5E5] dark:border-[#262626] bg-transparent rounded-lg px-3 py-2 font-medium text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white cursor-pointer"
                >
                  <option value="date-desc" className="dark:bg-[#111111]">Sort: Newest</option>
                  <option value="date-asc" className="dark:bg-[#111111]">Sort: Oldest</option>
                  <option value="progress-desc" className="dark:bg-[#111111]">Sort: Progress</option>
                  <option value="budget-desc" className="dark:bg-[#111111]">Sort: Budget</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Element */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#262626] dark:text-neutral-300">
              <thead className="text-[11px] font-semibold uppercase tracking-wider text-[#525252] dark:text-[#A3A3A3] bg-[#F9F9F9] dark:bg-[#0E0E0E] border-b border-[#E5E5E5] dark:border-[#262626]">
                <tr>
                  <th className="px-5 py-3.5 w-12 text-center">SL</th>
                  <th className="px-5 py-3.5 min-w-[240px]">Project Details</th>
                  <th className="px-5 py-3.5 text-center min-w-[120px]">Status</th>
                  <th className="px-5 py-3.5 min-w-[140px]">Progress</th>
                  <th className="px-5 py-3.5 min-w-[130px]">Budget</th>
                  <th className="px-5 py-3.5 min-w-[140px]">Target Timeline</th>
                  <th className="px-5 py-3.5 text-right w-28">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#262626] bg-white dark:bg-[#0A0A0A]">
                {paginatedProjects.length > 0 ? (
                  paginatedProjects.map((proj, index) => {
                    const sl = (currentPage - 1) * pageSize + index + 1;
                    const statusClass =
                      proj.status === "Completed"
                        ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900"
                        : proj.status === "In Review"
                        ? "bg-purple-50 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-900"
                        : "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900";

                    return (
                      <tr key={proj.id} className="hover:bg-[#F9F9F9] dark:hover:bg-[#141414] transition-colors group">
                        {/* SL */}
                        <td className="px-5 py-4 text-center text-xs font-mono font-medium text-[#737373] dark:text-neutral-500">
                          {sl < 10 ? `0${sl}` : sl}
                        </td>

                        <td className="px-5 py-4 max-w-xs">
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373] dark:text-neutral-400 block truncate">
                              {proj.category || "Development"}
                            </span>
                            <h4 className="text-xs font-bold text-[#0A0A0A] dark:text-white mt-0.5 truncate">
                              {proj.title}
                            </h4>
                            {proj.summary && (
                              <p className="text-[11px] text-[#737373] dark:text-neutral-400 truncate mt-0.5">
                                {proj.summary}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-center whitespace-nowrap">
                          <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-md border ${statusClass}`}>
                            {proj.status}
                          </span>
                        </td>

                        <td className="px-5 py-4 min-w-[140px]">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-semibold">
                              <span className="text-[#737373]">{proj.progress || 0}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-[#E5E5E5] dark:bg-[#262626] overflow-hidden">
                              <div
                                className="h-full bg-[#0A0A0A] dark:bg-white rounded-full transition-all duration-300"
                                style={{ width: `${proj.progress || 0}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 font-semibold text-[#0A0A0A] dark:text-white whitespace-nowrap">
                          {proj.budget || "Custom Contract"}
                        </td>

                        <td className="px-5 py-4 text-[#737373] dark:text-neutral-400 whitespace-nowrap text-xs">
                          {formatProjectDeadline(proj.deadline).dateRange}
                        </td>

                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedProject(proj)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold border border-[#E5E5E5] dark:border-[#262626] rounded-md hover:bg-[#F5F5F5] dark:hover:bg-[#202020] text-[#0A0A0A] dark:text-white transition-colors cursor-pointer"
                          >
                            Details
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#737373] dark:text-neutral-400">
                      No project deliverables matching your search or filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Automatic Pagination Footer */}
          <TablePagination
            currentPage={currentPage}
            totalItems={filteredProjects.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            itemLabel="projects"
          />
        </Card>
      )}

      {/* ========================================================================= */}
      {/* 2. KANBAN BOARD VIEW */}
      {/* ========================================================================= */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {KANBAN_COLUMNS.map((col) => {
            const colProjects = projects.filter((p: any) => {
              if (col.id === "Completed") return p.status === "Completed" || p.progress === 100;
              if (col.id === "In Review") return p.status === "In Review";
              if (col.id === "Planning") return p.status === "Planning" || p.progress < 20;
              return p.status === "In Progress" || p.status === "On Track" || (p.progress >= 20 && p.progress < 100);
            });

            return (
              <div
                key={col.id}
                className={`bg-[#F9F9F9] dark:bg-[#121212] border border-[#E5E5E5] dark:border-[#262626] border-t-4 ${col.color} rounded-xl p-4 space-y-3 min-h-[360px]`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#EBEBEB] dark:border-[#222222]">
                  <h3 className="text-xs font-bold text-[#0A0A0A] dark:text-white">{col.title}</h3>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white dark:bg-[#202020] text-[#737373]">
                    {colProjects.length}
                  </span>
                </div>

                {colProjects.length > 0 ? (
                  <div className="space-y-3">
                    {colProjects.map((proj: any) => (
                      <Card
                        key={proj.id}
                        onClick={() => setSelectedProject(proj)}
                        className="p-4 space-y-3 shadow-xs hover:border-black dark:hover:border-white transition-all cursor-pointer bg-white dark:bg-[#161616]"
                      >
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[#737373]">
                            {proj.category}
                          </span>
                          <h4 className="text-xs font-bold text-[#0A0A0A] dark:text-white leading-snug">
                            {proj.title}
                          </h4>
                        </div>

                        {/* Progress */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-[#737373]">
                            <span>Progress</span>
                            <span className="font-bold text-[#0A0A0A] dark:text-white">{proj.progress}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#E5E5E5] dark:bg-[#262626] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#0A0A0A] dark:bg-white rounded-full"
                              style={{ width: `${proj.progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Tech Stack tags */}
                        {proj.techStack && proj.techStack.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {proj.techStack.slice(0, 3).map((t: string, idx: number) => (
                              <span key={idx} className="text-[9px] px-1.5 py-0.5 bg-[#F0F0F0] dark:bg-[#222222] text-[#737373] dark:text-neutral-300 rounded-sm">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[10px] text-[#737373] pt-2 border-t border-[#E5E5E5] dark:border-[#262626]">
                          <span className="truncate mr-2">Target: {formatProjectDeadline(proj.deadline).dateRange}</span>
                          <span className="font-bold text-[#0A0A0A] dark:text-white shrink-0">{proj.budget || "₹0"}</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-[11px] text-[#A3A3A3] dark:text-neutral-500 border border-dashed border-[#E5E5E5] dark:border-[#262626] rounded-lg">
                    No items in this sprint phase
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#262626] rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between border-b border-[#E5E5E5] dark:border-[#262626] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373]">
                  {selectedProject.category}
                </span>
                <h3 className="text-lg font-bold text-[#0A0A0A] dark:text-white mt-0.5">
                  {selectedProject.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-1.5 text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white rounded-full hover:bg-[#F5F5F5] dark:hover:bg-[#202020]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="font-semibold text-[#737373] block mb-1">Project Scope & Summary:</span>
                <p className="text-[#0A0A0A] dark:text-neutral-200 bg-[#F9F9F9] dark:bg-[#161616] p-3 rounded-xl border border-[#E5E5E5] dark:border-[#262626]">
                  {selectedProject.summary || selectedProject.tagline || "Standard full-stack deliverable specification."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-[#F9F9F9] dark:bg-[#161616] rounded-xl border border-[#E5E5E5] dark:border-[#262626]">
                  <span className="text-[#737373] block text-[11px]">Sprint Status</span>
                  <span className="font-bold text-[#0A0A0A] dark:text-white">{selectedProject.status}</span>
                </div>
                <div className="p-3 bg-[#F9F9F9] dark:bg-[#161616] rounded-xl border border-[#E5E5E5] dark:border-[#262626]">
                  <span className="text-[#737373] block text-[11px]">Milestone Deadline</span>
                  <span className="font-bold text-[#0A0A0A] dark:text-white">{formatProjectDeadline(selectedProject.deadline).fullDisplay}</span>
                </div>
              </div>

              {selectedProject.techStack && selectedProject.techStack.length > 0 && (
                <div>
                  <span className="font-semibold text-[#737373] block mb-1.5">Technology Architecture:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProject.techStack.map((tech: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-1 text-xs bg-[#F0F0F0] dark:bg-[#222222] rounded-md font-medium text-[#0A0A0A] dark:text-white border border-[#E5E5E5] dark:border-[#333333]">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E5E5] dark:border-[#262626]">
              <Button variant="secondary" size="sm" onClick={() => setSelectedProject(null)}>
                Close
              </Button>
              <Button variant="primary" size="sm" href="/portal/revisions">
                Request Modification
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
