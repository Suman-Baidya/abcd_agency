import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { blogPosts as fallbackPosts } from "@/data/blog";
import { Badge } from "@/components/ui/Badge";
import { CTASection } from "@/components/marketing/CTASection";
import { PageHeader } from "@/components/ui/PageHeader";
import { BlogShareBar } from "@/components/marketing/BlogShareBar";
import { db } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-session";
import { format } from "date-fns";
import { ArrowLeft, Clock, Calendar, BookOpen } from "lucide-react";
import type { Metadata } from "next";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = (await db.blogPost.findUnique({ where: { slug } })) ||
    fallbackPosts.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: "Article Not Found — ABCD Agency",
    };
  }

  return {
    title: `${post.title} — ABCD Agency Blog`,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: "article",
      images: (post as any).coverImage ? [(post as any).coverImage] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Query database first
  let post = await db.blogPost.findUnique({
    where: { slug },
  });

  // Fallback to static data if not found in DB
  if (!post) {
    const fallback = fallbackPosts.find((p) => p.slug === slug);
    if (fallback) {
      post = {
        id: `fallback-${slug}`,
        slug: fallback.slug,
        title: fallback.title,
        pageTitle: null,
        summary: fallback.summary,
        content: fallback.content,
        category: fallback.category,
        readTime: fallback.readTime,
        author: fallback.author,
        coverImage: null,
        published: true,
        featured: false,
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  }

  if (!post) {
    notFound();
  }

  // If unpublished, only allow authenticated admins to view preview
  if (!post.published) {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
      notFound();
    }
  }

  let formattedDate = "Recent";
  try {
    if (post.createdAt) {
      formattedDate = format(new Date(post.createdAt), "MMMM d, yyyy");
    }
  } catch {
    formattedDate = "Aug 2026";
  }

  // Small, single-line title for the dark hero band
  const heroPageTitle = (post as any).pageTitle?.trim() || post.category || "Engineering Article";

  return (
    <div className="bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white transition-colors duration-200">
      {/* Top Hero Band: Small, concise, strictly single line with description, icons, and right-side icon */}
      <PageHeader 
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: heroPageTitle },
        ]}
        title={heroPageTitle}
        description={post.summary || "Explore our deep technical dives into Next.js performance, autonomous AI integration, and scalable systems architecture."}
        icon={<BookOpen className="w-32 h-32" />}
        showSocials={true}
      />

      {/* Main Article Container */}
      <article className="py-10 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation & Category/Meta Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Articles</span>
          </Link>

          <div className="flex items-center flex-wrap gap-2.5">
            <Badge variant="solid" size="sm">
              {post.category}
            </Badge>
            <span className="text-xs font-mono text-[#737373] dark:text-neutral-400">
              {post.readTime}
            </span>
            <span className="text-xs font-mono text-[#737373] dark:text-neutral-400">•</span>
            <span className="text-xs font-mono text-[#737373] dark:text-neutral-400">
              {formattedDate}
            </span>
            {!post.published && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                Draft Preview
              </span>
            )}
          </div>
        </div>

        {/* Full Blog Post Title (Placed upper side of image banner) */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0A0A0A] dark:text-white leading-[1.15] mt-2 mb-6">
          {post.title}
        </h1>

        {/* Author Details & Easy Sharing Option */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-y border-[#E5E5E5] dark:border-[#262626] mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] flex items-center justify-center text-xs font-bold shrink-0">
              ABCD
            </div>
            <div>
              <p className="text-xs font-bold text-[#0A0A0A] dark:text-white">{post.author}</p>
              <p className="text-[11px] text-[#737373] dark:text-neutral-400">Engineering Editorial</p>
            </div>
          </div>

          {/* Share Option */}
          <div className="w-full md:w-auto">
            <BlogShareBar title={post.title} slug={post.slug} />
          </div>
        </div>

        {/* Cover Image Banner (Reduced height as requested: compact, wide & aesthetic) */}
        {post.coverImage ? (
          <div className="relative w-full h-52 sm:h-72 md:h-80 max-h-[340px] rounded-2xl overflow-hidden mb-10 border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#111111] shadow-xs">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 896px"
            />
          </div>
        ) : (
          <div className="relative w-full h-36 sm:h-44 rounded-2xl overflow-hidden mb-10 border border-[#E5E5E5] dark:border-[#262626] bg-gradient-to-br from-[#F8F8F8] to-[#EEEEEE] dark:from-[#141414] dark:to-[#0C0C0C] flex items-center justify-center">
            <div className="flex items-center gap-2 text-[#737373] text-xs font-mono uppercase tracking-wider">
              <BookOpen className="w-4 h-4 opacity-50" />
              <span>{post.category} Editorial</span>
            </div>
          </div>
        )}

        {/* Article Content */}
        <div className="max-w-none text-base text-[#262626] dark:text-neutral-300 leading-relaxed space-y-8">
          {/* Summary Lead Paragraph */}
          <p className="text-lg sm:text-xl text-[#737373] dark:text-neutral-300 font-medium leading-relaxed pb-6 border-b border-[#E5E5E5] dark:border-[#262626]">
            {post.summary}
          </p>

          {/* Formatted Content */}
          <div className="whitespace-pre-line text-sm sm:text-base leading-relaxed text-[#262626] dark:text-neutral-200">
            {post.content.trim()}
          </div>
        </div>

        {/* Bottom Share Bar */}
        <div className="my-12">
          <BlogShareBar title={post.title} slug={post.slug} />
        </div>

        {/* Back Link Footer */}
        <div className="mt-12 pt-6 border-t border-[#E5E5E5] dark:border-[#262626] flex items-center justify-between">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#0A0A0A] dark:text-white hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-white rounded-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Articles
          </Link>
          <span className="text-xs font-mono text-[#737373]">
            ABCD Agency Engineering
          </span>
        </div>
      </article>

      {/* CTA Section */}
      <CTASection />
    </div>
  );
}
