"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface TransactionInput {
  title: string;
  type: "Income" | "Expense";
  category: string;
  amount: string;
  status: "Completed" | "Pending" | "Cancelled";
  date: string;
  paymentMethod: string;
  referenceNo?: string;
  clientName?: string;
  notes?: string;
}

export interface TransactionItem {
  id: string;
  title: string;
  type: "Income" | "Expense";
  category: string;
  amount: string;
  amountRaw: number;
  status: "Completed" | "Pending" | "Cancelled";
  date: string;
  dateRaw: string;
  paymentMethod: string;
  referenceNo?: string;
  clientName?: string;
  notes?: string;
}

const DEFAULT_TRANSACTIONS = [
  {
    title: "Nexus Labs AI Platform Milestone 2",
    type: "Income",
    category: "Project Milestone",
    amount: "₹64,000",
    amountRaw: 64000,
    status: "Completed",
    date: new Date("2026-08-25"),
    paymentMethod: "Bank Transfer",
    referenceNo: "INV-2026-002",
    clientName: "Nexus Labs",
    notes: "Payment received for completed milestone 2 deliverables.",
  },
  {
    title: "ApexFlow Q3 Development Retainer",
    type: "Income",
    category: "Client Retainer",
    amount: "₹48,500",
    amountRaw: 48500,
    status: "Completed",
    date: new Date("2026-08-20"),
    paymentMethod: "Bank Transfer",
    referenceNo: "INV-2026-001",
    clientName: "ApexFlow Inc.",
    notes: "Monthly enterprise retainer package.",
  },
  {
    title: "Senior UI/UX Contractor Monthly Payout",
    type: "Expense",
    category: "Salaries & Contractors",
    amount: "₹32,000",
    amountRaw: 32000,
    status: "Completed",
    date: new Date("2026-08-18"),
    paymentMethod: "Bank Transfer",
    referenceNo: "PAY-2026-088",
    clientName: "Rahul Sharma (Design Lead)",
    notes: "Contractor payment for client projects UI delivery.",
  },
  {
    title: "Govt Sector (RGYCSP) Phase 1 Setup",
    type: "Income",
    category: "Project Milestone",
    amount: "₹45,000",
    amountRaw: 45000,
    status: "Completed",
    date: new Date("2026-08-15"),
    paymentMethod: "Bank Transfer",
    referenceNo: "INV-2026-003",
    clientName: "Govt Sector (RGYCSP)",
    notes: "Government portal certification infrastructure launch.",
  },
  {
    title: "Google Ads & Social Media Growth Campaign",
    type: "Expense",
    category: "Marketing & Growth",
    amount: "₹12,000",
    amountRaw: 12000,
    status: "Completed",
    date: new Date("2026-08-12"),
    paymentMethod: "Credit Card",
    referenceNo: "REC-GADS-441",
    clientName: "Google India Ads",
    notes: "Agency brand awareness and client acquisition campaign.",
  },
  {
    title: "CloudSync Ltd. Web Application Build",
    type: "Income",
    category: "Project Milestone",
    amount: "₹36,000",
    amountRaw: 36000,
    status: "Completed",
    date: new Date("2026-08-10"),
    paymentMethod: "Stripe",
    referenceNo: "INV-2026-005",
    clientName: "CloudSync Ltd.",
    notes: "Stripe payout after standard processing fee deduction.",
  },
  {
    title: "FinEdge Capital Branding & Portal UI",
    type: "Income",
    category: "Project Milestone",
    amount: "₹28,000",
    amountRaw: 28000,
    status: "Completed",
    date: new Date("2026-08-08"),
    paymentMethod: "UPI",
    referenceNo: "UPI-98421893",
    clientName: "FinEdge Capital",
    notes: "Instant UPI settlement for visual brand guidelines.",
  },
  {
    title: "Vercel Pro & Neon DB Serverless Cloud Tier",
    type: "Expense",
    category: "Software & Cloud",
    amount: "₹6,800",
    amountRaw: 6800,
    status: "Completed",
    date: new Date("2026-08-05"),
    paymentMethod: "Credit Card",
    referenceNo: "REC-VCL-091",
    clientName: "Vercel Inc.",
    notes: "Monthly production hosting and database pooling compute.",
  },
  {
    title: "Adobe Creative Cloud & Figma Enterprise Licenses",
    type: "Expense",
    category: "Software & Cloud",
    amount: "₹5,400",
    amountRaw: 5400,
    status: "Completed",
    date: new Date("2026-08-03"),
    paymentMethod: "Credit Card",
    referenceNo: "REC-FIG-332",
    clientName: "Figma Inc.",
    notes: "Design team seats and collaborative asset library.",
  },
  {
    title: "Google Workspace & Gemini API Compute",
    type: "Expense",
    category: "Software & Cloud",
    amount: "₹4,800",
    amountRaw: 4800,
    status: "Completed",
    date: new Date("2026-08-01"),
    paymentMethod: "Credit Card",
    referenceNo: "REC-GGL-882",
    clientName: "Google Cloud",
    notes: "Business email seats and AI model API usage.",
  },
  {
    title: "Orion Ventures Initial Portfolio Retainer",
    type: "Income",
    category: "Client Retainer",
    amount: "₹25,000",
    amountRaw: 25000,
    status: "Pending",
    date: new Date("2026-08-28"),
    paymentMethod: "Bank Transfer",
    referenceNo: "INV-2026-006",
    clientName: "Orion Ventures",
    notes: "Invoice sent, payment due within net 15 days.",
  },
  {
    title: "High-Speed Fiber Internet & Office Utilities",
    type: "Expense",
    category: "Office & Equipment",
    amount: "₹3,500",
    amountRaw: 3500,
    status: "Completed",
    date: new Date("2026-07-28"),
    paymentMethod: "UPI",
    referenceNo: "UPI-7749102",
    clientName: "Airtel Broadband",
    notes: "Dedicated fiber leased line monthly bill.",
  },
];

