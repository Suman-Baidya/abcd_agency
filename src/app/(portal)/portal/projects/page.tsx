"use client";

import React, { useState, useEffect, useMemo } from "react";
import { getPortalData, clientApproveTask, submitRevisionRequest } from "../actions";
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
  X,
  User,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCw,
  Eye,
  Check,
  HelpCircle,
  Calendar
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { formatProjectDeadline, evaluateTaskUrgency } from "@/lib/formatDate";
import { ProjectSelectDropdown } from "@/components/ui/ProjectSelectDropdown";

const CLIENT_KANBAN_LANES = [
  { id: "Backlog", title: "Backlog", color: "border-t-indigo-500", badgeBg: "bg-indigo-50 dark:bg-indigo-950/40", badgeText: "text-indigo-600 dark:text-indigo-300" },
  { id: "Todo", title: "To Do", color: "border-t-emerald-500", badgeBg: "bg-emerald-50 dark:bg-emerald-950/40", badgeText: "text-emerald-600 dark:text-emerald-300" },
  { id: "InProgress", title: "In Progress", color: "border-t-amber-500", badgeBg: "bg-amber-50 dark:bg-amber-950/40", badgeText: "text-amber-600 dark:text-amber-300" },
  { id: "Done", title: "Done / QA", color: "border-t-rose-500", badgeBg: "bg-rose-50 dark:bg-rose-950/40", badgeText: "text-rose-600 dark:text-rose-300" },
  { id: "Approved", title: "Approved & Live", color: "border-t-blue-600", badgeBg: "bg-blue-50 dark:bg-blue-950/40", badgeText: "text-blue-600 dark:text-blue-300" },
];

const PRIORITY_BADGES: Record<string, { label: string; badge: string; dot: string }> = {
  Urgent: { 
    label: "Urgent", 
    badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20", 
    dot: "bg-rose-500"
  },
  Critical: { 
    label: "Critical", 
    badge: "bg-black text-white dark:bg-white dark:text-black border border-black/20 dark:border-white/20 font-bold", 
    dot: "bg-white dark:bg-black"
  },
  High: { 
    label: "High", 
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20", 
    dot: "bg-amber-500"
  },
  Medium: { 
    label: "Medium", 
    badge: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20", 
    dot: "bg-indigo-500"
  },
  Low: { 
    label: "Low", 
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20", 
    dot: "bg-emerald-500"
  },
};

