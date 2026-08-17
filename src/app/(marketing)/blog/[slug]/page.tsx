import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { blogPosts } from "@/data/blog";
import { Badge } from "@/components/ui/Badge";
import { CTASection } from "@/components/marketing/CTASection";

export function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white transition-colors duration-200">
      {/* Article Header */}
      <section className="pt-16 pb-16 md:pt-24 md:pb-20 border-b border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white transition-colors mb-6"
          >
            <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to all articles
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <Badge variant="solid" size="sm">
              {post.category}
            </Badge>
            <span className="text-xs font-mono text-[#737373] dark:text-neutral-400">{post.readTime}</span>
            <span className="text-xs font-mono text-[#737373] dark:text-neutral-400">•</span>
            <span className="text-xs font-mono text-[#737373] dark:text-neutral-400">{post.date}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0A0A0A] dark:text-white leading-tight mb-6">
            {post.title}
          </h1>

          <div className="flex items-center gap-3 pt-6 border-t border-[#E5E5E5] dark:border-[#262626]">
            <div className="w-9 h-9 rounded-full bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] flex items-center justify-center text-xs font-bold">
              ABCD
            </div>
            <div>
              <p className="text-xs font-bold text-[#0A0A0A] dark:text-white">{post.author}</p>
              <p className="text-[11px] text-[#737373] dark:text-neutral-400">Engineering Editorial</p>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="py-16 sm:py-24 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-none text-base text-[#262626] dark:text-neutral-300 leading-relaxed space-y-6">
          <p className="text-lg text-[#737373] dark:text-neutral-400 font-medium leading-relaxed pb-4 border-b border-[#E5E5E5] dark:border-[#262626]">
            {post.summary}
          </p>

          <div className="whitespace-pre-line text-sm sm:text-base leading-relaxed text-[#262626] dark:text-neutral-200">
            {post.content.trim()}
          </div>
        </div>
      </article>

      {/* CTA */}
      <CTASection />
    </div>
  );
}
