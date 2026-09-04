import React from "react";
import { Card } from "@/components/ui/Card";

export default function PortalLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="h-8 w-56 sm:w-72 bg-[#E5E5E5] dark:bg-[#262626] rounded-md" />
          <div className="h-4 w-64 sm:w-96 bg-[#F0F0F0] dark:bg-[#1A1A1A] rounded-md mt-2" />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-28 bg-[#E5E5E5] dark:bg-[#262626] rounded-md" />
          <div className="h-9 w-28 bg-[#0A0A0A]/20 dark:bg-white/20 rounded-md" />
        </div>
      </div>

      {/* KPI Cards Skeleton (2x2 on mobile, 4x1 on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card
            key={i}
            className="p-4 sm:p-5 flex flex-col justify-between h-28 sm:h-32 border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A]"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 bg-[#E5E5E5] dark:bg-[#262626] rounded" />
              <div className="w-7 h-7 rounded-md bg-[#F0F0F0] dark:bg-[#1A1A1A]" />
            </div>
            <div>
              <div className="h-7 w-20 sm:w-28 bg-[#E5E5E5] dark:bg-[#262626] rounded" />
              <div className="h-3 w-16 bg-[#F0F0F0] dark:bg-[#1A1A1A] rounded mt-2" />
            </div>
          </Card>
        ))}
      </div>

      {/* Main Grid: Active Deliverables & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Projects Card Skeleton */}
        <Card className="p-5 sm:p-6 lg:col-span-2 flex flex-col h-96 border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A]">
          <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5] dark:border-[#262626]">
            <div className="h-5 w-40 bg-[#E5E5E5] dark:bg-[#262626] rounded" />
            <div className="h-4 w-20 bg-[#F0F0F0] dark:bg-[#1A1A1A] rounded" />
          </div>
          <div className="space-y-4 pt-5 flex-1">
            {[1, 2, 3].map((row) => (
              <div
                key={row}
                className="p-3.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-[#FAFAFA] dark:bg-[#111111] flex items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-48 bg-[#E5E5E5] dark:bg-[#262626] rounded" />
                  <div className="h-3 w-32 bg-[#F0F0F0] dark:bg-[#1A1A1A] rounded" />
                </div>
                <div className="h-6 w-20 bg-[#E5E5E5] dark:bg-[#262626] rounded-md shrink-0" />
              </div>
            ))}
          </div>
        </Card>

        {/* Invoices & Milestones Card Skeleton */}
        <Card className="p-5 sm:p-6 flex flex-col h-96 border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A]">
          <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E5] dark:border-[#262626]">
            <div className="h-5 w-32 bg-[#E5E5E5] dark:bg-[#262626] rounded" />
            <div className="w-5 h-5 rounded-full bg-[#F0F0F0] dark:bg-[#1A1A1A]" />
          </div>
          <div className="space-y-3 pt-5 flex-1">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center justify-between py-2 border-b border-[#F0F0F0] dark:border-[#1A1A1A]">
                <div className="space-y-1.5">
                  <div className="h-3.5 w-28 bg-[#E5E5E5] dark:bg-[#262626] rounded" />
                  <div className="h-2.5 w-16 bg-[#F0F0F0] dark:bg-[#1A1A1A] rounded" />
                </div>
                <div className="h-4 w-14 bg-[#E5E5E5] dark:bg-[#262626] rounded" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
