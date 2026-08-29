import React from "react";
import { Card } from "@/components/ui/Card";

export interface StatCardProps {
  label: string;
  value: string | number;
  color?: "default" | "emerald" | "amber" | "red" | "blue";
  subtext?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  color = "default",
  subtext,
  className = "",
}: StatCardProps) {
  const colorMap = {
    default: "text-[#0A0A0A] dark:text-white",
    emerald: "text-emerald-700 dark:text-emerald-400",
    amber: "text-amber-700 dark:text-amber-400",
    red: "text-red-600 dark:text-red-400",
    blue: "text-blue-700 dark:text-blue-400",
  };

  return (
    <Card className={`!p-4 border border-[#E5E5E5] dark:border-[#262626] ${className}`}>
      <p className="text-xs font-semibold text-[#737373] dark:text-neutral-400 uppercase tracking-wider">
        {label}
      </p>
      <p className={`text-2xl font-bold mt-1.5 ${colorMap[color] || colorMap.default}`}>
        {value}
      </p>
      {subtext && (
        <p className="text-xs text-[#737373] dark:text-neutral-400 mt-1">
          {subtext}
        </p>
      )}
    </Card>
  );
}
