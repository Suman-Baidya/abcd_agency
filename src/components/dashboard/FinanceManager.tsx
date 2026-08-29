"use client";

import React, { useState, useMemo, useTransition } from "react";
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
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  CreditCard,
  Building2,
  FileText,
  Eye,
  Pencil,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Loader2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
  Wallet,
} from "lucide-react";
import { toast } from "react-hot-toast";
import {
  TransactionItem,
  createTransaction,
  updateTransaction,
  updateTransactionStatus,
  deleteTransaction,
} from "@/app/(dashboard)/admin/finance/actions";

const CATEGORIES = [
  "Project Milestone",
  "Client Retainer",
  "Software & Cloud",
  "Salaries & Contractors",
  "Marketing & Growth",
  "Office & Equipment",
  "Legal & Taxes",
  "Miscellaneous",
];

const PAYMENT_METHODS = [
  "Bank Transfer",
  "UPI",
  "Credit Card",
  "Debit Card",
  "Stripe",
  "PayPal",
  "Cash",
];

export function FinanceManager({
  initialTransactions = [],
}: {
  initialTransactions?: TransactionItem[];
}) {
  const router = useRouter();
  const [transactionList, setTransactionList] = useState<TransactionItem[]>(initialTransactions);
  const [, startTransition] = useTransition();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"date" | "amount" | "title">("date");
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<TransactionItem | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<TransactionItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick Status Change
  const handleQuickStatusChange = (id: string, newStatus: TransactionItem["status"]) => {
    setTransactionList((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
    const item = transactionList.find((t) => t.id === id);

    startTransition(async () => {
      try {
        await updateTransactionStatus(id, newStatus);
        toast.success(`Updated status for "${item?.title || "Transaction"}" to ${newStatus}`);
        router.refresh();
      } catch (err) {
        toast.error("Failed to update status in database");
      }
    });
  };

  // Add Form State
  const [formData, setFormData] = useState({
    title: "",
    type: "Income" as "Income" | "Expense",
    category: "Project Milestone",
    amount: "",
    status: "Completed" as "Completed" | "Pending" | "Cancelled",
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: "Bank Transfer",
    referenceNo: "",
    clientName: "",
    notes: "",
  });

  // Edit Form State
  const [editFormData, setEditFormData] = useState<{
    id: string;
    title: string;
    type: "Income" | "Expense";
    category: string;
    amount: string;
    status: "Completed" | "Pending" | "Cancelled";
    date: string;
    paymentMethod: string;
    referenceNo: string;
    clientName: string;
    notes: string;
  } | null>(null);

  // Statistics
  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;
    let pendingIncome = 0;

    transactionList.forEach((t) => {
      if (t.status === "Cancelled") return;
      if (t.type === "Income") {
        if (t.status === "Completed") income += t.amountRaw || 0;
        if (t.status === "Pending") pendingIncome += t.amountRaw || 0;
      } else if (t.type === "Expense") {
        expense += t.amountRaw || 0;
      }
    });

    const netProfit = income - expense;

    return {
      totalIncome: `₹${income.toLocaleString("en-IN")}`,
      totalExpense: `₹${expense.toLocaleString("en-IN")}`,
      netProfit: `₹${netProfit.toLocaleString("en-IN")}`,
      pendingReceivables: `₹${pendingIncome.toLocaleString("en-IN")}`,
      rawProfit: netProfit,
    };
  }, [transactionList]);

  // Tab counts
  const typeCounts = useMemo(() => {
    return {
      All: transactionList.length,
      Income: transactionList.filter((t) => t.type === "Income").length,
      Expense: transactionList.filter((t) => t.type === "Expense").length,
      Pending: transactionList.filter((t) => t.status === "Pending").length,
    };
  }, [transactionList]);

  // Filtered and Sorted
  const filteredTransactions = useMemo(() => {
    return transactionList
      .filter((t) => {
        const matchesSearch =
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (t.clientName && t.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (t.referenceNo && t.referenceNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
          t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesType = true;
        if (selectedType === "Income") matchesType = t.type === "Income";
        else if (selectedType === "Expense") matchesType = t.type === "Expense";
        else if (selectedType === "Pending") matchesType = t.status === "Pending";

        const matchesCategory =
          selectedCategory === "All" || t.category === selectedCategory;

        return matchesSearch && matchesType && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === "title") return a.title.localeCompare(b.title);
        if (sortBy === "amount") return b.amountRaw - a.amountRaw;
        if (sortBy === "date") return new Date(b.dateRaw).getTime() - new Date(a.dateRaw).getTime();
        return 0;
      });
  }, [transactionList, searchQuery, selectedType, selectedCategory, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / pageSize) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, currentPage, pageSize]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      "Title",
      "Type",
      "Category",
      "Amount",
      "Status",
      "Date",
      "Payment Method",
      "Reference No",
      "Client/Vendor",
      "Notes",
    ];

    const rows = filteredTransactions.map((t) => [
      `"${t.title}"`,
      `"${t.type}"`,
      `"${t.category}"`,
      `"${t.amount}"`,
      `"${t.status}"`,
      `"${t.date}"`,
      `"${t.paymentMethod}"`,
      `"${t.referenceNo || ""}"`,
      `"${t.clientName || ""}"`,
      `"${t.notes || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `finance_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Finance report exported successfully!");
  };

  // Add Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.amount.trim()) {
      toast.error("Please provide transaction title and amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createTransaction({
        title: formData.title,
        type: formData.type,
        category: formData.category,
        amount: formData.amount,
        status: formData.status,
        date: formData.date,
        paymentMethod: formData.paymentMethod,
        referenceNo: formData.referenceNo,
        clientName: formData.clientName,
        notes: formData.notes,
      });

      const formattedAmount = formData.amount.startsWith("₹")
        ? formData.amount
        : `₹${formData.amount}`;
      const rawNumber = parseInt(formData.amount.replace(/[^0-9]/g, "") || "0", 10);

      const newItem: TransactionItem = {
        id: created.id,
        title: created.title,
        type: (created.type as any) || formData.type,
        category: created.category,
        amount: formattedAmount,
        amountRaw: rawNumber,
        status: (created.status as any) || formData.status,
        date: new Date(formData.date).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
        dateRaw: formData.date,
        paymentMethod: created.paymentMethod,
        referenceNo: created.referenceNo || undefined,
        clientName: created.clientName || undefined,
        notes: created.notes || undefined,
      };

      setTransactionList((prev) => [newItem, ...prev.filter((t) => t.id !== newItem.id)]);
      setIsAddModalOpen(false);
      setFormData({
        title: "",
        type: "Income",
        category: "Project Milestone",
        amount: "",
        status: "Completed",
        date: new Date().toISOString().slice(0, 10),
        paymentMethod: "Bank Transfer",
        referenceNo: "",
        clientName: "",
        notes: "",
      });
      toast.success(`Transaction "${newItem.title}" recorded!`);
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "Failed to record transaction.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit
  const handleOpenEdit = (t: TransactionItem) => {
    setEditingTransaction(t);
    setEditFormData({
      id: t.id,
      title: t.title,
      type: t.type,
      category: t.category,
      amount: t.amount,
      status: t.status,
      date: t.dateRaw,
      paymentMethod: t.paymentMethod,
      referenceNo: t.referenceNo || "",
      clientName: t.clientName || "",
      notes: t.notes || "",
    });
  };

  // Edit Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData) return;

    setIsSubmitting(true);
    try {
      await updateTransaction(editFormData.id, {
        title: editFormData.title,
        type: editFormData.type,
        category: editFormData.category,
        amount: editFormData.amount,
        status: editFormData.status,
        date: editFormData.date,
        paymentMethod: editFormData.paymentMethod,
        referenceNo: editFormData.referenceNo,
        clientName: editFormData.clientName,
        notes: editFormData.notes,
      });

      const formattedAmount = editFormData.amount.startsWith("₹")
        ? editFormData.amount
        : `₹${editFormData.amount}`;
      const rawNumber = parseInt(editFormData.amount.replace(/[^0-9]/g, "") || "0", 10);

      setTransactionList((prev) =>
        prev.map((t) =>
          t.id === editFormData.id
            ? {
                ...t,
                title: editFormData.title.trim(),
                type: editFormData.type,
                category: editFormData.category,
                amount: formattedAmount,
                amountRaw: rawNumber,
                status: editFormData.status,
                date: new Date(editFormData.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                }),
                dateRaw: editFormData.date,
                paymentMethod: editFormData.paymentMethod,
                referenceNo: editFormData.referenceNo.trim() || undefined,
                clientName: editFormData.clientName.trim() || undefined,
                notes: editFormData.notes.trim() || undefined,
              }
            : t
        )
      );

      setEditingTransaction(null);
      setEditFormData(null);
      toast.success("Transaction updated!");
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update transaction.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Confirm
  const handleDeleteConfirm = () => {
    if (!deletingTransaction) return;

    const id = deletingTransaction.id;
    const title = deletingTransaction.title;

    setTransactionList((prev) => prev.filter((t) => t.id !== id));
    if (selectedTransaction?.id === id) setSelectedTransaction(null);
    setDeletingTransaction(null);

    startTransition(async () => {
      try {
        await deleteTransaction(id);
        toast.success(`Transaction "${title}" deleted`);
        router.refresh();
      } catch (err) {
        toast.error("Failed to delete transaction");
      }
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">
            Finance &amp; Accounting
          </h1>
          <p className="text-sm text-[#737373] dark:text-neutral-400 mt-1">
            Track agency cash flows, client billings, contractor payouts, and profitability.
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
            Export Report
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Record Transaction
          </Button>
        </div>
      </div>

      {/* KPI Stats Section */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Inflow" value={stats.totalIncome} color="emerald" />
        <StatCard label="Total Outflow" value={stats.totalExpense} />
        <StatCard label="Net Profit" value={stats.netProfit} color={stats.rawProfit >= 0 ? "emerald" : "amber"} />
        <StatCard label="Pending Due" value={stats.pendingReceivables} color="amber" />
      </div>

      {/* Main Transactions Card */}
      <Card className="overflow-hidden !p-0 rounded-xl border border-[#E5E5E5] dark:border-[#262626] shadow-xs bg-white dark:bg-[#0A0A0A]">
        {/* Filter Toolbar */}
        <div className="p-4 sm:p-5 border-b border-[#E5E5E5] dark:border-[#262626] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0A0A0A]">
          {/* Type Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {(["All", "Income", "Expense", "Pending"] as const).map((type) => {
              const isSelected = selectedType === type;
              const count = typeCounts[type];
              return (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedType(type);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? "bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] shadow-xs"
                      : "text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]"
                  }`}
                >
                  <span>{type}</span>
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

          {/* Search, Category & Sort Controls */}
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
              <input
                type="text"
                placeholder="Search transactions, ref, client..."
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

            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs border border-[#E5E5E5] dark:border-[#262626] bg-transparent rounded-lg px-3 py-2 font-medium text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white cursor-pointer"
            >
              <option value="All" className="dark:bg-[#111111]">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="dark:bg-[#111111]">{cat}</option>
              ))}
            </select>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs border border-[#E5E5E5] dark:border-[#262626] bg-transparent rounded-lg px-3 py-2 font-medium text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white cursor-pointer"
            >
              <option value="date" className="dark:bg-[#111111]">Sort: Date (Newest)</option>
              <option value="amount" className="dark:bg-[#111111]">Sort: Amount (High to Low)</option>
              <option value="title" className="dark:bg-[#111111]">Sort: Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#262626] dark:text-neutral-300">
            <thead className="text-[11px] font-semibold uppercase tracking-wider text-[#525252] dark:text-[#A3A3A3] bg-[#F9F9F9] dark:bg-[#0E0E0E] border-b border-[#E5E5E5] dark:border-[#262626]">
              <tr>
                <th className="px-5 py-3.5 w-12 text-center">SL</th>
                <th className="px-5 py-3.5 min-w-[280px]">Transaction &amp; Details</th>
                <th className="px-5 py-3.5 min-w-[130px] text-center">Status</th>
                <th className="px-5 py-3.5 min-w-[140px]">Category</th>
                <th className="px-5 py-3.5 min-w-[130px]">Method</th>
                <th className="px-5 py-3.5 min-w-[120px]">Date</th>
                <th className="px-5 py-3.5 min-w-[130px] text-right">Amount</th>
                <th className="px-5 py-3.5 text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#262626] bg-white dark:bg-[#0A0A0A]">
              {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((t, index) => {
                  const sl = (currentPage - 1) * pageSize + index + 1;
                  const isIncome = t.type === "Income";

                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-[#F9F9F9] dark:hover:bg-[#141414] transition-colors group"
                    >
                      {/* SL */}
                      <td className="px-5 py-4 text-center text-xs font-mono font-medium text-[#737373] dark:text-neutral-500">
                        {sl < 10 ? `0${sl}` : sl}
                      </td>

                      {/* Transaction info */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3.5">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 shadow-xs ${
                              isIncome
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40"
                                : "bg-[#F5F5F5] text-[#262626] dark:bg-[#1A1A1A] dark:text-neutral-300 border border-[#E5E5E5] dark:border-[#262626]"
                            }`}
                          >
                            {isIncome ? (
                              <ArrowDownLeft className="w-4 h-4" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-[#0A0A0A] dark:text-white truncate">
                              {t.title}
                            </p>
                            <p className="text-xs text-[#737373] dark:text-neutral-400 truncate mt-0.5 flex items-center gap-1.5">
                              {t.clientName && <span>{t.clientName}</span>}
                              {t.clientName && t.referenceNo && (
                                <span className="text-[#A3A3A3] dark:text-neutral-600">•</span>
                              )}
                              {t.referenceNo && (
                                <span className="font-mono text-[11px] bg-[#F5F5F5] dark:bg-[#1A1A1A] px-1.5 py-0.2 rounded-md">
                                  {t.referenceNo}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Quick Status */}
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        <select
                          value={t.status}
                          onChange={(e) => handleQuickStatusChange(t.id, e.target.value as any)}
                          className={`text-xs border rounded-lg px-2.5 py-1 font-medium outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white cursor-pointer transition-colors ${
                            t.status === "Completed"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50"
                              : t.status === "Pending"
                              ? "bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50"
                              : "bg-[#F5F5F5] text-[#737373] border-[#E5E5E5] dark:bg-[#1A1A1A] dark:text-neutral-400 dark:border-[#262626]"
                          }`}
                        >
                          <option value="Completed" className="dark:bg-[#111111] text-[#0A0A0A] dark:text-white">Completed</option>
                          <option value="Pending" className="dark:bg-[#111111] text-[#0A0A0A] dark:text-white">Pending</option>
                          <option value="Cancelled" className="dark:bg-[#111111] text-[#0A0A0A] dark:text-white">Cancelled</option>
                        </select>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-[#737373] dark:text-neutral-400 font-medium">
                        {t.category}
                      </td>

                      {/* Payment Method */}
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-[#737373] dark:text-neutral-400">
                        {t.paymentMethod}
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 whitespace-nowrap text-xs text-[#737373] dark:text-neutral-400">
                        {t.date}
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <span
                          className={`font-mono font-bold text-xs ${
                            isIncome
                              ? "text-emerald-700 dark:text-emerald-400"
                              : "text-[#0A0A0A] dark:text-white"
                          }`}
                        >
                          {isIncome ? `+${t.amount}` : `-${t.amount}`}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedTransaction(t)}
                            className="p-1.5 border border-[#E5E5E5] dark:border-[#262626] rounded-lg text-[#737373] hover:text-[#0A0A0A] dark:text-neutral-400 dark:hover:text-white hover:border-[#0A0A0A] dark:hover:border-white transition-colors cursor-pointer"
                            title="View Transaction"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(t)}
                            className="p-1.5 border border-[#E5E5E5] dark:border-[#262626] rounded-lg text-[#737373] hover:text-[#0A0A0A] dark:text-neutral-400 dark:hover:text-white hover:border-[#0A0A0A] dark:hover:border-white transition-colors cursor-pointer"
                            title="Edit Transaction"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingTransaction(t)}
                            className="p-1.5 border border-[#E5E5E5] dark:border-[#262626] rounded-lg text-[#737373] hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-800 transition-colors cursor-pointer"
                            title="Delete Transaction"
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
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="max-w-xs mx-auto text-center space-y-2">
                      <p className="text-sm font-semibold text-[#0A0A0A] dark:text-white">
                        No transactions found
                      </p>
                      <p className="text-xs text-[#737373] dark:text-neutral-400">
                        Try changing your filters or record a new transaction.
                      </p>
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedType("All");
                          setSelectedCategory("All");
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

        {/* Pagination & Controls */}
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
              Showing {filteredTransactions.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
              {Math.min(currentPage * pageSize, filteredTransactions.length)} of {filteredTransactions.length} transactions
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
      {deletingTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#0A0A0A]/50 backdrop-blur-sm transition-opacity"
            onClick={() => setDeletingTransaction(null)}
          />
          <div className="relative w-full max-w-md rounded-xl bg-white dark:bg-[#111111] p-6 shadow-2xl border border-[#E5E5E5] dark:border-[#262626] animate-in zoom-in-95 fade-in duration-200">
            <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mb-4">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold tracking-tight text-[#0A0A0A] dark:text-white mb-2">
              Delete Transaction
            </h3>
            <p className="text-xs text-[#737373] dark:text-neutral-400 mb-6 leading-relaxed">
              Are you sure you want to delete <strong className="text-[#0A0A0A] dark:text-white">{deletingTransaction.title}</strong>? This action will remove the record from financial reports.
            </p>
            <div className="flex items-center justify-end gap-2.5">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDeletingTransaction(null)}
              >
                Cancel
              </Button>
              <button
                onClick={handleDeleteConfirm}
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 active:bg-red-800 transition-colors shadow-xs cursor-pointer"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          if (isSubmitting) return;
          setIsAddModalOpen(false);
        }}
        title="Record Transaction"
        variant="centered"
        size="2xl"
      >
        <form onSubmit={handleAddSubmit} className="space-y-3">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#F5F5F5] dark:bg-[#141414] rounded-lg border border-[#E5E5E5] dark:border-[#262626]">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "Income" })}
              className={`py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                formData.type === "Income"
                  ? "bg-white text-emerald-700 dark:bg-[#262626] dark:text-emerald-400 shadow-xs"
                  : "text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white"
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              Income / Inflow
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "Expense" })}
              className={`py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                formData.type === "Expense"
                  ? "bg-white text-[#0A0A0A] dark:bg-[#262626] dark:text-white shadow-xs"
                  : "text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white"
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              Expense / Outflow
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                Transaction Title *
              </label>
              <input
                type="text"
                required
                placeholder={formData.type === "Income" ? "e.g. Acme Corp Retainer" : "e.g. Server Hosting & Cloud"}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                {formData.type === "Income" ? "Client / Payer" : "Vendor / Payee"}
              </label>
              <input
                type="text"
                placeholder={formData.type === "Income" ? "e.g. Acme Corp" : "e.g. Vercel Inc."}
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                Amount * (₹)
              </label>
              <input
                type="text"
                required
                placeholder="e.g. ₹50,000"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="dark:bg-[#111111]">{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                Payment Method
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white cursor-pointer"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m} className="dark:bg-[#111111]">{m}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white cursor-pointer"
              >
                <option value="Completed" className="dark:bg-[#111111]">Completed</option>
                <option value="Pending" className="dark:bg-[#111111]">Pending</option>
                <option value="Cancelled" className="dark:bg-[#111111]">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                Transaction Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                Reference / Invoice No
              </label>
              <input
                type="text"
                placeholder="e.g. INV-2026-101 / UPI-8941"
                value={formData.referenceNo}
                onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
              Notes &amp; Description
            </label>
            <textarea
              rows={2}
              placeholder="Add accounting details, bank reference, or project milestone notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white resize-none"
            />
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
                  Recording...
                </span>
              ) : (
                "Save Transaction"
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Transaction Modal */}
      {editingTransaction && editFormData && (
        <Modal
          isOpen={!!editingTransaction}
          onClose={() => {
            if (isSubmitting) return;
            setEditingTransaction(null);
            setEditFormData(null);
          }}
          title="Edit Transaction"
          variant="centered"
          size="2xl"
        >
          <form onSubmit={handleEditSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#F5F5F5] dark:bg-[#141414] rounded-lg border border-[#E5E5E5] dark:border-[#262626]">
              <button
                type="button"
                onClick={() => setEditFormData({ ...editFormData, type: "Income" })}
                className={`py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  editFormData.type === "Income"
                    ? "bg-white text-emerald-700 dark:bg-[#262626] dark:text-emerald-400 shadow-xs"
                    : "text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white"
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                Income / Inflow
              </button>
              <button
                type="button"
                onClick={() => setEditFormData({ ...editFormData, type: "Expense" })}
                className={`py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  editFormData.type === "Expense"
                    ? "bg-white text-[#0A0A0A] dark:bg-[#262626] dark:text-white shadow-xs"
                    : "text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white"
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                Expense / Outflow
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                  Transaction Title *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                  {editFormData.type === "Income" ? "Client / Payer" : "Vendor / Payee"}
                </label>
                <input
                  type="text"
                  value={editFormData.clientName}
                  onChange={(e) => setEditFormData({ ...editFormData, clientName: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                  Amount * (₹)
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.amount}
                  onChange={(e) => setEditFormData({ ...editFormData, amount: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                  Category
                </label>
                <select
                  value={editFormData.category}
                  onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="dark:bg-[#111111]">{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                  Payment Method
                </label>
                <select
                  value={editFormData.paymentMethod}
                  onChange={(e) => setEditFormData({ ...editFormData, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white cursor-pointer"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m} className="dark:bg-[#111111]">{m}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                  Status
                </label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white cursor-pointer"
                >
                  <option value="Completed" className="dark:bg-[#111111]">Completed</option>
                  <option value="Pending" className="dark:bg-[#111111]">Pending</option>
                  <option value="Cancelled" className="dark:bg-[#111111]">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                  Transaction Date
                </label>
                <input
                  type="date"
                  value={editFormData.date}
                  onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                  Reference / Invoice No
                </label>
                <input
                  type="text"
                  value={editFormData.referenceNo}
                  onChange={(e) => setEditFormData({ ...editFormData, referenceNo: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                Notes &amp; Description
              </label>
              <textarea
                rows={2}
                value={editFormData.notes}
                onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E5E5E5] dark:border-[#262626]">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={isSubmitting}
                onClick={() => {
                  setEditingTransaction(null);
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

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <Modal
          isOpen={!!selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          title="Transaction Receipt"
          variant="centered"
          size="2xl"
        >
          <div className="space-y-5">
            {/* Header Summary Card */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#F5F5F5] dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#262626]">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                  {selectedTransaction.type === "Income" ? "Payment Received" : "Expense Disbursed"}
                </span>
                <h3 className="text-2xl font-bold font-mono text-[#0A0A0A] dark:text-white mt-0.5">
                  {selectedTransaction.amount}
                </h3>
              </div>
              <div className="text-right">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    selectedTransaction.status === "Completed"
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40"
                      : selectedTransaction.status === "Pending"
                      ? "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40"
                      : "bg-[#F5F5F5] text-[#737373] border-[#E5E5E5] dark:bg-[#1A1A1A] dark:text-neutral-400 dark:border-[#262626]"
                  }`}
                >
                  {selectedTransaction.status}
                </span>
                <p className="text-xs text-[#737373] dark:text-neutral-400 mt-1">
                  {selectedTransaction.date}
                </p>
              </div>
            </div>

            {/* Transaction Key Details */}
            <div className="space-y-2.5">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                Accounting Information
              </p>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-[#FAFAFA] dark:bg-[#111111]">
                  <span className="text-[#737373] dark:text-neutral-400 flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5" /> Title
                  </span>
                  <span className="font-semibold text-[#0A0A0A] dark:text-white">
                    {selectedTransaction.title}
                  </span>
                </div>
                {selectedTransaction.clientName && (
                  <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-[#FAFAFA] dark:bg-[#111111]">
                    <span className="text-[#737373] dark:text-neutral-400 flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5" /> {selectedTransaction.type === "Income" ? "Client" : "Vendor"}
                    </span>
                    <span className="font-semibold text-[#0A0A0A] dark:text-white">
                      {selectedTransaction.clientName}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-[#FAFAFA] dark:bg-[#111111]">
                  <span className="text-[#737373] dark:text-neutral-400 flex items-center gap-2">
                    <Receipt className="w-3.5 h-3.5" /> Category
                  </span>
                  <span className="font-semibold text-[#0A0A0A] dark:text-white">
                    {selectedTransaction.category}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-[#FAFAFA] dark:bg-[#111111]">
                  <span className="text-[#737373] dark:text-neutral-400 flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5" /> Payment Method
                  </span>
                  <span className="font-semibold text-[#0A0A0A] dark:text-white">
                    {selectedTransaction.paymentMethod}
                  </span>
                </div>
                {selectedTransaction.referenceNo && (
                  <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-[#FAFAFA] dark:bg-[#111111]">
                    <span className="text-[#737373] dark:text-neutral-400 flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5" /> Reference / Invoice No
                    </span>
                    <span className="font-semibold font-mono text-[#0A0A0A] dark:text-white">
                      {selectedTransaction.referenceNo}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {selectedTransaction.notes && (
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                  Transaction Notes
                </p>
                <div className="p-3 bg-[#F9F9F9] dark:bg-[#111111] rounded-xl border border-[#E5E5E5] dark:border-[#262626] text-xs text-[#262626] dark:text-neutral-300 leading-relaxed">
                  {selectedTransaction.notes}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2.5 border-t border-[#E5E5E5] dark:border-[#262626]">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedTransaction(null)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const t = selectedTransaction;
                  setSelectedTransaction(null);
                  handleOpenEdit(t);
                }}
              >
                Edit Transaction
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
