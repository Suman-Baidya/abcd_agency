import React from "react";
import { Card } from "@/components/ui/Card";

export default function ProfileLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-8 w-48 bg-[#E5E5E5] dark:bg-[#262626] rounded-md" />
        <div className="h-4 w-72 bg-[#F0F0F0] dark:bg-[#1A1A1A] rounded-md mt-2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 flex flex-col items-center text-center space-y-4 border border-[#E5E5E5] dark:border-[#262626]">
          <div className="w-24 h-24 rounded-full bg-[#E5E5E5] dark:bg-[#262626]" />
          <div className="h-5 w-36 bg-[#E5E5E5] dark:bg-[#262626] rounded" />
          <div className="h-3.5 w-48 bg-[#F0F0F0] dark:bg-[#1A1A1A] rounded" />
        </Card>

        <Card className="p-6 lg:col-span-2 space-y-5 border border-[#E5E5E5] dark:border-[#262626]">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-28 bg-[#E5E5E5] dark:bg-[#262626] rounded" />
              <div className="h-10 w-full bg-[#F0F0F0] dark:bg-[#1A1A1A] rounded-md" />
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
