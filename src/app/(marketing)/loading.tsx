import React from "react";
import { Card } from "@/components/ui/Card";

export default function MarketingLoading() {
  return (
    <div className="w-full animate-pulse">
      {/* Top Dark Band Header Skeleton matching PageHeader */}
      <section className="relative overflow-hidden bg-[#0A0A0A] border-b-2 border-white dark:border-[#262626] min-h-[300px] flex items-center">
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="max-w-2xl space-y-4">
            {/* Monospace Tag / Breadcrumb */}
            <div className="h-3.5 w-32 bg-[#262626] rounded" />
            {/* Title */}
            <div className="h-9 sm:h-12 w-64 sm:w-96 bg-[#262626] rounded-md" />
            {/* Description */}
            <div className="space-y-2 pt-1">
              <div className="h-4 w-full max-w-lg bg-[#1A1A1A] rounded" />
              <div className="h-4 w-3/4 max-w-md bg-[#1A1A1A] rounded" />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid Skeleton */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Card
              key={item}
              className="p-6 flex flex-col justify-between h-72 border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] rounded-xl"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-[#E5E5E5] dark:bg-[#262626]" />
                <div className="h-5 w-44 bg-[#E5E5E5] dark:bg-[#262626] rounded" />
                <div className="space-y-1.5 pt-2">
                  <div className="h-3.5 w-full bg-[#F0F0F0] dark:bg-[#1A1A1A] rounded" />
                  <div className="h-3.5 w-4/5 bg-[#F0F0F0] dark:bg-[#1A1A1A] rounded" />
                  <div className="h-3.5 w-2/3 bg-[#F0F0F0] dark:bg-[#1A1A1A] rounded" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#E5E5E5] dark:border-[#262626]">
                <div className="h-3 w-20 bg-[#E5E5E5] dark:bg-[#262626] rounded" />
                <div className="h-4 w-4 rounded-full bg-[#E5E5E5] dark:bg-[#262626]" />
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
