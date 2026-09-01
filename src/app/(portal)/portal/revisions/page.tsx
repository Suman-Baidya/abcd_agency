"use client";

import React, { useState, useEffect, useMemo } from "react";
import { getPortalData, submitRevisionRequest } from "../actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/dashboard/StatCard";
import { TablePagination } from "@/components/ui/TablePagination";
import { RotateCcw, Plus, CheckCircle2, Clock, AlertCircle, Search, ArrowUpDown, Lock, MessageSquare, X } from "lucide-react";
import toast from "react-hot-toast";

export default function PortalRevisionsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);

  // Table state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusTab, setSelectedStatusTab] = useState("all");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc">("date-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedRevision, setSelectedRevision] = useState<any | null>(null);
  const [readNotifIds, setReadNotifIds] = useState<string[]>([]);

  // Sync read notification IDs from localStorage
  useEffect(() => {
    const syncReadNotifs = () => {
      try {
        const stored = localStorage.getItem("abcd_read_notifications");
        if (stored) {
          setReadNotifIds(JSON.parse(stored));
        }
      } catch {}
    };

    syncReadNotifs();
    window.addEventListener("notifications_updated", syncReadNotifs);
    return () => window.removeEventListener("notifications_updated", syncReadNotifs);
  }, []);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    projectId: "",
  });

  const loadData = () => {
    getPortalData().then((res) => {
      setData(res);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Please fill in title and description.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitRevisionRequest({
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        projectId: formData.projectId || undefined,
      });

      toast.success("Revision ticket submitted to engineering team!");
      setShowFormModal(false);
      setFormData({ title: "", description: "", priority: "Medium", projectId: "" });
      loadData();
    } catch (e: any) {
      toast.error(e?.message || "Failed to submit revision.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const client = data?.client;
  const isProspect = data?.user?.role === "USER";
  const revisions: any[] = useMemo(() => client?.revisionRequests || [], [client]);
  const projects: any[] = useMemo(() => client?.projects || [], [client]);

  // Stat metrics
  const totalRevisionsCount = revisions.length;
  const inProgressRevisions = revisions.filter((r) => r.status === "In Progress" || r.status === "In Review" || r.status === "New").length;
  const implementedRevisions = revisions.filter((r) => r.status === "Implemented" || r.status === "Approved" || r.status === "Completed").length;
  const highPriorityCount = revisions.filter((r) => r.priority === "High").length;

  // Filter and sort
  const filteredRevisions = useMemo(() => {
    let result = [...revisions];

    if (selectedStatusTab !== "all") {
      result = result.filter((r) => {
        if (selectedStatusTab === "active") return r.status === "In Progress" || r.status === "In Review" || r.status === "New";
        if (selectedStatusTab === "implemented") return r.status === "Implemented" || r.status === "Approved" || r.status === "Completed";
        return true;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.title?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.priority?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === "date-desc") {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (sortBy === "date-asc") {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      return 0;
    });

    return result;
  }, [revisions, selectedStatusTab, searchQuery, sortBy]);

  const paginatedRevisions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRevisions.slice(start, start + pageSize);
  }, [filteredRevisions, currentPage, pageSize]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#737373] dark:text-neutral-400">Loading revision tickets & QA history...</p>
      </div>
    );
  }

  if (isProspect) {
    return (
      <div className="space-y-6 animate-in fade-in">
        <div className="border-b border-[#E5E5E5] dark:border-[#262626] pb-6">
          <h1 className="text-2xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">Revision & QA Requests</h1>
          <p className="text-xs text-[#737373] mt-1">
            Revision requests are active when your project is in milestone development.
          </p>
        </div>

        <Card className="p-8 text-center space-y-4 max-w-lg mx-auto border border-[#E5E5E5] dark:border-[#262626]">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#0A0A0A] dark:text-white">Revision System Locked</h3>
          <p className="text-xs text-[#737373]">
            Once your project kicks off, you can submit sprint tweaks, UI modifications, and feedback tickets directly to engineering.
          </p>
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
            Revision Requests & Tickets
          </h1>
          <p className="text-sm text-[#737373] dark:text-neutral-400 mt-1">
            Submit modifications, feature tweaks, and UX adjustments directly to the engineering team.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowFormModal(true)}
          className="text-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          New Revision Ticket
        </Button>
      </div>

      {/* StatCards KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tickets" value={totalRevisionsCount} color="default" />
        <StatCard label="In Progress / QA" value={inProgressRevisions} color="amber" />
        <StatCard label="Implemented" value={implementedRevisions} color="emerald" />
        <StatCard label="High Priority" value={highPriorityCount} color={highPriorityCount > 0 ? "red" : "default"} />
      </div>

      {/* Revisions Table Card */}
      <Card className="overflow-hidden !p-0 rounded-xl border border-[#E5E5E5] dark:border-[#262626] shadow-xs bg-white dark:bg-[#0A0A0A]">
        {/* Table Controls Toolbar */}
        <div className="p-4 sm:p-5 border-b border-[#E5E5E5] dark:border-[#262626] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0A0A0A]">
          {/* Status Tab Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: "all", label: "All", count: totalRevisionsCount },
              { id: "active", label: "Active", count: inProgressRevisions },
              { id: "implemented", label: "Implemented", count: implementedRevisions },
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

          {/* Search & Sort */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ticket title or description..."
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
              </select>
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#262626] dark:text-neutral-300">
            <thead className="text-[11px] font-semibold uppercase tracking-wider text-[#525252] dark:text-[#A3A3A3] bg-[#F9F9F9] dark:bg-[#0E0E0E] border-b border-[#E5E5E5] dark:border-[#262626]">
              <tr>
                <th className="px-5 py-3.5 w-12 text-center">SL</th>
                <th className="px-5 py-3.5 min-w-[260px]">Ticket Details</th>
                <th className="px-5 py-3.5 min-w-[100px] text-center">Priority</th>
                <th className="px-5 py-3.5 min-w-[120px] text-center">Status</th>
                <th className="px-5 py-3.5 min-w-[120px]">Date</th>
                <th className="px-5 py-3.5 min-w-[200px]">Developer Resolution</th>
                <th className="px-5 py-3.5 text-right w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#262626] bg-white dark:bg-[#0A0A0A]">
              {paginatedRevisions.length > 0 ? (
                paginatedRevisions.map((rev, index) => {
                  const sl = (currentPage - 1) * pageSize + index + 1;
                  return (
                    <tr key={rev.id} className="hover:bg-[#F9F9F9] dark:hover:bg-[#141414] transition-colors group">
                      {/* SL */}
                      <td className="px-5 py-4 text-center text-xs font-mono font-medium text-[#737373] dark:text-neutral-500">
                        {sl < 10 ? `0${sl}` : sl}
                      </td>

                      <td className="px-5 py-4 max-w-xs sm:max-w-sm">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-[#0A0A0A] dark:text-white truncate">
                              {rev.title}
                            </h4>
                            {rev.response && (
                              <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded-sm border shrink-0 ${
                                !readNotifIds.includes(`rev-${rev.id}`)
                                  ? "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/40 animate-pulse"
                                  : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                              }`}>
                                <CheckCircle2 className="w-2.5 h-2.5" /> {!readNotifIds.includes(`rev-${rev.id}`) ? "New Reply" : "Replied"}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#737373] dark:text-neutral-400 truncate mt-0.5">
                            {rev.description}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${
                          rev.priority === "High"
                            ? "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900"
                            : "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                        }`}>
                          {rev.priority}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-md border ${
                          rev.status === "Implemented" || rev.status === "Approved" || rev.status === "Resolved"
                            ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900"
                            : rev.status === "In Progress"
                            ? "bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-900"
                            : "bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A]"
                        }`}>
                          {rev.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-[#737373] dark:text-neutral-400 whitespace-nowrap">
                        {new Date(rev.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-5 py-4 text-[#737373] dark:text-neutral-400 max-w-xs truncate">
                        {rev.response ? (
                          <span className="inline-flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-400 truncate">
                            <MessageSquare className="w-3 h-3 shrink-0" />
                            <span className="truncate">{rev.response}</span>
                          </span>
                        ) : (
                          <span className="text-[#A3A3A3] italic">Awaiting review</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            setSelectedRevision(rev);
                            try {
                              const stored = localStorage.getItem("abcd_read_notifications");
                              const parsed = stored ? JSON.parse(stored) : [];
                              const updated = Array.from(new Set([...parsed, `rev-${rev.id}`]));
                              localStorage.setItem("abcd_read_notifications", JSON.stringify(updated));
                              setReadNotifIds(updated);
                              setTimeout(() => {
                                window.dispatchEvent(new Event("notifications_updated"));
                              }, 0);
                            } catch {}
                          }}
                          className="px-2.5 py-1 text-xs font-bold border border-[#E5E5E5] dark:border-[#262626] rounded-md hover:bg-[#F5F5F5] dark:hover:bg-[#202020] text-[#0A0A0A] dark:text-white transition-colors cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#737373] dark:text-neutral-400">
                    No revision tickets found matching your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Automatic Pagination Footer */}
        <TablePagination
          currentPage={currentPage}
          totalItems={filteredRevisions.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="tickets"
        />
      </Card>

      {/* New Revision Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#262626] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-xl animate-in zoom-in-95 duration-200 scrollbar-thin">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] dark:border-[#262626] pb-3">
              <h3 className="text-sm font-bold text-[#0A0A0A] dark:text-white">Submit New Revision Ticket</h3>
              <button
                onClick={() => setShowFormModal(false)}
                className="p-1 text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white rounded-full"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
                  Request Title / Issue Summary *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Adjust checkout payment gateway validation"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
                    Target Project
                  </label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white focus:outline-none"
                  >
                    <option value="">General Deliverable</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
                    Priority Level
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white focus:outline-none"
                  >
                    <option value="Low">Low (Minor tweak)</option>
                    <option value="Medium">Medium (Standard QA)</option>
                    <option value="High">High (Urgent blocker)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
                  Detailed Change Description & Links *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the change in detail. Mention specific URLs or components..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E5E5] dark:border-[#262626]">
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowFormModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Submit Ticket"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Details Modal */}
      {selectedRevision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#262626] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 space-y-4 shadow-xl animate-in zoom-in-95 duration-200 scrollbar-thin">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] dark:border-[#262626] pb-3">
              <h3 className="text-sm font-bold text-[#0A0A0A] dark:text-white">Revision Ticket Details</h3>
              <button
                onClick={() => setSelectedRevision(null)}
                className="p-1 text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white rounded-full"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#0A0A0A] dark:text-white">{selectedRevision.title}</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A]">
                  {selectedRevision.status}
                </span>
              </div>

              <div className="p-3 bg-[#F9F9F9] dark:bg-[#161616] rounded-xl border border-[#E5E5E5] dark:border-[#262626] space-y-1">
                <span className="text-[#737373] block text-[11px]">Requested Changes:</span>
                <p className="text-[#0A0A0A] dark:text-neutral-200 leading-relaxed whitespace-pre-wrap">
                  {selectedRevision.description}
                </p>
              </div>

              {selectedRevision.response && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900 space-y-1">
                  <span className="text-emerald-800 dark:text-emerald-300 font-semibold block text-[11px]">Developer Resolution:</span>
                  <p className="text-emerald-950 dark:text-emerald-200 leading-relaxed">
                    {selectedRevision.response}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-[#E5E5E5] dark:border-[#262626]">
              <Button variant="secondary" size="sm" onClick={() => setSelectedRevision(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
