import React, { Suspense } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { CTASection } from "@/components/marketing/CTASection";
import { BookOpen } from "lucide-react";
import { BlogGallery, SerializedBlogPost } from "@/components/marketing/BlogGallery";
import { db } from "@/lib/prisma";
import { blogPosts as fallbackPosts } from "@/data/blog";
import { format } from "date-fns";

export const metadata = {
  title: "Engineering Blog & Architecture Insights — ABCD Agency",
  description:
    "Technical articles, architecture deep dives, and lessons learned building scalable web systems and AI automations.",
};

export const revalidate = 60; // ISR cache revalidation every minute

export default async function BlogPage() {
  let rawPosts = await db.blogPost.findMany({
    where: { published: true },
    orderBy: [
      { featured: "desc" },
      { createdAt: "desc" },
    ],
  });

  // Fallback to static data if database has not been seeded yet
  if (rawPosts.length === 0) {
    rawPosts = fallbackPosts.map((p, idx) => ({
      id: `fallback-${idx}`,
      slug: p.slug,
      title: p.title,
      summary: p.summary,
      content: p.content,
      category: p.category,
      readTime: p.readTime,
      author: p.author,
      coverImage: null,
      published: true,
      featured: idx === 0,
      order: idx,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  }

  const serializedPosts: SerializedBlogPost[] = rawPosts.map((post: any) => {
    let formattedDate = "Recent";
    try {
      if (post.createdAt) {
        formattedDate = format(new Date(post.createdAt), "MMM d, yyyy");
      }
    } catch {
      formattedDate = "Aug 2026";
    }

    return {
      id: post.id,
      slug: post.slug,
      title: post.title,
      summary: post.summary,
      category: post.category,
      readTime: post.readTime || "5 min read",
      author: post.author || "ABCD Team",
      coverImage: post.coverImage || null,
      featured: post.featured || false,
      date: formattedDate,
    };
  });

  return (
    <div className="bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white transition-colors duration-200">
      {/* Blog Hero */}
      <PageHeader 
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
        ]}
        title="Insights & News"
        description="Explore our deep technical dives into Next.js performance, autonomous AI integration, and scalable systems architecture."
        icon={<BookOpen className="w-32 h-32" />}
      />

      {/* Articles Gallery */}
      <section className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense fallback={<div className="py-20 text-center text-xs font-mono text-[#737373]">Loading articles...</div>}>
          <BlogGallery initialPosts={serializedPosts} />
        </Suspense>
      </section>

      {/* CTA */}
      <CTASection />
    </div>
  );
}
