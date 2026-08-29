import React from "react";
import { FinanceManager } from "@/components/dashboard/FinanceManager";
import { getFinanceTransactions } from "./actions";

export const metadata = {
  title: "Finance & Accounting — ABCD Agency",
  description: "Track revenues, client invoices, contractor expenses, and agency cash flows.",
};

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const transactions = await getFinanceTransactions();
  return <FinanceManager initialTransactions={transactions} />;
}
