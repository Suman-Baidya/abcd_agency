import React, { Suspense } from "react";
import { db } from "@/lib/prisma";
import { blogPosts as defaultPosts } from "@/data/blog";
import { BlogManager } from "@/components/dashboard/BlogManager";
import { getBlogCategories } from "@/app/(dashboard)/admin/settings/blogActions";

export const metadata = {
  title: "Blog Articles — ABCD Agency",
};

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const [initialBlogs, categories] = await Promise.all([
    db.blogPost.findMany({
      orderBy: { createdAt: "desc" },
    }),
    getBlogCategories(),
  ]);

  let blogs = initialBlogs;

  // If database table is empty, auto-seed with default entries so dashboard is never empty
  if (blogs.length === 0) {
    try {
      for (const p of defaultPosts) {
        await db.blogPost.upsert({
          where: { slug: p.slug },
          update: {},
          create: {
            title: p.title,
            slug: p.slug,
            summary: p.summary,
            content: p.content.trim(),
            category: p.category,
            readTime: p.readTime,
            author: p.author,
            published: true,
            featured: true,
          },
        });
      }
      blogs = await db.blogPost.findMany({
        orderBy: { createdAt: "desc" },
      });
    } catch (e) {
      console.error("Error auto-seeding default blogs:", e);
    }
  }

  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-xs font-mono text-[#737373]">
          Loading editorial hub...
        </div>
      }
    >
      <BlogManager initialBlogs={blogs as any} initialCategories={categories} />
    </Suspense>
  );
}
