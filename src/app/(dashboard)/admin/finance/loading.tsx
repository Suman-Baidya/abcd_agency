import React from "react";
import { Card } from "@/components/ui/Card";

export default function FinanceLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="h-8 w-60 bg-[#E5E5E5] dark:bg-[#262626] rounded-md" />
          <div className="h-4 w-80 bg-[#F0F0F0] dark:bg-[#1A1A1A] rounded-md mt-2" />
        </div>
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          <div className="h-9 w-full sm:w-28 bg-[#E5E5E5] dark:bg-[#262626] rounded-md" />
          <div className="h-9 w-full sm:w-32 bg-[#E5E5E5] dark:bg-[#262626] rounded-md" />
          <div className="col-span-2 sm:col-span-1 h-9 w-full sm:w-28 bg-[#0A0A0A]/20 dark:bg-white/20 rounded-md" />
        </div>
      </div>

      {/* KPI Stats Row Skeleton (4 Financial KPIs) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4 sm:p-5 flex flex-col justify-between h-24 border border-[#E5E5E5] dark:border-[#262626]">
            <div className="h-3 w-20 bg-[#E5E5E5] dark:bg-[#262626] rounded" />
            <div className="h-7 w-28 bg-[#E5E5E5] dark:bg-[#262626] rounded mt-2" />
          </Card>
        ))}
      </div>

      {/* Table Card Skeleton */}
      <Card className="overflow-hidden !p-0 border border-[#E5E5E5] dark:border-[#262626] shadow-xs">
        {/* Toolbar Skeleton */}
        <div className="p-4 sm:p-5 border-b border-[#E5E5E5] dark:border-[#262626] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 w-24 bg-[#E5E5E5] dark:bg-[#262626] rounded-lg shrink-0" />
            ))}
          </div>
          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            <div className="h-8 w-full sm:w-64 bg-[#F0F0F0] dark:bg-[#1A1A1A] rounded-lg" />
            <div className="h-8 w-32 bg-[#E5E5E5] dark:bg-[#262626] rounded-lg" />
            <div className="h-8 w-36 bg-[#E5E5E5] dark:bg-[#262626] rounded-lg" />
          </div>
        </div>

        {/* Transactions Rows Skeleton */}
        <div className="divide-y divide-[#E5E5E5] dark:divide-[#262626]">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="px-5 py-4 flex items-center justify-between gap-4">
              <div className="h-4 w-6 bg-[#F0F0F0] dark:bg-[#1A1A1A] rounded" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="h-4 w-56 bg-[#E5E5E5] dark:bg-[#262626] rounded" />
                <div className="h-3 w-36 bg-[#F0F0F0] dark:bg-[#1A1A1A] rounded" />
              </div>
              <div className="h-6 w-20 bg-[#E5E5E5] dark:bg-[#262626] rounded-full hidden sm:block" />
              <div className="h-4 w-24 bg-[#F0F0F0] dark:bg-[#1A1A1A] rounded hidden md:block" />
              <div className="h-4 w-20 bg-[#E5E5E5] dark:bg-[#262626] rounded font-bold" />
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 bg-[#F0F0F0] dark:bg-[#1A1A1A] rounded" />
                <div className="h-7 w-7 bg-[#F0F0F0] dark:bg-[#1A1A1A] rounded" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
