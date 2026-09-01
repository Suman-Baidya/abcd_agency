"use client";

import React, { useState, useEffect, useMemo } from "react";
import { submitPortalInquiry, getPortalData } from "../actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/dashboard/StatCard";
import { TablePagination } from "@/components/ui/TablePagination";
import { 
  Send, 
  CheckCircle2, 
  MessageCircle, 
  Mail, 
  Phone, 
  Clock, 
  Plus, 
  Search, 
  ArrowUpDown, 
  ExternalLink,
  Eye,
  Calendar,
  Sparkles,
  FileText,
  ShieldCheck,
  Building2,
  Check,
  X
} from "lucide-react";
import toast from "react-hot-toast";

// Synchronized with public contact form options
const AVAILABLE_SERVICES = [
  "Website Development",
  "Web Application Development",
  "UI/UX Design",
  "Meta Ads",
  "Google Ads",
  "SEO",
  "AI Automation",
  "WhatsApp Automation",
  "Custom Software",
  "Other",
];

const BUSINESS_TYPES = [
  "Startup",
  "Small Business",
  "Educational Institute",
  "Enterprise / Organization",
  "Other",
];

const ENGAGEMENT_TYPES = [
  "Custom Web & Software Dev",
  "UI/UX & Product Design",
  "Performance Marketing",
  "Business Automation & AI",
  "Other / Custom",
];

const BUDGET_OPTIONS = [
  "< ₹5,000 — Sprint / MVP",
  "₹5,000 – ₹15,000 — Core Platform",
  "₹15,000 – ₹30,000 — Scale & AI",
  "₹30,000+ — Enterprise",
  "Monthly Retainer (₹35,000/mo)",
];

const SUPPORT_CONTACTS = {
  phone: "+918944899747",
  phoneDisplay: "+91 89448 99747",
  whatsapp: "918167685731",
  whatsappDisplay: "+91 81676 85731",
  email: "sb.abcd321@gmail.com",
};

