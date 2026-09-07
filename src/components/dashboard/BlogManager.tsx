"use client";

import React, { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { StatCard } from "@/components/dashboard/StatCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ImageUploadInput } from "@/components/ui/ImageUploadInput";
import { slugify } from "@/lib/slugify";
import {
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  toggleBlogPostPublished,
} from "@/app/(dashboard)/admin/settings/blogActions";
import {
  BookOpen,
  Plus,
  Search,
  Pencil,
  Trash2,
  ExternalLink,
  Check,
  X,
  Clock,
  Tag,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Eye,
  FileText,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { BlogCategoryManager, BlogCategoryItem } from "@/components/dashboard/BlogCategoryManager";

export interface BlogPostItem {
  id: string;
  slug: string;
  title: string;
  pageTitle?: string | null;
  summary: string;
  content: string;
  category: string;
  readTime: string;
  author: string;
  coverImage?: string | null;
  published: boolean;
  featured: boolean;
  order: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

const CATEGORY_PRESETS = [
  "Engineering",
  "AI & Automation",
  "Architecture",
  "Cloud & DevOps",
  "Design & UX",
  "Case Study",
];

export function BlogManager({
  initialBlogs = [],
  initialCategories = [],
}: {
  initialBlogs: BlogPostItem[];
  initialCategories?: BlogCategoryItem[];
}) {
  const router = useRouter();
  const [blogs, setBlogs] = useState<BlogPostItem[]>(initialBlogs);
  const [categoriesList, setCategoriesList] = useState<BlogCategoryItem[]>(initialCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<"All" | "Published" | "Draft">("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"newest" | "title" | "category">("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogPostItem | null>(null);
  const [deletingBlog, setDeletingBlog] = useState<BlogPostItem | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [pageTitle, setPageTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isCustomSlug, setIsCustomSlug] = useState(false);
  const [category, setCategory] = useState("Engineering");
  const [customCategory, setCustomCategory] = useState("");
  const [author, setAuthor] = useState("ABCD Team");
  const [readTime, setReadTime] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [published, setPublished] = useState(true);
  const [featured, setFeatured] = useState(false);

  const [isPending, startTransition] = useTransition();

  // Reset and open modal
  const openCreateModal = () => {
    setEditingBlog(null);
    setTitle("");
    setPageTitle("");
    setSlug("");
    setIsCustomSlug(false);
    setCategory("Engineering");
    setCustomCategory("");
    setAuthor("ABCD Team");
    setReadTime("5 min read");
    setSummary("");
    setContent("");
    setCoverImage(null);
    setPublished(true);
    setFeatured(false);
    setIsPreviewMode(false);
    setIsModalOpen(true);
  };

  const openEditModal = (blog: BlogPostItem) => {
    setEditingBlog(blog);
    setTitle(blog.title);
    setPageTitle(blog.pageTitle || "");
    setSlug(blog.slug);
    setIsCustomSlug(true);
    if (CATEGORY_PRESETS.includes(blog.category)) {
      setCategory(blog.category);
      setCustomCategory("");
    } else {
      setCategory("Other");
      setCustomCategory(blog.category);
    }
    setAuthor(blog.author || "ABCD Team");
    setReadTime(blog.readTime || "5 min read");
    setSummary(blog.summary);
    setContent(blog.content);
    setCoverImage(blog.coverImage || null);
    setPublished(blog.published);
    setFeatured(blog.featured || false);
    setIsPreviewMode(false);
    setIsModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isCustomSlug && !editingBlog) {
      setSlug(slugify(val));
    }
  };

  const handleContentChange = (val: string) => {
    setContent(val);
    if (!readTime || readTime === "5 min read") {
      const words = val.trim().split(/\s+/).filter(Boolean).length;
      const mins = Math.max(1, Math.ceil(words / 200));
      setReadTime(`${mins} min read`);
    }
  };

  // Submit Handler
  const handleSaveBlog = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please provide an article title");
      return;
    }
    if (!summary.trim()) {
      toast.error("Please provide a summary");
      return;
    }
    if (!content.trim()) {
      toast.error("Please provide the article content");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const formCoverImage = (formData.get("coverImage") as string)?.trim();
    const finalCoverImage = formCoverImage || coverImage || null;

    const finalCategory =
      category === "Other" && customCategory.trim()
        ? customCategory.trim()
        : category;

    const payload = {
      title: title.trim(),
      pageTitle: pageTitle.trim() || null,
      slug: slug.trim() ? slugify(slug) : slugify(title),
      summary: summary.trim(),
      content: content.trim(),
      category: finalCategory,
      readTime: readTime.trim() || "5 min read",
      author: author.trim() || "ABCD Team",
      coverImage: finalCoverImage,
      published,
      featured,
    };

    startTransition(async () => {
      try {
        if (editingBlog) {
          const res = await updateBlogPost(editingBlog.id, payload);
          if (res.success && res.post) {
            setBlogs((prev) =>
              prev.map((b) => (b.id === editingBlog.id ? (res.post as any) : b))
            );
            toast.success(`Article "${payload.title}" updated!`);
            setIsModalOpen(false);
            router.refresh();
          } else {
            toast.error(res.error || "Failed to update article");
          }
        } else {
          const res = await createBlogPost(payload);
          if (res.success && res.post) {
            setBlogs((prev) => [res.post as any, ...prev]);
            toast.success(`Article "${payload.title}" published!`);
            setIsModalOpen(false);
            router.refresh();
          } else {
            toast.error(res.error || "Failed to create article");
          }
        }
      } catch (err: any) {
        let errorMsg = err.message || "Failed to save blog post";
        try {
          const parsed = JSON.parse(errorMsg);
          if (Array.isArray(parsed) && parsed[0]?.message) {
            errorMsg = parsed[0].message;
          }
        } catch {}
        toast.error(errorMsg);
      }
    });
  };

  // Delete Handler
  const handleConfirmDelete = () => {
    if (!deletingBlog) return;
    const { id, title: blogTitle } = deletingBlog;

    startTransition(async () => {
      try {
        await deleteBlogPost(id);
        setBlogs((prev) => prev.filter((b) => b.id !== id));
        toast.success(`Article "${blogTitle}" deleted`);
        setDeletingBlog(null);
        router.refresh();
      } catch (err: any) {
        toast.error(err.message || "Failed to delete blog post");
      }
    });
  };

  // Toggle Publish
  const handleTogglePublish = (blog: BlogPostItem) => {
    startTransition(async () => {
      try {
        const res = await toggleBlogPostPublished(blog.id);
        setBlogs((prev) =>
          prev.map((b) =>
            b.id === blog.id ? { ...b, published: res.published } : b
          )
        );
        toast.success(
          `Article marked as ${res.published ? "Published" : "Draft"}`
        );
        router.refresh();
      } catch {
        toast.error("Failed to update publish state");
      }
    });
  };

  // Filter & Sort Logic
  const statusCounts = useMemo(() => {
    return {
      All: blogs.length,
      Published: blogs.filter((b) => b.published).length,
      Draft: blogs.filter((b) => !b.published).length,
    };
  }, [blogs]);

  const availableCategories = useMemo(() => {
    const listNames = categoriesList.map((c) => c.name);
    const blogCats = blogs.map((b) => b.category);
    return Array.from(new Set([...listNames, ...blogCats, ...CATEGORY_PRESETS])).filter(Boolean);
  }, [categoriesList, blogs]);

  const filterCategories = useMemo(() => {
    const listNames = categoriesList.map((c) => c.name);
    const blogCats = blogs.map((b) => b.category);
    return ["All", ...Array.from(new Set([...listNames, ...blogCats]))];
  }, [categoriesList, blogs]);

  const filteredBlogs = useMemo(() => {
    return blogs
      .filter((b) => {
        const query = searchQuery.toLowerCase();
        const matchesQuery =
          b.title.toLowerCase().includes(query) ||
          b.summary.toLowerCase().includes(query) ||
          b.category.toLowerCase().includes(query) ||
          b.author.toLowerCase().includes(query) ||
          b.slug.toLowerCase().includes(query);

        const matchesStatus =
          selectedStatus === "All"
            ? true
            : selectedStatus === "Published"
            ? b.published
            : !b.published;

        const matchesCategory =
          selectedCategory === "All" || b.category === selectedCategory;

        return matchesQuery && matchesStatus && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === "title") return a.title.localeCompare(b.title);
        if (sortBy === "category") return a.category.localeCompare(b.category);
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [blogs, searchQuery, selectedStatus, selectedCategory, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredBlogs.length / pageSize) || 1;
  const paginatedBlogs = filteredBlogs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const featuredCount = blogs.filter((b) => b.featured).length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. Header (Matching Projects / Clients / Finance standard) */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">
            Blog & Editorial
          </h1>
          <p className="text-sm text-[#737373] dark:text-neutral-400 mt-1">
            Author, curate, and publish engineering articles and technical insights.
          </p>
        </div>

        <div id="admin-blog-actions" className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          <BlogCategoryManager
            categories={categoriesList}
            onCategoriesChange={(updated) => setCategoriesList(updated)}
          />

          <Link
            href="/blog"
            target="_blank"
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] hover:bg-[#F5F5F5] dark:hover:bg-[#1C1C1C] text-xs font-semibold text-[#0A0A0A] dark:text-white transition-colors cursor-pointer w-full sm:w-auto"
          >
            <span>View Live</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <Button
            id="blog-write-button"
            variant="primary"
            size="sm"
            onClick={openCreateModal}
            className="flex items-center justify-center gap-1.5 text-xs w-full sm:w-auto cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Write Article</span>
          </Button>
        </div>
      </div>

      {/* 2. KPI Stats Cards (Standard 4-Column Grid) */}
      <div id="admin-blog-kpi" className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Articles" value={blogs.length} />
        <StatCard label="Live on Site" value={statusCounts.Published} color="emerald" />
        <StatCard label="Drafts" value={statusCounts.Draft} color="amber" />
        <StatCard label="Featured" value={featuredCount} />
      </div>

      {/* 3. Table Container Card */}
      <Card
        id="admin-blog-table"
        className="overflow-hidden !p-0 rounded-xl border border-[#E5E5E5] dark:border-[#262626] shadow-xs bg-white dark:bg-[#0A0A0A]"
      >
        {/* Filter Toolbar */}
        <div className="p-4 sm:p-5 border-b border-[#E5E5E5] dark:border-[#262626] flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#0A0A0A]">
          {/* Status Filter Tabs with Counts */}
          <div id="admin-blog-tabs" className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {(["All", "Published", "Draft"] as const).map((st) => {
              const isSelected = selectedStatus === st;
              const count = statusCounts[st];
              return (
                <button
                  key={st}
                  onClick={() => {
                    setSelectedStatus(st);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? "bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] shadow-xs"
                      : "text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]"
                  }`}
                >
                  <span>{st}</span>
                  <span
                    className={`px-1.5 py-0.2 text-[10px] rounded-md font-mono ${
                      isSelected
                        ? "bg-white/20 text-white dark:bg-black/20 dark:text-black"
                        : "bg-[#E5E5E5] text-[#0A0A0A] dark:bg-[#262626] dark:text-neutral-300"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search, Category, and Sort Controls */}
          <div id="admin-blog-search" className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
              <input
                type="text"
                placeholder="Search articles, slug, tags..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-8 py-2 text-xs border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            {filterCategories.length > 2 && (
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="text-xs border border-[#E5E5E5] dark:border-[#262626] bg-transparent rounded-lg px-3 py-2 font-medium text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white cursor-pointer"
              >
                {filterCategories.map((c) => (
                  <option key={c} value={c} className="dark:bg-[#111111]">
                    {c === "All" ? "All Categories" : c}
                  </option>
                ))}
              </select>
            )}

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs border border-[#E5E5E5] dark:border-[#262626] bg-transparent rounded-lg px-3 py-2 font-medium text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white cursor-pointer"
            >
              <option value="newest" className="dark:bg-[#111111]">Sort: Newest</option>
              <option value="title" className="dark:bg-[#111111]">Sort: Title (A-Z)</option>
              <option value="category" className="dark:bg-[#111111]">Sort: Category</option>
            </select>
          </div>
        </div>

        {/* List Table (Matching Projects & Clients thead and typography) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#262626] dark:text-neutral-300">
            <thead className="text-[11px] font-semibold uppercase tracking-wider text-[#525252] dark:text-[#A3A3A3] bg-[#F9F9F9] dark:bg-[#0E0E0E] border-b border-[#E5E5E5] dark:border-[#262626]">
              <tr>
                <th className="px-5 py-3.5 w-12 text-center whitespace-nowrap">SL</th>
                <th className="px-5 py-3.5 min-w-[280px] whitespace-nowrap">Article</th>
                <th className="px-5 py-3.5 min-w-[110px] text-center whitespace-nowrap">Status</th>
                <th className="px-5 py-3.5 min-w-[130px] text-center whitespace-nowrap">Category</th>
                <th className="px-5 py-3.5 min-w-[130px] whitespace-nowrap">Author</th>
                <th className="px-5 py-3.5 min-w-[110px] whitespace-nowrap">Date</th>
                <th className="px-5 py-3.5 text-right w-32 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5] dark:divide-[#262626] bg-white dark:bg-[#0A0A0A]">
              {paginatedBlogs.length > 0 ? (
                paginatedBlogs.map((post, index) => {
                  const sl = (currentPage - 1) * pageSize + index + 1;
                  const dateStr = post.createdAt
                    ? new Date(post.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Recent";

                  return (
                    <tr
                      key={post.id}
                      className="hover:bg-[#F9F9F9] dark:hover:bg-[#141414] transition-colors group"
                    >
                      {/* SL */}
                      <td className="px-5 py-4 text-center text-xs font-mono font-medium text-[#737373] dark:text-neutral-500 whitespace-nowrap">
                        {sl < 10 ? `0${sl}` : sl}
                      </td>

                      {/* Article Details & Cover Thumbnail */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3.5">
                          {post.coverImage ? (
                            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#111111] shrink-0 shadow-2xs">
                              <img
                                src={post.coverImage}
                                alt={post.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg border border-dashed border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5]/60 dark:bg-[#111111]/60 shrink-0 flex flex-col items-center justify-center text-[#737373] text-[10px]">
                              <BookOpen className="w-4 h-4 opacity-40 mb-0.5" />
                              <span>No cover</span>
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#0A0A0A] dark:text-white tracking-tight text-sm line-clamp-1">
                                {post.title}
                              </span>
                              {post.featured && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] shrink-0">
                                  Featured
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[#737373] dark:text-neutral-400 line-clamp-1 mt-0.5">
                              {post.summary}
                            </p>
                            <span className="text-[11px] font-mono text-[#737373] mt-1 block">
                              /blog/{post.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status Toggle Badge */}
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleTogglePublish(post)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                            post.published
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                              : "bg-neutral-100 dark:bg-neutral-800 text-[#737373] border-[#E5E5E5] dark:border-[#333] hover:text-[#0A0A0A] dark:hover:text-white"
                          }`}
                          title="Click to toggle publish status"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              post.published ? "bg-emerald-600 dark:bg-emerald-400" : "bg-neutral-400"
                            }`}
                          />
                          <span>{post.published ? "Live" : "Draft"}</span>
                        </button>
                      </td>

                      {/* Category - Center Aligned */}
                      <td className="px-5 py-4 text-center whitespace-nowrap">
                        <div className="flex justify-center">
                          <Badge variant="muted" size="sm">
                            {post.category}
                          </Badge>
                        </div>
                      </td>

                      {/* Author & Read Time - Truncate with dot dot */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <p
                          className="text-xs font-semibold text-[#0A0A0A] dark:text-white truncate max-w-[110px] sm:max-w-[130px]"
                          title={post.author}
                        >
                          {post.author}
                        </p>
                        <p className="text-[11px] font-mono text-[#737373] dark:text-neutral-400 mt-0.5">
                          {post.readTime}
                        </p>
                      </td>

                      {/* Created Date */}
                      <td className="px-5 py-4 text-xs font-mono text-[#737373] dark:text-neutral-400 whitespace-nowrap">
                        {dateStr}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] hover:bg-[#F0F0F0] dark:hover:bg-[#1E1E1E] text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white transition-colors"
                            title="View article on live site"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            onClick={() => openEditModal(post)}
                            className="p-1.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] hover:bg-[#F0F0F0] dark:hover:bg-[#1E1E1E] text-[#0A0A0A] dark:text-white transition-colors cursor-pointer"
                            title="Edit article"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingBlog(post)}
                            className="p-1.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                            title="Delete article"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-[#737373]">
                    <BookOpen className="w-10 h-10 mx-auto opacity-30 mb-2" />
                    <p className="text-sm font-semibold text-[#0A0A0A] dark:text-white">
                      No articles found
                    </p>
                    <p className="text-xs text-[#737373] mt-1">
                      {searchQuery || selectedStatus !== "All" || selectedCategory !== "All"
                        ? "Try clearing filters to see more results."
                        : "Start by creating your first technical publication."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Rows per page Controls (Standard Dashboard Layout) */}
        <div className="px-5 py-4 border-t border-[#E5E5E5] dark:border-[#262626] flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#0A0A0A]">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#737373] dark:text-neutral-400 uppercase tracking-wider">
                Rows per page:
              </span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="text-xs border border-[#E5E5E5] dark:border-[#262626] bg-transparent rounded-md px-2 py-1 font-medium text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white cursor-pointer"
              >
                <option value="5" className="dark:bg-[#111111]">5</option>
                <option value="10" className="dark:bg-[#111111]">10</option>
                <option value="20" className="dark:bg-[#111111]">20</option>
                <option value="50" className="dark:bg-[#111111]">50</option>
                <option value="100" className="dark:bg-[#111111]">100</option>
              </select>
            </div>
            <p className="text-xs font-medium text-[#737373] dark:text-neutral-400 hidden sm:block">
              Showing {filteredBlogs.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{" "}
              {Math.min(currentPage * pageSize, filteredBlogs.length)} of {filteredBlogs.length} articles
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 border border-[#E5E5E5] dark:border-[#262626] rounded-md text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white hover:border-[#0A0A0A] dark:hover:border-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1.5 text-xs font-medium text-[#0A0A0A] dark:text-white bg-[#F5F5F5] dark:bg-[#111111] rounded-md border border-[#E5E5E5] dark:border-[#262626] font-mono">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 border border-[#E5E5E5] dark:border-[#262626] rounded-md text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white hover:border-[#0A0A0A] dark:hover:border-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* 4. Write / Edit Article Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-3xl my-8 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-[#E5E5E5] dark:border-[#262626] shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#E5E5E5] dark:border-[#262626]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#111111] flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0A0A0A] dark:text-white">
                    {editingBlog ? "Edit Publication" : "Create Technical Article"}
                  </h3>
                  <p className="text-xs text-[#737373]">
                    Configure title, slug, cover image, and markdown body.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveBlog} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              {/* Title & Slug */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0A0A0A] dark:text-white mb-1.5">
                    Article Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Building Resilient SaaS Architectures with Next.js 15"
                    className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111] text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] dark:focus:ring-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#0A0A0A] dark:text-white">
                      Page Header Title <span className="text-[10px] font-normal text-[#737373] normal-case">(Single line for top hero band)</span>
                    </label>
                    <span className="text-[10px] text-[#737373] font-mono">Optional</span>
                  </div>
                  <input
                    type="text"
                    value={pageTitle}
                    onChange={(e) => setPageTitle(e.target.value)}
                    placeholder="e.g. Next.js SaaS Architecture (defaults to Category if empty)"
                    maxLength={100}
                    className="w-full px-3.5 py-2 text-xs rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111] text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] dark:focus:ring-white"
                  />
                  <p className="text-[10px] text-[#737373] mt-1">
                    Appears in the dark top hero band and breadcrumbs. Kept to a small, clean single line.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#737373]">
                      URL Slug
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomSlug(!isCustomSlug)}
                      className="text-[11px] text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white underline cursor-pointer"
                    >
                      {isCustomSlug ? "Auto-generate from title" : "Edit slug manually"}
                    </button>
                  </div>
                  <div className="flex items-center rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111] px-3">
                    <span className="text-xs font-mono text-[#737373] select-none">/blog/</span>
                    <input
                      type="text"
                      disabled={!isCustomSlug}
                      value={slug}
                      onChange={(e) => setSlug(slugify(e.target.value))}
                      placeholder="url-slug"
                      className="w-full py-2 px-1 text-xs font-mono bg-transparent text-[#0A0A0A] dark:text-white focus:outline-none disabled:opacity-60"
                    />
                  </div>
                </div>
              </div>

              {/* Category, Author, Read Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0A0A0A] dark:text-white mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111] text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] dark:focus:ring-white cursor-pointer"
                  >
                    {availableCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="Other">Custom Category...</option>
                  </select>
                  {category === "Other" && (
                    <input
                      type="text"
                      placeholder="Enter custom category"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="mt-2 w-full px-3 py-1.5 text-xs rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111] text-[#0A0A0A] dark:text-white focus:outline-none"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0A0A0A] dark:text-white mb-1.5">
                    Author
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="ABCD Team"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111] text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] dark:focus:ring-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0A0A0A] dark:text-white mb-1.5">
                    Read Time
                  </label>
                  <input
                    type="text"
                    value={readTime}
                    onChange={(e) => setReadTime(e.target.value)}
                    placeholder="e.g. 5 min read"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111] text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] dark:focus:ring-white"
                  />
                </div>
              </div>

              {/* Cover Image Upload (Synced with Cloudinary & URL) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0A0A0A] dark:text-white mb-1.5">
                  Cover Image
                </label>
                <ImageUploadInput
                  name="coverImage"
                  label="Upload Article Cover Image"
                  value={coverImage}
                  defaultValue={coverImage}
                  onChange={(url) => setCoverImage(url)}
                  folder="abcd_agency/blog"
                />
              </div>

              {/* Summary */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#0A0A0A] dark:text-white mb-1.5">
                  Summary / Excerpt *
                </label>
                <textarea
                  required
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="A concise 2-3 sentence overview for search previews and blog cards."
                  className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111] text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] dark:focus:ring-white"
                />
              </div>

              {/* Content with Markdown Preview */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#0A0A0A] dark:text-white">
                    Article Body (Markdown Supported) *
                  </label>
                  <div className="flex items-center rounded-md border border-[#E5E5E5] dark:border-[#262626] p-0.5 bg-[#F5F5F5] dark:bg-[#1A1A1A]">
                    <button
                      type="button"
                      onClick={() => setIsPreviewMode(false)}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                        !isPreviewMode
                          ? "bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white shadow-xs"
                          : "text-[#737373]"
                      }`}
                    >
                      Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPreviewMode(true)}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                        isPreviewMode
                          ? "bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white shadow-xs"
                          : "text-[#737373]"
                      }`}
                    >
                      Preview
                    </button>
                  </div>
                </div>

                {!isPreviewMode ? (
                  <textarea
                    required
                    rows={12}
                    value={content}
                    onChange={(e) => handleContentChange(e.target.value)}
                    placeholder="Write article in markdown format using headings (###), bullet lists, and code blocks..."
                    className="w-full px-3.5 py-2.5 text-sm font-mono leading-relaxed rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111] text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] dark:focus:ring-white"
                  />
                ) : (
                  <div className="w-full min-h-[250px] p-5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111] text-sm text-[#0A0A0A] dark:text-neutral-200 whitespace-pre-line leading-relaxed overflow-y-auto max-h-[350px]">
                    {content ? content : <span className="text-[#737373] italic">No content written yet.</span>}
                  </div>
                )}
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#0A0A0A] dark:text-white">Publish Article</p>
                    <p className="text-xs text-[#737373]">Live on /blog immediately.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                    <input
                      type="checkbox"
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-[#E5E5E5] dark:bg-[#262626] peer-focus:ring-2 peer-focus:ring-[#0A0A0A] dark:peer-focus:ring-white rounded-full peer peer-checked:bg-[#0A0A0A] dark:peer-checked:bg-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-[#0A0A0A] after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#0A0A0A] dark:text-white">Featured Post</p>
                    <p className="text-xs text-[#737373]">Highlight on home and blog headers.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-[#E5E5E5] dark:bg-[#262626] peer-focus:ring-2 peer-focus:ring-[#0A0A0A] dark:peer-focus:ring-white rounded-full peer peer-checked:bg-[#0A0A0A] dark:peer-checked:bg-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-[#0A0A0A] after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E5E5] dark:border-[#262626]">
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingBlog ? "Save Changes" : "Publish Article"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Delete Confirmation Modal */}
      {deletingBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#0A0A0A] rounded-2xl border border-[#E5E5E5] dark:border-[#262626] p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/40 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#0A0A0A] dark:text-white">Delete Article</h4>
                <p className="text-xs text-[#737373]">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-[#737373] leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <strong className="text-[#0A0A0A] dark:text-white font-semibold">
                "{deletingBlog.title}"
              </strong>
              ? It will be removed from the live website immediately.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDeletingBlog(null)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmDelete}
                disabled={isPending}
                className="bg-red-600 hover:bg-red-700 text-white border-red-600 cursor-pointer"
              >
                {isPending ? "Deleting..." : "Confirm Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
