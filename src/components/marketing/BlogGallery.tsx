"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Search, ArrowRight, BookOpen, Clock, Calendar } from "lucide-react";

export interface SerializedBlogPost {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  readTime: string;
  author: string;
  coverImage?: string | null;
  featured?: boolean;
  date: string;
}

export function BlogGallery({
  initialPosts = [],
}: {
  initialPosts: SerializedBlogPost[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(initialPosts.map((p) => p.category)))];

  const filteredPosts = initialPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || post.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-10">
      {/* Search & Category Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-8 border-b border-[#E5E5E5] dark:border-[#262626]">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-white ${
                selectedCategory === cat
                  ? "bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] shadow-xs"
                  : "bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Field */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737373]" />
          <input
            type="text"
            placeholder="Search articles & insights..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111] text-[#0A0A0A] dark:text-white placeholder-[#737373] focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] dark:focus:ring-white"
          />
        </div>
      </div>

      {/* Articles Grid */}
      {filteredPosts.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-[#E5E5E5] dark:border-[#262626] rounded-2xl bg-white dark:bg-[#111111]/50 p-8">
          <BookOpen className="w-12 h-12 mx-auto text-[#737373] opacity-40 mb-3" />
          <h3 className="text-base font-bold text-[#0A0A0A] dark:text-white">
            No matching articles found
          </h3>
          <p className="text-xs text-[#737373] mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or selecting a different category filter.
          </p>
          {(searchQuery || selectedCategory !== "All") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="mt-4 px-4 py-1.5 rounded-lg text-xs font-semibold border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] hover:bg-[#F5F5F5] dark:hover:bg-[#1C1C1C] text-[#0A0A0A] dark:text-white transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col justify-between rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:hover:border-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-white"
            >
              {/* Cover Image or Editorial Banner (Reduced height for sleek proportion) */}
              {post.coverImage ? (
                <div className="relative w-full aspect-[2/1] overflow-hidden bg-neutral-100 dark:bg-neutral-900 border-b border-[#E5E5E5] dark:border-[#262626]">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  {post.featured && (
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#0A0A0A]/90 dark:bg-white/90 text-white dark:text-[#0A0A0A] backdrop-blur-xs">
                        Featured
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative w-full aspect-[2/1] overflow-hidden bg-gradient-to-br from-[#F8F8F8] to-[#EFEFEF] dark:from-[#141414] dark:to-[#0C0C0C] border-b border-[#E5E5E5] dark:border-[#262626] flex items-center justify-center p-5">
                  <div className="absolute inset-0 bg-[radial-gradient(#0A0A0A_1px,transparent_1px)] dark:bg-[radial-gradient(#FFFFFF_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
                  <div className="flex flex-col items-center justify-center text-center z-10">
                    <div className="w-12 h-12 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] flex items-center justify-center mb-2 shadow-xs group-hover:scale-110 transition-transform">
                      <BookOpen className="w-5 h-5 text-[#0A0A0A] dark:text-white" />
                    </div>
                    <span className="text-[11px] font-mono text-[#737373] uppercase tracking-wider">
                      {post.category}
                    </span>
                  </div>
                  {post.featured && (
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A]">
                        Featured
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center flex-wrap gap-2.5 mb-4">
                    <Badge variant="muted" size="sm">
                      {post.category}
                    </Badge>
                    <span className="text-xs font-mono text-[#737373] dark:text-neutral-400">
                      {post.readTime}
                    </span>
                    <span className="text-xs font-mono text-[#737373] dark:text-neutral-400">•</span>
                    <span className="text-xs font-mono text-[#737373] dark:text-neutral-400">
                      {post.date}
                    </span>
                    {!post.coverImage && post.featured && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A]">
                        Featured
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-[#0A0A0A] dark:text-white tracking-tight group-hover:underline underline-offset-4 mb-3 leading-snug">
                    {post.title}
                  </h2>

                  <p className="text-sm text-[#737373] dark:text-neutral-400 leading-relaxed mb-6 line-clamp-3">
                    {post.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E5E5E5] dark:border-[#262626] flex items-center justify-between mt-auto">
                  <span className="text-xs font-semibold text-[#0A0A0A] dark:text-white">
                    By {post.author}
                  </span>
                  <span className="text-xs font-bold text-[#0A0A0A] dark:text-white inline-flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform">
                    Read Article <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
