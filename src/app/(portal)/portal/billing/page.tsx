"use client";

import React, { useState, useEffect, useMemo } from "react";
import { getPortalData } from "../actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/dashboard/StatCard";
import { TablePagination } from "@/components/ui/TablePagination";
import { Receipt, Download, CreditCard, CheckCircle2, Clock, Search, ArrowUpDown, IndianRupee, X } from "lucide-react";
import Link from "next/link";

export default function PortalBillingPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Table state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusTab, setSelectedStatusTab] = useState("all");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "amount-desc" | "amount-asc">("date-desc");
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
  const transactions: any[] = useMemo(() => client?.transactions || [], [client]);

  // Stat metrics
  const totalTransactionsCount = transactions.length;
  const completedTxs = transactions.filter((t) => t.status === "Completed");
  const pendingTxs = transactions.filter((t) => t.status === "Pending" || t.status === "Processing");

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // Status Tab Filter
    if (selectedStatusTab !== "all") {
      result = result.filter((t) => {
        if (selectedStatusTab === "completed") return t.status === "Completed";
        if (selectedStatusTab === "pending") return t.status === "Pending" || t.status === "Processing";
        return true;
      });
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title?.toLowerCase().includes(q) ||
          t.paymentMethod?.toLowerCase().includes(q) ||
          t.referenceNo?.toLowerCase().includes(q) ||
          t.amount?.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "date-desc") {
        return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
      }
      if (sortBy === "date-asc") {
        return new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime();
      }
      if (sortBy === "amount-desc") {
        const numA = parseInt((a.amount || "").replace(/[^0-9]/g, "") || "0", 10);
        const numB = parseInt((b.amount || "").replace(/[^0-9]/g, "") || "0", 10);
        return numB - numA;
      }
      if (sortBy === "amount-asc") {
        const numA = parseInt((a.amount || "").replace(/[^0-9]/g, "") || "0", 10);
        const numB = parseInt((b.amount || "").replace(/[^0-9]/g, "") || "0", 10);
        return numA - numB;
      }
      return 0;
    });

    return result;
  }, [transactions, selectedStatusTab, searchQuery, sortBy]);

  // Paginated slice
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#737373] dark:text-neutral-400">Loading financial ledger & receipts...</p>
      </div>
    );
  }

  if (isProspect) {
    return (
      <div className="space-y-6 animate-in fade-in">
        <div className="border-b border-[#E5E5E5] dark:border-[#262626] pb-6">
          <h1 className="text-2xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">Billing & Invoices</h1>
          <p className="text-xs text-[#737373] mt-1">
            Financial statements and GST invoices are activated once your official project agreement is signed.
          </p>
        </div>

        <Card className="p-8 text-center space-y-4 max-w-lg mx-auto border border-[#E5E5E5] dark:border-[#262626]">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
            <Receipt className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#0A0A0A] dark:text-white">No Invoices Issued Yet</h3>
          <p className="text-xs text-[#737373]">
            Once you approve a proposal and milestone schedule, all invoices and payment confirmations will appear here.
          </p>
          <Link
            href="/portal/inquiries"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] text-xs font-bold rounded-lg hover:opacity-90 transition-opacity"
          >
            Start Project Consultation
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
            Invoices & Financial Ledger
          </h1>
          <p className="text-sm text-[#737373] dark:text-neutral-400 mt-1">
            Review completed milestone payments, outstanding balances, and official GST tax receipts.
          </p>
        </div>

        <Button id="billing-support-btn" variant="secondary" size="sm" href="mailto:billing@abcdagency.com">
          Billing Support
        </Button>
      </div>

      {/* StatCards Financial KPI Row */}
      <div id="billing-kpi-stats" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Invoiced" value={client?.totalSpend || "₹0"} color="default" />
        <StatCard label="Payments Completed" value={client?.totalSpend || "₹0"} color="emerald" />
        <StatCard label="Outstanding Balance" value={client?.dueBalance || "₹0"} color={client?.dueBalance && client?.dueBalance !== "₹0" ? "amber" : "default"} />
        <StatCard label="Total Invoices" value={totalTransactionsCount} color="default" />
      </div>

      {/* Transactions Table Card */}
      <Card id="billing-table-card" className="overflow-hidden !p-0 rounded-xl border border-[#E5E5E5] dark:border-[#262626] shadow-xs bg-white dark:bg-[#0A0A0A]">
        {/* Table Controls Toolbar */}
        <div className="p-4 sm:p-5 border-b border-[#E5E5E5] dark:border-[#262626] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0A0A0A]">
          {/* Status Tab Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: "all", label: "All", count: totalTransactionsCount },
              { id: "completed", label: "Completed", count: completedTxs.length },
              { id: "pending", label: "Pending", count: pendingTxs.length },
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
                placeholder="Search invoice or ref no..."
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
                <option value="amount-desc" className="dark:bg-[#111111]">Sort: Highest Amount</option>
                <option value="amount-asc" className="dark:bg-[#111111]">Sort: Lowest Amount</option>
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
                <th className="px-5 py-3.5 min-w-[240px]">Transaction & Description</th>
                <th className="px-5 py-3.5 min-w-[120px]">Date</th>
                <th className="px-5 py-3.5 min-w-[160px]">Payment Method</th>
                <th className="px-5 py-3.5 min-w-[120px]">Amount</th>
                <th className="px-5 py-3.5 text-center min-w-[110px]">Status</th>
                <th className="px-5 py-3.5 text-right w-28">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#262626] bg-white dark:bg-[#0A0A0A]">
              {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((tx, index) => {
                  const sl = (currentPage - 1) * pageSize + index + 1;
                  return (
                    <tr key={tx.id} className="hover:bg-[#F9F9F9] dark:hover:bg-[#141414] transition-colors group">
                      {/* SL */}
                      <td className="px-5 py-4 text-center text-xs font-mono font-medium text-[#737373] dark:text-neutral-500">
                        {sl < 10 ? `0${sl}` : sl}
                      </td>

                      <td className="px-5 py-4 font-bold text-[#0A0A0A] dark:text-white">
                        {tx.title}
                      </td>

                      <td className="px-5 py-4 text-[#737373] dark:text-neutral-400 whitespace-nowrap text-xs">
                        {new Date(tx.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-5 py-4 text-[#737373] dark:text-neutral-400 whitespace-nowrap text-xs">
                        {tx.paymentMethod || "Bank Transfer"} {tx.referenceNo ? `(${tx.referenceNo})` : ""}
                      </td>

                      <td className="px-5 py-4 font-bold text-[#0A0A0A] dark:text-white whitespace-nowrap">
                        {tx.amount}
                      </td>

                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-md border ${
                          tx.status === "Completed"
                            ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900"
                            : "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900"
                        }`}>
                          {tx.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <a
                          href={tx.invoiceUrl || "#"}
                          target={tx.invoiceUrl ? "_blank" : undefined}
                          download={tx.invoiceUrl ? `${tx.title}-receipt.pdf` : undefined}
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold border border-[#E5E5E5] dark:border-[#262626] rounded-md hover:bg-[#F5F5F5] dark:hover:bg-[#202020] text-[#0A0A0A] dark:text-white transition-colors cursor-pointer"
                          title="Download Tax Receipt"
                        >
                          <Download className="w-3 h-3" />
                          <span>PDF</span>
                        </a>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#737373] dark:text-neutral-400">
                    No financial statements matching your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Automatic Pagination Footer */}
        <TablePagination
          currentPage={currentPage}
          totalItems={filteredTransactions.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="invoices"
        />
      </Card>
    </div>
  );
}
