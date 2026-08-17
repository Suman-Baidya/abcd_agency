import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { blogPosts } from "@/data/blog";
import { Badge } from "@/components/ui/Badge";
import { CTASection } from "@/components/marketing/CTASection";

export const metadata = {
  title: "Engineering Blog & Architecture Insights — ABCD Agency",
  description:
    "Technical articles, architecture deep dives, and lessons learned building scalable web systems and AI automations.",
};

export default function BlogPage() {
  return (
    <div className="bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white transition-colors duration-200">
      {/* Blog Hero */}
      <PageHeader
        subtitle="Engineering Insights"
        title="Architecture notes, technical deep-dives, and case logs."
        description="We write about what we build: Next.js performance optimizations, AI workflow pipelines, and database scaling strategies."
      />

      {/* Articles Grid */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col justify-between rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] p-8 transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:hover:border-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-white"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="muted" size="sm">
                    {post.category}
                  </Badge>
                  <span className="text-xs font-mono text-[#737373] dark:text-neutral-400">{post.readTime}</span>
                  <span className="text-xs font-mono text-[#737373] dark:text-neutral-400">•</span>
                  <span className="text-xs font-mono text-[#737373] dark:text-neutral-400">{post.date}</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-[#0A0A0A] dark:text-white tracking-tight group-hover:underline underline-offset-4 mb-3">
                  {post.title}
                </h2>

                <p className="text-sm text-[#737373] dark:text-neutral-400 leading-relaxed mb-6">
                  {post.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-[#E5E5E5] dark:border-[#262626] flex items-center justify-between">
                <span className="text-xs font-semibold text-[#0A0A0A] dark:text-white">
                  By {post.author}
                </span>
                <span className="text-xs font-bold text-[#0A0A0A] dark:text-white inline-flex items-center gap-1">
                  Read Article →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <CTASection />
    </div>
  );
}