export async function getFinanceTransactions(): Promise<TransactionItem[]> {
  try {
    if (!db.transaction) {
      console.warn("db.transaction not ready, returning fallback seeds");
      return DEFAULT_TRANSACTIONS.map((t, idx) => ({
        id: `tx-${idx + 1}`,
        title: t.title,
        type: t.type as "Income" | "Expense",
        category: t.category,
        amount: t.amount,
        amountRaw: t.amountRaw,
        status: t.status as "Completed" | "Pending" | "Cancelled",
        date: t.date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        dateRaw: t.date.toISOString().slice(0, 10),
        paymentMethod: t.paymentMethod,
        referenceNo: t.referenceNo,
        clientName: t.clientName,
        notes: t.notes,
      }));
    }

    const count = await db.transaction.count();
    if (count === 0) {
      await db.transaction.createMany({
        data: DEFAULT_TRANSACTIONS,
      });
    }

    const records = await db.transaction.findMany({
      orderBy: { date: "desc" },
    });

    return records.map((r: any) => ({
      id: r.id,
      title: r.title,
      type: (r.type || "Income") as "Income" | "Expense",
      category: r.category || "Miscellaneous",
      amount: r.amount || "₹0",
      amountRaw: r.amountRaw || 0,
      status: (r.status || "Completed") as "Completed" | "Pending" | "Cancelled",
      date: new Date(r.date || r.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
      dateRaw: new Date(r.date || r.createdAt).toISOString().slice(0, 10),
      paymentMethod: r.paymentMethod || "Bank Transfer",
      referenceNo: r.referenceNo || undefined,
      clientName: r.clientName || undefined,
      notes: r.notes || undefined,
    }));
  } catch (error) {
    console.error("Error fetching transactions from db:", error);
    return DEFAULT_TRANSACTIONS.map((t, idx) => ({
      id: `tx-${idx + 1}`,
      title: t.title,
      type: t.type as "Income" | "Expense",
      category: t.category,
      amount: t.amount,
      amountRaw: t.amountRaw,
      status: t.status as "Completed" | "Pending" | "Cancelled",
      date: t.date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      dateRaw: t.date.toISOString().slice(0, 10),
      paymentMethod: t.paymentMethod,
      referenceNo: t.referenceNo,
      clientName: t.clientName,
      notes: t.notes,
    }));
  }
}

export async function createTransaction(data: TransactionInput) {
  try {
    const rawNumber = parseInt(data.amount.replace(/[^0-9]/g, "") || "0", 10);
    const formattedAmount = data.amount.startsWith("₹") ? data.amount : `₹${data.amount || "0"}`;
    const txDate = data.date ? new Date(data.date) : new Date();

    const created = await db.transaction.create({
      data: {
        title: data.title.trim(),
        type: data.type || "Income",
        category: data.category?.trim() || "Miscellaneous",
        amount: formattedAmount,
        amountRaw: rawNumber,
        status: data.status || "Completed",
        date: txDate,
        paymentMethod: data.paymentMethod || "Bank Transfer",
        referenceNo: data.referenceNo?.trim() || null,
        clientName: data.clientName?.trim() || null,
        notes: data.notes?.trim() || null,
      },
    });

    revalidatePath("/admin/finance");
    revalidatePath("/admin");
    return created;
  } catch (error: any) {
    console.error("Failed to create transaction:", error);
    throw new Error(error?.message || "Failed to create transaction in database");
  }
}

export async function updateTransaction(id: string, data: TransactionInput) {
  try {
    const rawNumber = parseInt(data.amount.replace(/[^0-9]/g, "") || "0", 10);
    const formattedAmount = data.amount.startsWith("₹") ? data.amount : `₹${data.amount || "0"}`;
    const txDate = data.date ? new Date(data.date) : new Date();

    const updated = await db.transaction.update({
      where: { id },
      data: {
        title: data.title.trim(),
        type: data.type || "Income",
        category: data.category?.trim() || "Miscellaneous",
        amount: formattedAmount,
        amountRaw: rawNumber,
        status: data.status || "Completed",
        date: txDate,
        paymentMethod: data.paymentMethod || "Bank Transfer",
        referenceNo: data.referenceNo?.trim() || null,
        clientName: data.clientName?.trim() || null,
        notes: data.notes?.trim() || null,
      },
    });

    revalidatePath("/admin/finance");
    revalidatePath("/admin");
    return updated;
  } catch (error: any) {
    console.error("Failed to update transaction:", error);
    throw new Error(error?.message || "Failed to update transaction in database");
  }
}

export async function updateTransactionStatus(id: string, status: string) {
  try {
    const updated = await db.transaction.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/admin/finance");
    revalidatePath("/admin");
    return updated;
  } catch (error: any) {
    console.error("Failed to update transaction status:", error);
    throw new Error(error?.message || "Failed to update status in database");
  }
}

export async function deleteTransaction(id: string) {
  try {
    await db.transaction.delete({
      where: { id },
    });

    revalidatePath("/admin/finance");
    revalidatePath("/admin");
  } catch (error: any) {
    console.error("Failed to delete transaction:", error);
    throw new Error(error?.message || "Failed to delete transaction from database");
  }
}
