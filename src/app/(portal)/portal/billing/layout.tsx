import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invoices & Billing — ABCD Digital Hub | Financial Ledger",
  description: "View financial milestones, transaction receipts, and outstanding invoice balances on ABCD Digital Hub.",
};

export default function PortalBillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
