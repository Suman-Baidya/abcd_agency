import React from "react";
import { Card } from "@/components/ui/Card";

export default function SettingsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-8 w-52 bg-[#E5E5E5] dark:bg-[#262626] rounded-md" />
        <div className="h-4 w-72 bg-[#F0F0F0] dark:bg-[#1A1A1A] rounded-md mt-2" />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#E5E5E5] dark:border-[#262626] pb-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-8 w-24 bg-[#E5E5E5] dark:bg-[#262626] rounded-lg shrink-0" />
        ))}
      </div>

      <Card className="p-6 space-y-6 border border-[#E5E5E5] dark:border-[#262626]">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-32 bg-[#E5E5E5] dark:bg-[#262626] rounded" />
            <div className="h-10 w-full bg-[#F0F0F0] dark:bg-[#1A1A1A] rounded-md" />
          </div>
        ))}
      </Card>
    </div>
  );
}