export default function PortalProjectsPage() {
  const [data, setData] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [selectedKanbanScope, setSelectedKanbanScope] = useState<string>("all"); // "all" or specific projectId
  const [activeMobileLane, setActiveMobileLane] = useState<string>("all"); // Mobile phone lane switcher
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTaskDetail, setSelectedTaskDetail] = useState<any | null>(null);

  // Revision & Approval state for DONE / QA items
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [revisionTaskTarget, setRevisionTaskTarget] = useState<any | null>(null);
  const [revisionFormData, setRevisionFormData] = useState({
    title: "",
    description: "",
    priority: "High",
  });

  // Table filters, search & pagination state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusTab, setSelectedStatusTab] = useState("all");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "progress-desc" | "progress-asc" | "budget-desc">("date-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  const fetchPortalProjects = async (showToast = false) => {
    try {
      const res = await getPortalData();
      setData(res);
      if (showToast) {
        toast.success("Kanban board refreshed & synced", { duration: 1500 });
      }
    } catch (err) {
      if (showToast) {
        toast.error("Failed to refresh board");
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPortalProjects();
  }, []);

  const handleReload = () => {
    setIsRefreshing(true);
    fetchPortalProjects(true);
  };

  // Client Task Approval Handler
  const handleApproveTask = async (taskId: string, taskTitle?: string) => {
    setIsProcessingAction(true);
    try {
      await clientApproveTask(taskId);
      toast.success(`🎉 "${taskTitle || "Deliverable"}" approved and marked Live!`, { duration: 2500 });
      if (selectedTaskDetail?.id === taskId) {
        setSelectedTaskDetail(null);
      }
      await fetchPortalProjects();
    } catch (err: any) {
      toast.error(err.message || "Failed to approve deliverable.");
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Open Revision Request Modal for a QA task
  const handleOpenRevisionModal = (task: any) => {
    setRevisionTaskTarget(task);
    setRevisionFormData({
      title: `Feedback on QA: ${task.title}`,
      description: "",
      priority: "High",
    });
  };

  // Submit QA Revision / Question
  const handleSubmitRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionFormData.description.trim()) {
      toast.error("Please explain your question or revision details.");
      return;
    }

    setIsProcessingAction(true);
    try {
      await submitRevisionRequest({
        projectId: revisionTaskTarget?.projectId || undefined,
        title: revisionFormData.title.trim(),
        description: revisionFormData.description.trim(),
        priority: revisionFormData.priority,
      });

      toast.success("Revision question sent to engineering team!", { duration: 2500 });
      setRevisionTaskTarget(null);
      if (selectedTaskDetail?.id === revisionTaskTarget?.id) {
        setSelectedTaskDetail(null);
      }
      await fetchPortalProjects();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit revision request.");
    } finally {
      setIsProcessingAction(false);
    }
  };

  const client = data?.client;
  const isProspect = data?.user?.role === "USER";
  
  // Dynamically compute project progress live from tasks
  const projects: any[] = useMemo(() => {
    const rawProjects = client?.projects || [];
    return rawProjects.map((p: any) => {
      const pTasks = p.tasks || [];
      if (pTasks.length === 0) return p;
      const completedCount = pTasks.filter((t: any) => t.status === "Approved" || t.status === "Done").length;
      const computedProgress = Math.round((completedCount / pTasks.length) * 100);
      return {
        ...p,
        progress: computedProgress,
      };
    });
  }, [client]);

  // Active selected project for Kanban sprint deep dive
  const activeSelectedProject = useMemo(() => {
    if (selectedKanbanScope === "all") return null;
    return projects.find((p) => p.id === selectedKanbanScope) || null;
  }, [projects, selectedKanbanScope]);

  // Aggregate tasks for selected project or across all client projects
  const clientTasks = useMemo(() => {
    if (activeSelectedProject) {
      return (activeSelectedProject.tasks || []).map((t: any) => ({
        ...t,
        projectId: activeSelectedProject.id,
        projectTitle: activeSelectedProject.title,
      }));
    }
    const allT: any[] = [];
    projects.forEach((p) => {
      if (p.tasks && p.tasks.length > 0) {
        p.tasks.forEach((t: any) => {
          allT.push({ ...t, projectId: p.id, projectTitle: p.title });
        });
      }
    });
    return allT;
  }, [projects, activeSelectedProject]);

  // Pre-partition tasks by lane in a single O(N) pass
  const clientTasksByLane = useMemo(() => {
    const map: Record<string, any[]> = {
      Backlog: [],
      Todo: [],
      InProgress: [],
      Done: [],
      Approved: [],
    };
    clientTasks.forEach((t: any) => {
      if (map[t.status]) {
        map[t.status].push(t);
      } else {
        map.Todo.push(t);
      }
    });
    return map;
  }, [clientTasks]);

  // Stat metrics
  const totalProjects = projects.length;
  const inProgressProjects = projects.filter((p) => p.status === "In Progress" || p.status === "On Track").length;
  const inReviewProjects = projects.filter((p) => p.status === "In Review").length;
  const completedProjects = projects.filter((p) => p.status === "Completed" || p.progress === 100).length;

  // Filter and sort projects for table
  const filteredProjects = useMemo(() => {
    let result = [...projects];

    if (selectedStatusTab !== "all") {
      result = result.filter((p) => {
        if (selectedStatusTab === "active") return p.status === "In Progress" || p.status === "On Track";
        if (selectedStatusTab === "review") return p.status === "In Review";
        if (selectedStatusTab === "completed") return p.status === "Completed" || p.progress === 100;
        return true;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.summary?.toLowerCase().includes(q)
      );
    }

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
        <div id="projects-view-toggle" className="flex items-center gap-1 p-1 bg-[#F5F5F5] dark:bg-[#151515] rounded-xl border border-[#E5E5E5] dark:border-[#262626]">
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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
      <div id="projects-kpi-stats" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Projects" value={totalProjects} color="default" />
        <StatCard label="Active Sprints" value={inProgressProjects} color="amber" />
        <StatCard label="In QA Review" value={inReviewProjects} color="blue" />
        <StatCard label="Delivered & Live" value={completedProjects} color="emerald" />
      </div>

      {/* ========================================================================= */}
      {/* 1. DATA TABLE VIEW */}
      {/* ========================================================================= */}
      <Card id="projects-table-card" className="overflow-hidden !p-0 rounded-xl border border-[#E5E5E5] dark:border-[#262626] shadow-xs bg-white dark:bg-[#0A0A0A]">
        <div className="p-4 sm:p-5 border-b border-[#E5E5E5] dark:border-[#262626] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0A0A0A]">
          {/* Status Filter Tabs */}
          <div id="projects-status-tabs" className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
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

        <TablePagination
          currentPage={currentPage}
          totalItems={filteredProjects.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="projects"
        />
      </Card>

      {/* ========================================================================= */}
      {/* 2. FLOATING KANBAN BOARD OVERLAY SECTION */}
      {/* ========================================================================= */}
      {viewMode === "kanban" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0E0E0E] border border-[#E5E5E5] dark:border-[#262626] rounded-3xl w-full max-w-7xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Top Floating Control Bar (Back + Reload on left, Select in middle, Close on right) */}
            <div className="p-3.5 sm:p-5 border-b border-[#E5E5E5] dark:border-[#262626] bg-white/95 dark:bg-[#0E0E0E]/95 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              
              {/* Mobile Top Row: Back + Reload on left, Close on right */}
              <div className="flex items-center justify-between w-full sm:w-auto">
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setViewMode("table")}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#F9F9F9] dark:bg-[#141414] text-xs font-bold text-[#0A0A0A] dark:text-white hover:bg-[#EAEAEA] dark:hover:bg-[#202020] transition-colors cursor-pointer shadow-xs"
                    title="Back to Data Table"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    onClick={handleReload}
                    disabled={isRefreshing}
                    className="p-2 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#F9F9F9] dark:bg-[#141414] text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white hover:bg-[#EAEAEA] dark:hover:bg-[#202020] transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                    title="Reload & Sync Kanban"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-black dark:text-white" : ""}`} />
                  </button>
                </div>

                {/* Mobile Close Button */}
                <div className="sm:hidden">
                  <button
                    onClick={() => setViewMode("table")}
                    className="p-2 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#F9F9F9] dark:bg-[#141414] text-[#737373] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer shadow-xs"
                    title="Close Floating Kanban"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Middle: Project Dropdown Select Box */}
              <div className="w-full sm:flex-1 sm:max-w-md sm:mx-auto">
                <ProjectSelectDropdown
                  projects={projects}
                  selectedId={selectedKanbanScope}
                  onSelect={setSelectedKanbanScope}
                  allLabel="All Projects & Deliverables"
                />
              </div>

              {/* Desktop Close button */}
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setViewMode("table")}
                  className="p-2 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#F9F9F9] dark:bg-[#141414] text-[#737373] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer shadow-xs"
                  title="Close Floating Kanban"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Floating Scrollable Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 scrollbar-thin">
              
              {/* Active project progress summary (if selected) */}
              {activeSelectedProject && (
                <div className="p-4 bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-[#141414] dark:to-[#181818] rounded-2xl border border-[#E5E5E5] dark:border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white dark:bg-[#202020] border border-[#E5E5E5] dark:border-[#333333] text-[#0A0A0A] dark:text-white">
                        {activeSelectedProject.category || "Deliverable"}
                      </span>
                      <span className="text-xs font-bold text-[#0A0A0A] dark:text-white">{activeSelectedProject.title}</span>
                    </div>
                    <p className="text-[11px] text-[#737373] dark:text-neutral-400">
                      Target Deadline: {formatProjectDeadline(activeSelectedProject.deadline).fullDisplay}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-[10px] text-[#737373] font-semibold">Sprint Progress</div>
                      <div className="text-xs font-bold text-[#0A0A0A] dark:text-white">
                        {activeSelectedProject.progress}%
                      </div>
                    </div>
                    <div className="w-28 h-2 rounded-full bg-[#E5E5E5] dark:bg-[#262626] overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${activeSelectedProject.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Template Priority Legend */}
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs py-1 px-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#0A0A0A] dark:text-white tracking-tight">Sprint Tasks</span>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-[#737373]">
                  <span className="flex items-center gap-1 font-medium">
                    <span className="w-2.5 h-1.5 rounded-sm bg-rose-500"></span> Urgent
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <span className="w-2.5 h-1.5 rounded-sm bg-amber-500"></span> High
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <span className="w-2.5 h-1.5 rounded-sm bg-indigo-500"></span> Medium
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <span className="w-2.5 h-1.5 rounded-sm bg-emerald-500"></span> Low
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <span className="w-2.5 h-1.5 rounded-sm bg-black dark:bg-white"></span> Critical Task
                  </span>
                </div>
              </div>

              {/* Mobile-Only Lane Quick Switcher Tabs (375px+ phones) */}
              <div className="md:hidden flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setActiveMobileLane("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeMobileLane === "all"
                      ? "bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] shadow-xs"
                      : "bg-[#F5F5F5] dark:bg-[#161616] text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white border border-[#E5E5E5] dark:border-[#262626]"
                  }`}
                >
                  <span>All Lanes</span>
                  <span className="text-[10px] font-mono opacity-80">({clientTasks.length})</span>
                </button>
                {CLIENT_KANBAN_LANES.map((col) => {
                  const count = (clientTasksByLane[col.id] || []).length;
                  return (
                    <button
                      key={col.id}
                      onClick={() => setActiveMobileLane(col.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                        activeMobileLane === col.id
                          ? "bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] shadow-xs"
                          : "bg-[#F5F5F5] dark:bg-[#161616] text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white border border-[#E5E5E5] dark:border-[#262626]"
                      }`}
                    >
                      <span>{col.title}</span>
                      <span className="text-[10px] font-mono opacity-80">({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* 5 Compact Template Kanban Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5 items-start">
                {CLIENT_KANBAN_LANES.filter((col) => activeMobileLane === "all" || activeMobileLane === col.id).map((col) => {
                  const laneTasks = clientTasksByLane[col.id] || [];
                  const isQALane = col.id === "Done";

                  return (
                    <div
                      key={col.id}
                      className={`bg-[#F9F9F9] dark:bg-[#121212] border border-[#E5E5E5] dark:border-[#262626] border-t-4 ${col.color} rounded-2xl p-3.5 space-y-3 min-h-[460px] shadow-xs flex flex-col`}
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-[#EBEBEB] dark:border-[#222222]">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-[11px] font-bold text-[#0A0A0A] dark:text-white uppercase tracking-wider">
                            {col.title}
                          </h3>
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${col.badgeBg} ${col.badgeText}`}>
                            {laneTasks.length}
                          </span>
                        </div>

                        {isQALane && (
                          <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded">
                            Client Review
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 flex-1">
                        {laneTasks.length > 0 ? (
                          laneTasks.map((task: any) => {
                            const priorityInfo = PRIORITY_BADGES[task.priority] || PRIORITY_BADGES["Medium"];
                            const urgencyInfo = evaluateTaskUrgency(task.dueDate, task.priority);

                            return (
                              <div
                                key={task.id}
                                onClick={() => setSelectedTaskDetail(task)}
                                className="p-3 space-y-2.5 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#161616] shadow-xs hover:border-black dark:hover:border-white transition-all cursor-pointer group"
                              >
                                {/* Top: Priority tag & project */}
                                <div className="flex items-center justify-between gap-1">
                                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${priorityInfo.badge}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${priorityInfo.dot}`}></span>
                                    {priorityInfo.label}
                                  </span>

                                  {task.projectTitle && (
                                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#737373] bg-[#F5F5F5] dark:bg-[#222222] px-1.5 py-0.5 rounded max-w-[100px] truncate">
                                      {task.projectTitle}
                                    </span>
                                  )}
                                </div>

                                {/* Title & description */}
                                <div className="space-y-0.5">
                                  <h4 className="text-xs font-bold text-[#0A0A0A] dark:text-white leading-snug truncate">
                                    {task.title}
                                  </h4>
                                  {task.description && (
                                    <p className="text-[10px] text-[#737373] dark:text-neutral-400 line-clamp-1">
                                      {task.description}
                                    </p>
                                  )}
                                </div>

                                {/* Due date, Assignee, View button */}
                                <div className="flex items-center justify-between text-[10px] text-[#737373] pt-1.5 border-t border-[#F0F0F0] dark:border-[#222222]">
                                  <div className="flex items-center gap-1 truncate max-w-[90px]">
                                    <User className="w-3 h-3 text-[#737373]" />
                                    <span className="truncate">{task.assignee || "Agency Dev"}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-1.5">
                                    {task.dueDate && (
                                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-medium flex items-center gap-0.5 ${urgencyInfo.badgeClass}`}>
                                        <Clock className="w-2.5 h-2.5" />
                                        <span>{urgencyInfo.urgencyLabel || urgencyInfo.formattedDate}</span>
                                      </span>
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedTaskDetail(task);
                                      }}
                                      className="p-1 text-[#737373] hover:text-black dark:hover:text-white rounded hover:bg-[#F0F0F0] dark:hover:bg-[#222222]"
                                      title="View Details"
                                    >
                                      <Eye className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>

                                {/* ========================================================================= */}
                                {/* DONE / QA REVIEW ACTIONS: Approve & Request Revision / Question */}
                                {/* ========================================================================= */}
                                {isQALane && (
                                  <div 
                                    className="pt-2 border-t border-rose-100 dark:border-rose-950/40 grid grid-cols-2 gap-1.5"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      type="button"
                                      disabled={isProcessingAction}
                                      onClick={() => handleApproveTask(task.id, task.title)}
                                      className="w-full flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                                      title="Sign off & mark task live"
                                    >
                                      <Check className="w-3 h-3" />
                                      <span>Approve</span>
                                    </button>

                                    <button
                                      type="button"
                                      disabled={isProcessingAction}
                                      onClick={() => handleOpenRevisionModal(task)}
                                      className="w-full flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 font-bold text-[10px] transition-colors cursor-pointer disabled:opacity-50"
                                      title="Ask questions or request revisions on this task"
                                    >
                                      <MessageSquare className="w-3 h-3" />
                                      <span>Revision</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <div className="py-8 text-center text-[10px] text-[#A3A3A3] dark:text-neutral-500 border border-dashed border-[#E5E5E5] dark:border-[#262626] rounded-xl">
                            No tasks in this lane
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CLIENT TASK DETAILS MODAL */}
      {/* ========================================================================= */}
      {selectedTaskDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#262626] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 scrollbar-thin">
            <div className="flex items-start justify-between border-b border-[#E5E5E5] dark:border-[#262626] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold ${
                    (PRIORITY_BADGES[selectedTaskDetail.priority] || PRIORITY_BADGES["Medium"]).badge
                  }`}>
                    {(PRIORITY_BADGES[selectedTaskDetail.priority] || PRIORITY_BADGES["Medium"]).label}
                  </span>
                  {selectedTaskDetail.projectTitle && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373] bg-[#F0F0F0] dark:bg-[#202020] px-2 py-0.5 rounded">
                      {selectedTaskDetail.projectTitle}
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-[#0A0A0A] dark:text-white mt-1.5">
                  {selectedTaskDetail.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTaskDetail(null)}
                className="p-1.5 text-[#737373] hover:text-black dark:hover:text-white rounded-full hover:bg-[#F5F5F5] dark:hover:bg-[#202020]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="font-bold text-[#737373] block mb-1">Deliverable Scope & Notes:</span>
                <p className="text-[#0A0A0A] dark:text-neutral-200 bg-[#F9F9F9] dark:bg-[#161616] p-3.5 rounded-xl border border-[#E5E5E5] dark:border-[#262626] leading-relaxed">
                  {selectedTaskDetail.description || "Active sprint deliverable task item."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#F9F9F9] dark:bg-[#161616] rounded-xl border border-[#E5E5E5] dark:border-[#262626] space-y-0.5">
                  <span className="text-[10px] text-[#737373] font-semibold block">Sprint Status</span>
                  <span className="font-bold text-[#0A0A0A] dark:text-white">{selectedTaskDetail.status}</span>
                </div>

                <div className="p-3 bg-[#F9F9F9] dark:bg-[#161616] rounded-xl border border-[#E5E5E5] dark:border-[#262626] space-y-0.5">
                  <span className="text-[10px] text-[#737373] font-semibold block">Assignee</span>
                  <span className="font-bold text-[#0A0A0A] dark:text-white">{selectedTaskDetail.assignee || "Agency Dev"}</span>
                </div>

                <div className="p-3 bg-[#F9F9F9] dark:bg-[#161616] rounded-xl border border-[#E5E5E5] dark:border-[#262626] space-y-0.5">
                  <span className="text-[10px] text-[#737373] font-semibold block">Target Due Date</span>
                  <span className="font-bold text-[#0A0A0A] dark:text-white">
                    {selectedTaskDetail.dueDate ? evaluateTaskUrgency(selectedTaskDetail.dueDate, selectedTaskDetail.priority).formattedDate : "Flexible"}
                  </span>
                </div>

                <div className="p-3 bg-[#F9F9F9] dark:bg-[#161616] rounded-xl border border-[#E5E5E5] dark:border-[#262626] space-y-0.5">
                  <span className="text-[10px] text-[#737373] font-semibold block">Live Status</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">Synced with Super Admin</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#E5E5E5] dark:border-[#262626]">
              <Button variant="secondary" size="sm" onClick={() => setSelectedTaskDetail(null)}>
                Close
              </Button>

              <div className="flex items-center gap-2">
                {selectedTaskDetail.status === "Done" ? (
                  <>
                    <button
                      type="button"
                      disabled={isProcessingAction}
                      onClick={() => handleOpenRevisionModal(selectedTaskDetail)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 font-bold text-xs transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Request Revision</span>
                    </button>

                    <button
                      type="button"
                      disabled={isProcessingAction}
                      onClick={() => handleApproveTask(selectedTaskDetail.id, selectedTaskDetail.title)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve & Go Live</span>
                    </button>
                  </>
                ) : (
                  <Button variant="primary" size="sm" href="/portal/revisions">
                    Request Modification
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: INLINE QA REVISION / QUESTION MODAL */}
      {/* ========================================================================= */}
      {revisionTaskTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#262626] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-2xl animate-in zoom-in-95 duration-200 scrollbar-thin">
            <div className="flex items-start justify-between border-b border-[#E5E5E5] dark:border-[#262626] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                  QA Feedback & Revisions
                </span>
                <h3 className="text-base font-bold text-[#0A0A0A] dark:text-white mt-1.5 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-amber-500" />
                  Ask Question / Request Revision
                </h3>
              </div>
              <button
                onClick={() => setRevisionTaskTarget(null)}
                className="p-1.5 text-[#737373] hover:text-black dark:hover:text-white rounded-full hover:bg-[#F5F5F5] dark:hover:bg-[#202020]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitRevision} className="space-y-4 text-xs">
              {/* Linked Task Context Badge */}
              <div className="p-3 bg-[#F9F9F9] dark:bg-[#161616] rounded-xl border border-[#E5E5E5] dark:border-[#262626] space-y-1">
                <div className="text-[10px] font-bold text-[#737373]">Target Deliverable:</div>
                <div className="font-bold text-[#0A0A0A] dark:text-white">{revisionTaskTarget.title}</div>
                <div className="text-[10px] text-[#737373]">Project: {revisionTaskTarget.projectTitle}</div>
              </div>

              {/* Revision Request Title */}
              <div>
                <label className="block font-bold text-[#737373] mb-1">Subject / Summary *</label>
                <input
                  type="text"
                  value={revisionFormData.title}
                  onChange={(e) => setRevisionFormData({ ...revisionFormData, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-transparent text-[#0A0A0A] dark:text-white outline-none focus:ring-2 focus:ring-black dark:focus:ring-white font-medium"
                  required
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block font-bold text-[#737373] mb-1">Urgency Priority</label>
                <select
                  value={revisionFormData.priority}
                  onChange={(e) => setRevisionFormData({ ...revisionFormData, priority: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#161616] text-[#0A0A0A] dark:text-white font-semibold outline-none"
                >
                  <option value="Urgent">Urgent (Blocker)</option>
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium (Standard)</option>
                  <option value="Low">Low (Minor tweak)</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-[#737373] mb-1">
                  Questions, Feedback & Requested Modifications *
                </label>
                <textarea
                  rows={4}
                  placeholder="Explain what changes are needed, ask technical questions, or paste reference links..."
                  value={revisionFormData.description}
                  onChange={(e) => setRevisionFormData({ ...revisionFormData, description: e.target.value })}
                  className="w-full p-3 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-transparent text-[#0A0A0A] dark:text-white outline-none focus:ring-2 focus:ring-black dark:focus:ring-white resize-none font-medium leading-relaxed"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E5E5] dark:border-[#262626]">
                <Button variant="secondary" size="sm" type="button" onClick={() => setRevisionTaskTarget(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" disabled={isProcessingAction}>
                  {isProcessingAction ? "Sending..." : "Submit Revision Request"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#262626] rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-xl animate-in zoom-in-95 duration-200 scrollbar-thin">
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
