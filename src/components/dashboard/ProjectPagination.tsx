"use client";

import React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ProjectPagination({ totalItems }: { totalItems: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPage = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 20;
  const totalPages = Math.ceil(totalItems / limit);

  const updateUrl = (page: number, newLimit: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    params.set("limit", newLimit.toString());
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalItems);

  return (
    <div className="px-6 py-4 border-t border-[#E5E5E5] dark:border-[#262626] flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#737373] dark:text-neutral-400 uppercase tracking-wider">
            Rows per page:
          </span>
          <select 
            value={limit} 
            onChange={(e) => updateUrl(1, Number(e.target.value))}
            className="text-xs border border-[#E5E5E5] dark:border-[#262626] bg-transparent rounded-md px-2 py-1 font-medium text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white cursor-pointer"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
        <p className="text-xs font-medium text-[#737373] dark:text-neutral-400 hidden sm:block">
          Showing {totalItems > 0 ? startItem : 0} to {endItem} of {totalItems}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={() => updateUrl(currentPage - 1, limit)}
          disabled={currentPage <= 1}
          className="p-1.5 border border-[#E5E5E5] dark:border-[#262626] rounded-md text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white hover:border-[#0A0A0A] dark:hover:border-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="px-3 py-1.5 text-xs font-medium text-[#0A0A0A] dark:text-white bg-[#F5F5F5] dark:bg-[#111111] rounded-md border border-[#E5E5E5] dark:border-[#262626]">
          {currentPage} / {totalPages || 1}
        </span>
        <button 
          onClick={() => updateUrl(currentPage + 1, limit)}
          disabled={currentPage >= totalPages}
          className="p-1.5 border border-[#E5E5E5] dark:border-[#262626] rounded-md text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white hover:border-[#0A0A0A] dark:hover:border-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
