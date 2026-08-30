"use client";

import React, { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/dashboard/StatCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  Search,
  Plus,
  Download,
  Mail,
  Phone,
  Globe,
  MapPin,
  Briefcase,
  Eye,
  MoreVertical,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Contact,
  MessageCircle,
  Pencil,
  Trash2,
  Copy,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  createClient,
  updateClient,
  updateClientStatus,
  deleteClient,
} from "@/app/(dashboard)/admin/clients/actions";

import { ClientProjectItem } from "@/app/(dashboard)/admin/clients/actions";

export interface ClientItem {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  isWhatsappSame: boolean;
  whatsapp?: string;
  industry: string;
  location: string;
  website?: string;
  projects: number;
  activeProjects: number;
  projectsList?: ClientProjectItem[];
  totalSpend: string;
  totalSpendRaw: number;
  dueBalance: string;
  dueBalanceRaw: number;
  status: "Active" | "Prospect" | "Inactive";
  joined: string;
  joinedDate: string;
  initials: string;
  notes?: string;
}

export function ClientManager({
  initialClients = [],
}: {
  initialClients?: ClientItem[];
}) {
  const router = useRouter();
  const [clientList, setClientList] = useState<ClientItem[]>(initialClients);
  const [, startTransition] = useTransition();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"name" | "spend" | "projects" | "joined">("joined");
  const [selectedClient, setSelectedClient] = useState<ClientItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientItem | null>(null);
  const [deletingClient, setDeletingClient] = useState<ClientItem | null>(null);
  const [openContactDropdownId, setOpenContactDropdownId] = useState<string | null>(null);
  const [openMoreDropdownId, setOpenMoreDropdownId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close dropdowns on outside click
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-dropdown-container]")) {
        setOpenContactDropdownId(null);
        setOpenMoreDropdownId(null);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  // Quick Status Change directly from table row
  const handleQuickStatusChange = (clientId: string, newStatus: ClientItem["status"]) => {
    setClientList((prev) =>
      prev.map((c) => (c.id === clientId ? { ...c, status: newStatus } : c))
    );
    const client = clientList.find((c) => c.id === clientId);

    startTransition(async () => {
      try {
        await updateClientStatus(clientId, newStatus);
        toast.success(`Updated status for ${client?.name || "Client"} to ${newStatus}`);
        router.refresh();
      } catch (err) {
        toast.error("Failed to update status in database");
      }
    });
  };

  // New Client Form State
  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    isWhatsappSame: true,
    whatsapp: "",
    industry: "",
    location: "",
    website: "",
    status: "Active" as "Active" | "Prospect" | "Inactive",
    notes: "",
    initialSpend: "₹0",
    dueBalance: "₹0",
  });

  // Edit Client Form State
  const [editFormData, setEditFormData] = useState<{
    id: string;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    isWhatsappSame: boolean;
    whatsapp: string;
    industry: string;
    location: string;
    website: string;
    status: "Active" | "Prospect" | "Inactive";
    notes: string;
    totalSpend: string;
    dueBalance: string;
  } | null>(null);

  // Filtered and Sorted Clients
  const filteredClients = useMemo(() => {
    return clientList
      .filter((client) => {
        const matchesSearch =
          client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.location.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
          selectedStatus === "All" || client.status === selectedStatus;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "spend") return b.totalSpendRaw - a.totalSpendRaw;
        if (sortBy === "projects") return b.projects - a.projects;
        if (sortBy === "joined") return new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime();
        return 0;
      });
  }, [clientList, searchQuery, selectedStatus, sortBy]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredClients.length / pageSize) || 1;
  const paginatedClients = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredClients.slice(start, start + pageSize);
  }, [filteredClients, currentPage, pageSize]);

  // Statistics
  const stats = useMemo(() => {
    const total = clientList.length;
    const active = clientList.filter((c) => c.status === "Active").length;
    const prospects = clientList.filter((c) => c.status === "Prospect").length;
    const totalRev = clientList.reduce((acc, c) => acc + (c.totalSpendRaw || 0), 0);
    return {
      total,
      active,
      prospects,
      totalRevenue: `₹${(totalRev / 1000).toFixed(1)}k`,
    };
  }, [clientList]);

  // Status counts for tabs
  const statusCounts = useMemo(() => {
    return {
      All: clientList.length,
      Active: clientList.filter((c) => c.status === "Active").length,
      Prospect: clientList.filter((c) => c.status === "Prospect").length,
      Inactive: clientList.filter((c) => c.status === "Inactive").length,
    };
  }, [clientList]);

  // Export to CSV handler
  const handleExportCSV = () => {
    const headers = [
      "Client Name",
      "Contact Person",
      "Email",
      "Phone",
      "WhatsApp",
      "Industry",
      "Location",
      "Status",
      "Projects",
      "Total Spend",
      "Due Balance",
      "Joined Date",
    ];

    const rows = filteredClients.map((c) => [
      `"${c.name}"`,
      `"${c.contactPerson}"`,
      `"${c.email}"`,
      `"${c.phone}"`,
      `"${c.isWhatsappSame ? c.phone : c.whatsapp || ""}"`,
      `"${c.industry}"`,
      `"${c.location}"`,
      `"${c.status}"`,
      c.projects,
      `"${c.totalSpend}"`,
      `"${c.dueBalance}"`,
      `"${c.joined}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `clients_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Client list exported successfully!");
  };

  // Helper for website formatting
  const formatWebsiteUrl = (url: string) => {
    if (!url || !url.trim()) return undefined;
    const trimmed = url.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
    return `https://${trimmed}`;
  };

  // Add Client Submit handler
  const handleAddClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Please provide company name and email");
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedWebsite = formatWebsiteUrl(formData.website);
      const created = await createClient({
        name: formData.name,
        contactPerson: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        isWhatsappSame: formData.isWhatsappSame,
        whatsapp: formData.isWhatsappSame ? formData.phone : formData.whatsapp,
        industry: formData.industry,
        location: formData.location,
        website: formattedWebsite,
        status: formData.status,
        totalSpend: formData.initialSpend,
        dueBalance: formData.dueBalance,
        notes: formData.notes,
      });

      const words = formData.name.trim().split(" ");
      const initials =
        words.length > 1
          ? `${words[0][0]}${words[1][0]}`.toUpperCase()
          : formData.name.slice(0, 2).toUpperCase();

      const spendFormatted = formData.initialSpend.startsWith("₹")
        ? formData.initialSpend
        : `₹${formData.initialSpend}`;
      const dueFormatted = formData.dueBalance.startsWith("₹")
        ? formData.dueBalance
        : `₹${formData.dueBalance}`;

      const newClient: ClientItem = {
        id: created.id,
        name: created.name,
        contactPerson: created.contactPerson || "Account Manager",
        email: created.email,
        phone: created.phone || "N/A",
        isWhatsappSame: created.isWhatsappSame,
        whatsapp: created.whatsapp || undefined,
        industry: created.industry || "General",
        location: created.location || "Remote",
        website: created.website || undefined,
        projects: 0,
        activeProjects: 0,
        totalSpend: spendFormatted,
        totalSpendRaw: parseInt(formData.initialSpend.replace(/[^0-9]/g, "") || "0", 10),
        dueBalance: dueFormatted,
        dueBalanceRaw: parseInt(formData.dueBalance.replace(/[^0-9]/g, "") || "0", 10),
        status: (created.status as any) || "Active",
        joined: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        joinedDate: new Date().toISOString().slice(0, 10),
        initials,
        notes: created.notes || undefined,
      };

      setClientList((prev) => [newClient, ...prev.filter((c) => c.id !== newClient.id)]);
      setIsAddModalOpen(false);
      setFormData({
        name: "",
        contactPerson: "",
        email: "",
        phone: "",
        isWhatsappSame: true,
        whatsapp: "",
        industry: "",
        location: "",
        website: "",
        status: "Active",
        notes: "",
        initialSpend: "₹0",
        dueBalance: "₹0",
      });
      toast.success(`Client "${newClient.name}" added successfully!`);
      router.refresh();
    } catch (err: any) {
      console.error("Error creating client:", err);
      toast.error(err?.message || "Failed to add client. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (client: ClientItem) => {
    const isSame = client.isWhatsappSame ?? (!client.whatsapp || client.whatsapp === client.phone);
    setEditingClient(client);
    setEditFormData({
      id: client.id,
      name: client.name,
      contactPerson: client.contactPerson,
      email: client.email,
      phone: client.phone,
      isWhatsappSame: isSame,
      whatsapp: isSame ? client.phone : (client.whatsapp || ""),
      industry: client.industry,
      location: client.location,
      website: client.website || "",
      status: client.status,
      notes: client.notes || "",
      totalSpend: client.totalSpend,
      dueBalance: client.dueBalance || "₹0",
    });
  };

  // Edit Client Submit
  const handleEditClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData) return;

    setIsSubmitting(true);
    try {
      const formattedWebsite = formatWebsiteUrl(editFormData.website);
      await updateClient(editFormData.id, {
        name: editFormData.name,
        contactPerson: editFormData.contactPerson,
        email: editFormData.email,
        phone: editFormData.phone,
        isWhatsappSame: editFormData.isWhatsappSame,
        whatsapp: editFormData.isWhatsappSame ? editFormData.phone : editFormData.whatsapp,
        industry: editFormData.industry,
        location: editFormData.location,
        website: formattedWebsite,
        status: editFormData.status,
        totalSpend: editFormData.totalSpend,
        dueBalance: editFormData.dueBalance,
        notes: editFormData.notes,
      });

      const words = editFormData.name.trim().split(" ");
      const initials =
        words.length > 1
          ? `${words[0][0]}${words[1][0]}`.toUpperCase()
          : editFormData.name.slice(0, 2).toUpperCase();

      const updatedSpendRaw = parseInt(editFormData.totalSpend.replace(/[^0-9]/g, "") || "0", 10);
      const updatedDueRaw = parseInt(editFormData.dueBalance.replace(/[^0-9]/g, "") || "0", 10);

      const spendFormatted = editFormData.totalSpend.startsWith("₹")
        ? editFormData.totalSpend
        : `₹${editFormData.totalSpend}`;
      const dueFormatted = editFormData.dueBalance.startsWith("₹")
        ? editFormData.dueBalance
        : `₹${editFormData.dueBalance}`;

      setClientList((prev) =>
        prev.map((c) =>
          c.id === editFormData.id
            ? {
                ...c,
                name: editFormData.name.trim(),
                contactPerson: editFormData.contactPerson.trim(),
                email: editFormData.email.trim(),
                phone: editFormData.phone.trim(),
                isWhatsappSame: editFormData.isWhatsappSame,
                whatsapp: editFormData.isWhatsappSame ? editFormData.phone.trim() : (editFormData.whatsapp.trim() || undefined),
                industry: editFormData.industry.trim(),
                location: editFormData.location.trim(),
                website: formattedWebsite,
                status: editFormData.status,
                notes: editFormData.notes.trim() || undefined,
                totalSpend: spendFormatted,
                totalSpendRaw: updatedSpendRaw,
                dueBalance: dueFormatted,
                dueBalanceRaw: updatedDueRaw,
                initials,
              }
            : c
        )
      );

      setEditingClient(null);
      setEditFormData(null);
      toast.success("Client details updated!");
      router.refresh();
    } catch (err: any) {
      console.error("Error updating client:", err);
      toast.error(err?.message || "Failed to update client details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Client
  const handleDeleteConfirm = () => {
    if (!deletingClient) return;

    const clientId = deletingClient.id;
    const clientName = deletingClient.name;

    setClientList((prev) => prev.filter((c) => c.id !== clientId));
    if (selectedClient?.id === clientId) setSelectedClient(null);
    setDeletingClient(null);

    startTransition(async () => {
      try {
        await deleteClient(clientId);
        toast.success(`Client "${clientName}" deleted`);
        router.refresh();
      } catch (err) {
        toast.error("Failed to delete client from database");
      }
    });
  };

  const getCleanPhone = (phone: string) => {
    const digits = (phone || "").replace(/[^0-9]/g, "");
    if (digits.length === 10) return `91${digits}`;
    return digits;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">
            Clients
          </h1>
          <p className="text-sm text-[#737373] dark:text-neutral-400 mt-1">
            Manage your client accounts, engagements, and business relationships.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCSV}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Client
          </Button>
        </div>
      </div>

      {/* KPI Stats Section */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Clients" value={stats.total} />
        <StatCard label="Active Accounts" value={stats.active} color="emerald" />
        <StatCard label="Prospects" value={stats.prospects} />
        <StatCard label="Total Revenue" value={stats.totalRevenue} />
      </div>

      {/* Clients List Table Container Card */}
      <Card className="overflow-hidden !p-0 rounded-xl border border-[#E5E5E5] dark:border-[#262626] shadow-xs bg-white dark:bg-[#0A0A0A]">
        {/* Filter Toolbar */}
        <div className="p-4 sm:p-5 border-b border-[#E5E5E5] dark:border-[#262626] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0A0A0A]">
          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {(["All", "Active", "Prospect", "Inactive"] as const).map((status) => {
              const isSelected = selectedStatus === status;
              const count = statusCounts[status];
              return (
                <button
                  key={status}
                  onClick={() => {
                    setSelectedStatus(status);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? "bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] shadow-xs"
                      : "text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]"
                  }`}
                >
                  <span>{status}</span>
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
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
              <input
                type="text"
                placeholder="Search clients, email, industry..."
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
                <option value="joined" className="dark:bg-[#111111]">Sort: Newest</option>
                <option value="name" className="dark:bg-[#111111]">Sort: Name (A-Z)</option>
                <option value="spend" className="dark:bg-[#111111]">Sort: Highest Spend</option>
                <option value="projects" className="dark:bg-[#111111]">Sort: Most Projects</option>
              </select>
            </div>
          </div>
        </div>

        {/* List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#262626] dark:text-neutral-300">
            <thead className="text-[11px] font-semibold uppercase tracking-wider text-[#525252] dark:text-[#A3A3A3] bg-[#F9F9F9] dark:bg-[#0E0E0E] border-b border-[#E5E5E5] dark:border-[#262626]">
              <tr>
                <th className="px-5 py-3.5 w-12 text-center">SL</th>
                <th className="px-5 py-3.5 min-w-[260px]">Client / Account</th>
                <th className="px-5 py-3.5 min-w-[130px] text-center">Status</th>
                <th className="px-5 py-3.5 min-w-[130px]">Projects</th>
                <th className="px-5 py-3.5 min-w-[140px]">Spend & Due</th>
                <th className="px-5 py-3.5 min-w-[140px]">Client Since</th>
                <th className="px-5 py-3.5 text-right w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#262626] bg-white dark:bg-[#0A0A0A]">
              {paginatedClients.length > 0 ? (
                paginatedClients.map((client, index) => {
                  const sl = (currentPage - 1) * pageSize + index + 1;
                  const isContactOpen = openContactDropdownId === client.id;
                  const isMoreOpen = openMoreDropdownId === client.id;
                  const whatsappTarget = client.isWhatsappSame ? client.phone : (client.whatsapp || client.phone);

                  return (
                    <tr
                      key={client.id}
                      className="hover:bg-[#F9F9F9] dark:hover:bg-[#141414] transition-colors group"
                    >
                      {/* SL */}
                      <td className="px-5 py-4 text-center text-xs font-mono font-medium text-[#737373] dark:text-neutral-500">
                        {sl < 10 ? `0${sl}` : sl}
                      </td>

                      {/* Client info */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-9 h-9 rounded-lg bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                            {client.initials}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-bold text-[#0A0A0A] dark:text-white truncate">
                                {client.name}
                              </p>
                              {client.website && (
                                <a
                                  href={client.website}
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
                              <span className="truncate">{client.contactPerson}</span>
                              <span className="text-[#A3A3A3] dark:text-neutral-600 shrink-0">•</span>
                              <span className="font-mono text-[11px] truncate">{client.email}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Quick Status Selection (Centered) */}
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        <select
                          value={client.status}
                          onChange={(e) => handleQuickStatusChange(client.id, e.target.value as any)}
                          className={`text-xs border rounded-lg px-2.5 py-1 font-medium outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white cursor-pointer transition-colors ${
                            client.status === "Active"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50"
                              : client.status === "Prospect"
                              ? "bg-blue-50 text-blue-800 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/50"
                              : "bg-[#F5F5F5] text-[#737373] border-[#E5E5E5] dark:bg-[#1A1A1A] dark:text-neutral-400 dark:border-[#262626]"
                          }`}
                        >
                          <option value="Active" className="dark:bg-[#111111] text-[#0A0A0A] dark:text-white">Active</option>
                          <option value="Prospect" className="dark:bg-[#111111] text-[#0A0A0A] dark:text-white">Prospect</option>
                          <option value="Inactive" className="dark:bg-[#111111] text-[#0A0A0A] dark:text-white">Inactive</option>
                        </select>
                      </td>

                      {/* Projects */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-[#0A0A0A] dark:text-white">
                            {client.projects} {client.projects === 1 ? "Project" : "Projects"}
                          </span>
                          <span className="text-[11px] text-[#737373] dark:text-neutral-400">
                            {client.activeProjects} active
                          </span>
                        </div>
                      </td>

                      {/* Total Spend & Due Balance */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-xs text-[#0A0A0A] dark:text-white">
                            {client.totalSpend}
                          </span>
                          <span
                            className={`text-[11px] font-mono mt-0.5 ${
                              client.dueBalance && client.dueBalance !== "₹0"
                                ? "text-amber-700 dark:text-amber-400 font-semibold"
                                : "text-[#737373] dark:text-neutral-500"
                            }`}
                          >
                            Due: {client.dueBalance || "₹0"}
                          </span>
                        </div>
                      </td>

                      {/* Joined Date */}
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-[#737373] dark:text-neutral-400">
                        {client.joined}
                      </td>

                      {/* Actions: Contact, Edit, Delete, More */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5" data-dropdown-container>
                          {/* 1. Contact Button */}
                          <div className="relative">
                            <button
                              onClick={() => {
                                setOpenContactDropdownId(isContactOpen ? null : client.id);
                                setOpenMoreDropdownId(null);
                              }}
                              className={`p-1.5 border rounded-lg transition-colors cursor-pointer ${
                                isContactOpen
                                  ? "bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] border-[#0A0A0A] dark:border-white"
                                  : "border-[#E5E5E5] dark:border-[#262626] text-[#737373] hover:text-[#0A0A0A] dark:text-neutral-400 dark:hover:text-white hover:border-[#0A0A0A] dark:hover:border-white"
                              }`}
                              title="Contact Client"
                            >
                              <Contact className="w-3.5 h-3.5" />
                            </button>

                            {isContactOpen && (
                              <div className="absolute right-0 top-full mt-1.5 z-40 w-48 rounded-xl bg-white dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#262626] shadow-xl p-1.5 animate-in fade-in zoom-in-95 duration-150">
                                <a
                                  href={`tel:${client.phone}`}
                                  onClick={() => setOpenContactDropdownId(null)}
                                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-[#0A0A0A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-colors"
                                >
                                  <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                  <span>Call Now</span>
                                </a>
                                <a
                                  href={`https://wa.me/${getCleanPhone(whatsappTarget)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => setOpenContactDropdownId(null)}
                                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-[#0A0A0A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-colors"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                  <span>WhatsApp</span>
                                </a>
                                <a
                                  href={`mailto:${client.email}?subject=Touching base regarding ABCD Agency partnership`}
                                  onClick={() => setOpenContactDropdownId(null)}
                                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-[#0A0A0A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-colors"
                                >
                                  <Mail className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                  <span>Mail</span>
                                </a>
                              </div>
                            )}
                          </div>

                          {/* 2. Edit Button */}
                          <button
                            onClick={() => handleOpenEdit(client)}
                            className="p-1.5 border border-[#E5E5E5] dark:border-[#262626] rounded-lg text-[#737373] hover:text-[#0A0A0A] dark:text-neutral-400 dark:hover:text-white hover:border-[#0A0A0A] dark:hover:border-white transition-colors cursor-pointer"
                            title="Edit Client"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* 3. Delete Button */}
                          <button
                            onClick={() => setDeletingClient(client)}
                            className="p-1.5 border border-[#E5E5E5] dark:border-[#262626] rounded-lg text-[#737373] hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-800 transition-colors cursor-pointer"
                            title="Delete Client"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {/* 4. More Button */}
                          <div className="relative">
                            <button
                              onClick={() => {
                                setOpenMoreDropdownId(isMoreOpen ? null : client.id);
                                setOpenContactDropdownId(null);
                              }}
                              className={`p-1.5 border rounded-lg transition-colors cursor-pointer ${
                                isMoreOpen
                                  ? "bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] border-[#0A0A0A] dark:border-white"
                                  : "border-[#E5E5E5] dark:border-[#262626] text-[#737373] hover:text-[#0A0A0A] dark:text-neutral-400 dark:hover:text-white hover:border-[#0A0A0A] dark:hover:border-white"
                              }`}
                              title="More Options"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            {isMoreOpen && (
                              <div className="absolute right-0 top-full mt-1.5 z-40 w-48 rounded-xl bg-white dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#262626] shadow-xl p-1.5 animate-in fade-in zoom-in-95 duration-150 text-left">
                                <button
                                  onClick={() => {
                                    setSelectedClient(client);
                                    setOpenMoreDropdownId(null);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-[#0A0A0A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-colors cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 text-[#737373]" />
                                  <span>View Profile</span>
                                </button>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(client.email);
                                    toast.success("Email copied to clipboard");
                                    setOpenMoreDropdownId(null);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-[#0A0A0A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-colors cursor-pointer"
                                >
                                  <Copy className="w-3.5 h-3.5 text-[#737373]" />
                                  <span>Copy Email</span>
                                </button>
                                {client.website && (
                                  <a
                                    href={client.website}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={() => setOpenMoreDropdownId(null)}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg text-[#0A0A0A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-colors"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5 text-[#737373]" />
                                    <span>Visit Website</span>
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="max-w-xs mx-auto text-center space-y-2">
                      <p className="text-sm font-semibold text-[#0A0A0A] dark:text-white">
                        No clients match your filter
                      </p>
                      <p className="text-xs text-[#737373] dark:text-neutral-400">
                        Try adjusting your search criteria or resetting the status filter.
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedStatus("All");
                        }}
                        className="mt-3 text-xs font-semibold text-[#0A0A0A] dark:text-white underline underline-offset-4 cursor-pointer"
                      >
                        Reset filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Row Controls */}
        <div className="px-5 py-4 border-t border-[#E5E5E5] dark:border-[#262626] flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#0A0A0A]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#737373] dark:text-neutral-400 uppercase tracking-wider">
                Rows per page:
              </span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="text-xs border border-[#E5E5E5] dark:border-[#262626] bg-transparent rounded-lg px-2.5 py-1 font-medium text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white cursor-pointer"
              >
                <option value="5" className="dark:bg-[#111111]">5</option>
                <option value="10" className="dark:bg-[#111111]">10</option>
                <option value="20" className="dark:bg-[#111111]">20</option>
                <option value="50" className="dark:bg-[#111111]">50</option>
              </select>
            </div>
            <p className="text-xs font-medium text-[#737373] dark:text-neutral-400 hidden sm:block">
              Showing {filteredClients.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
              {Math.min(currentPage * pageSize, filteredClients.length)} of {filteredClients.length} clients
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage <= 1}
              className="p-1.5 border border-[#E5E5E5] dark:border-[#262626] rounded-lg text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white hover:border-[#0A0A0A] dark:hover:border-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1.5 text-xs font-medium text-[#0A0A0A] dark:text-white bg-[#F5F5F5] dark:bg-[#111111] rounded-lg border border-[#E5E5E5] dark:border-[#262626]">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="p-1.5 border border-[#E5E5E5] dark:border-[#262626] rounded-lg text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white hover:border-[#0A0A0A] dark:hover:border-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Alert Modal */}
      {deletingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#0A0A0A]/50 backdrop-blur-sm transition-opacity"
            onClick={() => setDeletingClient(null)}
          />
          <div className="relative w-full max-w-md rounded-xl bg-white dark:bg-[#111111] p-6 shadow-2xl border border-[#E5E5E5] dark:border-[#262626] animate-in zoom-in-95 fade-in duration-200">
            <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold tracking-tight text-[#0A0A0A] dark:text-white mb-2">
              Delete Client
            </h3>
            <p className="text-xs text-[#737373] dark:text-neutral-400 mb-6 leading-relaxed">
              Are you sure you want to delete <strong className="text-[#0A0A0A] dark:text-white">{deletingClient.name}</strong>? This will remove all associated contact and billing data.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDeletingClient(null)}
              >
                Cancel
              </Button>
              <button
                onClick={handleDeleteConfirm}
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 active:bg-red-800 transition-colors shadow-xs cursor-pointer"
              >
                Delete Client
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {editingClient && editFormData && (
        <Modal
          isOpen={!!editingClient}
          onClose={() => {
            if (isSubmitting) return;
            setEditingClient(null);
            setEditFormData(null);
          }}
          title="Edit Client"
          variant="centered"
          size="2xl"
        >
          <form onSubmit={handleEditClientSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                  Company / Client Name *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                  Contact Person
                </label>
                <input
                  type="text"
                  value={editFormData.contactPerson}
                  onChange={(e) => setEditFormData({ ...editFormData, contactPerson: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={editFormData.phone}
                  onChange={(e) => {
                    const newPhone = e.target.value;
                    setEditFormData({
                      ...editFormData,
                      phone: newPhone,
                      whatsapp: editFormData.isWhatsappSame ? newPhone : editFormData.whatsapp,
                    });
                  }}
                  className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* WhatsApp Number with Checkbox on the right */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400 flex items-center gap-1">
                    <MessageCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    WhatsApp No (Optional)
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={editFormData.isWhatsappSame}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setEditFormData({
                          ...editFormData,
                          isWhatsappSame: isChecked,
                          whatsapp: isChecked ? editFormData.phone : "",
                        });
                      }}
                      className="w-3.5 h-3.5 rounded border-[#E5E5E5] dark:border-[#262626] text-[#0A0A0A] focus:ring-0 cursor-pointer accent-[#0A0A0A] dark:accent-white"
                    />
                    <span className="text-[11px] font-medium text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white">
                      Same as Mobile
                    </span>
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={editFormData.whatsapp}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditFormData({
                      ...editFormData,
                      whatsapp: val,
                      isWhatsappSame: val === editFormData.phone && val !== "",
                    });
                  }}
                  className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                  Industry
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fintech, SaaS"
                  value={editFormData.industry}
                  onChange={(e) => setEditFormData({ ...editFormData, industry: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="City, Country"
                  value={editFormData.location}
                  onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                  Account Status
                </label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white cursor-pointer"
                >
                  <option value="Active" className="dark:bg-[#111111]">Active</option>
                  <option value="Prospect" className="dark:bg-[#111111]">Prospect</option>
                  <option value="Inactive" className="dark:bg-[#111111]">Inactive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                  Website URL
                </label>
                <input
                  type="text"
                  placeholder="https://company.com"
                  value={editFormData.website}
                  onChange={(e) => setEditFormData({ ...editFormData, website: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                  Total Spend
                </label>
                <input
                  type="text"
                  placeholder="e.g. ₹50,000"
                  value={editFormData.totalSpend}
                  onChange={(e) => setEditFormData({ ...editFormData, totalSpend: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                  Due Balance
                </label>
                <input
                  type="text"
                  placeholder="e.g. ₹10,000"
                  value={editFormData.dueBalance}
                  onChange={(e) => setEditFormData({ ...editFormData, dueBalance: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                  Internal Notes
                </label>
                <textarea
                  rows={2}
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5E5E5] dark:border-[#262626]">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={isSubmitting}
                onClick={() => {
                  setEditingClient(null);
                  setEditFormData(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Client Detail Centered Modal */}
      {selectedClient && (
        <Modal
          isOpen={!!selectedClient}
          onClose={() => setSelectedClient(null)}
          title="Client Profile"
          variant="centered"
          size="2xl"
        >
          <div className="space-y-5">
            {/* Header profile card */}
            <div className="flex items-center gap-4 p-3.5 rounded-xl bg-[#F5F5F5] dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#262626]">
              <div className="w-11 h-11 rounded-xl bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] font-bold text-sm flex items-center justify-center shrink-0">
                {selectedClient.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-bold text-[#0A0A0A] dark:text-white truncate">
                    {selectedClient.name}
                  </h3>
                  <Badge variant="outline">{selectedClient.status}</Badge>
                </div>
                <p className="text-xs text-[#737373] dark:text-neutral-400 mt-0.5">
                  {selectedClient.industry}
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 border border-[#E5E5E5] dark:border-[#262626] rounded-xl bg-white dark:bg-[#0E0E0E]">
                <p className="text-[10px] font-semibold uppercase text-[#737373] dark:text-neutral-400">
                  Total Spend
                </p>
                <p className="text-sm font-bold font-mono text-[#0A0A0A] dark:text-white mt-1">
                  {selectedClient.totalSpend}
                </p>
              </div>
              <div className="p-3 border border-[#E5E5E5] dark:border-[#262626] rounded-xl bg-white dark:bg-[#0E0E0E]">
                <p className="text-[10px] font-semibold uppercase text-[#737373] dark:text-neutral-400">
                  Due Balance
                </p>
                <p className={`text-sm font-bold font-mono mt-1 ${
                  selectedClient.dueBalance && selectedClient.dueBalance !== "₹0"
                    ? "text-amber-700 dark:text-amber-400"
                    : "text-[#0A0A0A] dark:text-white"
                }`}>
                  {selectedClient.dueBalance || "₹0"}
                </p>
              </div>
              <div className="p-3 border border-[#E5E5E5] dark:border-[#262626] rounded-xl bg-white dark:bg-[#0E0E0E]">
                <p className="text-[10px] font-semibold uppercase text-[#737373] dark:text-neutral-400">
                  Projects
                </p>
                <p className="text-sm font-bold text-[#0A0A0A] dark:text-white mt-1">
                  {selectedClient.projects} ({selectedClient.activeProjects} active)
                </p>
              </div>
            </div>

            {/* Client's Linked Projects Section */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                  Active & Completed Projects ({selectedClient.projectsList?.length || selectedClient.projects || 0})
                </p>
                <Link
                  href={`/admin/projects`}
                  className="text-[11px] font-semibold text-[#0A0A0A] dark:text-white hover:underline flex items-center gap-1"
                >
                  View All in Projects <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              {selectedClient.projectsList && selectedClient.projectsList.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {selectedClient.projectsList.map((proj) => (
                    <div
                      key={proj.id}
                      className="p-3 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#FAFAFA] dark:bg-[#111111] hover:border-[#0A0A0A] dark:hover:border-white transition-all group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs font-bold text-[#0A0A0A] dark:text-white truncate">
                              {proj.title}
                            </h4>
                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${
                              proj.status === "On Track"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60"
                                : proj.status === "Delayed"
                                ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60"
                                : "bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700"
                            }`}>
                              {proj.status}
                            </span>
                            <span className="text-[10px] text-[#737373] dark:text-neutral-400 font-mono">
                              {proj.category}
                            </span>
                          </div>

                          {/* Progress and Financial stats */}
                          <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] font-mono">
                            <div>
                              <span className="text-[#737373] dark:text-neutral-500 block text-[9px] uppercase">Budget</span>
                              <span className="font-semibold text-[#0A0A0A] dark:text-white">{proj.budget}</span>
                            </div>
                            <div>
                              <span className="text-[#737373] dark:text-neutral-500 block text-[9px] uppercase">Paid</span>
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">₹{proj.paidRaw.toLocaleString("en-IN")}</span>
                            </div>
                            <div>
                              <span className="text-[#737373] dark:text-neutral-500 block text-[9px] uppercase">Remaining Due</span>
                              <span className={`font-semibold ${proj.dueRaw > 0 ? "text-amber-700 dark:text-amber-400" : "text-[#737373] dark:text-neutral-500"}`}>
                                ₹{proj.dueRaw.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-[#E5E5E5] dark:bg-[#262626] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#0A0A0A] dark:bg-white rounded-full"
                                style={{ width: `${proj.progress}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-mono font-medium text-[#737373] dark:text-neutral-400 shrink-0">
                              {proj.progress}%
                            </span>
                          </div>
                        </div>

                        {/* Direct action link to project */}
                        <div className="flex flex-col items-end gap-1.5 shrink-0 pt-0.5">
                          <Link
                            href={`/admin/projects?q=${encodeURIComponent(proj.title)}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-lg bg-white dark:bg-[#1A1A1A] border border-[#E5E5E5] dark:border-[#262626] text-[#0A0A0A] dark:text-white hover:bg-[#0A0A0A] hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                            title="Manage this project"
                          >
                            <span>Open Project</span>
                            <ChevronRight className="w-3 h-3" />
                          </Link>
                          {proj.slug && (
                            <Link
                              href={`/work/${proj.slug}`}
                              target="_blank"
                              className="text-[10px] text-[#737373] dark:text-neutral-400 hover:underline flex items-center gap-0.5"
                            >
                              <span>Public Page</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-[#E5E5E5] dark:border-[#262626] text-center bg-[#FAFAFA] dark:bg-[#111111]">
                  <p className="text-xs text-[#737373] dark:text-neutral-400">
                    No projects found for this client.
                  </p>
                  <Link
                    href={`/admin/projects`}
                    className="inline-block mt-2 text-xs font-semibold text-[#0A0A0A] dark:text-white underline underline-offset-2"
                  >
                    + Create a Project for {selectedClient.name}
                  </Link>
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div className="space-y-2.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                Contact Details
              </p>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-[#FAFAFA] dark:bg-[#111111]">
                  <span className="text-[#737373] dark:text-neutral-400 flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5" /> Contact Person
                  </span>
                  <span className="font-semibold text-[#0A0A0A] dark:text-white">
                    {selectedClient.contactPerson}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-[#FAFAFA] dark:bg-[#111111]">
                  <span className="text-[#737373] dark:text-neutral-400 flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </span>
                  <a
                    href={`mailto:${selectedClient.email}`}
                    className="font-semibold text-[#0A0A0A] dark:text-white hover:underline"
                  >
                    {selectedClient.email}
                  </a>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-[#FAFAFA] dark:bg-[#111111]">
                  <span className="text-[#737373] dark:text-neutral-400 flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5" /> Phone
                  </span>
                  <span className="font-semibold font-mono text-[#0A0A0A] dark:text-white">
                    {selectedClient.phone}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-[#FAFAFA] dark:bg-[#111111]">
                  <span className="text-[#737373] dark:text-neutral-400 flex items-center gap-2">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> WhatsApp
                  </span>
                  <span className="font-semibold font-mono text-[#0A0A0A] dark:text-white">
                    {selectedClient.isWhatsappSame
                      ? `Same as phone (${selectedClient.phone})`
                      : (selectedClient.whatsapp || selectedClient.phone)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-[#FAFAFA] dark:bg-[#111111]">
                  <span className="text-[#737373] dark:text-neutral-400 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" /> Location
                  </span>
                  <span className="font-semibold text-[#0A0A0A] dark:text-white">
                    {selectedClient.location}
                  </span>
                </div>
                {selectedClient.website && (
                  <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-[#FAFAFA] dark:bg-[#111111]">
                    <span className="text-[#737373] dark:text-neutral-400 flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5" /> Website
                    </span>
                    <a
                      href={selectedClient.website}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-[#0A0A0A] dark:text-white hover:underline flex items-center gap-1"
                    >
                      {selectedClient.website.replace("https://", "")}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Internal Notes */}
            {selectedClient.notes && (
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                  Account Notes
                </p>
                <div className="p-3 bg-[#F9F9F9] dark:bg-[#111111] rounded-xl border border-[#E5E5E5] dark:border-[#262626] text-xs text-[#262626] dark:text-neutral-300 leading-relaxed">
                  {selectedClient.notes}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2.5 border-t border-[#E5E5E5] dark:border-[#262626]">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedClient(null)}
              >
                Close
              </Button>
              <a
                href={`mailto:${selectedClient.email}`}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] hover:opacity-90 transition-opacity"
              >
                <Mail className="w-3.5 h-3.5" />
                Contact Client
              </a>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Client Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          if (isSubmitting) return;
          setIsAddModalOpen(false);
        }}
        title="Add New Client"
        variant="centered"
        size="2xl"
      >
        <form onSubmit={handleAddClientSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                Company / Client Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Acme Corporation"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                Contact Person
              </label>
              <input
                type="text"
                placeholder="e.g. John Doe"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="contact@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => {
                  const newPhone = e.target.value;
                  setFormData({
                    ...formData,
                    phone: newPhone,
                    whatsapp: formData.isWhatsappSame ? newPhone : formData.whatsapp,
                  });
                }}
                className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* WhatsApp Number with Checkbox on the right */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400 flex items-center gap-1">
                  <MessageCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  WhatsApp No (Optional)
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isWhatsappSame}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      setFormData({
                        ...formData,
                        isWhatsappSame: isChecked,
                        whatsapp: isChecked ? formData.phone : "",
                      });
                    }}
                    className="w-3.5 h-3.5 rounded border-[#E5E5E5] dark:border-[#262626] text-[#0A0A0A] focus:ring-0 cursor-pointer accent-[#0A0A0A] dark:accent-white"
                  />
                  <span className="text-[11px] font-medium text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white">
                    Same as Mobile
                  </span>
                </label>
              </div>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={formData.whatsapp}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({
                    ...formData,
                    whatsapp: val,
                    isWhatsappSame: val === formData.phone && val !== "",
                  });
                }}
                className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                Industry
              </label>
              <input
                type="text"
                placeholder="e.g. Fintech, SaaS"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                Location
              </label>
              <input
                type="text"
                placeholder="City, Country"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                Initial Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white cursor-pointer"
              >
                <option value="Active" className="dark:bg-[#111111]">Active</option>
                <option value="Prospect" className="dark:bg-[#111111]">Prospect</option>
                <option value="Inactive" className="dark:bg-[#111111]">Inactive</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                Website URL (Optional)
              </label>
              <input
                type="text"
                placeholder="https://company.com"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                Initial Spend
              </label>
              <input
                type="text"
                placeholder="e.g. ₹0"
                value={formData.initialSpend}
                onChange={(e) => setFormData({ ...formData, initialSpend: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                Due Balance
              </label>
              <input
                type="text"
                placeholder="e.g. ₹0"
                value={formData.dueBalance}
                onChange={(e) => setFormData({ ...formData, dueBalance: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                Internal Notes
              </label>
              <textarea
                rows={2}
                placeholder="Add any initial background or requirements..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5E5E5] dark:border-[#262626]">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isSubmitting}
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </span>
              ) : (
                "Save Client"
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
