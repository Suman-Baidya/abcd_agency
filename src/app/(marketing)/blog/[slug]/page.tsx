import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { blogPosts } from "@/data/blog";
import { Badge } from "@/components/ui/Badge";
import { CTASection } from "@/components/marketing/CTASection";
import { PageHeader } from "@/components/ui/PageHeader";

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
      <PageHeader 
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
          { label: post.title },
        ]}
        title={post.title}
        description={post.summary}
        showSocials={false}
      />
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-b border-[#E5E5E5] dark:border-[#262626]">
        <div className="flex items-center gap-3 mb-6">
          <Badge variant="solid" size="sm">
            {post.category}
          </Badge>
          <span className="text-xs font-mono text-[#737373] dark:text-neutral-400">{post.readTime}</span>
          <span className="text-xs font-mono text-[#737373] dark:text-neutral-400">•</span>
          <span className="text-xs font-mono text-[#737373] dark:text-neutral-400">{post.date}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] flex items-center justify-center text-xs font-bold">
            ABCD
          </div>
          <div>
            <p className="text-xs font-bold text-[#0A0A0A] dark:text-white">{post.author}</p>
            <p className="text-[11px] text-[#737373] dark:text-neutral-400">Engineering Editorial</p>
          </div>
        </div>
      </div>

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
