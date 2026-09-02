"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { UserItem, convertUserToClient, updateUserStatus, deleteUserAccount, getUserActivities, clearUserActivities, markUserAsViewed } from "@/app/(dashboard)/admin/users/actions";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/Button";
import { PopoverMenu } from "@/components/ui/PopoverMenu";
import { Modal } from "@/components/ui/Modal";
import { 
  Search, 
  Eye, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Building2, 
  UserPlus, 
  CheckCircle2, 
  ExternalLink, 
  Trash2, 
  X, 
  MessageCircle, 
  Contact, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  UserCheck,
  AlertTriangle
} from "lucide-react";
import toast from "react-hot-toast";

interface UserManagerProps {
  initialUsers: UserItem[];
}

export function UserManager({ initialUsers }: UserManagerProps) {
  const [users, setUsers] = useState<UserItem[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<"all" | "prospects" | "clients" | "admins">("all");
  const [sortBy, setSortBy] = useState<"newest" | "name" | "activity">("newest");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Drawer / Details Modal State
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [isClearingActivities, setIsClearingActivities] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [convertingUser, setConvertingUser] = useState<UserItem | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [deletingUser, setDeletingUser] = useState<UserItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedUser && !isClearModalOpen && !convertingUser && !deletingUser) {
        setSelectedUser(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedUser, isClearModalOpen, convertingUser, deletingUser]);

  // Contact popup dropdown state
  const [openContactDropdownId, setOpenContactDropdownId] = useState<string | null>(null);
  const contactButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Counts for tabs & stat cards
  const prospectsCount = users.filter((u) => u.role === "USER" || !u.clientId).length;
  const clientsCount = users.filter((u) => u.role === "CLIENT" && !!u.clientId).length;
  const adminsCount = users.filter((u) => u.role === "ADMIN" || u.role === "SUPER_ADMIN").length;

  const tabCounts = {
    all: users.length,
    prospects: prospectsCount,
    clients: clientsCount,
    admins: adminsCount,
  };

  // Filter and sort users
  const filteredUsers = useMemo(() => {
    let result = users.filter((u) => {
      // Tab filter
      if (selectedTab === "prospects" && !(u.role === "USER" || !u.clientId)) return false;
      if (selectedTab === "clients" && !(u.role === "CLIENT" && !!u.clientId)) return false;
      if (selectedTab === "admins" && u.role !== "ADMIN" && u.role !== "SUPER_ADMIN") return false;

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.companyName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.toLowerCase().includes(q)) ||
        (u.industry && u.industry.toLowerCase().includes(q)) ||
        (u.location && u.location.toLowerCase().includes(q))
      );
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "name") {
        return (a.companyName || a.name).localeCompare(b.companyName || b.name);
      }
      if (sortBy === "activity") {
        return (b.activitiesCount || 0) - (a.activitiesCount || 0);
      }
      // default newest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [users, selectedTab, searchQuery, sortBy]);

  // Paginated users
  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ["Company / Name", "Contact Person", "Email", "Phone", "Role", "Status", "Verified", "Industry", "Location", "Website", "Joined Date"];
    const rows = filteredUsers.map((u) => [
      `"${u.companyName || u.name}"`,
      `"${u.name}"`,
      `"${u.email}"`,
      `"${u.phone || "N/A"}"`,
      `"${u.role}"`,
      `"${u.status}"`,
      `"${u.isVerified ? "Yes" : "No"}"`,
      `"${u.industry || "N/A"}"`,
      `"${u.location || "N/A"}"`,
      `"${u.website || "N/A"}"`,
      `"${formatDate(u.createdAt)}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `users_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Users CSV exported successfully");
  };

  const handleOpenDetails = async (user: UserItem) => {
    setSelectedUser(user);
    setLoadingActivities(true);

    // If not viewed yet, mark as viewed to decrease notification count
    if (!user.isViewed) {
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isViewed: true } : u))
      );
      markUserAsViewed(user.id).catch(() => {});
    }

    try {
      const acts = await getUserActivities(user.id);
      setActivities(acts);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load user activity log");
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleClearActivities = () => {
    if (!selectedUser) return;
    setIsClearModalOpen(true);
  };

  const handleConfirmClearActivities = async () => {
    if (!selectedUser) return;

    setIsClearingActivities(true);
    try {
      await clearUserActivities(selectedUser.id);
      setActivities([]);
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? { ...u, activitiesCount: 0 } : u))
      );
      toast.success("Activity logs cleared successfully");
      setIsClearModalOpen(false);
    } catch (e: any) {
      toast.error(e?.message || "Failed to clear activity logs");
    } finally {
      setIsClearingActivities(false);
    }
  };

  const handleConvertToClient = (user: UserItem) => {
    setConvertingUser(user);
  };

  const handleConfirmConvertToClient = async () => {
    if (!convertingUser) return;

    setIsConverting(true);
    try {
      const res = await convertUserToClient(convertingUser.id);
      if (res.success) {
        toast.success(`Successfully converted ${convertingUser.companyName || convertingUser.name} to Client!`);
        setUsers((prev) =>
          prev.map((u) => (u.id === convertingUser.id ? { ...u, role: "CLIENT", clientId: res.clientId } : u))
        );
        if (selectedUser?.id === convertingUser.id) {
          setSelectedUser((prev) => (prev ? { ...prev, role: "CLIENT", clientId: res.clientId } : null));
        }
        setConvertingUser(null);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to convert user to client.");
    } finally {
      setIsConverting(false);
    }
  };

  const handleToggleStatus = async (user: UserItem, newStatus: string) => {
    try {
      await updateUserStatus(user.id, newStatus);
      toast.success(`Status updated to ${newStatus}`);
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
      );
      if (selectedUser?.id === user.id) {
        setSelectedUser((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (e) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = (user: UserItem) => {
    setDeletingUser(user);
  };

  const handleConfirmDelete = async () => {
    if (!deletingUser) return;

    setIsDeleting(true);
    try {
      await deleteUserAccount(deletingUser.id);
      toast.success("User account deleted");
      setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
      if (selectedUser?.id === deletingUser.id) {
        setSelectedUser(null);
      }
      setDeletingUser(null);
    } catch (e) {
      toast.error("Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  const getCleanPhone = (phone?: string | null) => {
    const digits = (phone || "").replace(/[^0-9]/g, "");
    if (digits.length === 10) return `91${digits}`;
    return digits;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">
            Users Management
          </h1>
          <p className="text-sm text-[#737373] dark:text-neutral-400 mt-1">
            Track user registrations, view active sessions, and convert prospects to official clients.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            id="admin-users-export-btn"
            variant="secondary"
            size="sm"
            onClick={handleExportCSV}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Stats Section (Standardized StatCard Design & Height) */}
      <div id="admin-users-kpi" className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Accounts" value={users.length} />
        <StatCard label="New Prospects" value={prospectsCount} color="amber" />
        <StatCard label="Active Clients" value={clientsCount} color="emerald" />
        <StatCard label="Administrators" value={adminsCount} />
      </div>

      {/* Users Table Container Card */}
      <Card id="admin-users-table" className="overflow-hidden !p-0 rounded-xl border border-[#E5E5E5] dark:border-[#262626] shadow-xs bg-white dark:bg-[#0A0A0A]">
        {/* Filter & Search Toolbar */}
        <div className="p-4 sm:p-5 border-b border-[#E5E5E5] dark:border-[#262626] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0A0A0A]">
          {/* Status Filter Tabs */}
          <div id="admin-users-tabs" className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {(
              [
                { id: "all", label: "All Users" },
                { id: "prospects", label: "Prospects / Leads" },
                { id: "clients", label: "Converted Clients" },
                { id: "admins", label: "Admins" },
              ] as const
            ).map((tab) => {
              const isSelected = selectedTab === tab.id;
              const count = tabCounts[tab.id];
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setSelectedTab(tab.id);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? "bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] shadow-xs"
                      : "text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.2 text-[10px] rounded-md font-mono ${
                      isSelected
                        ? "bg-white/20 text-white dark:bg-black/20 dark:text-black"
                        : "bg-[#E5E5E5] text-[#0A0A0A] dark:bg-[#262626] dark:text-neutral-300"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Sort Controls */}
          <div id="admin-users-search" className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
              <input
                type="text"
                placeholder="Search users, company, email, location..."
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

            {/* Sort Select */}
            <div className="flex items-center gap-1.5 shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs border border-[#E5E5E5] dark:border-[#262626] bg-transparent rounded-lg px-3 py-2 font-medium text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white cursor-pointer"
              >
                <option value="newest" className="dark:bg-[#111111]">Sort: Newest</option>
                <option value="name" className="dark:bg-[#111111]">Sort: Name (A-Z)</option>
                <option value="activity" className="dark:bg-[#111111]">Sort: Most Active</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#262626] dark:text-neutral-300">
            <thead className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400 bg-[#FBFBFB] dark:bg-[#111111] border-b border-[#E5E5E5] dark:border-[#262626]">
              <tr>
                <th className="px-5 py-3.5">User / Organization</th>
                <th className="px-5 py-3.5 text-center">Account Role</th>
                <th className="px-5 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5">Joined & Activity</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#262626]">
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => {
                  const isProspect = user.role === "USER" || !user.clientId;
                  const isClient = user.role === "CLIENT" && !!user.clientId;
                  const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
                  const isContactOpen = openContactDropdownId === user.id;

                  const initials =
                    (user.companyName || user.name)
                      .trim()
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase() || "U";

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-[#FBFBFB] dark:hover:bg-[#151515] transition-colors"
                    >
                      {/* Organization & Representative */}
                      <td className="px-5 py-4 min-w-[240px]">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-xs text-[#0A0A0A] dark:text-white truncate">
                                {user.companyName || user.name}
                              </span>
                              {user.website && (
                                <a
                                  href={user.website.startsWith("http") ? user.website : `https://${user.website}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[#737373] hover:text-[#0A0A0A] dark:text-neutral-400 dark:hover:text-white transition-colors"
                                  title="Visit Website"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                            <p className="text-xs text-[#737373] dark:text-neutral-400 truncate mt-0.5 flex items-center gap-1.5 min-w-0">
                              <span className="truncate">{user.name}</span>
                              <span className="text-[#A3A3A3] dark:text-neutral-600 shrink-0">•</span>
                              <span className="font-mono text-[11px] truncate">{user.email}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role & Verification Badge (Centered) */}
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        <div className="inline-flex flex-col items-center gap-1">
                          {isProspect && (
                            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                              Prospect / Lead
                            </span>
                          )}
                          {isClient && (
                            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                              Client Account
                            </span>
                          )}
                          {isAdmin && (
                            <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A]">
                              {user.role}
                            </span>
                          )}

                          <span className="text-[10px] font-medium text-[#737373] dark:text-neutral-400">
                            {user.isVerified ? "Email Verified" : "Unverified"}
                          </span>
                        </div>
                      </td>

                      {/* Quick Status Selection (Centered) */}
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        <select
                          value={user.status}
                          onChange={(e) => handleToggleStatus(user, e.target.value)}
                          className={`text-xs border rounded-lg px-2.5 py-1 font-medium outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white cursor-pointer transition-colors ${
                            user.status === "Active"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50"
                              : "bg-red-50 text-red-800 border-red-200/80 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800/50"
                          }`}
                        >
                          <option value="Active" className="dark:bg-[#111111] text-[#0A0A0A] dark:text-white">Active</option>
                          <option value="Suspended" className="dark:bg-[#111111] text-[#0A0A0A] dark:text-white">Suspended</option>
                        </select>
                      </td>

                      {/* Joined Date & Activity */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-xs text-[#0A0A0A] dark:text-white font-semibold">
                            {formatDate(user.createdAt)}
                          </span>
                          <span className="text-[11px] text-[#737373] dark:text-neutral-400 mt-0.5">
                            {user.activitiesCount} recorded actions
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5" data-dropdown-container>
                          {/* Make Client 1-Click CTA if Prospect */}
                          {isProspect && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleConvertToClient(user)}
                              disabled={isConverting}
                              className="text-xs py-1 px-2.5 min-h-[30px] font-bold"
                            >
                              <UserPlus className="w-3.5 h-3.5 mr-1" />
                              Make Client
                            </Button>
                          )}

                          {/* Contact Popup Button */}
                          <div className="relative">
                            <button
                              ref={(el) => {
                                contactButtonRefs.current[user.id] = el;
                              }}
                              onClick={() => setOpenContactDropdownId(isContactOpen ? null : user.id)}
                              className={`p-1.5 border rounded-lg transition-colors cursor-pointer ${
                                isContactOpen
                                  ? "bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] border-[#0A0A0A] dark:border-white"
                                  : "border-[#E5E5E5] dark:border-[#262626] text-[#737373] hover:text-[#0A0A0A] dark:text-neutral-400 dark:hover:text-white hover:border-[#0A0A0A] dark:hover:border-white"
                              }`}
                              title="Contact User"
                            >
                              <Contact className="w-3.5 h-3.5" />
                            </button>

                            <PopoverMenu
                              isOpen={isContactOpen}
                              onClose={() => setOpenContactDropdownId(null)}
                              anchorEl={contactButtonRefs.current[user.id] || null}
                              align="right"
                            >
                              {(user.phone || user.whatsapp) ? (
                                <a
                                  href={`tel:${user.phone || user.whatsapp}`}
                                  onClick={() => setOpenContactDropdownId(null)}
                                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-[#0A0A0A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-colors"
                                >
                                  <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                  <span>Call Now</span>
                                </a>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenContactDropdownId(null);
                                    toast.error(`No phone number available for ${user.name}`);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-[#737373] dark:text-neutral-400 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-colors text-left cursor-pointer"
                                >
                                  <Phone className="w-3.5 h-3.5 text-[#A3A3A3] dark:text-neutral-500" />
                                  <span>Call Now</span>
                                </button>
                              )}

                              {(user.whatsapp || user.phone) ? (
                                <a
                                  href={`https://wa.me/${getCleanPhone(user.isWhatsappSame ? user.phone : (user.whatsapp || user.phone))}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => setOpenContactDropdownId(null)}
                                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-[#0A0A0A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-colors"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                  <span>WhatsApp</span>
                                </a>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenContactDropdownId(null);
                                    toast.error(`No WhatsApp number available for ${user.name}`);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-[#737373] dark:text-neutral-400 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-colors text-left cursor-pointer"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 text-[#A3A3A3] dark:text-neutral-500" />
                                  <span>WhatsApp</span>
                                </button>
                              )}

                              <a
                                href={`mailto:${user.email}?subject=Touching base regarding ABCD Agency partnership`}
                                onClick={() => setOpenContactDropdownId(null)}
                                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-[#0A0A0A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-colors"
                              >
                                <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                <span>Send Email</span>
                              </a>
                            </PopoverMenu>
                          </div>

                          {/* View Details Drawer Button */}
                          <button
                            onClick={() => handleOpenDetails(user)}
                            className="p-1.5 border border-[#E5E5E5] dark:border-[#262626] rounded-lg text-[#737373] hover:text-[#0A0A0A] dark:text-neutral-400 dark:hover:text-white hover:border-[#0A0A0A] dark:hover:border-white transition-colors cursor-pointer"
                            title="View Full Profile & Activity Audit"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(user)}
                            className="p-1.5 border border-[#E5E5E5] dark:border-[#262626] rounded-lg text-[#737373] hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-800 transition-colors cursor-pointer"
                            title="Delete User"
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
                  <td colSpan={5} className="py-12 text-center text-sm text-[#737373] dark:text-neutral-400">
                    No users found matching your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer matching other pages */}
        <div className="p-4 border-t border-[#E5E5E5] dark:border-[#262626] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs bg-white dark:bg-[#0A0A0A]">
          <div className="flex items-center gap-2 text-[#737373] dark:text-neutral-400">
            <span>Showing</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-[#E5E5E5] dark:border-[#262626] bg-transparent rounded-md px-2 py-1 text-xs font-semibold text-[#0A0A0A] dark:text-white outline-none"
            >
              <option value={10} className="dark:bg-[#111111]">10</option>
              <option value={25} className="dark:bg-[#111111]">25</option>
              <option value={50} className="dark:bg-[#111111]">50</option>
            </select>
            <span>of {filteredUsers.length} total users</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 font-semibold text-xs text-[#0A0A0A] dark:text-white">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* Slide-Over Drawer / Details Modal */}
      {selectedUser && (
        <div 
          onClick={() => setSelectedUser(null)}
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white dark:bg-[#111111] border-l border-[#E5E5E5] dark:border-[#262626] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300 cursor-default"
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-[#E5E5E5] dark:border-[#262626] flex items-center justify-between bg-white dark:bg-[#111111] shrink-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] flex items-center justify-center font-bold text-sm">
                  {(selectedUser.companyName || selectedUser.name).slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#0A0A0A] dark:text-white leading-tight">
                    {selectedUser.companyName || selectedUser.name}
                  </h2>
                  <p className="text-xs text-[#737373] dark:text-neutral-400">
                    Registered on {formatDate(selectedUser.createdAt)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white rounded-full hover:bg-[#F5F5F5] dark:hover:bg-[#222222]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Drawer Content */}
            <div className="p-6 space-y-6 flex-1 overflow-y-auto min-h-0">
              {/* Promotion Banner if Prospect or Client profile deleted */}
              {(selectedUser.role === "USER" || !selectedUser.clientId) && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                    <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      Unconverted Prospect Account
                    </h4>
                  </div>
                  <p className="text-xs text-amber-800 dark:text-amber-300">
                    This user registered online. Convert them into an official Client to assign projects and manage finances.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full justify-center bg-amber-900 text-white hover:bg-amber-950"
                    onClick={() => handleConvertToClient(selectedUser)}
                    disabled={isConverting}
                  >
                    {isConverting ? "Promoting..." : "Make Official Client Account"}
                  </Button>
                </div>
              )}

              {/* Converted Client Status Badge */}
              {selectedUser.role === "CLIENT" && !!selectedUser.clientId && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">Official Client Account</p>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400">Available in Client CRM and Project allocations.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Organization & Contact Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#737373] dark:text-neutral-400 border-b border-[#E5E5E5] dark:border-[#262626] pb-2">
                  Account Details
                </h4>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#737373] block">Contact Representative:</span>
                    <span className="font-semibold text-[#0A0A0A] dark:text-white">{selectedUser.name}</span>
                  </div>
                  <div>
                    <span className="text-[#737373] block">Email Address:</span>
                    <span className="font-mono font-semibold text-[#0A0A0A] dark:text-white">{selectedUser.email}</span>
                  </div>
                  <div>
                    <span className="text-[#737373] block">Phone:</span>
                    <span className="font-semibold text-[#0A0A0A] dark:text-white">{selectedUser.phone || "Not provided"}</span>
                  </div>
                  <div>
                    <span className="text-[#737373] block">WhatsApp:</span>
                    <span className="font-semibold text-[#0A0A0A] dark:text-white">{selectedUser.whatsapp || selectedUser.phone || "Same as phone"}</span>
                  </div>
                  <div>
                    <span className="text-[#737373] block">Industry:</span>
                    <span className="font-semibold text-[#0A0A0A] dark:text-white">{selectedUser.industry || "Not specified"}</span>
                  </div>
                  <div>
                    <span className="text-[#737373] block">Location:</span>
                    <span className="font-semibold text-[#0A0A0A] dark:text-white">{selectedUser.location || "Remote"}</span>
                  </div>
                  {selectedUser.website && (
                    <div className="col-span-2">
                      <span className="text-[#737373] block">Website:</span>
                      <a
                        href={selectedUser.website.startsWith("http") ? selectedUser.website : `https://${selectedUser.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-[#0A0A0A] dark:text-white underline inline-flex items-center gap-1"
                      >
                        {selectedUser.website}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#E5E5E5] dark:border-[#262626] pb-2 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                      Activity & Audit History
                    </h4>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[#F0F0F0] dark:bg-[#202020] text-[#737373] dark:text-neutral-400">
                      Last 45 days
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono text-[#737373] dark:text-neutral-400">
                      {activities.length} entries
                    </span>
                    {activities.length > 0 && (
                      <button
                        onClick={handleClearActivities}
                        disabled={isClearingActivities}
                        className="text-[11px] text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-semibold flex items-center gap-1 hover:underline cursor-pointer transition-colors disabled:opacity-50"
                        title="Clear this user's activity log history to free storage"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>{isClearingActivities ? "Clearing..." : "Clear Storage"}</span>
                      </button>
                    )}
                  </div>
                </div>

                {loadingActivities ? (
                  <div className="py-6 text-center text-xs text-[#737373]">
                    Loading activity history...
                  </div>
                ) : activities.length > 0 ? (
                  <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#E5E5E5] dark:before:bg-[#262626]">
                    {activities.map((act) => (
                      <div key={act.id} className="relative pl-7 text-xs">
                        <div className="absolute left-2 top-1.5 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[#0A0A0A] dark:bg-white border-2 border-white dark:border-[#111111]" />
                        <div className="p-3 bg-[#F9F9F9] dark:bg-[#161616] border border-[#E5E5E5] dark:border-[#262626] rounded-xl space-y-1.5">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="font-bold text-[#0A0A0A] dark:text-white text-[11px] px-2 py-0.5 rounded-md bg-[#EAEAEA] dark:bg-[#222222]">
                              {act.action}
                            </span>
                            <span className="text-[10px] text-[#737373] dark:text-neutral-400 font-mono">
                              {new Date(act.createdAt).toLocaleString("en-US", {
                                month: "short",
                                day: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          {act.description && (
                            <p className="text-[11px] text-[#262626] dark:text-neutral-300">
                              {act.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between flex-wrap gap-2 text-[10px] text-[#737373] dark:text-neutral-400 pt-1.5 border-t border-[#EAEAEA] dark:border-[#222222]">
                            <span>Device: <strong className="font-medium text-[#0A0A0A] dark:text-white">{act.device || "Web Browser"}</strong></span>
                            <span>IP & Location: <strong className="font-medium text-[#0A0A0A] dark:text-white">{act.ipAddress || "127.0.0.1"}</strong></span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-[#737373]">
                    No activity records found for this user within the last 45 days.
                  </div>
                )}
              </div>
            </div>

            {/* Fixed Action Footer */}
            <div className="p-4 border-t border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] flex items-center justify-between gap-3 shrink-0">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleToggleStatus(selectedUser, selectedUser.status === "Active" ? "Suspended" : "Active")}
                className="flex-1 text-xs"
              >
                {selectedUser.status === "Active" ? "Suspend Account" : "Activate Account"}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedUser(null)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Alert Modal: Clear Activity Logs */}
      <Modal
        isOpen={isClearModalOpen}
        onClose={() => {
          if (isClearingActivities) return;
          setIsClearModalOpen(false);
        }}
        title="Clear Activity & Audit History"
        variant="centered"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-red-900 dark:text-red-200">
                Permanent Storage Cleanup
              </p>
              <p className="text-red-700 dark:text-red-300/90 leading-relaxed">
                Are you sure you want to delete all activity & audit logs for <strong className="font-semibold text-red-950 dark:text-red-100">{selectedUser?.companyName || selectedUser?.name}</strong>? This frees database storage immediately and cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5E5E5] dark:border-[#262626]">
            <Button
              variant="secondary"
              size="sm"
              disabled={isClearingActivities}
              onClick={() => setIsClearModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isClearingActivities}
              onClick={handleConfirmClearActivities}
              className="bg-red-600 hover:bg-red-700 text-white border-transparent"
            >
              {isClearingActivities ? "Clearing..." : "Yes, Clear Storage"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Custom Confirmation Alert Modal: Promote to Client */}
      <Modal
        isOpen={!!convertingUser}
        onClose={() => {
          if (isConverting) return;
          setConvertingUser(null);
        }}
        title="Promote to Official Client"
        variant="centered"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs space-y-1">
            <p className="font-bold text-amber-900 dark:text-amber-200">
              Account Promotion
            </p>
            <p className="text-amber-800 dark:text-amber-300 leading-relaxed">
              Promote <strong className="font-semibold text-amber-950 dark:text-amber-100">{convertingUser?.companyName || convertingUser?.name}</strong> to an official Client account? This will create an official Client profile and grant client-level project permissions.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5E5E5] dark:border-[#262626]">
            <Button
              variant="secondary"
              size="sm"
              disabled={isConverting}
              onClick={() => setConvertingUser(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isConverting}
              onClick={handleConfirmConvertToClient}
            >
              {isConverting ? "Promoting..." : "Confirm & Make Client"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Custom Confirmation Alert Modal: Delete User */}
      <Modal
        isOpen={!!deletingUser}
        onClose={() => {
          if (isDeleting) return;
          setDeletingUser(null);
        }}
        title="Delete User Account"
        variant="centered"
        size="md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold text-red-900 dark:text-red-200">
                Permanent Deletion
              </p>
              <p className="text-red-700 dark:text-red-300/90 leading-relaxed">
                Are you sure you want to delete the user account for <strong className="font-semibold text-red-950 dark:text-red-100">{deletingUser?.name}</strong> ({deletingUser?.email})? All associated credentials and activity history will be permanently deleted.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5E5E5] dark:border-[#262626]">
            <Button
              variant="secondary"
              size="sm"
              disabled={isDeleting}
              onClick={() => setDeletingUser(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white border-transparent"
            >
              {isDeleting ? "Deleting..." : "Yes, Delete Account"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
