"use client";

import React, { useTransition, useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

export function ProjectFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const currentStatus = searchParams.get("status") || "All Status";

  // Debounced search
  useEffect(() => {
    const currentQ = searchParams.get("q") || "";
    if (searchQuery === currentQ) return; // Prevent infinite loop on URL update

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchQuery) {
        params.set("q", searchQuery);
      } else {
        params.delete("q");
      }
      
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, pathname, router, searchParams]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    
    if (newStatus && newStatus !== "All Status") {
      params.set("status", newStatus);
    } else {
      params.delete("status");
    }

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-3 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white w-48"
        />
        {isPending && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-3 h-3 border-2 border-[#737373] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      <select 
        value={currentStatus}
        onChange={handleStatusChange}
        className="text-xs border border-[#E5E5E5] dark:border-[#262626] bg-transparent rounded-md px-3 py-2 font-medium text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white cursor-pointer"
      >
        <option value="All Status">All Status</option>
        <option value="On Track">On Track</option>
        <option value="In Review">In Review</option>
        <option value="Delayed">Delayed</option>
        <option value="On Hold">On Hold</option>
      </select>
    </div>
  );
}
