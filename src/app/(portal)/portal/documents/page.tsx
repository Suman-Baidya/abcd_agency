"use client";

import React, { useState, useEffect, useMemo } from "react";
import { getPortalData } from "../actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/dashboard/StatCard";
import { TablePagination } from "@/components/ui/TablePagination";
import { FileText, Download, FileCode, FileSpreadsheet, Shield, UploadCloud, Search, ArrowUpDown, Lock, X } from "lucide-react";
import Link from "next/link";

export default function PortalDocumentsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Table state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeTab, setSelectedTypeTab] = useState("all");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "name-asc">("date-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    getPortalData().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  const client = data?.client;
  const isProspect = data?.user?.role === "USER";

  const rawDocuments: any[] = useMemo(() => {
    if (client?.documents?.length) return client.documents;
    return [
      {
        id: "doc-1",
        title: "Master Services Agreement (MSA) & Non-Disclosure Agreement",
        fileType: "PDF",
        size: "1.4 MB",
        uploadedBy: "Agency Legal Team",
        createdAt: new Date("2026-08-01"),
      },
      {
        id: "doc-2",
        title: "Enterprise Full-Stack Architecture & API Specifications",
        fileType: "PDF",
        size: "3.2 MB",
        uploadedBy: "Engineering Lead",
        createdAt: new Date("2026-08-10"),
      },
      {
        id: "doc-3",
        title: "Complete Figma UI/UX Design System & Asset Bundle",
        fileType: "Archive",
        size: "18.5 MB",
        uploadedBy: "Product Design Team",
        createdAt: new Date("2026-08-15"),
      },
      {
        id: "doc-4",
        title: "Security & Database Compliance Verification Report",
        fileType: "PDF",
        size: "820 KB",
        uploadedBy: "DevOps Team",
        createdAt: new Date("2026-08-20"),
      },
    ];
  }, [client]);

  // Stat metrics
  const totalDocsCount = rawDocuments.length;
  const pdfDocsCount = rawDocuments.filter((d) => d.fileType === "PDF").length;
  const archiveDocsCount = rawDocuments.filter((d) => d.fileType === "Archive" || d.fileType === "ZIP").length;
  const otherDocsCount = totalDocsCount - pdfDocsCount - archiveDocsCount;

  // Filter & Sort
  const filteredDocuments = useMemo(() => {
    let result = [...rawDocuments];

    if (selectedTypeTab !== "all") {
      result = result.filter((d) => {
        if (selectedTypeTab === "pdf") return d.fileType === "PDF";
        if (selectedTypeTab === "archive") return d.fileType === "Archive" || d.fileType === "ZIP";
        return true;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.title?.toLowerCase().includes(q) ||
          d.uploadedBy?.toLowerCase().includes(q) ||
          d.fileType?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === "date-desc") {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (sortBy === "date-asc") {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      if (sortBy === "name-asc") {
        return (a.title || "").localeCompare(b.title || "");
      }
      return 0;
    });

    return result;
  }, [rawDocuments, selectedTypeTab, searchQuery, sortBy]);

  const paginatedDocuments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDocuments.slice(start, start + pageSize);
  }, [filteredDocuments, currentPage, pageSize]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#737373] dark:text-neutral-400">Loading document vault & signed contracts...</p>
      </div>
    );
  }

  if (isProspect) {
    return (
      <div className="space-y-6 animate-in fade-in">
        <div className="border-b border-[#E5E5E5] dark:border-[#262626] pb-6">
          <h1 className="text-2xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">Files & Document Vault</h1>
          <p className="text-xs text-[#737373] mt-1">
            Official project documents, contracts, and design systems are unlocked for Active Clients.
          </p>
        </div>

        <Card className="p-8 text-center space-y-4 max-w-lg mx-auto border border-[#E5E5E5] dark:border-[#262626]">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#0A0A0A] dark:text-white">Document Vault Locked</h3>
          <p className="text-xs text-[#737373]">
            Once you sign an agreement and begin a project sprint, all shared technical specs, NDAs, and production deliverables will be accessible here.
          </p>
          <Link
            href="/portal/inquiries"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] text-xs font-bold rounded-lg hover:opacity-90 transition-opacity"
          >
            Submit Project Inquiry
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
            Files & Shared Documents
          </h1>
          <p className="text-sm text-[#737373] dark:text-neutral-400 mt-1">
            Access your signed contracts, architecture blueprints, sprint releases, and design packages.
          </p>
        </div>

        <Button variant="secondary" size="sm" href="mailto:support@abcdagency.com">
          Request File Access
        </Button>
      </div>

      {/* StatCards KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Documents" value={totalDocsCount} color="default" />
        <StatCard label="PDF Specifications" value={pdfDocsCount} color="emerald" />
        <StatCard label="Design & Source Archives" value={archiveDocsCount} color="amber" />
        <StatCard label="Vault Security" value="Encrypted" color="default" />
      </div>

      {/* Documents Table Card */}
      <Card className="overflow-hidden !p-0 rounded-xl border border-[#E5E5E5] dark:border-[#262626] shadow-xs bg-white dark:bg-[#0A0A0A]">
        {/* Table Controls Toolbar */}
        <div className="p-4 sm:p-5 border-b border-[#E5E5E5] dark:border-[#262626] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0A0A0A]">
          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: "all", label: "All", count: totalDocsCount },
              { id: "pdf", label: "PDF Documents", count: pdfDocsCount },
              { id: "archive", label: "Source Archives", count: archiveDocsCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedTypeTab(tab.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                  selectedTypeTab === tab.id
                    ? "bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] shadow-xs"
                    : "text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 text-[10px] rounded-md font-mono ${
                  selectedTypeTab === tab.id
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
                placeholder="Search file name or author..."
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
                <option value="name-asc" className="dark:bg-[#111111]">Sort: Name</option>
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
                <th className="px-5 py-3.5 min-w-[260px]">Document & Specification</th>
                <th className="px-5 py-3.5 text-center min-w-[100px]">Type</th>
                <th className="px-5 py-3.5 min-w-[100px]">Size</th>
                <th className="px-5 py-3.5 min-w-[130px]">Author</th>
                <th className="px-5 py-3.5 min-w-[120px]">Date Uploaded</th>
                <th className="px-5 py-3.5 text-right w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#262626] bg-white dark:bg-[#0A0A0A]">
              {paginatedDocuments.length > 0 ? (
                paginatedDocuments.map((doc, index) => {
                  const sl = (currentPage - 1) * pageSize + index + 1;
                  return (
                    <tr key={doc.id} className="hover:bg-[#F9F9F9] dark:hover:bg-[#141414] transition-colors group">
                      {/* SL */}
                      <td className="px-5 py-4 text-center text-xs font-mono font-medium text-[#737373] dark:text-neutral-500">
                        {sl < 10 ? `0${sl}` : sl}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] dark:bg-[#1A1A1A] border border-[#E5E5E5] dark:border-[#333333] flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
                          </div>
                          <span className="font-bold text-[#0A0A0A] dark:text-white">
                            {doc.title}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-[#F5F5F5] dark:bg-[#222222] text-[#0A0A0A] dark:text-white border border-[#E5E5E5] dark:border-[#333333]">
                          {doc.fileType}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-[#737373] dark:text-neutral-400 whitespace-nowrap font-mono text-xs">
                        {doc.size}
                      </td>

                      <td className="px-5 py-4 text-[#737373] dark:text-neutral-400 whitespace-nowrap">
                        {doc.uploadedBy}
                      </td>

                      <td className="px-5 py-4 text-[#737373] dark:text-neutral-400 whitespace-nowrap">
                        {new Date(doc.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <a
                          href={doc.fileUrl || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold border border-[#E5E5E5] dark:border-[#262626] rounded-md hover:bg-[#F5F5F5] dark:hover:bg-[#202020] text-[#0A0A0A] dark:text-white transition-colors cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          Download
                        </a>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#737373] dark:text-neutral-400">
                    No documents found matching your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Automatic Pagination Footer */}
        <TablePagination
          currentPage={currentPage}
          totalItems={filteredDocuments.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="documents"
        />
      </Card>
    </div>
  );
}
