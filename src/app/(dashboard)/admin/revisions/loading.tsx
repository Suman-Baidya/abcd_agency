import React from "react";
import { Card } from "@/components/ui/Card";

export default function RevisionsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="h-8 w-60 bg-[#E5E5E5] dark:bg-[#262626] rounded-md" />
          <div className="h-4 w-72 bg-[#F0F0F0] dark:bg-[#1A1A1A] rounded-md mt-2" />
        </div>
        <div className="h-9 w-full sm:w-32 bg-[#E5E5E5] dark:bg-[#262626] rounded-md" />
      </div>

      {/* KPI Stats Row Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4 sm:p-5 flex flex-col justify-between h-24 border border-[#E5E5E5] dark:border-[#262626]">
            <div className="h-3 w-20 bg-[#E5E5E5] dark:bg-[#262626] rounded" />
            <div className="h-7 w-28 bg-[#E5E5E5] dark:bg-[#262626] rounded mt-2" />
          </Card>
        ))}
      </div>

      {/* Revisions Card Skeleton */}
      <Card className="overflow-hidden !p-0 border border-[#E5E5E5] dark:border-[#262626] shadow-xs">
        <div className="p-4 sm:p-5 border-b border-[#E5E5E5] dark:border-[#262626] flex items-center justify-between">
          <div className="h-5 w-40 bg-[#E5E5E5] dark:bg-[#262626] rounded" />
          <div className="h-8 w-64 bg-[#F0F0F0] dark:bg-[#1A1A1A] rounded-lg" />
        </div>
        <div className="divide-y divide-[#E5E5E5] dark:divide-[#262626]">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-4 w-48 bg-[#E5E5E5] dark:bg-[#262626] rounded" />
                <div className="h-5 w-20 bg-[#E5E5E5] dark:bg-[#262626] rounded-full" />
              </div>
              <div className="h-3 w-3/4 bg-[#F0F0F0] dark:bg-[#1A1A1A] rounded" />
              <div className="h-3 w-1/2 bg-[#F0F0F0] dark:bg-[#1A1A1A] rounded" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
