"use client";

import React, { useState, useMemo, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/dashboard/StatCard";
import { TablePagination } from "@/components/ui/TablePagination";
import {
  RotateCcw,
  Search,
  Filter,
  ArrowUpDown,
  FolderKanban,
  ListTodo,
  ExternalLink,
  ChevronRight,
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Building2,
  Mail,
  Phone,
  Layers,
  Sparkles,
  X,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  updateRevisionStatus,
  replyToRevision,
  deleteRevision,
} from "@/app/(dashboard)/admin/revisions/actions";

interface RevisionManagerProps {
  initialRevisions: any[];
  projects: any[];
  clients: any[];
}

const KANBAN_LANES = [
  { id: "Pending", title: "Pending / New", color: "border-t-amber-500", badgeColor: "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900" },
  { id: "In Review", title: "Under Review", color: "border-t-purple-500", badgeColor: "bg-purple-50 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-900" },
  { id: "In Progress", title: "Active Sprint", color: "border-t-blue-500", badgeColor: "bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-900" },
  { id: "Resolved", title: "Resolved & Live", color: "border-t-emerald-500", badgeColor: "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900" },
];

export function RevisionManager({
  initialRevisions,
  projects,
  clients,
}: RevisionManagerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [revisions, setRevisions] = useState<any[]>(initialRevisions);
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");

  // Filter states (initialized from URL if present)
  const initialProjectId = searchParams.get("projectId") || "all";
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedStatusTab, setSelectedStatusTab] = useState(searchParams.get("status") || "all");
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId);
  const [selectedClientId, setSelectedClientId] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "priority">("date-desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Selected item for detail & reply modal
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [newStatus, setNewStatus] = useState("In Progress");
  const [isReplying, setIsReplying] = useState(false);
  const [deletingTicket, setDeletingTicket] = useState<any | null>(null);

  // Sync state if props change
  React.useEffect(() => {
    setRevisions(initialRevisions);
  }, [initialRevisions]);

  // Handle opening ticket
  const handleOpenTicket = (ticket: any) => {
    setSelectedTicket(ticket);
    setReplyMessage(ticket.response || "");
    setNewStatus(ticket.status || "In Progress");
  };

  // KPIs
  const totalCount = revisions.length;
  const pendingCount = revisions.filter((r) => r.status === "Pending" || r.status === "New").length;
  const inReviewCount = revisions.filter((r) => r.status === "In Review" || r.status === "In Progress").length;
  const resolvedCount = revisions.filter((r) => r.status === "Resolved" || r.status === "Completed" || r.status === "Implemented").length;

  // Filtered & Sorted list
  const filteredRevisions = useMemo(() => {
    let result = [...revisions];

    // Status Tab Filter
    if (selectedStatusTab !== "all") {
      result = result.filter((r) => {
        if (selectedStatusTab === "pending") return r.status === "Pending" || r.status === "New";
        if (selectedStatusTab === "review") return r.status === "In Review";
        if (selectedStatusTab === "progress") return r.status === "In Progress";
        if (selectedStatusTab === "resolved") return r.status === "Resolved" || r.status === "Completed" || r.status === "Implemented";
        return true;
      });
    }

    // Project filter
    if (selectedProjectId !== "all") {
      result = result.filter((r) => r.projectId === selectedProjectId);
    }

    // Client filter
    if (selectedClientId !== "all") {
      result = result.filter((r) => r.clientId === selectedClientId);
    }

    // Priority filter
    if (selectedPriority !== "all") {
      result = result.filter((r) => r.priority === selectedPriority);
    }

    // Search keyword
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.title?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.clientRel?.name?.toLowerCase().includes(q) ||
          r.projectRel?.title?.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "date-desc") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "date-asc") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "priority") {
        const pOrder: Record<string, number> = { High: 1, Medium: 2, Low: 3 };
        return (pOrder[a.priority] || 4) - (pOrder[b.priority] || 4);
      }
      return 0;
    });

    return result;
  }, [revisions, selectedStatusTab, selectedProjectId, selectedClientId, selectedPriority, searchQuery, sortBy]);

  // Paginated slice
  const paginatedRevisions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRevisions.slice(start, start + pageSize);
  }, [filteredRevisions, currentPage, pageSize]);

  // Handle Quick Status Change
  const handleQuickStatus = async (id: string, status: string) => {
    const toastId = toast.loading("Updating status...");
    try {
      await updateRevisionStatus(id, status);
      setRevisions((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
      if (selectedTicket && selectedTicket.id === id) {
        setSelectedTicket((prev: any) => ({ ...prev, status }));
      }
      toast.success(`Ticket marked as ${status}`, { id: toastId });
    } catch (e: any) {
      toast.error(e?.message || "Failed to update status", { id: toastId });
    }
  };

  // Handle Reply & Resolution Submit
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setIsReplying(true);
    const toastId = toast.loading("Sending response to client portal...");
    try {
      await replyToRevision(selectedTicket.id, replyMessage, newStatus);
      setRevisions((prev) =>
        prev.map((r) =>
          r.id === selectedTicket.id
            ? { ...r, response: replyMessage, status: newStatus }
            : r
        )
      );
      setSelectedTicket((prev: any) => ({
        ...prev,
        response: replyMessage,
        status: newStatus,
      }));
      toast.success("Response sent to client portal successfully!", { id: toastId });
    } catch (e: any) {
      toast.error(e?.message || "Failed to submit response", { id: toastId });
    } finally {
      setIsReplying(false);
    }
  };

  // Handle Delete Confirm
  const handleDeleteTicket = async () => {
    if (!deletingTicket) return;
    const toastId = toast.loading("Deleting ticket...");
    try {
      await deleteRevision(deletingTicket.id);
      setRevisions((prev) => prev.filter((r) => r.id !== deletingTicket.id));
      if (selectedTicket?.id === deletingTicket.id) {
        setSelectedTicket(null);
      }
      setDeletingTicket(null);
      toast.success("Revision ticket removed", { id: toastId });
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete ticket", { id: toastId });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-md bg-[#F0F0F0] dark:bg-[#202020] text-[#737373] dark:text-neutral-400 border border-[#E5E5E5] dark:border-[#333333]">
              LIVE CLIENT REQUEST DESK
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">
            Revisions & Client Feedback
          </h1>
          <p className="text-sm text-[#737373] dark:text-neutral-400 mt-1">
            Review incoming project revision briefs, dispatch engineer feedback, and manage client sprint adjustments.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-[#F5F5F5] dark:bg-[#151515] rounded-xl border border-[#E5E5E5] dark:border-[#262626] shrink-0">
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === "table"
                ? "bg-white dark:bg-[#262626] text-[#0A0A0A] dark:text-white shadow-xs"
                : "text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white"
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            Tickets Table
          </button>
          <button
            onClick={() => setViewMode("kanban")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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

      {/* KPI StatCards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tickets" value={totalCount} color="default" />
        <StatCard label="Action Required" value={pendingCount} color="amber" />
        <StatCard label="In Progress" value={inReviewCount} color="blue" />
        <StatCard label="Resolved & Shipped" value={resolvedCount} color="emerald" />
      </div>

      {/* Main Container Card */}
      <Card className="overflow-hidden !p-0 rounded-xl border border-[#E5E5E5] dark:border-[#262626] shadow-xs bg-white dark:bg-[#0A0A0A]">
        {/* Top Filter Toolbar */}
        <div className="p-4 sm:p-5 border-b border-[#E5E5E5] dark:border-[#262626] flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-[#0A0A0A]">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            {[
              { id: "all", label: "All", count: totalCount },
              { id: "pending", label: "Pending", count: pendingCount },
              { id: "review", label: "In Review", count: revisions.filter((r) => r.status === "In Review").length },
              { id: "progress", label: "In Progress", count: revisions.filter((r) => r.status === "In Progress").length },
              { id: "resolved", label: "Resolved", count: resolvedCount },
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
                <span
                  className={`px-1.5 py-0.2 text-[10px] rounded-md font-mono ${
                    selectedStatusTab === tab.id
                      ? "bg-white/20 text-white dark:bg-black/20 dark:text-black"
                      : "bg-[#E5E5E5] text-[#0A0A0A] dark:bg-[#262626] dark:text-neutral-300"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search, Filters & Sort Controls */}
          <div className="flex flex-wrap lg:flex-nowrap items-center gap-2.5">
            {/* Search bar */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tickets, clients..."
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

            {/* Filter by Project */}
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs border border-[#E5E5E5] dark:border-[#262626] bg-transparent rounded-lg px-2.5 py-2 font-medium text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white cursor-pointer"
            >
              <option value="all" className="dark:bg-[#111111]">Project: All ({projects.length})</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="dark:bg-[#111111]">
                  {p.title}
                </option>
              ))}
            </select>

            {/* Filter by Priority */}
            <select
              value={selectedPriority}
              onChange={(e) => {
                setSelectedPriority(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs border border-[#E5E5E5] dark:border-[#262626] bg-transparent rounded-lg px-2.5 py-2 font-medium text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white cursor-pointer"
            >
              <option value="all" className="dark:bg-[#111111]">Priority: All</option>
              <option value="High" className="dark:bg-[#111111]">High</option>
              <option value="Medium" className="dark:bg-[#111111]">Medium</option>
              <option value="Low" className="dark:bg-[#111111]">Low</option>
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs border border-[#E5E5E5] dark:border-[#262626] bg-transparent rounded-lg px-2.5 py-2 font-medium text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white cursor-pointer"
            >
              <option value="date-desc" className="dark:bg-[#111111]">Sort: Newest</option>
              <option value="date-asc" className="dark:bg-[#111111]">Sort: Oldest</option>
              <option value="priority" className="dark:bg-[#111111]">Sort: Priority</option>
            </select>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* 1. TABLE VIEW */}
        {/* ===================================================================== */}
        {viewMode === "table" && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#262626] dark:text-neutral-300">
              <thead className="text-[11px] font-semibold uppercase tracking-wider text-[#525252] dark:text-[#A3A3A3] bg-[#F9F9F9] dark:bg-[#0E0E0E] border-b border-[#E5E5E5] dark:border-[#262626]">
                <tr>
                  <th className="px-5 py-3.5 w-12 text-center">SL</th>
                  <th className="px-5 py-3.5 min-w-[280px]">Revision Details</th>
                  <th className="px-5 py-3.5 min-w-[180px]">Project & Client</th>
                  <th className="px-5 py-3.5 text-center min-w-[100px]">Priority</th>
                  <th className="px-5 py-3.5 text-center min-w-[120px]">Status</th>
                  <th className="px-5 py-3.5 min-w-[110px]">Submitted</th>
                  <th className="px-5 py-3.5 text-right w-36">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#262626] bg-white dark:bg-[#0A0A0A]">
                {paginatedRevisions.length > 0 ? (
                  paginatedRevisions.map((rev, index) => {
                    const sl = (currentPage - 1) * pageSize + index + 1;
                    const statusLane = KANBAN_LANES.find((l) => l.id === rev.status) || KANBAN_LANES[0];
                    const priorityClass =
                      rev.priority === "High"
                        ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200 dark:border-red-900"
                        : rev.priority === "Medium"
                        ? "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900"
                        : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700";

                    return (
                      <tr
                        key={rev.id}
                        className="hover:bg-[#F9F9F9] dark:hover:bg-[#141414] transition-colors group"
                      >
                        {/* SL */}
                        <td className="px-5 py-4 text-center text-xs font-mono font-medium text-[#737373] dark:text-neutral-500">
                          {sl < 10 ? `0${sl}` : sl}
                        </td>
                        {/* Title & Client */}
                        <td className="px-5 py-4 max-w-xs sm:max-w-sm">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#0A0A0A] dark:text-white truncate">
                                {rev.title}
                              </span>
                              {rev.response && (
                                <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
                                  <CheckCircle2 className="w-2.5 h-2.5" /> Replied
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#737373] dark:text-neutral-400 truncate mt-0.5">
                              {rev.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-[#737373]">
                              <span className="font-semibold text-[#0A0A0A] dark:text-white">
                                {rev.clientRel?.name || "Client Account"}
                              </span>
                              {rev.clientRel?.email && (
                                <span className="font-mono text-[10px]">
                                  • {rev.clientRel.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Associated Project */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          {rev.projectRel ? (
                            <Link
                              href={`/admin/projects?q=${encodeURIComponent(rev.projectRel.title)}`}
                              className="inline-flex items-center gap-1.5 p-1.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-[#FAFAFA] dark:bg-[#161616] hover:border-black dark:hover:border-white transition-colors group/p"
                            >
                              <Layers className="w-3.5 h-3.5 text-[#737373] group-hover/p:text-[#0A0A0A] dark:group-hover/p:text-white" />
                              <span className="font-medium text-[#0A0A0A] dark:text-white">
                                {rev.projectRel.title}
                              </span>
                              <ExternalLink className="w-3 h-3 text-[#737373] opacity-60" />
                            </Link>
                          ) : (
                            <span className="text-[11px] text-[#737373] dark:text-neutral-500 italic">
                              General Deliverable
                            </span>
                          )}
                        </td>

                        {/* Priority */}
                        <td className="px-5 py-4 text-center whitespace-nowrap">
                          <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-md border ${priorityClass}`}>
                            {rev.priority || "Medium"}
                          </span>
                        </td>

                        {/* Status (with quick switcher) */}
                        <td className="px-5 py-4 text-center whitespace-nowrap">
                          <select
                            value={rev.status}
                            onChange={(e) => handleQuickStatus(rev.id, e.target.value)}
                            className={`text-[10px] font-bold rounded-md border px-2 py-1 outline-none cursor-pointer ${statusLane.badgeColor}`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Review">In Review</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                        </td>

                        {/* Date */}
                        <td className="px-5 py-4 text-[#737373] dark:text-neutral-400 whitespace-nowrap font-mono text-[11px]">
                          {new Date(rev.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                          })}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenTicket(rev)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold border border-[#E5E5E5] dark:border-[#262626] rounded-md hover:bg-[#F5F5F5] dark:hover:bg-[#202020] text-[#0A0A0A] dark:text-white transition-colors cursor-pointer"
                            >
                              <MessageSquare className="w-3 h-3" />
                              Inspect & Reply
                            </button>
                            <button
                              onClick={() => setDeletingTicket(rev)}
                              className="p-1 text-[#737373] hover:text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                              title="Delete ticket"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-[#737373] dark:text-neutral-400">
                      No revision requests matching your filters or search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ===================================================================== */}
        {/* 2. KANBAN VIEW */}
        {/* ===================================================================== */}
        {viewMode === "kanban" && (
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start bg-[#FBFBFB] dark:bg-[#111111]">
            {KANBAN_LANES.map((lane) => {
              const laneTickets = filteredRevisions.filter((r) => {
                if (lane.id === "Pending") return r.status === "Pending" || r.status === "New";
                if (lane.id === "In Review") return r.status === "In Review";
                if (lane.id === "In Progress") return r.status === "In Progress";
                if (lane.id === "Resolved") return r.status === "Resolved" || r.status === "Completed" || r.status === "Implemented";
                return false;
              });

              return (
                <div
                  key={lane.id}
                  className={`bg-[#F9F9F9] dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] border-t-4 ${lane.color} rounded-xl p-4 space-y-3 min-h-[380px]`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#EBEBEB] dark:border-[#222222]">
                    <h3 className="text-xs font-bold text-[#0A0A0A] dark:text-white">{lane.title}</h3>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white dark:bg-[#202020] text-[#737373]">
                      {laneTickets.length}
                    </span>
                  </div>

                  {laneTickets.length > 0 ? (
                    <div className="space-y-3">
                      {laneTickets.map((t) => (
                        <Card
                          key={t.id}
                          onClick={() => handleOpenTicket(t)}
                          className="p-3.5 space-y-2.5 shadow-xs hover:border-black dark:hover:border-white transition-all cursor-pointer bg-white dark:bg-[#181818]"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-[#737373]">
                              {t.clientRel?.name || "Client"}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded-sm border ${
                                t.priority === "High"
                                  ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200"
                                  : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 border-neutral-200"
                              }`}
                            >
                              {t.priority}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-[#0A0A0A] dark:text-white leading-snug">
                            {t.title}
                          </h4>

                          <p className="text-[11px] text-[#737373] dark:text-neutral-400 line-clamp-2">
                            {t.description}
                          </p>

                          {t.projectRel && (
                            <div className="text-[10px] font-medium text-[#737373] dark:text-neutral-400 bg-[#F5F5F5] dark:bg-[#222222] p-1.5 rounded-md truncate">
                              📁 {t.projectRel.title}
                            </div>
                          )}

                          <div className="flex items-center justify-between text-[10px] text-[#737373] pt-2 border-t border-[#E5E5E5] dark:border-[#262626]">
                            <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                            {t.response ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                                ✓ Answered
                              </span>
                            ) : (
                              <span className="text-amber-600 dark:text-amber-400 font-medium">Needs Reply</span>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="py-10 text-center text-[11px] text-[#A3A3A3] dark:text-neutral-500 border border-dashed border-[#E5E5E5] dark:border-[#262626] rounded-lg">
                      No tickets in this lane
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Table Pagination Footer */}
        {viewMode === "table" && (
          <TablePagination
            currentPage={currentPage}
            totalItems={filteredRevisions.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            itemLabel="revisions"
          />
        )}
      </Card>

      {/* ========================================================================= */}
      {/* 3. TICKET INSPECT & LIVE REPLY MODAL */}
      {/* ========================================================================= */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#262626] rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#E5E5E5] dark:border-[#262626] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#F0F0F0] dark:bg-[#202020] text-[#737373]">
                    {selectedTicket.priority} Priority Ticket
                  </span>
                  <span className="text-xs text-[#737373] font-mono">
                    ID: #{selectedTicket.id.slice(-6).toUpperCase()}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-[#0A0A0A] dark:text-white mt-1">
                  {selectedTicket.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1.5 text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white rounded-full hover:bg-[#F5F5F5] dark:hover:bg-[#202020] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Ticket Context Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Client Info */}
              <div className="p-3 bg-[#F9F9F9] dark:bg-[#161616] rounded-xl border border-[#E5E5E5] dark:border-[#262626] space-y-1">
                <span className="text-[#737373] block text-[10px] uppercase font-bold tracking-wider">Client Organization</span>
                <p className="font-bold text-[#0A0A0A] dark:text-white text-sm">{selectedTicket.clientRel?.name || "Client Account"}</p>
                <p className="text-[#737373] dark:text-neutral-400">{selectedTicket.clientRel?.email}</p>
              </div>

              {/* Associated Project */}
              <div className="p-3 bg-[#F9F9F9] dark:bg-[#161616] rounded-xl border border-[#E5E5E5] dark:border-[#262626] space-y-1">
                <span className="text-[#737373] block text-[10px] uppercase font-bold tracking-wider">Associated Project</span>
                {selectedTicket.projectRel ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#0A0A0A] dark:text-white text-sm">{selectedTicket.projectRel.title}</p>
                      <p className="text-[#737373]">{selectedTicket.projectRel.category}</p>
                    </div>
                    <Link
                      href={`/admin/projects?q=${encodeURIComponent(selectedTicket.projectRel.title)}`}
                      className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] hover:opacity-90 inline-flex items-center gap-1"
                    >
                      Open Project <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                ) : (
                  <p className="text-[#737373] italic">General Organization Deliverable</p>
                )}
              </div>
            </div>

            {/* Client's Original Description */}
            <div className="space-y-1.5 text-xs">
              <span className="font-bold text-[#0A0A0A] dark:text-white uppercase tracking-wider text-[11px] block">
                Client Revision Specification:
              </span>
              <div className="p-4 bg-[#F9F9F9] dark:bg-[#161616] rounded-xl border border-[#E5E5E5] dark:border-[#262626] text-[#0A0A0A] dark:text-neutral-200 leading-relaxed whitespace-pre-wrap">
                {selectedTicket.description}
              </div>
            </div>

            {/* Interactive Admin Response & Resolution Box */}
            <form onSubmit={handleSendReply} className="space-y-4 pt-2 border-t border-[#E5E5E5] dark:border-[#262626]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="text-xs font-bold text-[#0A0A0A] dark:text-white flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Engineering Response & Status Update:
                </label>

                {/* Status selector */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-[#737373]">Set Ticket Status:</span>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="px-2.5 py-1 bg-white dark:bg-[#161616] border border-[#E5E5E5] dark:border-[#262626] rounded-md font-semibold text-[#0A0A0A] dark:text-white outline-none cursor-pointer"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Review">In Review</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved & Shipped</option>
                  </select>
                </div>
              </div>

              <textarea
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                placeholder="Write resolution notes, deploy confirmation, or instructions visible to the client in their portal..."
                rows={4}
                className="w-full p-3 text-xs bg-white dark:bg-[#161616] border border-[#E5E5E5] dark:border-[#262626] rounded-xl text-[#0A0A0A] dark:text-white placeholder-[#737373] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
              />

              <div className="flex items-center justify-between pt-1">
                <p className="text-[11px] text-[#737373]">
                  Changes are instantly synced to the client&apos;s live portal.
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setSelectedTicket(null)}
                  >
                    Close
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={isReplying}
                  >
                    <Send className="w-3.5 h-3.5 mr-1" />
                    {isReplying ? "Saving..." : "Send Response & Update"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#262626] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-[#0A0A0A] dark:text-white">Delete Revision Request</h3>
            <p className="text-xs text-[#737373] dark:text-neutral-400">
              Are you sure you want to permanently delete the ticket <strong className="text-[#0A0A0A] dark:text-white">&quot;{deletingTicket.title}&quot;</strong>?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={() => setDeletingTicket(null)}>
                Cancel
              </Button>
              <button
                onClick={handleDeleteTicket}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
              >
                Delete Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
