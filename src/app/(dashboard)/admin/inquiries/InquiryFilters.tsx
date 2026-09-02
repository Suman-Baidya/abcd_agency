"use client";

import React, { useTransition, useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

interface InquiryFiltersProps {
  tabCounts: Record<string, number>;
}

const TABS = [
  { label: "All" },
  { label: "Unread" },
  { label: "Replied" },
  { label: "Trash" },
] as const;

export function InquiryFilters({ tabCounts }: InquiryFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const currentTab = searchParams.get("tab") || "Unread";
  const currentSort = searchParams.get("sort") || "newest";

  // Debounced search
  useEffect(() => {
    const currentQ = searchParams.get("q") || "";
    if (searchQuery === currentQ) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchQuery) {
        params.set("q", searchQuery);
      } else {
        params.delete("q");
      }
      params.set("page", "1");

      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, pathname, router, searchParams]);

  const handleTabClick = (tabLabel: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabLabel);
    params.set("page", "1");

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newSort && newSort !== "newest") {
      params.set("sort", newSort);
    } else {
      params.delete("sort");
    }
    params.set("page", "1");

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Left side: Tab type status filter */}
      <div id="admin-inquiries-tabs" className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
        {TABS.map((t) => {
          const isSelected = currentTab === t.label;
          const count = tabCounts[t.label];

          return (
            <button
              key={t.label}
              onClick={() => handleTabClick(t.label)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                isSelected
                  ? "bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] shadow-xs"
                  : "text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]"
              }`}
            >
              <span>{t.label}</span>
              {typeof count === "number" && (
                <span
                  className={`px-1.5 py-0.2 text-[10px] rounded-md font-mono ${
                    isSelected
                      ? "bg-white/20 text-white dark:bg-black/20 dark:text-black"
                      : "bg-[#E5E5E5] text-[#0A0A0A] dark:bg-[#262626] dark:text-neutral-300"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Right side: Search & Sort controls */}
      <div id="admin-inquiries-search" className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
        {/* Search Input Controls */}
        <div className="relative flex-1 sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
          <input
            type="text"
            placeholder="Search inquiries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : isPending ? (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-3 h-3 border-2 border-[#737373] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : null}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-1.5 shrink-0">
          <select
            value={currentSort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="text-xs border border-[#E5E5E5] dark:border-[#262626] bg-transparent rounded-lg px-3 py-2 font-medium text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white cursor-pointer"
          >
            <option value="newest" className="dark:bg-[#111111]">Sort: Newest</option>
            <option value="oldest" className="dark:bg-[#111111]">Sort: Oldest</option>
            <option value="a-z" className="dark:bg-[#111111]">Sort: Name (A-Z)</option>
            <option value="z-a" className="dark:bg-[#111111]">Sort: Name (Z-A)</option>
          </select>
        </div>
      </div>
    </div>
  );
}
