import React from "react";
import { Card } from "@/components/ui/Card";

export default function AdminOverviewLoading() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="h-7 sm:h-9 w-52 sm:w-64 bg-[#E5E5E5] dark:bg-[#262626] rounded-md" />
          <div className="h-4 w-72 sm:w-96 bg-[#F0F0F0] dark:bg-[#1A1A1A] rounded-md mt-2" />
        </div>
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 sm:gap-3">
          <div className="h-9 w-full sm:w-28 bg-[#E5E5E5] dark:bg-[#262626] rounded-md" />
          <div className="h-9 w-full sm:w-28 bg-[#0A0A0A]/20 dark:bg-white/20 rounded-md" />
        </div>
      </div>

      {/* KPI Grid Skeleton (2x2 on mobile, 4x1 on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-3.5 sm:p-5 flex flex-col justify-between h-28 sm:h-32 border border-[#E5E5E5] dark:border-[#262626]">
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 bg-[#E5E5E5] dark:bg-[#262626] rounded" />
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-[#F0F0F0] dark:bg-[#1A1A1A]" />
            </div>
            <div>
              <div className="h-6 sm:h-8 w-24 sm:w-32 bg-[#E5E5E5] dark:bg-[#262626] rounded" />
              <div className="h-3 w-16 bg-[#F0F0F0] dark:bg-[#1A1A1A] rounded mt-2" />
            </div>
          </Card>
        ))}
      </div>

      {/* Main Charts & Activity Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart Card Skeleton */}
        <Card className="p-4 sm:p-6 lg:col-span-2 flex flex-col h-80 border border-[#E5E5E5] dark:border-[#262626]">
          <div className="flex items-center justify-between mb-6">
            <div className="h-5 w-36 bg-[#E5E5E5] dark:bg-[#262626] rounded" />
            <div className="h-7 w-28 bg-[#F0F0F0] dark:bg-[#1A1A1A] rounded" />
          </div>
          <div className="flex-1 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-[#E5E5E5] dark:border-[#262626]">
            {[40, 65, 30, 85, 50, 75].map((h, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div
                  style={{ height: `${h}%` }}
                  className="w-full max-w-[48px] bg-[#E5E5E5] dark:bg-[#262626] rounded-t-sm"
                />
                <div className="h-3 w-6 bg-[#F0F0F0] dark:bg-[#1A1A1A] rounded" />
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity Card Skeleton */}
        <Card className="p-4 sm:p-6 flex flex-col justify-between h-80 border border-[#E5E5E5] dark:border-[#262626]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="h-5 w-32 bg-[#E5E5E5] dark:bg-[#262626] rounded" />
              <div className="h-4 w-16 bg-[#F0F0F0] dark:bg-[#1A1A1A] rounded" />
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 items-center p-1.5">
                  <div className="w-8 h-8 rounded-full bg-[#E5E5E5] dark:bg-[#262626] shrink-0" />
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="h-3.5 w-3/4 bg-[#E5E5E5] dark:bg-[#262626] rounded" />
                    <div className="h-3 w-1/2 bg-[#F0F0F0] dark:bg-[#1A1A1A] rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="h-9 w-full bg-[#E5E5E5] dark:bg-[#262626] rounded-md mt-4" />
        </Card>
      </div>

      {/* Active Projects Table Skeleton */}
      <Card className="overflow-hidden !p-0 border border-[#E5E5E5] dark:border-[#262626]">
        <div className="p-4 sm:p-6 border-b border-[#E5E5E5] dark:border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="h-5 w-40 bg-[#E5E5E5] dark:bg-[#262626] rounded" />
            <div className="h-3 w-60 bg-[#F0F0F0] dark:bg-[#1A1A1A] rounded mt-2" />
          </div>
          <div className="h-8 w-full sm:w-32 bg-[#E5E5E5] dark:bg-[#262626] rounded" />
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-[#F0F0F0] dark:border-[#1A1A1A] last:border-0 gap-4">
              <div className="h-4 w-6 bg-[#F0F0F0] dark:bg-[#1A1A1A] rounded" />
              <div className="h-4 w-48 bg-[#E5E5E5] dark:bg-[#262626] rounded flex-1" />
              <div className="h-4 w-20 bg-[#F0F0F0] dark:bg-[#1A1A1A] rounded hidden sm:block" />
              <div className="h-4 w-24 bg-[#E5E5E5] dark:bg-[#262626] rounded" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
