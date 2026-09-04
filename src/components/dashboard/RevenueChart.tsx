"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";

interface TransactionData {
  amountRaw: number;
  type: string;
  status: string;
  date: string;
  dateRaw: string;
}

interface RevenueChartProps {
  transactions: TransactionData[];
}

export function RevenueChart({ transactions }: RevenueChartProps) {
  const [timeRange, setTimeRange] = useState<"6months" | "year" | "all">("6months");

  // Generate dynamic monthly bars based on transactions
  const monthlyData = useMemo(() => {
    const now = new Date();
    const completedIncome = transactions.filter(
      (t) => t.type === "Income" && t.status === "Completed"
    );

    let monthsCount = 6;
    if (timeRange === "year") monthsCount = 12;
    if (timeRange === "all") monthsCount = 12;

    const months: { label: string; year: number; month: number; total: number }[] = [];

    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthLabel = d.toLocaleDateString("en-US", { month: "short" });
      const year = d.getFullYear();
      const month = d.getMonth();

      // Sum income for this month
      const monthIncome = completedIncome.reduce((acc, t) => {
        const txDate = new Date(t.dateRaw || t.date);
        if (txDate.getFullYear() === year && txDate.getMonth() === month) {
          return acc + (t.amountRaw || 0);
        }
        return acc;
      }, 0);

      months.push({
        label: monthLabel,
        year,
        month,
        total: monthIncome,
      });
    }

    const maxTotal = Math.max(...months.map((m) => m.total), 1);

    return months.map((m) => {
      // Bar height percentage between 10% and 95%
      const percentage = m.total > 0 ? Math.max(15, Math.round((m.total / maxTotal) * 95)) : 8;
      const formattedValue =
        m.total >= 100000
          ? `₹${(m.total / 100000).toFixed(1)}L`
          : m.total >= 1000
          ? `₹${(m.total / 1000).toFixed(0)}k`
          : `₹${m.total}`;

      return {
        ...m,
        heightPercent: percentage,
        formattedValue,
        isPeak: m.total === maxTotal && m.total > 0,
      };
    });
  }, [transactions, timeRange]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <Link 
          href="/admin/finance" 
          className="text-base sm:text-lg font-bold text-[#0A0A0A] dark:text-white hover:underline flex items-center gap-1.5 group"
        >
          <span>Revenue Overview</span>
          <svg 
            className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-[#737373] dark:text-neutral-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as any)}
          aria-label="Revenue time range"
          className="text-xs border border-[#E5E5E5] dark:border-[#262626] bg-transparent rounded-md px-2 py-1 font-medium text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white cursor-pointer"
        >
          <option value="6months" className="dark:bg-[#111111] text-black dark:text-white">Last 6 Months</option>
          <option value="year" className="dark:bg-[#111111] text-black dark:text-white">This Year</option>
          <option value="all" className="dark:bg-[#111111] text-black dark:text-white">All Time</option>
        </select>
      </div>

      <div className="flex-1 flex items-end justify-between gap-2 pt-6 pb-2 min-h-[192px] h-48 border-b border-[#E5E5E5] dark:border-[#262626] relative">
        {/* Simple CSS Bar Chart grid lines */}
        <div className="absolute top-0 w-full border-t border-dashed border-[#E5E5E5] dark:border-[#262626]"></div>
        <div className="absolute top-1/2 w-full border-t border-dashed border-[#E5E5E5] dark:border-[#262626]"></div>

        {monthlyData.map((m, idx) => {
          const isLast = idx === monthlyData.length - 1;
          const isHighlight = m.isPeak || (isLast && m.total > 0);

          return (
            <div key={`${m.label}-${idx}`} className="flex-1 flex flex-col items-center gap-2 group z-10 h-full justify-end">
              <div
                style={{ height: `${m.heightPercent}%` }}
                className={`w-full max-w-[48px] rounded-t-sm transition-all duration-300 relative cursor-pointer ${
                  isHighlight
                    ? "bg-[#0A0A0A] dark:bg-white"
                    : "bg-[#E5E5E5] dark:bg-[#262626] group-hover:bg-[#0A0A0A] dark:group-hover:bg-white"
                }`}
              >
                {/* Tooltip */}
                <span
                  className={`absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-1 rounded shadow-md pointer-events-none transition-all duration-150 z-20 whitespace-nowrap ${
                    isHighlight
                      ? "bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] opacity-100"
                      : "bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {m.formattedValue}
                </span>
              </div>
              <span
                className={`text-[10px] sm:text-xs font-semibold ${
                  isHighlight
                    ? "text-[#0A0A0A] dark:text-white"
                    : "text-[#737373] dark:text-neutral-400 group-hover:text-[#0A0A0A] dark:group-hover:text-white"
                }`}
              >
                {m.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
