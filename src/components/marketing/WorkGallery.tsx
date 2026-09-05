"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  SlidersHorizontal,
  Briefcase,
  RotateCcw,
  Sparkles
} from "lucide-react";
import { ProjectCard } from "@/components/ui/ProjectCard";

export interface SerializedProject {
  title: string;
  slug: string;
  category: string;
  tagline: string;
  summary: string;
  impact: string;
  techStack: string[];
  createdAt: string;
}

interface WorkGalleryProps {
  initialProjects: SerializedProject[];
}

export function WorkGallery({ initialProjects }: WorkGalleryProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const galleryRef = useRef<HTMLDivElement>(null);

  // Read initial states from URL params or defaults
  const paramQuery = searchParams.get("q") || "";
  const paramCategory = searchParams.get("category") || "All";
  const paramSort = searchParams.get("sort") || "newest";
  const paramPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  const [searchQuery, setSearchQuery] = useState(paramQuery);
  const [selectedCategory, setSelectedCategory] = useState(paramCategory);
  const [sortBy, setSortBy] = useState(paramSort);
  const [currentPage, setCurrentPage] = useState(paramPage);
  const [pageSize, setPageSize] = useState<number>(6);

  // Sync state if URL query params change externally (e.g. browser back/forward)
  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
    setSelectedCategory(searchParams.get("category") || "All");
    setSortBy(searchParams.get("sort") || "newest");
    setCurrentPage(Math.max(1, parseInt(searchParams.get("page") || "1", 10)));
  }, [searchParams]);

  // Extract distinct categories and their counts
  const { categories, categoryCounts } = useMemo(() => {
    const counts: Record<string, number> = {};
    const catSet = new Set<string>();

    initialProjects.forEach((p) => {
      const cat = p.category?.trim() || "Uncategorized";
      catSet.add(cat);
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const sortedCats = Array.from(catSet).sort((a, b) => a.localeCompare(b));
    return {
      categories: ["All", ...sortedCats],
      categoryCounts: counts,
    };
  }, [initialProjects]);

  // Helper to update URL search params quietly
  const updateUrlParams = (newQ: string, newCat: string, newSort: string, newPage: number) => {
    const params = new URLSearchParams();
    if (newQ.trim()) params.set("q", newQ.trim());
    if (newCat && newCat !== "All") params.set("category", newCat);
    if (newSort && newSort !== "newest") params.set("sort", newSort);
    if (newPage > 1) params.set("page", newPage.toString());

    const qs = params.toString();
    const newUrl = qs ? `${pathname}?${qs}` : pathname;
    router.replace(newUrl, { scroll: false });
  };

  // Filter & Sort Logic
  const filteredAndSortedProjects = useMemo(() => {
    let result = [...initialProjects];

    // 1. Filter by Category
    if (selectedCategory !== "All") {
      result = result.filter(
        (p) => (p.category?.trim() || "").toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // 2. Filter by Search Query
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter((p) => {
        const titleMatch = p.title?.toLowerCase().includes(query);
        const taglineMatch = p.tagline?.toLowerCase().includes(query);
        const summaryMatch = p.summary?.toLowerCase().includes(query);
        const categoryMatch = p.category?.toLowerCase().includes(query);
        const techMatch = Array.isArray(p.techStack) && p.techStack.some((t) => t.toLowerCase().includes(query));
        return titleMatch || taglineMatch || summaryMatch || categoryMatch || techMatch;
      });
    }

    // 3. Sorting System
    result.sort((a, b) => {
      if (sortBy === "category") {
        const catCompare = (a.category || "").localeCompare(b.category || "");
        if (catCompare !== 0) return catCompare;
        return (a.title || "").localeCompare(b.title || "");
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "alpha-asc") {
        return (a.title || "").localeCompare(b.title || "");
      }
      if (sortBy === "alpha-desc") {
        return (b.title || "").localeCompare(a.title || "");
      }
      // default: newest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [initialProjects, selectedCategory, searchQuery, sortBy]);

  // Pagination Calculations
  const totalItems = filteredAndSortedProjects.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startItem = totalItems > 0 ? (safeCurrentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(safeCurrentPage * pageSize, totalItems);

  const paginatedProjects = useMemo(() => {
    const startIdx = (safeCurrentPage - 1) * pageSize;
    return filteredAndSortedProjects.slice(startIdx, startIdx + pageSize);
  }, [filteredAndSortedProjects, safeCurrentPage, pageSize]);

  // Handlers
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
    updateUrlParams(searchQuery, cat, sortBy, 1);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
    updateUrlParams(val, selectedCategory, sortBy, 1);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(1);
    updateUrlParams(searchQuery, selectedCategory, sort, 1);
  };

  const handlePageChange = (page: number) => {
    const targetPage = Math.max(1, Math.min(totalPages, page));
    setCurrentPage(targetPage);
    updateUrlParams(searchQuery, selectedCategory, sortBy, targetPage);

    // Smooth scroll to top of gallery
    if (galleryRef.current) {
      const topOffset = galleryRef.current.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: topOffset, behavior: "smooth" });
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSortBy("newest");
    setCurrentPage(1);
    updateUrlParams("", "All", "newest", 1);
  };

  const hasActiveFilters = searchQuery.trim() !== "" || selectedCategory !== "All" || sortBy !== "newest";

  return (
    <div ref={galleryRef} className="space-y-8">
      {/* Control Bar: Compact Search, Category Select Box, Sort, and Items Per Page */}
      <div className="rounded-2xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] p-2 sm:p-3 shadow-2xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
          {/* Left: Compact Search Bar */}
          <div className="relative w-full sm:w-64 md:w-72 shrink-0">
            <Search className="w-4 h-4 text-[#737373] dark:text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search case studies..."
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-xl bg-[#FBFBFB] dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white placeholder:text-[#737373] dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] dark:focus:ring-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => handleSearchChange("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#0A0A0A] dark:text-neutral-400 dark:hover:text-white cursor-pointer transition-colors p-0.5"
                title="Clear search query"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right: Category Select Box, Sort By, Items Per Page, Reset Button */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 w-full lg:w-auto justify-between lg:justify-end">
            {/* Category Select Box */}
            <div className="flex items-center gap-1.5 flex-1 sm:flex-initial min-w-0">
              <label htmlFor="work-category-select" className="text-xs font-semibold text-[#737373] dark:text-neutral-400 whitespace-nowrap hidden sm:inline">
                Category:
              </label>
              <div className="relative w-full sm:w-auto min-w-0">
                <select
                  id="work-category-select"
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full sm:w-auto appearance-none pl-2.5 pr-6 sm:pr-8 py-2 text-xs font-semibold border border-[#E5E5E5] dark:border-[#262626] rounded-xl bg-[#FBFBFB] dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] dark:focus:ring-white cursor-pointer transition-all sm:max-w-[220px] truncate"
                >
                  {categories.map((cat) => {
                    const count = cat === "All" ? initialProjects.length : (categoryCounts[cat] || 0);
                    const label = cat === "All" ? "All Categories" : cat;
                    return (
                      <option key={cat} value={cat} className="dark:bg-[#111111]">
                        {label} ({count})
                      </option>
                    );
                  })}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#737373] dark:text-neutral-400 absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Sort Select Box */}
            <div className="flex items-center gap-1.5 flex-1 sm:flex-initial min-w-0">
              <label htmlFor="work-sort-select" className="text-xs font-semibold text-[#737373] dark:text-neutral-400 whitespace-nowrap hidden sm:inline">
                Sort:
              </label>
              <div className="relative w-full sm:w-auto min-w-0">
                <select
                  id="work-sort-select"
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="w-full sm:w-auto appearance-none pl-2.5 pr-6 sm:pr-8 py-2 text-xs font-semibold border border-[#E5E5E5] dark:border-[#262626] rounded-xl bg-[#FBFBFB] dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] dark:focus:ring-white cursor-pointer transition-all truncate"
                >
                  <option value="newest" className="dark:bg-[#111111]">Newest First</option>
                  <option value="oldest" className="dark:bg-[#111111]">Oldest First</option>
                  <option value="category" className="dark:bg-[#111111]">Category (A → Z)</option>
                  <option value="alpha-asc" className="dark:bg-[#111111]">Title (A → Z)</option>
                  <option value="alpha-desc" className="dark:bg-[#111111]">Title (Z → A)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#737373] dark:text-neutral-400 absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Page Size Dropdown */}
            <div className="flex items-center gap-1.5 shrink-0 sm:flex-initial">
              <label htmlFor="work-pagesize-select" className="text-xs font-semibold text-[#737373] dark:text-neutral-400 whitespace-nowrap hidden sm:inline">
                Show:
              </label>
              <div className="relative">
                <select
                  id="work-pagesize-select"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="appearance-none pl-2 sm:pl-2.5 pr-5 sm:pr-7 py-2 text-xs font-semibold border border-[#E5E5E5] dark:border-[#262626] rounded-xl bg-[#FBFBFB] dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] dark:focus:ring-white cursor-pointer transition-all"
                >
                  <option value={6} className="dark:bg-[#111111]">6 / page</option>
                  <option value={9} className="dark:bg-[#111111]">9 / page</option>
                  <option value={12} className="dark:bg-[#111111]">12 / page</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#737373] dark:text-neutral-400 absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Reset Filters Icon Button if active */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="shrink-0 inline-flex items-center gap-1 px-2 sm:px-2.5 py-2 text-xs font-semibold border border-[#E5E5E5] dark:border-[#262626] rounded-xl text-[#737373] hover:text-[#0A0A0A] dark:text-neutral-400 dark:hover:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#161616] transition-colors cursor-pointer"
                title="Reset all filters"
                aria-label="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Results Header / Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#737373] dark:text-neutral-400 px-1">
        <div>
          Showing{" "}
          <span className="font-bold text-[#0A0A0A] dark:text-white">
            {totalItems > 0 ? startItem : 0}
          </span>{" "}
          to{" "}
          <span className="font-bold text-[#0A0A0A] dark:text-white">{endItem}</span>{" "}
          of{" "}
          <span className="font-bold text-[#0A0A0A] dark:text-white">{totalItems}</span>{" "}
          case {totalItems === 1 ? "study" : "studies"}
          {selectedCategory !== "All" && (
            <span> in &ldquo;{selectedCategory}&rdquo;</span>
          )}
          {searchQuery.trim() && (
            <span> matching &ldquo;{searchQuery}&rdquo;</span>
          )}
        </div>

        {sortBy !== "newest" && (
          <div className="font-mono text-[11px] text-[#737373] dark:text-neutral-400">
            Sorted by: <span className="font-semibold text-[#0A0A0A] dark:text-white">{sortBy.replace("-", " ")}</span>
          </div>
        )}
      </div>

      {/* Projects Grid */}
      {paginatedProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {paginatedProjects.map((project) => (
            <ProjectCard key={project.slug} project={project as any} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 sm:p-16 text-center border border-dashed border-[#E5E5E5] dark:border-[#262626] rounded-2xl bg-white dark:bg-[#111111] space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#F5F5F5] dark:bg-[#1A1A1A] flex items-center justify-center text-[#737373] dark:text-neutral-400">
            <Briefcase className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-[#0A0A0A] dark:text-white">
              No matching case studies found
            </h3>
            <p className="text-xs text-[#737373] dark:text-neutral-400 leading-relaxed">
              We couldn&apos;t find any projects matching your current filters. Try refining your search keyword or switching categories.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset all filters
          </button>
        </div>
      )}

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="pt-6 border-t border-[#E5E5E5] dark:border-[#262626] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs font-medium text-[#737373] dark:text-neutral-400">
            Page <span className="font-semibold text-[#0A0A0A] dark:text-white">{safeCurrentPage}</span> of{" "}
            <span className="font-semibold text-[#0A0A0A] dark:text-white">{totalPages}</span>
          </p>

          <div className="flex items-center gap-1.5">
            {/* Previous Page Button */}
            <button
              type="button"
              onClick={() => handlePageChange(safeCurrentPage - 1)}
              disabled={safeCurrentPage <= 1}
              className="inline-flex items-center gap-1 px-3 py-2 border border-[#E5E5E5] dark:border-[#262626] rounded-lg text-xs font-semibold text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white hover:border-[#0A0A0A] dark:hover:border-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white dark:bg-[#111111]"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Prev</span>
            </button>

            {/* Numbered Page Buttons */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                // If many pages, only show first, last, and around current
                const isNearCurrent = Math.abs(p - safeCurrentPage) <= 1;
                const isFirstOrLast = p === 1 || p === totalPages;

                if (!isNearCurrent && !isFirstOrLast) {
                  if (p === 2 || p === totalPages - 1) {
                    return (
                      <span key={p} className="px-1 text-xs text-[#737373] dark:text-neutral-500 font-mono">
                        ...
                      </span>
                    );
                  }
                  return null;
                }

                const isCurrent = p === safeCurrentPage;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePageChange(p)}
                    className={`min-w-[34px] h-[34px] px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${isCurrent
                      ? "bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] shadow-xs"
                      : "border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white hover:border-[#0A0A0A] dark:hover:border-white"
                      }`}
                    aria-current={isCurrent ? "page" : undefined}
                  >
                    {p}
                  </button>
                );
              })}
            </div>

            {/* Next Page Button */}
            <button
              type="button"
              onClick={() => handlePageChange(safeCurrentPage + 1)}
              disabled={safeCurrentPage >= totalPages}
              className="inline-flex items-center gap-1 px-3 py-2 border border-[#E5E5E5] dark:border-[#262626] rounded-lg text-xs font-semibold text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white hover:border-[#0A0A0A] dark:hover:border-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white dark:bg-[#111111]"
              aria-label="Next page"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function WorkGallerySkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Control bar skeleton */}
      <div className="rounded-2xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          <div className="h-9 bg-[#F5F5F5] dark:bg-[#1A1A1A] rounded-xl w-full sm:w-64 md:w-72" />
          <div className="flex items-center gap-3">
            <div className="h-9 w-40 bg-[#F5F5F5] dark:bg-[#1A1A1A] rounded-xl" />
            <div className="h-9 w-32 bg-[#F5F5F5] dark:bg-[#1A1A1A] rounded-xl" />
            <div className="h-9 w-24 bg-[#F5F5F5] dark:bg-[#1A1A1A] rounded-xl" />
          </div>
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div
            key={idx}
            className="rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] h-96 flex flex-col overflow-hidden"
          >
            <div className="h-56 bg-[#F5F5F5] dark:bg-[#161616]" />
            <div className="p-6 space-y-3 flex-1">
              <div className="h-5 bg-[#E5E5E5] dark:bg-[#262626] rounded-md w-3/4" />
              <div className="h-4 bg-[#F5F5F5] dark:bg-[#1A1A1A] rounded-md w-1/2" />
              <div className="h-12 bg-[#F5F5F5] dark:bg-[#1A1A1A] rounded-md w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

