"use client";

import React, { useState, useMemo } from "react";
import { Search, X, Layers, Cpu, Sparkles, Filter } from "lucide-react";
import { EcoSystemCard, EcoSystemPlatformData } from "./EcoSystemCard";

interface EcoSystemGalleryProps {
  initialPlatforms: EcoSystemPlatformData[];
}

export function EcoSystemGallery({ initialPlatforms }: EcoSystemGalleryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = useMemo(() => {
    const set = new Set<string>();
    initialPlatforms.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ["All", ...Array.from(set)];
  }, [initialPlatforms]);

  const filteredPlatforms = useMemo(() => {
    return initialPlatforms.filter((platform) => {
      const matchesCategory =
        selectedCategory === "All" || platform.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        platform.name.toLowerCase().includes(q) ||
        platform.tagline.toLowerCase().includes(q) ||
        platform.description.toLowerCase().includes(q) ||
        (platform.targetAudience && platform.targetAudience.toLowerCase().includes(q)) ||
        platform.features.some((f) => f.toLowerCase().includes(q)) ||
        platform.techStack.some((t) => t.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [initialPlatforms, selectedCategory, searchQuery]);

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* Category Pills & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((cat) => {
            const count =
              cat === "All"
                ? initialPlatforms.length
                : initialPlatforms.filter((p) => p.category === cat).length;
            const isSelected = selectedCategory === cat;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A]"
                    : "border border-[#E5E5E5] dark:border-[#262626] bg-transparent text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white hover:border-neutral-400 dark:hover:border-neutral-600"
                }`}
              >
                {cat === "All" ? "All Systems" : cat} <span className="opacity-60 text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 text-[#737373] dark:text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search platforms & tools..."
            className="w-full pl-8 pr-7 py-1.5 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] dark:placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#0A0A0A] dark:text-neutral-400 dark:hover:text-white p-0.5 cursor-pointer"
              title="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Alternating Showcase Rows */}
      {filteredPlatforms.length > 0 ? (
        <div>
          {filteredPlatforms.map((platform, idx) => (
            <EcoSystemCard key={platform.id} platform={platform} index={idx} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-dashed border-[#E5E5E5] dark:border-[#262626] bg-[#FAFAFA] dark:bg-[#111111] space-y-3">
          <p className="text-sm font-semibold text-[#0A0A0A] dark:text-white">
            No platforms found matching your criteria
          </p>
          <p className="text-xs text-[#737373] dark:text-neutral-400 max-w-sm mx-auto">
            Try adjusting your search query or selecting &quot;All Platforms&quot;.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] hover:opacity-90 transition-opacity"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