export default function PortalInquiriesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([AVAILABLE_SERVICES[0]]);

  // Table state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusTab, setSelectedStatusTab] = useState("all");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc">("date-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    businessType: "Startup",
    projectType: "Custom Web & Software Dev",
    budget: "₹5,000 – ₹15,000 — Core Platform",
    message: "",
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

  const toggleService = (service: string) => {
    setSelectedServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServices.length === 0) {
      toast.error("Please select at least one service.");
      return;
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      toast.error("Please describe your project requirements (at least 10 characters).");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitPortalInquiry({
        businessType: formData.businessType,
        services: selectedServices,
        projectType: formData.projectType,
        budget: formData.budget,
        message: formData.message,
      });

      toast.success("Project brief submitted successfully! Assigned high priority.");
      setShowInquiryModal(false);
      setFormData({
        businessType: "Startup",
        projectType: "Custom Web & Software Dev",
        budget: "₹5,000 – ₹15,000 — Core Platform",
        message: "",
      });
      setSelectedServices([AVAILABLE_SERVICES[0]]);
      loadData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit inquiry.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const user = data?.user;
  const inquiriesList: any[] = useMemo(() => {
    if (data?.userInquiries && data.userInquiries.length > 0) {
      return data.userInquiries;
    }
    return [
      {
        id: "inq-1",
        businessType: user?.industry || "Startup",
        projectType: "Custom Web & Software Dev",
        services: ["Website Development", "Web Application Development"],
        budget: "₹15,000 – ₹30,000 — Scale & AI",
        status: user?.role === "USER" ? "New" : "Replied",
        createdAt: user?.createdAt || new Date(),
        message: "Initial technical project brief registered during account verification.",
      },
    ];
  }, [data, user]);

  // Stat metrics
  const totalInquiriesCount = inquiriesList.length;
  const underReviewCount = inquiriesList.filter((i) => i.status === "New" || i.status === "In Progress").length;
  const scopedCount = inquiriesList.filter((i) => i.status === "Replied" || i.status === "Closed" || i.status === "Scoped & Converted").length;

  const filteredInquiries = useMemo(() => {
    let result = [...inquiriesList];

    if (selectedStatusTab !== "all") {
      result = result.filter((i) => {
        if (selectedStatusTab === "review") return i.status === "New" || i.status === "In Progress";
        if (selectedStatusTab === "scoped") return i.status === "Replied" || i.status === "Closed" || i.status === "Scoped & Converted";
        return true;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.projectType?.toLowerCase().includes(q) ||
          i.businessType?.toLowerCase().includes(q) ||
          i.message?.toLowerCase().includes(q) ||
          i.services?.some((s: string) => s.toLowerCase().includes(q))
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
  }, [inquiriesList, selectedStatusTab, searchQuery, sortBy]);

  const paginatedInquiries = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredInquiries.slice(start, start + pageSize);
  }, [filteredInquiries, currentPage, pageSize]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">
            Project Inquiries & Briefs
          </h1>
          <p className="text-sm text-[#737373] dark:text-neutral-400 mt-1">
            Submit new project specifications, track architectural review status, and speak with solutions leads.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowInquiryModal(true)}
            className="text-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Submit New Brief
          </Button>
        </div>
      </div>

      {/* StatCards KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Inquiries" value={totalInquiriesCount} color="default" />
        <StatCard label="Under Review" value={underReviewCount} color="amber" />
        <StatCard label="Scoped & Replied" value={scopedCount} color="emerald" />
        <StatCard label="Response within" value="< 24 hours" color="emerald" />
      </div>

      {/* Inquiries Table Card */}
      <Card className="overflow-hidden !p-0 rounded-xl border border-[#E5E5E5] dark:border-[#262626] shadow-xs bg-white dark:bg-[#0A0A0A]">
        {/* Table Controls Toolbar */}
        <div className="p-4 sm:p-5 border-b border-[#E5E5E5] dark:border-[#262626] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0A0A0A]">
          {/* Status Tab Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: "all", label: "All", count: totalInquiriesCount },
              { id: "review", label: "Under Review", count: underReviewCount },
              { id: "scoped", label: "Scoped", count: scopedCount },
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

          {/* Search, Sort & Instant Channels */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search inquiries..."
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

            {/* Sort Dropdown */}
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

            {/* Quick Action Options: Call, WhatsApp, Mail */}
            <div className="flex items-center gap-1.5 pl-1 border-l border-[#E5E5E5] dark:border-[#262626] shrink-0">
              <a
                href={`tel:${SUPPORT_CONTACTS.phone}`}
                title={`Call ${SUPPORT_CONTACTS.phoneDisplay}`}
                className="p-1.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1F1F1F] transition-colors inline-flex items-center gap-1 text-xs font-semibold"
              >
                <Phone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              </a>

              <a
                href={`https://wa.me/${SUPPORT_CONTACTS.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                title="Chat on WhatsApp"
                className="p-1.5 rounded-lg border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:opacity-90 transition-opacity inline-flex items-center gap-1 text-xs font-semibold"
              >
                <MessageCircle className="w-3.5 h-3.5" />
              </a>

              <a
                href={`mailto:${SUPPORT_CONTACTS.email}`}
                title={`Email ${SUPPORT_CONTACTS.email}`}
                className="p-1.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1F1F1F] transition-colors inline-flex items-center gap-1 text-xs font-semibold"
              >
                <Mail className="w-3.5 h-3.5 text-[#737373]" />
              </a>
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#262626] dark:text-neutral-300">
            <thead className="text-[11px] font-semibold uppercase tracking-wider text-[#525252] dark:text-[#A3A3A3] bg-[#F9F9F9] dark:bg-[#0E0E0E] border-b border-[#E5E5E5] dark:border-[#262626]">
              <tr>
                <th className="px-5 py-3.5 w-12 text-center">SL</th>
                <th className="px-5 py-3.5 min-w-[240px]">Project Scope & Brief</th>
                <th className="px-5 py-3.5 min-w-[120px]">Industry</th>
                <th className="px-5 py-3.5 min-w-[130px]">Budget</th>
                <th className="px-5 py-3.5 min-w-[120px]">Date</th>
                <th className="px-5 py-3.5 text-center min-w-[120px]">Status</th>
                <th className="px-5 py-3.5 text-right w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#262626] bg-white dark:bg-[#0A0A0A]">
              {paginatedInquiries.length > 0 ? (
                paginatedInquiries.map((inq, index) => {
                  const sl = (currentPage - 1) * pageSize + index + 1;
                  return (
                    <tr key={inq.id} className="hover:bg-[#F9F9F9] dark:hover:bg-[#141414] transition-colors group">
                      {/* SL */}
                      <td className="px-5 py-4 text-center text-xs font-mono font-medium text-[#737373] dark:text-neutral-500">
                        {sl < 10 ? `0${sl}` : sl}
                      </td>

                      {/* Scope */}
                      <td className="px-5 py-4 max-w-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] dark:bg-[#1C1C1C] border border-[#E5E5E5] dark:border-[#333333] flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-[#0A0A0A] dark:text-white truncate block">
                              {inq.projectType}
                            </h4>
                            <p className="text-[11px] text-[#737373] dark:text-neutral-400 truncate block mt-0.5">
                              {inq.message}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Industry */}
                      <td className="px-5 py-4 text-[#737373] dark:text-neutral-300 whitespace-nowrap font-medium text-xs">
                        {inq.businessType}
                      </td>

                      {/* Budget */}
                      <td className="px-5 py-4 font-semibold text-[#0A0A0A] dark:text-white whitespace-nowrap text-xs">
                        {inq.budget}
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-[#737373] dark:text-neutral-400 whitespace-nowrap text-xs">
                        {new Date(inq.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        })}
                      </td>

                      {/* Status Pill */}
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-md border ${
                          inq.status === "Replied" || inq.status === "Closed" || inq.status === "Scoped & Converted"
                            ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900"
                            : "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900"
                        }`}>
                          {inq.status === "New" ? "Under Review" : inq.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedInquiry(inq)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold border border-[#E5E5E5] dark:border-[#262626] rounded-md hover:bg-[#F5F5F5] dark:hover:bg-[#202020] text-[#0A0A0A] dark:text-white transition-colors cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          View Brief
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#737373] dark:text-neutral-400">
                    No project briefs found matching your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Automatic Pagination Footer */}
        <TablePagination
          currentPage={currentPage}
          totalItems={filteredInquiries.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="inquiries"
        />
      </Card>

      {/* Submit Inquiry Modal */}
      {showInquiryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#262626] rounded-2xl max-w-2xl w-full p-5 sm:p-6 space-y-4 shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] dark:border-[#262626] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#0A0A0A] dark:text-white">Submit Project Specification</h3>
                <p className="text-[11px] text-[#737373]">Prioritized review by solutions architects for verified accounts.</p>
              </div>
              <button
                onClick={() => setShowInquiryModal(false)}
                className="p-1.5 text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white rounded-full hover:bg-[#F5F5F5] dark:hover:bg-[#202020] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Row 1: Business Type, Engagement Type, and Budget (3 Columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#0A0A0A] dark:text-white mb-1">
                    Business Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.businessType}
                    onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                    className="w-full h-9 px-2.5 text-xs rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white cursor-pointer"
                  >
                    {BUSINESS_TYPES.map((bt) => (
                      <option key={bt} value={bt}>
                        {bt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#0A0A0A] dark:text-white mb-1">
                    Engagement Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.projectType}
                    onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                    className="w-full h-9 px-2.5 text-xs rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white cursor-pointer"
                  >
                    {ENGAGEMENT_TYPES.map((et) => (
                      <option key={et} value={et}>
                        {et}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#0A0A0A] dark:text-white mb-1">
                    Estimated Budget <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full h-9 px-2.5 text-xs rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white cursor-pointer"
                  >
                    {BUDGET_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Services Interested In (Compact Checkbox Grid) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-[#0A0A0A] dark:text-white">
                    Services Interested In <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-[#737373]">Select one or multiple</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {AVAILABLE_SERVICES.map((srv) => {
                    const isSelected = selectedServices.includes(srv);
                    return (
                      <button
                        key={srv}
                        type="button"
                        onClick={() => toggleService(srv)}
                        className={`py-1.5 px-2.5 text-left rounded-lg text-xs border transition-all cursor-pointer flex items-center gap-2 ${
                          isSelected
                            ? "border-[#0A0A0A] dark:border-white bg-[#F9F9F9] dark:bg-[#1A1A1A] text-[#0A0A0A] dark:text-white font-semibold"
                            : "border-[#E5E5E5] dark:border-[#262626] text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white bg-white dark:bg-[#0A0A0A]"
                        }`}
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                            isSelected
                              ? "bg-[#0A0A0A] border-[#0A0A0A] dark:bg-white dark:border-white text-white dark:text-[#0A0A0A]"
                              : "border-[#D4D4D4] dark:border-[#444444] bg-transparent"
                          }`}
                        >
                          {isSelected && (
                            <svg className="w-2.5 h-2.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          )}
                        </div>
                        <span className="truncate flex-1 text-[11px]">{srv}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 3: Project Description */}
              <div>
                <label className="block font-semibold text-[#0A0A0A] dark:text-white mb-1">
                  Project Goals & Technical Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your technical requirements, key user flows, target launch deadline, or existing tech stack..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E5E5] dark:border-[#262626]">
                <Button type="button" variant="secondary" size="sm" onClick={() => setShowInquiryModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting Brief..." : "Submit Project Brief"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inquiry View Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#262626] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-xl animate-in zoom-in-95 duration-200 overflow-x-hidden">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] dark:border-[#262626] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#0A0A0A] dark:text-white">Inquiry Specification Details</h3>
                <p className="text-[11px] text-[#737373]">Brief ID: {selectedInquiry.id}</p>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="p-1 text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white rounded-full cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#0A0A0A] dark:text-white">{selectedInquiry.projectType}</span>
                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                  {selectedInquiry.status === "New" ? "Under Review" : selectedInquiry.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#F9F9F9] dark:bg-[#161616] rounded-xl border border-[#E5E5E5] dark:border-[#262626]">
                  <span className="text-[#737373] block text-[11px]">Business Type</span>
                  <span className="font-bold text-[#0A0A0A] dark:text-white mt-0.5 block">{selectedInquiry.businessType}</span>
                </div>
                <div className="p-3 bg-[#F9F9F9] dark:bg-[#161616] rounded-xl border border-[#E5E5E5] dark:border-[#262626]">
                  <span className="text-[#737373] block text-[11px]">Budget Target</span>
                  <span className="font-bold text-[#0A0A0A] dark:text-white mt-0.5 block">{selectedInquiry.budget}</span>
                </div>
              </div>

              {selectedInquiry.services && selectedInquiry.services.length > 0 && (
                <div>
                  <span className="text-[#737373] block text-[11px] mb-1.5 font-semibold">Required Services:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedInquiry.services.map((srv: string) => (
                      <span key={srv} className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-[#F5F5F5] dark:bg-[#1C1C1C] text-[#0A0A0A] dark:text-white border border-[#E5E5E5] dark:border-[#333333]">
                        {srv}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3.5 bg-[#F9F9F9] dark:bg-[#161616] rounded-xl border border-[#E5E5E5] dark:border-[#262626] space-y-1.5">
                <span className="text-[#737373] block text-[11px] font-semibold">Requirements & Technical Scope:</span>
                <p className="text-[#0A0A0A] dark:text-neutral-200 leading-relaxed whitespace-pre-wrap">
                  {selectedInquiry.message}
                </p>
              </div>

              {/* Direct Reach Options */}
              <div className="pt-2">
                <p className="text-[11px] font-semibold text-[#737373] mb-2">Speak directly with our Lead Architect regarding this brief:</p>
                <div className="grid grid-cols-3 gap-2">
                  <a
                    href={`tel:${SUPPORT_CONTACTS.phone}`}
                    className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-[#E5E5E5] dark:border-[#262626] hover:bg-[#F5F5F5] dark:hover:bg-[#1F1F1F] font-semibold text-[#0A0A0A] dark:text-white transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    <span>Call Now</span>
                  </a>
                  <a
                    href={`https://wa.me/${SUPPORT_CONTACTS.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 font-semibold hover:opacity-90 transition-opacity"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                  <a
                    href={`mailto:${SUPPORT_CONTACTS.email}`}
                    className="flex items-center justify-center gap-1.5 p-2 rounded-lg border border-[#E5E5E5] dark:border-[#262626] hover:bg-[#F5F5F5] dark:hover:bg-[#1F1F1F] font-semibold text-[#0A0A0A] dark:text-white transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#737373]" />
                    <span>Send Email</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#E5E5E5] dark:border-[#262626]">
              <Button variant="secondary" size="sm" onClick={() => setSelectedInquiry(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
