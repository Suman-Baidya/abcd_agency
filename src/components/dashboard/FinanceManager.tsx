"use client";

import React, { useState, useMemo, useTransition, useEffect } from "react";
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
  ChevronsUpDown,
  AlertTriangle,
  Loader2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
  Wallet,
  Tag,
  Check,
  FileDown,
  Printer,
} from "lucide-react";
import jsPDF from "jspdf";
import { toast } from "react-hot-toast";
import {
  TransactionItem,
  createTransaction,
  updateTransaction,
  updateTransactionStatus,
  deleteTransaction,
} from "@/app/(dashboard)/admin/finance/actions";

const DEFAULT_CATEGORIES = [
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

export interface FinanceClientItem {
  id: string;
  name: string;
  email?: string;
  projects?: Array<{
    id: string;
    title: string;
    budget: string;
    budgetRaw: number;
    paidRaw: number;
  }>;
}

export function FinanceManager({
  initialTransactions = [],
  clients = [],
}: {
  initialTransactions?: TransactionItem[];
  clients?: FinanceClientItem[];
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
  const [previewReceiptTx, setPreviewReceiptTx] = useState<TransactionItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic Categories state
  const [categories, setCategories] = useState<string[]>(() => {
    const fromTx = initialTransactions.map((t) => t.category).filter(Boolean);
    return Array.from(new Set([...DEFAULT_CATEGORIES, ...fromTx]));
  });
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryManagerInput, setNewCategoryManagerInput] = useState("");

  // Inline Category creation state for Add modal
  const [isCreatingCategoryAdd, setIsCreatingCategoryAdd] = useState(false);
  const [newCategoryInputAdd, setNewCategoryInputAdd] = useState("");

  // Inline Category creation state for Edit modal
  const [isCreatingCategoryEdit, setIsCreatingCategoryEdit] = useState(false);
  const [newCategoryInputEdit, setNewCategoryInputEdit] = useState("");

  // Load custom saved categories from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("abcd_finance_categories");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCategories((prev) => Array.from(new Set([...prev, ...parsed])));
        }
      }
    } catch {
      // ignore localStorage errors
    }
  }, []);

  const handleAddCategory = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return null;
    setCategories((prev) => {
      if (prev.includes(trimmed)) return prev;
      const updated = [...prev, trimmed];
      try {
        localStorage.setItem("abcd_finance_categories", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    return trimmed;
  };

  const [editingCategoryName, setEditingCategoryName] = useState<string | null>(null);
  const [editCategoryInput, setEditCategoryInput] = useState("");

  const handleEditCategory = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) {
      setEditingCategoryName(null);
      return;
    }

    setCategories((prev) => {
      const updated = prev.map((c) => (c === oldName ? trimmed : c));
      try {
        localStorage.setItem("abcd_finance_categories", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    // Update in-memory transactions that used the old category name
    setTransactionList((prev) =>
      prev.map((t) => (t.category === oldName ? { ...t, category: trimmed } : t))
    );

    if (formData.category === oldName) {
      setFormData((prev) => ({ ...prev, category: trimmed }));
    }

    if (editFormData && editFormData.category === oldName) {
      setEditFormData((prev) => (prev ? { ...prev, category: trimmed } : prev));
    }

    if (selectedCategory === oldName) {
      setSelectedCategory(trimmed);
    }

    setEditingCategoryName(null);
    setEditCategoryInput("");
    toast.success(`Category renamed to "${trimmed}"`);
  };

  const handleDeleteCategory = (catToDelete: string) => {
    setCategories((prev) => {
      const updated = prev.filter((c) => c !== catToDelete);
      try {
        localStorage.setItem("abcd_finance_categories", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    toast.success(`Category "${catToDelete}" removed`);
  };

  // Helper to fetch local image and convert to Base64 for jsPDF embedding
  const getBase64ImageFromUrl = async (imageUrl: string): Promise<string | null> => {
    try {
      const res = await fetch(imageUrl);
      if (!res.ok) return null;
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  };

  // Helper to format clean ASCII amount for PDF to avoid UTF-8 font corruption and page overflow
  const formatPdfAmount = (raw: string | number) => {
    if (!raw) return "0.00";
    const str = String(raw).replace(/[₹\u20B9]/g, "").trim();
    return `INR ${str}`;
  };

  // State for PDF download progress
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Direct A4 Vector PDF Generation with Official Logo & Pristine Monochrome Aesthetics
  const handleDownloadDirectPDF = async (t: TransactionItem) => {
    setIsDownloadingPdf(true);
    const toastId = toast.loading("Generating PDF receipt...");
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const receiptNo = t.referenceNo || `REC-${t.id.slice(-6).toUpperCase()}`;
      const cleanAmount = formatPdfAmount(t.amount);

      // --- Header Brand & Logo (Exact 1.945 aspect ratio without stretching) ---
      const logoBase64 = await getBase64ImageFromUrl("/images/Black_Logo.png");
      if (logoBase64) {
        try {
          doc.addImage(logoBase64, "PNG", 20, 14, 36, 18.5);
        } catch {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(20);
          doc.setTextColor(10, 10, 10);
          doc.text("ABCD AGENCY", 20, 24);
        }
      } else {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(20);
        doc.setTextColor(10, 10, 10);
        doc.text("ABCD AGENCY", 20, 24);
      }

      // Real Agency Contact Info from siteConfig
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 100, 100);
      doc.text("sb.abcd321@gmail.com  •  +91 89448 99747", 20, 36.5);
      doc.text("Tripura, India  •  abcdagency.com", 20, 41);

      // --- Receipt Badge Top Right ---
      doc.setFillColor(10, 10, 10);
      doc.roundedRect(138, 14, 52, 7, 1.2, 1.2, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("PAYMENT RECEIPT", 164, 18.8, { align: "center" });

      // Receipt Meta Lines
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(115, 115, 115);
      doc.text("Receipt No:", 138, 27.5);
      doc.setFont("courier", "bold");
      doc.setFontSize(8);
      doc.setTextColor(10, 10, 10);
      doc.text(receiptNo, 190, 27.5, { align: "right" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(115, 115, 115);
      doc.text("Date:", 138, 33.5);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(10, 10, 10);
      doc.text(t.date, 190, 33.5, { align: "right" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(115, 115, 115);
      doc.text("Status:", 138, 39.5);

      if (t.status === "Completed") {
        doc.setFillColor(236, 253, 245);
        doc.setDrawColor(167, 243, 208);
        doc.setLineWidth(0.2);
        doc.roundedRect(165, 36, 25, 4.8, 1, 1, "FD");
        doc.setTextColor(6, 95, 70);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.text("COMPLETED", 177.5, 39.5, { align: "center" });
      } else {
        doc.setFillColor(255, 251, 235);
        doc.setDrawColor(253, 230, 138);
        doc.setLineWidth(0.2);
        doc.roundedRect(165, 36, 25, 4.8, 1, 1, "FD");
        doc.setTextColor(146, 64, 14);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7);
        doc.text(t.status.toUpperCase(), 177.5, 39.5, { align: "center" });
      }

      // --- Header Separator Line ---
      doc.setDrawColor(10, 10, 10);
      doc.setLineWidth(0.5);
      doc.line(20, 46, 190, 46);

      // --- Party & Summary Cards ---
      // Left Card: Received From / Paid To
      doc.setFillColor(250, 250, 250);
      doc.setDrawColor(229, 229, 229);
      doc.setLineWidth(0.3);
      doc.roundedRect(20, 52, 82, 24, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(115, 115, 115);
      doc.text(t.type === "Income" ? "RECEIVED FROM (CLIENT)" : "PAID TO (PAYEE / VENDOR)", 24, 58.5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(10, 10, 10);
      doc.text(t.clientName || "Valued Client", 24, 65.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(82, 82, 82);
      doc.text(t.referenceNo ? `Ref / Invoice ID: ${t.referenceNo}` : "Direct Agency Transaction", 24, 71.5);

      // Right Card: Transaction Summary (Explicit fill color)
      doc.setFillColor(250, 250, 250);
      doc.setDrawColor(229, 229, 229);
      doc.setLineWidth(0.3);
      doc.roundedRect(108, 52, 82, 24, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(115, 115, 115);
      doc.text("TRANSACTION SUMMARY", 112, 58.5);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(10, 10, 10);
      doc.text(`${t.type}  •  ${t.paymentMethod}`, 112, 65.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(82, 82, 82);
      doc.text(`Category: ${t.category}`, 112, 71.5);

      // --- Itemized Table ---
      const tableTopY = 82;
      doc.setFillColor(245, 245, 245);
      doc.setDrawColor(229, 229, 229);
      doc.setLineWidth(0.3);
      doc.rect(20, tableTopY, 170, 8, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(82, 82, 82);
      doc.text("SL", 24, tableTopY + 5.5);
      doc.text("ITEM / DESCRIPTION", 36, tableTopY + 5.5);
      doc.text("CATEGORY", 112, tableTopY + 5.5);
      doc.text("METHOD", 142, tableTopY + 5.5);
      doc.text("AMOUNT", 188, tableTopY + 5.5, { align: "right" });

      // Table Row
      const rowY = tableTopY + 8;
      doc.setFont("courier", "normal");
      doc.setFontSize(8);
      doc.setTextColor(115, 115, 115);
      doc.text("01", 24, rowY + 7);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(10, 10, 10);
      const splitTitle = doc.splitTextToSize(t.title, 70);
      doc.text(splitTitle, 36, rowY + 6);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(115, 115, 115);
      doc.text(t.clientName ? `Party: ${t.clientName}` : "Standard Agency Account", 36, rowY + 11);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(82, 82, 82);
      doc.text(t.category, 112, rowY + 7);
      doc.text(t.paymentMethod, 142, rowY + 7);

      doc.setFont("courier", "bold");
      doc.setFontSize(8.5);
      doc.setTextColor(10, 10, 10);
      doc.text(cleanAmount, 188, rowY + 7, { align: "right" });

      doc.setDrawColor(229, 229, 229);
      doc.setLineWidth(0.3);
      doc.line(20, rowY + 16, 190, rowY + 16);

      // --- Summary Section (Safe within page boundaries) ---
      const summaryY = rowY + 22;
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(229, 229, 229);
      doc.setLineWidth(0.3);
      doc.roundedRect(120, summaryY, 70, 26, 1.5, 1.5, "FD");

      // Subtotal
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(82, 82, 82);
      doc.text("Subtotal", 124, summaryY + 5.5);
      doc.setFont("courier", "normal");
      doc.setFontSize(8);
      doc.setTextColor(10, 10, 10);
      doc.text(cleanAmount, 186, summaryY + 5.5, { align: "right" });
      doc.setDrawColor(229, 229, 229);
      doc.line(120, summaryY + 8.5, 190, summaryY + 8.5);

      // Tax
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(82, 82, 82);
      doc.text("Tax / Fee", 124, summaryY + 13.5);
      doc.setFont("courier", "normal");
      doc.setFontSize(8);
      doc.setTextColor(10, 10, 10);
      doc.text("INR 0.00", 186, summaryY + 13.5, { align: "right" });
      doc.line(120, summaryY + 16.5, 190, summaryY + 16.5);

      // Net Total Dark Bar
      doc.setFillColor(10, 10, 10);
      doc.rect(120, summaryY + 16.5, 70, 9.5, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text(`Net Total (${t.type})`, 124, summaryY + 23);
      doc.setFont("courier", "bold");
      doc.setFontSize(9);
      doc.text(cleanAmount, 186, summaryY + 23, { align: "right" });

      // --- Notes Section ---
      const notesY = summaryY + 34;
      doc.setFillColor(250, 250, 250);
      doc.setDrawColor(229, 229, 229);
      doc.rect(20, notesY, 170, 18, "FD");
      doc.setFillColor(10, 10, 10);
      doc.rect(20, notesY, 2.5, 18, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.setTextColor(10, 10, 10);
      doc.text(t.notes ? "TRANSACTION NOTES" : "RECEIPT NOTICE", 26, notesY + 5.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(82, 82, 82);
      const noteContent = t.notes || "This is a computer-generated official payment receipt. No physical signature is mandatory for digital transaction validation.";
      const splitNotes = doc.splitTextToSize(noteContent, 158);
      doc.text(splitNotes, 26, notesY + 11);

      // --- Footer Section (No sign box, clean official footer) ---
      const footerY = 262;
      doc.setDrawColor(229, 229, 229);
      doc.setLineDashPattern([1.5, 1.5], 0);
      doc.line(20, footerY - 4, 190, footerY - 4);
      doc.setLineDashPattern([], 0);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(115, 115, 115);
      doc.text("Official electronic payment receipt generated by ABCD Agency Finance Management System.", 20, footerY + 2);
      doc.text(`Support: sb.abcd321@gmail.com  •  Phone: +91 89448 99747  •  Website: abcdagency.com  •  Record ID: ${t.id}`, 20, footerY + 6.5);

      const filename = `Receipt_${receiptNo.replace(/[^a-zA-Z0-9-_]/g, "_")}.pdf`;
      doc.save(filename);

      toast.success(`Downloaded ${filename}`, { id: toastId });
    } catch (err: any) {
      console.error("PDF export error:", err);
      toast.error("Failed to generate PDF download", { id: toastId });
    } finally {
      setIsDownloadingPdf(false);
    }
  };

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
    clientId: "",
    projectId: "",
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
    clientId?: string;
    projectId?: string;
    notes: string;
  } | null>(null);

  // Smart Client Combobox states for Add & Edit modals
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [addClientSearch, setAddClientSearch] = useState("");
  const addClientDropdownRef = React.useRef<HTMLDivElement>(null);

  const [isEditClientOpen, setIsEditClientOpen] = useState(false);
  const [editClientSearch, setEditClientSearch] = useState("");
  const editClientDropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (addClientDropdownRef.current && !addClientDropdownRef.current.contains(event.target as Node)) {
        setIsAddClientOpen(false);
      }
      if (editClientDropdownRef.current && !editClientDropdownRef.current.contains(event.target as Node)) {
        setIsEditClientOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter clients by search query
  const filteredAddClients = useMemo(() => {
    if (!addClientSearch.trim()) return clients;
    const q = addClientSearch.toLowerCase();
    return clients.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.email && c.email.toLowerCase().includes(q))
    );
  }, [clients, addClientSearch]);

  const filteredEditClients = useMemo(() => {
    if (!editClientSearch.trim()) return clients;
    const q = editClientSearch.toLowerCase();
    return clients.filter(
      (c) => c.name.toLowerCase().includes(q) || (c.email && c.email.toLowerCase().includes(q))
    );
  }, [clients, editClientSearch]);

  // Smart Select Client for Add Modal
  const handleSelectAddClient = (client: FinanceClientItem) => {
    const clientProjects = client.projects || [];
    let autoProjectId = "";
    let autoTitle = formData.title;
    let autoAmount = formData.amount;

    if (clientProjects.length === 1) {
      const p = clientProjects[0];
      autoProjectId = p.id;
      const due = Math.max(0, p.budgetRaw - p.paidRaw);
      if (!autoTitle || autoTitle.includes("Milestone") || autoTitle.includes("Payment")) {
        autoTitle = `${p.title} - Payment`;
      }
      if (!autoAmount || autoAmount === "₹0") {
        autoAmount = due > 0 ? `₹${due.toLocaleString("en-IN")}` : `₹${p.budgetRaw.toLocaleString("en-IN")}`;
      }
    } else if (clientProjects.length > 1) {
      // If only one project has due > 0, auto-prioritize it
      const dueProjects = clientProjects.filter((p) => (p.budgetRaw - p.paidRaw) > 0);
      if (dueProjects.length === 1) {
        const p = dueProjects[0];
        autoProjectId = p.id;
        const due = p.budgetRaw - p.paidRaw;
        if (!autoTitle) autoTitle = `${p.title} - Payment`;
        if (!autoAmount || autoAmount === "₹0") autoAmount = `₹${due.toLocaleString("en-IN")}`;
      }
    }

    setFormData((prev) => ({
      ...prev,
      clientId: client.id,
      clientName: client.name,
      projectId: autoProjectId,
      title: autoTitle || (client.name ? `${client.name} - Payment` : prev.title),
      amount: autoAmount || prev.amount,
    }));
    setIsAddClientOpen(false);
    setAddClientSearch("");
  };

  // Smart Select Project for Add Modal
  const handleSelectAddProject = (pId: string) => {
    const currentClient = clients.find((c) => c.id === formData.clientId);
    const matchedProj = currentClient?.projects?.find((p) => p.id === pId);

    if (matchedProj) {
      const due = Math.max(0, matchedProj.budgetRaw - matchedProj.paidRaw);
      setFormData((prev) => ({
        ...prev,
        projectId: pId,
        title: (!prev.title || currentClient?.projects?.some((p) => prev.title.includes(p.title)))
          ? `${matchedProj.title} - Payment`
          : prev.title,
        amount: (!prev.amount || prev.amount === "₹0" || currentClient?.projects?.some(p => prev.amount === `₹${(p.budgetRaw - p.paidRaw).toLocaleString("en-IN")}`)) && due > 0
          ? `₹${due.toLocaleString("en-IN")}`
          : prev.amount,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        projectId: "",
      }));
    }
  };

  // Smart Select Client for Edit Modal
  const handleSelectEditClient = (client: FinanceClientItem) => {
    if (!editFormData) return;
    const clientProjects = client.projects || [];
    let autoProjectId = "";

    if (clientProjects.length === 1) {
      autoProjectId = clientProjects[0].id;
    } else if (clientProjects.length > 1) {
      const dueProjects = clientProjects.filter((p) => (p.budgetRaw - p.paidRaw) > 0);
      if (dueProjects.length === 1) {
        autoProjectId = dueProjects[0].id;
      }
    }

    setEditFormData({
      ...editFormData,
      clientId: client.id,
      clientName: client.name,
      projectId: autoProjectId,
    });
    setIsEditClientOpen(false);
    setEditClientSearch("");
  };

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
        clientId: formData.clientId || undefined,
        projectId: formData.projectId || undefined,
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
        clientId: created.clientId || undefined,
        projectId: created.projectId || undefined,
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
        clientId: "",
        projectId: "",
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
      clientId: t.clientId || "",
      projectId: t.projectId || "",
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
        clientId: editFormData.clientId || undefined,
        projectId: editFormData.projectId || undefined,
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
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Tag className="w-4 h-4" />
            Categories
          </Button>
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
            id="admin-finance-create-btn"
            variant="primary"
            size="sm"
            onClick={() => {
              setIsCreatingCategoryAdd(false);
              setNewCategoryInputAdd("");
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Record
          </Button>
        </div>
      </div>

      {/* KPI Stats Section */}
      <div id="admin-finance-kpi" className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Inflow" value={stats.totalIncome} color="emerald" />
        <StatCard label="Total Outflow" value={stats.totalExpense} />
        <StatCard label="Net Profit" value={stats.netProfit} color={stats.rawProfit >= 0 ? "emerald" : "amber"} />
        <StatCard label="Pending Due" value={stats.pendingReceivables} color="amber" />
      </div>

      {/* Main Transactions Card */}
      <Card id="admin-finance-table" className="overflow-hidden !p-0 rounded-xl border border-[#E5E5E5] dark:border-[#262626] shadow-xs bg-white dark:bg-[#0A0A0A]">
        {/* Filter Toolbar */}
        <div className="p-4 sm:p-5 border-b border-[#E5E5E5] dark:border-[#262626] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0A0A0A]">
          {/* Type Filter Tabs */}
          <div id="admin-finance-tabs" className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
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
          <div id="admin-finance-search" className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
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
              {categories.map((cat) => (
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
                <th className="px-5 py-3.5 min-w-[200px] max-w-[280px]">Transaction &amp; Details</th>
                <th className="px-3.5 py-3.5 min-w-[120px] text-left">Status</th>
                <th className="px-5 py-3.5 min-w-[140px]">Category</th>
                <th className="px-5 py-3.5 min-w-[140px]">Date &amp; Method</th>
                <th className="px-5 py-3.5 min-w-[130px] text-right">Amount</th>
                <th className="px-5 py-3.5 text-right min-w-[140px]">Actions</th>
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
                      <td className="px-5 py-4 min-w-[200px] max-w-[280px]">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 shadow-xs ${
                              isIncome
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40"
                                : "bg-[#F5F5F5] text-[#262626] dark:bg-[#1A1A1A] dark:text-neutral-300 border border-[#E5E5E5] dark:border-[#262626]"
                            }`}
                          >
                            {isIncome ? (
                              <ArrowDownLeft className="w-4 h-4 shrink-0" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4 shrink-0" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p
                              className="text-sm font-bold text-[#0A0A0A] dark:text-white truncate block"
                              title={t.title}
                            >
                              {t.title}
                            </p>
                            <p
                              className="text-xs text-[#737373] dark:text-neutral-400 truncate mt-0.5 flex items-center gap-1.5"
                              title={t.clientName || ""}
                            >
                              {t.clientName && <span className="truncate">{t.clientName}</span>}
                              {t.clientName && t.referenceNo && (
                                <span className="text-[#A3A3A3] dark:text-neutral-600 shrink-0">•</span>
                              )}
                              {t.referenceNo && (
                                <span className="font-mono text-[11px] bg-[#F5F5F5] dark:bg-[#1A1A1A] px-1.5 py-0.2 rounded-md shrink-0">
                                  {t.referenceNo}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Quick Status */}
                      <td className="px-3.5 py-4 whitespace-nowrap text-left">
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

                      {/* Date & Method */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-[#0A0A0A] dark:text-white">
                            {t.date}
                          </span>
                          <span className="text-[11px] text-[#737373] dark:text-neutral-400 mt-0.5">
                            {t.paymentMethod}
                          </span>
                        </div>
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
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setPreviewReceiptTx(t)}
                            className="p-1.5 border border-[#E5E5E5] dark:border-[#262626] rounded-lg text-[#737373] hover:text-[#0A0A0A] dark:text-neutral-400 dark:hover:text-white hover:border-[#0A0A0A] dark:hover:border-white transition-colors cursor-pointer"
                            title="Download Receipt Copy (A4 PDF)"
                          >
                            <FileDown className="w-3.5 h-3.5" />
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
                  <td colSpan={7} className="px-6 py-12 text-center">
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
          setIsCreatingCategoryAdd(false);
          setNewCategoryInputAdd("");
        }}
        title="New Record"
        variant="centered"
        size="2xl"
        className="h-[600px] max-h-[85vh]"
        headerActions={
          <div className="flex items-center p-1 bg-white dark:bg-[#141414] rounded-lg border border-[#0A0A0A] dark:border-white/30 shadow-xs">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "Income" })}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                formData.type === "Income"
                  ? "bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] shadow-xs"
                  : "text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white"
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Income / Inflow</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "Expense" })}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                formData.type === "Expense"
                  ? "bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] shadow-xs"
                  : "text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white"
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Expense / Outflow</span>
            </button>
          </div>
        }
      >
        <form onSubmit={handleAddSubmit} className="flex flex-col min-h-0">
          <div className="space-y-3.5 pb-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                  Transaction Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder={formData.type === "Income" ? "e.g. Acme Corp Milestone 1" : "e.g. Server Hosting & Cloud"}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                />
              </div>

            {/* Smart Searchable Client Combobox for Add */}
            <div className="space-y-1 relative" ref={addClientDropdownRef}>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400 flex items-center justify-between">
                <span>{formData.type === "Income" ? "Client / Account *" : "Vendor / Payee *"}</span>
                {formData.type === "Income" && clients.length > 0 && (
                  <span className="text-[10px] text-[#737373] dark:text-neutral-500">Searchable account</span>
                )}
              </label>

              {formData.type === "Income" && clients.length > 0 ? (
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddClientOpen(!isAddClientOpen);
                      setAddClientSearch("");
                    }}
                    className="w-full text-left flex items-center justify-between px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white hover:border-[#0A0A0A] dark:hover:border-white transition-colors cursor-pointer"
                  >
                    {formData.clientName ? (
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-5 h-5 rounded-full bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] flex items-center justify-center text-[9px] font-bold shrink-0">
                          {formData.clientName.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-semibold truncate">{formData.clientName}</span>
                      </div>
                    ) : (
                      <span className="text-[#737373] dark:text-neutral-500">
                        -- Select Client Account --
                      </span>
                    )}
                    <ChevronsUpDown className="w-3.5 h-3.5 text-[#737373] shrink-0 ml-1.5 opacity-70" />
                  </button>

                  {/* Dropdown Menu */}
                  {isAddClientOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#262626] rounded-lg shadow-xl p-2 space-y-2 animate-in fade-in duration-100">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#737373]" />
                        <input
                          type="text"
                          placeholder="Search client by name or email..."
                          value={addClientSearch}
                          onChange={(e) => setAddClientSearch(e.target.value)}
                          autoFocus
                          className="w-full pl-8 pr-7 py-1.5 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-[#F9F9F9] dark:bg-[#1A1A1A] text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                        />
                        {addClientSearch && (
                          <button
                            type="button"
                            onClick={() => setAddClientSearch("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <div className="max-h-48 overflow-y-auto space-y-0.5 pr-0.5">
                        {filteredAddClients.length > 0 ? (
                          filteredAddClients.map((c) => {
                            const isSelected = formData.clientId === c.id || formData.clientName.toLowerCase() === c.name.toLowerCase();
                            const dueCount = c.projects?.filter(p => (p.budgetRaw - p.paidRaw) > 0).length || 0;

                            return (
                              <button
                                key={c.id}
                                type="button"
                                onClick={() => handleSelectAddClient(c)}
                                className={`w-full text-left px-2.5 py-2 rounded-md text-xs flex items-center justify-between transition-colors cursor-pointer ${
                                  isSelected
                                    ? "bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] font-semibold"
                                    : "hover:bg-[#F5F5F5] dark:hover:bg-[#1C1C1C] text-[#0A0A0A] dark:text-white"
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div
                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                      isSelected
                                        ? "bg-white text-[#0A0A0A] dark:bg-[#0A0A0A] dark:text-white"
                                        : "bg-[#E5E5E5] text-[#0A0A0A] dark:bg-[#262626] dark:text-white"
                                    }`}
                                  >
                                    {c.name.slice(0, 2).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <p className="truncate font-medium">{c.name}</p>
                                      {dueCount > 0 && (
                                        <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${isSelected ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"}`}>
                                          {dueCount} Due
                                        </span>
                                      )}
                                    </div>
                                    {c.email && (
                                      <p className={`text-[10px] truncate ${isSelected ? "text-neutral-300 dark:text-neutral-600" : "text-[#737373] dark:text-neutral-400"}`}>
                                        {c.email}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-2" />}
                              </button>
                            );
                          })
                        ) : (
                          <div className="py-4 text-center text-xs text-[#737373] dark:text-neutral-500">
                            {addClientSearch ? `No clients matching "${addClientSearch}"` : "No registered clients found"}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  placeholder={formData.type === "Income" ? "e.g. Acme Corp" : "e.g. Vercel Inc."}
                  value={formData.clientName}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                />
              )}
            </div>
          </div>

          {/* Smart Project Due Selector for Income */}
          {formData.type === "Income" && formData.clientId && (
            (() => {
              const currentClient = clients.find((c) => c.id === formData.clientId);
              const clientProjects = currentClient?.projects || [];
              if (clientProjects.length === 0) return null;

              return (
                <div className="space-y-2 p-3 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-[#FAFAFA] dark:bg-[#141414] animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A] dark:text-white flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-[#737373]" />
                      <span>Select Project for Payment</span>
                    </label>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono font-medium">
                      Auto-syncs project balance
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
                    {/* General Retainer Option */}
                    <button
                      type="button"
                      onClick={() => handleSelectAddProject("")}
                      className={`w-full text-left px-3 py-2 rounded-lg border text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        !formData.projectId
                          ? "border-[#0A0A0A] bg-white dark:border-white dark:bg-[#1C1C1C] shadow-xs font-semibold"
                          : "border-[#E5E5E5] dark:border-[#262626] bg-white/60 dark:bg-[#111111] hover:bg-white dark:hover:bg-[#181818] text-[#737373] dark:text-neutral-400"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs text-[#0A0A0A] dark:text-white font-medium truncate">
                          General Account Retainer / Advance
                        </span>
                        <span className="text-[10px] font-mono text-[#737373] dark:text-neutral-500 shrink-0">
                          (No specific project)
                        </span>
                      </div>
                      {!formData.projectId && <Check className="w-3.5 h-3.5 text-[#0A0A0A] dark:text-white shrink-0 ml-2" />}
                    </button>

                    {/* Client's Projects with Due Balances (Clean 1-Line Layout) */}
                    {clientProjects.map((p) => {
                      const isSelected = formData.projectId === p.id;
                      const due = Math.max(0, p.budgetRaw - p.paidRaw);
                      const isDue = due > 0;

                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSelectAddProject(p.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg border text-xs transition-all cursor-pointer ${
                            isSelected
                              ? "border-[#0A0A0A] bg-white dark:border-white dark:bg-[#1C1C1C] shadow-xs"
                              : "border-[#E5E5E5] dark:border-[#262626] bg-white/60 dark:bg-[#111111] hover:bg-white dark:hover:bg-[#181818]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 min-w-0">
                            {/* Left: Project title & Due badge in 1 line */}
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span className="font-semibold text-xs text-[#0A0A0A] dark:text-white truncate" title={p.title}>
                                {p.title}
                              </span>
                              {isDue ? (
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300 shrink-0">
                                  Due: ₹{due.toLocaleString("en-IN")}
                                </span>
                              ) : (
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-300 shrink-0">
                                  Fully Paid
                                </span>
                              )}
                            </div>

                            {/* Right: Payment details (Budget & Paid) */}
                            <div className="flex items-center gap-2 text-[11px] text-[#737373] dark:text-neutral-400 font-mono shrink-0">
                              <span>Budget: {p.budget || `₹${p.budgetRaw.toLocaleString("en-IN")}`}</span>
                              <span>•</span>
                              <span>Paid: ₹{p.paidRaw.toLocaleString("en-IN")}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#0A0A0A] dark:text-white ml-1 shrink-0" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()
          )}

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
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                  Category
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingCategoryAdd(!isCreatingCategoryAdd);
                    setNewCategoryInputAdd("");
                  }}
                  className="text-[11px] font-semibold text-[#0A0A0A] dark:text-white hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  {isCreatingCategoryAdd ? "Select Existing" : "Create New"}
                </button>
              </div>

              {isCreatingCategoryAdd ? (
                <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
                  <input
                    type="text"
                    placeholder="Enter category name..."
                    value={newCategoryInputAdd}
                    onChange={(e) => setNewCategoryInputAdd(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (newCategoryInputAdd.trim()) {
                          const added = handleAddCategory(newCategoryInputAdd);
                          if (added) {
                            setFormData({ ...formData, category: added });
                            setIsCreatingCategoryAdd(false);
                            setNewCategoryInputAdd("");
                            toast.success(`Category "${added}" created & selected`);
                          }
                        }
                      }
                    }}
                    className="flex-1 px-3 py-2 text-xs border border-[#0A0A0A] dark:border-white rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newCategoryInputAdd.trim()) {
                        const added = handleAddCategory(newCategoryInputAdd);
                        if (added) {
                          setFormData({ ...formData, category: added });
                          setIsCreatingCategoryAdd(false);
                          setNewCategoryInputAdd("");
                          toast.success(`Category "${added}" created & selected`);
                        }
                      }
                    }}
                    disabled={!newCategoryInputAdd.trim()}
                    className="px-3 py-2 text-xs font-semibold rounded-lg bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shrink-0 cursor-pointer"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingCategoryAdd(false);
                      setNewCategoryInputAdd("");
                    }}
                    className="px-2.5 py-2 text-xs font-medium rounded-lg border border-[#E5E5E5] dark:border-[#262626] text-[#737373] hover:text-[#0A0A0A] dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <select
                  value={formData.category}
                  onChange={(e) => {
                    if (e.target.value === "__CREATE_NEW__") {
                      setIsCreatingCategoryAdd(true);
                      setNewCategoryInputAdd("");
                    } else {
                      setFormData({ ...formData, category: e.target.value });
                    }
                  }}
                  className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="dark:bg-[#111111]">{cat}</option>
                  ))}
                  <option value="__CREATE_NEW__" className="dark:bg-[#111111] font-semibold text-[#0A0A0A] dark:text-white">
                    + Create New Category...
                  </option>
                </select>
              )}
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
                rows={4}
                placeholder="Add accounting details, bank reference, or project milestone notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white resize-y min-h-[96px]"
              />
            </div>
          </div>

          {/* Fixed / Sticky Bottom Actions Bar (No negative margins = No horizontal scrollbar) */}
          <div className="sticky bottom-0 -mx-4 sm:-mx-5 px-4 sm:px-5 py-3 -mb-4 sm:-mb-5 bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-sm border-t border-[#E5E5E5] dark:border-[#262626] flex items-center justify-end gap-2.5 z-20 min-h-[58px]">
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
          title="Edit Record"
          variant="centered"
          size="2xl"
          className="h-[600px] max-h-[85vh]"
          headerActions={
            <div className="flex items-center p-1 bg-white dark:bg-[#141414] rounded-lg border border-[#0A0A0A] dark:border-white/30 shadow-xs">
              <button
                type="button"
                onClick={() => setEditFormData({ ...editFormData, type: "Income" })}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                  editFormData.type === "Income"
                    ? "bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] shadow-xs"
                    : "text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white"
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>Income / Inflow</span>
              </button>
              <button
                type="button"
                onClick={() => setEditFormData({ ...editFormData, type: "Expense" })}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                  editFormData.type === "Expense"
                    ? "bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] shadow-xs"
                    : "text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white"
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Expense / Outflow</span>
              </button>
            </div>
          }
        >
          <form onSubmit={handleEditSubmit} className="flex flex-col min-h-0">
            <div className="space-y-3.5 pb-3">
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

              {/* Smart Searchable Client Combobox for Edit */}
              <div className="space-y-1 relative" ref={editClientDropdownRef}>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400 flex items-center justify-between">
                  <span>{editFormData.type === "Income" ? "Client / Account *" : "Vendor / Payee *"}</span>
                  {editFormData.type === "Income" && clients.length > 0 && (
                    <span className="text-[10px] text-[#737373] dark:text-neutral-500">Searchable account</span>
                  )}
                </label>

                {editFormData.type === "Income" && clients.length > 0 ? (
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditClientOpen(!isEditClientOpen);
                        setEditClientSearch("");
                      }}
                      className="w-full text-left flex items-center justify-between px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white hover:border-[#0A0A0A] dark:hover:border-white transition-colors cursor-pointer"
                    >
                      {editFormData.clientName ? (
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-5 h-5 rounded-full bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] flex items-center justify-center text-[9px] font-bold shrink-0">
                            {editFormData.clientName.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="font-semibold truncate">{editFormData.clientName}</span>
                        </div>
                      ) : (
                        <span className="text-[#737373] dark:text-neutral-500">
                          -- Select Client Account --
                        </span>
                      )}
                      <ChevronsUpDown className="w-3.5 h-3.5 text-[#737373] shrink-0 ml-1.5 opacity-70" />
                    </button>

                    {/* Dropdown Menu */}
                    {isEditClientOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#262626] rounded-lg shadow-xl p-2 space-y-2 animate-in fade-in duration-100">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#737373]" />
                          <input
                            type="text"
                            placeholder="Search client by name or email..."
                            value={editClientSearch}
                            onChange={(e) => setEditClientSearch(e.target.value)}
                            autoFocus
                            className="w-full pl-8 pr-7 py-1.5 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-[#F9F9F9] dark:bg-[#1A1A1A] text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                          />
                          {editClientSearch && (
                            <button
                              type="button"
                              onClick={() => setEditClientSearch("")}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        <div className="max-h-48 overflow-y-auto space-y-0.5 pr-0.5">
                          {filteredEditClients.length > 0 ? (
                            filteredEditClients.map((c) => {
                              const isSelected = editFormData.clientId === c.id || editFormData.clientName.toLowerCase() === c.name.toLowerCase();
                              const dueCount = c.projects?.filter(p => (p.budgetRaw - p.paidRaw) > 0).length || 0;

                              return (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => handleSelectEditClient(c)}
                                  className={`w-full text-left px-2.5 py-2 rounded-md text-xs flex items-center justify-between transition-colors cursor-pointer ${
                                    isSelected
                                      ? "bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] font-semibold"
                                      : "hover:bg-[#F5F5F5] dark:hover:bg-[#1C1C1C] text-[#0A0A0A] dark:text-white"
                                  }`}
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div
                                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                        isSelected
                                          ? "bg-white text-[#0A0A0A] dark:bg-[#0A0A0A] dark:text-white"
                                          : "bg-[#E5E5E5] text-[#0A0A0A] dark:bg-[#262626] dark:text-white"
                                      }`}
                                    >
                                      {c.name.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <p className="truncate font-medium">{c.name}</p>
                                        {dueCount > 0 && (
                                          <span className={`text-[9px] px-1 py-0.2 rounded font-mono ${isSelected ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"}`}>
                                            {dueCount} Due
                                          </span>
                                        )}
                                      </div>
                                      {c.email && (
                                        <p className={`text-[10px] truncate ${isSelected ? "text-neutral-300 dark:text-neutral-600" : "text-[#737373] dark:text-neutral-400"}`}>
                                          {c.email}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-2" />}
                                </button>
                              );
                            })
                          ) : (
                            <div className="py-4 text-center text-xs text-[#737373] dark:text-neutral-500">
                              {editClientSearch ? `No clients matching "${editClientSearch}"` : "No registered clients found"}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    placeholder={editFormData.type === "Income" ? "e.g. Acme Corp" : "e.g. Vercel Inc."}
                    value={editFormData.clientName}
                    onChange={(e) => setEditFormData({ ...editFormData, clientName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                  />
                )}
              </div>
            </div>

            {/* Smart Project Due Selector for Income (Edit) */}
            {editFormData.type === "Income" && editFormData.clientId && (
              (() => {
                const currentClient = clients.find((c) => c.id === editFormData.clientId);
                const clientProjects = currentClient?.projects || [];
                if (clientProjects.length === 0) return null;

                return (
                  <div className="space-y-2 p-3 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-[#FAFAFA] dark:bg-[#141414] animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-[#0A0A0A] dark:text-white flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#737373]" />
                        <span>Select Project for Payment</span>
                      </label>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono font-medium">
                        Auto-syncs project balance
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
                      {/* General Retainer Option */}
                      <button
                        type="button"
                        onClick={() => setEditFormData({ ...editFormData, projectId: "" })}
                        className={`w-full text-left px-3 py-2 rounded-lg border text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          !editFormData.projectId
                            ? "border-[#0A0A0A] bg-white dark:border-white dark:bg-[#1C1C1C] shadow-xs font-semibold"
                            : "border-[#E5E5E5] dark:border-[#262626] bg-white/60 dark:bg-[#111111] hover:bg-white dark:hover:bg-[#181818] text-[#737373] dark:text-neutral-400"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs text-[#0A0A0A] dark:text-white font-medium truncate">
                            General Account Retainer / Advance
                          </span>
                          <span className="text-[10px] font-mono text-[#737373] dark:text-neutral-500 shrink-0">
                            (No specific project)
                          </span>
                        </div>
                        {!editFormData.projectId && <Check className="w-3.5 h-3.5 text-[#0A0A0A] dark:text-white shrink-0 ml-2" />}
                      </button>

                      {/* Client's Projects with Due Balances (Clean 1-Line Layout) */}
                      {clientProjects.map((p) => {
                        const isSelected = editFormData.projectId === p.id;
                        const due = Math.max(0, p.budgetRaw - p.paidRaw);
                        const isDue = due > 0;

                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setEditFormData({ ...editFormData, projectId: p.id })}
                            className={`w-full text-left px-3 py-2 rounded-lg border text-xs transition-all cursor-pointer ${
                              isSelected
                                ? "border-[#0A0A0A] bg-white dark:border-white dark:bg-[#1C1C1C] shadow-xs"
                                : "border-[#E5E5E5] dark:border-[#262626] bg-white/60 dark:bg-[#111111] hover:bg-white dark:hover:bg-[#181818]"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3 min-w-0">
                              {/* Left: Project title & Due badge in 1 line */}
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <span className="font-semibold text-xs text-[#0A0A0A] dark:text-white truncate" title={p.title}>
                                  {p.title}
                                </span>
                                {isDue ? (
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300 shrink-0">
                                    Due: ₹{due.toLocaleString("en-IN")}
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-300 shrink-0">
                                    Fully Paid
                                  </span>
                                )}
                              </div>

                              {/* Right: Payment details (Budget & Paid) */}
                              <div className="flex items-center gap-2 text-[11px] text-[#737373] dark:text-neutral-400 font-mono shrink-0">
                                <span>Budget: {p.budget || `₹${p.budgetRaw.toLocaleString("en-IN")}`}</span>
                                <span>•</span>
                                <span>Paid: ₹{p.paidRaw.toLocaleString("en-IN")}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-[#0A0A0A] dark:text-white ml-1 shrink-0" />}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()
            )}

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
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                    Category
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingCategoryEdit(!isCreatingCategoryEdit);
                      setNewCategoryInputEdit("");
                    }}
                    className="text-[11px] font-semibold text-[#0A0A0A] dark:text-white hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    {isCreatingCategoryEdit ? "Select Existing" : "Create New"}
                  </button>
                </div>

                {isCreatingCategoryEdit ? (
                  <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
                    <input
                      type="text"
                      placeholder="Enter category name..."
                      value={newCategoryInputEdit}
                      onChange={(e) => setNewCategoryInputEdit(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (newCategoryInputEdit.trim()) {
                            const added = handleAddCategory(newCategoryInputEdit);
                            if (added) {
                              setEditFormData({ ...editFormData, category: added });
                              setIsCreatingCategoryEdit(false);
                              setNewCategoryInputEdit("");
                              toast.success(`Category "${added}" created & selected`);
                            }
                          }
                        }
                      }}
                      className="flex-1 px-3 py-2 text-xs border border-[#0A0A0A] dark:border-white rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newCategoryInputEdit.trim()) {
                          const added = handleAddCategory(newCategoryInputEdit);
                          if (added) {
                            setEditFormData({ ...editFormData, category: added });
                            setIsCreatingCategoryEdit(false);
                            setNewCategoryInputEdit("");
                            toast.success(`Category "${added}" created & selected`);
                          }
                        }
                      }}
                      disabled={!newCategoryInputEdit.trim()}
                      className="px-3 py-2 text-xs font-semibold rounded-lg bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shrink-0 cursor-pointer"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingCategoryEdit(false);
                        setNewCategoryInputEdit("");
                      }}
                      className="px-2.5 py-2 text-xs font-medium rounded-lg border border-[#E5E5E5] dark:border-[#262626] text-[#737373] hover:text-[#0A0A0A] dark:text-neutral-400 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <select
                    value={editFormData.category}
                    onChange={(e) => {
                      if (e.target.value === "__CREATE_NEW__") {
                        setIsCreatingCategoryEdit(true);
                        setNewCategoryInputEdit("");
                      } else {
                        setEditFormData({ ...editFormData, category: e.target.value });
                      }
                    }}
                    className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="dark:bg-[#111111]">{cat}</option>
                    ))}
                    <option value="__CREATE_NEW__" className="dark:bg-[#111111] font-semibold text-[#0A0A0A] dark:text-white">
                      + Create New Category...
                    </option>
                  </select>
                )}
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
                  rows={4}
                  value={editFormData.notes}
                  onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white resize-y min-h-[96px]"
                />
              </div>
            </div>

            {/* Fixed / Sticky Bottom Actions Bar (No negative margins = No horizontal scrollbar) */}
            <div className="sticky bottom-0 -mx-4 sm:-mx-5 px-4 sm:px-5 py-3 -mb-4 sm:-mb-5 bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-sm border-t border-[#E5E5E5] dark:border-[#262626] flex items-center justify-end gap-2.5 z-20 min-h-[58px]">
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
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2.5 border-t border-[#E5E5E5] dark:border-[#262626]">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleDownloadDirectPDF(selectedTransaction)}
                disabled={isDownloadingPdf}
                className="flex items-center justify-center gap-1.5"
              >
                {isDownloadingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download PDF Receipt
                  </>
                )}
              </Button>
              <div className="flex items-center justify-end gap-2">
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
          </div>
        </Modal>
      )}
      {/* Category Manager Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setNewCategoryManagerInput("");
        }}
        title="Manage Finance Categories"
        variant="centered"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-xs text-[#737373] dark:text-neutral-400 leading-relaxed">
            Create and organize categories for grouping agency transactions, client billings, and operational expenses.
          </p>

          {/* Add New Category Input */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
              Create New Category
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="e.g. Legal & Compliance, Cloud Hosting..."
                value={newCategoryManagerInput}
                onChange={(e) => setNewCategoryManagerInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (newCategoryManagerInput.trim()) {
                      const added = handleAddCategory(newCategoryManagerInput);
                      if (added) {
                        setNewCategoryManagerInput("");
                        toast.success(`Category "${added}" created successfully`);
                      }
                    }
                  }
                }}
                className="flex-1 px-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (newCategoryManagerInput.trim()) {
                    const added = handleAddCategory(newCategoryManagerInput);
                    if (added) {
                      setNewCategoryManagerInput("");
                      toast.success(`Category "${added}" created successfully`);
                    }
                  }
                }}
                disabled={!newCategoryManagerInput.trim()}
                className="flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Category
              </Button>
            </div>
          </div>

          {/* Existing Categories List */}
          <div className="space-y-2 pt-2 border-t border-[#E5E5E5] dark:border-[#262626]">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400">
              Available Categories ({categories.length})
            </h4>
            <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
              {categories.map((cat) => {
                const count = transactionList.filter((t) => t.category === cat).length;
                const isDefault = DEFAULT_CATEGORIES.includes(cat);
                const isEditing = editingCategoryName === cat;

                if (isEditing) {
                  return (
                    <div
                      key={cat}
                      className="flex items-center gap-2 p-2 border border-[#0A0A0A] dark:border-white rounded-lg bg-white dark:bg-[#111111] animate-in fade-in duration-150"
                    >
                      <input
                        type="text"
                        autoFocus
                        value={editCategoryInput}
                        onChange={(e) => setEditCategoryInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleEditCategory(cat, editCategoryInput);
                          } else if (e.key === "Escape") {
                            setEditingCategoryName(null);
                          }
                        }}
                        className="flex-1 px-2 py-1 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleEditCategory(cat, editCategoryInput)}
                        disabled={!editCategoryInput.trim()}
                        className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                        title="Save Changes"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCategoryName(null)}
                        className="p-1.5 text-[#737373] hover:text-[#0A0A0A] dark:text-neutral-400 dark:hover:text-white hover:bg-[#E5E5E5] dark:hover:bg-[#262626] rounded-md transition-colors cursor-pointer"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                }

                return (
                  <div
                    key={cat}
                    className="flex items-center justify-between p-2.5 border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-[#FAFAFA] dark:bg-[#141414] hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xs font-semibold text-[#0A0A0A] dark:text-white truncate">
                        {cat}
                      </span>
                      <span className="text-[10px] font-mono text-[#737373] dark:text-neutral-500 bg-[#E5E5E5] dark:bg-[#262626] px-1.5 py-0.5 rounded">
                        {count} {count === 1 ? "record" : "records"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCategoryName(cat);
                          setEditCategoryInput(cat);
                        }}
                        className="p-1.5 text-[#737373] hover:text-[#0A0A0A] dark:text-neutral-400 dark:hover:text-white hover:bg-[#E5E5E5] dark:hover:bg-[#262626] rounded transition-colors cursor-pointer"
                        title="Edit Category Name"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, category: cat }));
                          setIsCategoryModalOpen(false);
                          setIsAddModalOpen(true);
                        }}
                        className="px-2 py-1 text-[11px] font-medium text-[#737373] hover:text-[#0A0A0A] dark:text-neutral-400 dark:hover:text-white hover:bg-[#E5E5E5] dark:hover:bg-[#262626] rounded transition-colors cursor-pointer"
                        title="Create new record with this category"
                      >
                        Use in New Record
                      </button>
                      {!isDefault && count === 0 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat)}
                          className="p-1 text-[#737373] hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors cursor-pointer"
                          title="Remove custom category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button variant="secondary" size="sm" onClick={() => setIsCategoryModalOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      </Modal>
      {/* Receipt Preview Modal */}
      {previewReceiptTx && (
        <Modal
          isOpen={!!previewReceiptTx}
          onClose={() => setPreviewReceiptTx(null)}
          title="Payment Receipt Copy (A4 Preview)"
          variant="centered"
          size="2xl"
        >
          <div className="space-y-4">
            {/* A4 Sheet Preview Box */}
            <div id="printable-receipt-preview" className="max-h-[65vh] overflow-y-auto p-4 sm:p-6 bg-white text-[#0A0A0A] rounded-xl border border-[#E5E5E5] shadow-xs">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b-2 border-[#0A0A0A]">
                <div>
                  <img
                    src="/images/Black_Logo.png"
                    alt="ABCD Agency"
                    className="h-10 w-auto object-contain mb-1.5"
                  />
                  <p className="text-[11px] text-[#525252] leading-relaxed">
                    sb.abcd321@gmail.com • +91 89448 99747<br />
                    Tripura, India • abcdagency.com
                  </p>
                </div>
                <div className="sm:text-right">
                  <span className="inline-block px-3 py-1 bg-[#0A0A0A] text-white text-[10px] font-bold uppercase tracking-widest rounded">
                    Payment Receipt
                  </span>
                  <div className="mt-2.5 text-xs text-[#525252] space-y-0.5">
                    <div>Receipt No: <strong className="font-mono text-[#0A0A0A]">{previewReceiptTx.referenceNo || `REC-${previewReceiptTx.id.slice(-6).toUpperCase()}`}</strong></div>
                    <div>Date: <strong className="text-[#0A0A0A]">{previewReceiptTx.date}</strong></div>
                    <div>Status: <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${previewReceiptTx.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>{previewReceiptTx.status}</span></div>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-b border-[#E5E5E5]">
                <div className="p-3.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#737373]">
                    {previewReceiptTx.type === "Income" ? "Received From (Client)" : "Paid To (Payee / Vendor)"}
                  </div>
                  <div className="text-sm font-bold text-[#0A0A0A] mt-1">
                    {previewReceiptTx.clientName || "Valued Client"}
                  </div>
                  <div className="text-xs text-[#737373] mt-1">
                    {previewReceiptTx.referenceNo ? `Ref / Invoice ID: ${previewReceiptTx.referenceNo}` : "Direct Transaction"}
                  </div>
                </div>

                <div className="p-3.5 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#737373]">
                    Transaction Summary
                  </div>
                  <div className="text-sm font-bold text-[#0A0A0A] mt-1">
                    {previewReceiptTx.type} • {previewReceiptTx.paymentMethod}
                  </div>
                  <div className="text-xs text-[#737373] mt-1">
                    Category: <strong className="text-[#0A0A0A]">{previewReceiptTx.category}</strong>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="py-5">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F5F5F5] border-y border-[#E5E5E5] text-[10px] font-bold uppercase tracking-wider text-[#525252]">
                      <th className="py-2.5 px-3 w-10 text-center">SL</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Method</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5]">
                    <tr>
                      <td className="py-3 px-3 text-center font-mono text-[#737373]">01</td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-[#0A0A0A]">{previewReceiptTx.title}</div>
                        <div className="text-[11px] text-[#737373] mt-0.5">{previewReceiptTx.clientName ? `Party: ${previewReceiptTx.clientName}` : "Standard Agency Account"}</div>
                      </td>
                      <td className="py-3 px-3 text-[#525252]">{previewReceiptTx.category}</td>
                      <td className="py-3 px-3 text-[#525252]">{previewReceiptTx.paymentMethod}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-[#0A0A0A]">{previewReceiptTx.amount}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end pt-2">
                <div className="w-full sm:w-72 border border-[#E5E5E5] rounded-lg overflow-hidden text-xs">
                  <div className="flex justify-between px-3.5 py-2 border-b border-[#E5E5E5] text-[#525252]">
                    <span>Subtotal</span>
                    <span className="font-mono">{previewReceiptTx.amount}</span>
                  </div>
                  <div className="flex justify-between px-3.5 py-2 border-b border-[#E5E5E5] text-[#525252]">
                    <span>Tax / Processing Fee</span>
                    <span className="font-mono">₹0.00</span>
                  </div>
                  <div className="flex justify-between px-3.5 py-2.5 bg-[#0A0A0A] text-white font-bold">
                    <span>Net Total ({previewReceiptTx.type})</span>
                    <span className="font-mono text-sm">{previewReceiptTx.amount}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {previewReceiptTx.notes && (
                <div className="mt-4 p-3 bg-[#FAFAFA] border-l-2 border-[#0A0A0A] rounded-r-lg text-xs text-[#525252] leading-relaxed">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#0A0A0A] mb-1">Notes</div>
                  {previewReceiptTx.notes}
                </div>
              )}

              {/* Footer (No signature box) */}
              <div className="mt-6 pt-4 border-t border-dashed border-[#CCCCCC] flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] text-[#737373]">
                <div>Official electronic payment receipt generated by ABCD Agency Finance System.</div>
                <div>Support: sb.abcd321@gmail.com • +91 89448 99747</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPreviewReceiptTx(null)}
                disabled={isDownloadingPdf}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleDownloadDirectPDF(previewReceiptTx)}
                disabled={isDownloadingPdf}
                className="flex items-center gap-2"
              >
                {isDownloadingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
