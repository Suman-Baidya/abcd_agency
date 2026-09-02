"use client";

import React, { useState, useEffect, useMemo } from "react";
import { getPortalData, scheduleMeeting } from "../actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/dashboard/StatCard";
import { TablePagination } from "@/components/ui/TablePagination";
import { Calendar, Video, Clock, Plus, CheckCircle2, ExternalLink, Search, ArrowUpDown, Lock, X } from "lucide-react";
import toast from "react-hot-toast";

export default function PortalMeetingsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showBookModal, setShowBookModal] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  // Table state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusTab, setSelectedStatusTab] = useState("all");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc">("date-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [formData, setFormData] = useState({
    title: "Sprint Review & Milestone Sync",
    date: new Date().toISOString().slice(0, 10),
    time: "15:00",
    duration: "30 mins",
    notes: "",
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

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooking(true);
    try {
      await scheduleMeeting({
        title: formData.title,
        date: formData.date,
        time: formData.time,
        duration: formData.duration,
        notes: formData.notes,
      });

      toast.success("Meeting scheduled! Google Meet link generated.");
      setShowBookModal(false);
      loadData();
    } catch (e: any) {
      toast.error(e?.message || "Failed to schedule meeting.");
    } finally {
      setIsBooking(false);
    }
  };

  const client = data?.client;
  const isProspect = data?.user?.role === "USER";
  const meetings: any[] = useMemo(() => client?.meetings || [], [client]);

  // Stat metrics
  const totalMeetingsCount = meetings.length;
  const upcomingMeetingsCount = meetings.filter((m) => new Date(m.date).getTime() >= new Date().setHours(0, 0, 0, 0)).length;
  const completedMeetingsCount = totalMeetingsCount - upcomingMeetingsCount;

  // Filter & sort
  const filteredMeetings = useMemo(() => {
    let result = [...meetings];

    if (selectedStatusTab !== "all") {
      const today = new Date().setHours(0, 0, 0, 0);
      result = result.filter((m) => {
        const isUpcoming = new Date(m.date).getTime() >= today;
        if (selectedStatusTab === "upcoming") return isUpcoming;
        if (selectedStatusTab === "completed") return !isUpcoming;
        return true;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.title?.toLowerCase().includes(q) ||
          m.notes?.toLowerCase().includes(q) ||
          m.time?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === "date-desc") {
        return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
      }
      if (sortBy === "date-asc") {
        return new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime();
      }
      return 0;
    });

    return result;
  }, [meetings, selectedStatusTab, searchQuery, sortBy]);

  const paginatedMeetings = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMeetings.slice(start, start + pageSize);
  }, [filteredMeetings, currentPage, pageSize]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#737373] dark:text-neutral-400">Loading meeting schedules & calendars...</p>
      </div>
    );
  }

  if (isProspect) {
    return (
      <div className="space-y-6 animate-in fade-in">
        <div className="border-b border-[#E5E5E5] dark:border-[#262626] pb-6">
          <h1 className="text-2xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">Meetings & Consultations</h1>
          <p className="text-xs text-[#737373] mt-1">
            Dedicated sprint review calls and team syncs are available for active client projects.
          </p>
        </div>

        <Card className="p-8 text-center space-y-4 max-w-lg mx-auto border border-[#E5E5E5] dark:border-[#262626]">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#0A0A0A] dark:text-white">Milestone Meetings Locked</h3>
          <p className="text-xs text-[#737373]">
            Once you become an Active Client, you can schedule direct architecture reviews and sprint checkpoint calls.
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
            Meetings & Consultations
          </h1>
          <p className="text-sm text-[#737373] dark:text-neutral-400 mt-1">
            Schedule and join live video calls with your lead architect and engineering team.
          </p>
        </div>

        <Button
          id="meetings-book-btn"
          variant="primary"
          size="sm"
          onClick={() => setShowBookModal(true)}
          className="text-xs cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Book Milestone Call
        </Button>
      </div>

      {/* StatCards KPI Row */}
      <div id="meetings-kpi-stats" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Sessions" value={totalMeetingsCount} color="default" />
        <StatCard label="Upcoming Calls" value={upcomingMeetingsCount} color="emerald" />
        <StatCard label="Completed Sessions" value={completedMeetingsCount} color="default" />
        <StatCard label="Platform" value="Google Meet" color="blue" />
      </div>

      {/* Meetings Table Card */}
      <Card id="meetings-table-card" className="overflow-hidden !p-0 rounded-xl border border-[#E5E5E5] dark:border-[#262626] shadow-xs bg-white dark:bg-[#0A0A0A]">
        {/* Table Controls Toolbar */}
        <div className="p-4 sm:p-5 border-b border-[#E5E5E5] dark:border-[#262626] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0A0A0A]">
          {/* Status Tab Pills */}
          <div id="meetings-status-tabs" className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: "all", label: "All", count: totalMeetingsCount },
              { id: "upcoming", label: "Upcoming", count: upcomingMeetingsCount },
              { id: "completed", label: "Completed", count: completedMeetingsCount },
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
                placeholder="Search meeting title or agenda..."
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
                <th className="px-5 py-3.5 min-w-[260px]">Meeting Topic & Agenda</th>
                <th className="px-5 py-3.5 min-w-[160px]">Schedule</th>
                <th className="px-5 py-3.5 min-w-[100px]">Duration</th>
                <th className="px-5 py-3.5 min-w-[120px]">Platform</th>
                <th className="px-5 py-3.5 text-right w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#262626] bg-white dark:bg-[#0A0A0A]">
              {paginatedMeetings.length > 0 ? (
                paginatedMeetings.map((m, index) => {
                  const sl = (currentPage - 1) * pageSize + index + 1;
                  return (
                    <tr key={m.id} className="hover:bg-[#F9F9F9] dark:hover:bg-[#141414] transition-colors group">
                      {/* SL */}
                      <td className="px-5 py-4 text-center text-xs font-mono font-medium text-[#737373] dark:text-neutral-500">
                        {sl < 10 ? `0${sl}` : sl}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 flex items-center justify-center shrink-0">
                            <Video className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-[#0A0A0A] dark:text-white">{m.title}</h4>
                            {m.notes && <p className="text-[11px] text-[#737373] dark:text-neutral-400 line-clamp-1 mt-0.5">{m.notes}</p>}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-semibold text-[#0A0A0A] dark:text-white">{m.date}</span>
                        <span className="text-[#737373] dark:text-neutral-400 ml-1 text-xs">at {m.time}</span>
                      </td>

                      <td className="px-5 py-4 text-[#737373] dark:text-neutral-400 whitespace-nowrap text-xs">
                        {m.duration}
                      </td>

                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#F5F5F5] dark:bg-[#222222] text-[#0A0A0A] dark:text-white border border-[#E5E5E5] dark:border-[#333333]">
                          Google Meet
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <a
                          href={m.meetingLink || "https://meet.google.com"}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] text-xs font-bold rounded-lg hover:opacity-90 transition-opacity"
                        >
                          Join Call
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#737373] dark:text-neutral-400">
                    No scheduled meetings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Automatic Pagination Footer */}
        <TablePagination
          currentPage={currentPage}
          totalItems={filteredMeetings.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="meetings"
        />
      </Card>

      {/* Book Meeting Modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#262626] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 shadow-xl animate-in zoom-in-95 duration-200 scrollbar-thin">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] dark:border-[#262626] pb-3">
              <h3 className="text-sm font-bold text-[#0A0A0A] dark:text-white">Schedule Video Consultation</h3>
              <button
                onClick={() => setShowBookModal(false)}
                className="p-1 text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white rounded-full"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBook} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
                  Call Objective / Topic *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
                    Preferred Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
                    Time (IST) *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
                  Meeting Agenda & Discussion Items
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="What would you like to review during this call?"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E5E5] dark:border-[#262626]">
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowBookModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isBooking}>
                  {isBooking ? "Booking..." : "Confirm & Generate Meet Link"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
