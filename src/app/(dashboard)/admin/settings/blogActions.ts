"use server";

import { db } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-session";
import { slugify } from "@/lib/slugify";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const blogSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  pageTitle: z.string().max(120).nullable().optional(),
  slug: z.string().optional(),
  summary: z.string().min(1, "Summary is required"),
  content: z.string().min(1, "Article content cannot be empty"),
  category: z.string().default("Engineering"),
  readTime: z.string().optional(),
  author: z.string().default("ABCD Team"),
  coverImage: z.string().nullable().optional(),
  published: z.boolean().default(true),
  featured: z.boolean().default(false),
});

function estimateReadTime(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}

async function verifyAdminRole() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    throw new Error("Unauthorized: Only administrators can modify blog posts.");
  }
  return user;
}

export async function createBlogPost(formData: FormData | Record<string, any>) {
  const currentUser = await verifyAdminRole();

  const isFormData = formData instanceof FormData;
  const rawData: Record<string, any> = isFormData
    ? {
        title: formData.get("title"),
        pageTitle: formData.get("pageTitle") || null,
        slug: formData.get("slug"),
        summary: formData.get("summary"),
        content: formData.get("content"),
        category: formData.get("category"),
        readTime: formData.get("readTime"),
        author: formData.get("author") || currentUser.name || "ABCD Team",
        coverImage: formData.get("coverImage") || null,
        published: formData.get("published") === "true" || formData.get("published") === "on",
        featured: formData.get("featured") === "true" || formData.get("featured") === "on",
      }
    : {
        ...formData,
        pageTitle: formData.pageTitle || null,
        published: Boolean(formData.published),
        featured: Boolean(formData.featured),
      };

  const parsed = blogSchema.safeParse(rawData);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || "Validation failed";
    return { success: false, error: errorMsg };
  }
  const validated = parsed.data;

  // Generate or clean slug
  let targetSlug = validated.slug && validated.slug.trim() !== "" 
    ? slugify(validated.slug) 
    : slugify(validated.title);

  if (!targetSlug) {
    targetSlug = `post-${Date.now().toString(36)}`;
  }

  // Ensure slug uniqueness
  const existing = await db.blogPost.findUnique({ where: { slug: targetSlug } });
  if (existing) {
    targetSlug = `${targetSlug}-${Date.now().toString().slice(-4)}`;
  }

  // Auto-estimate read time if not supplied
  const readTime = validated.readTime && validated.readTime.trim() !== ""
    ? validated.readTime
    : estimateReadTime(validated.content);

  try {
    const post = await db.blogPost.create({
      data: {
        title: validated.title.trim(),
        pageTitle: validated.pageTitle?.trim() || null,
        slug: targetSlug,
        summary: validated.summary.trim(),
        content: validated.content.trim(),
        category: validated.category.trim() || "Engineering",
        readTime,
        author: validated.author.trim() || "ABCD Team",
        coverImage: validated.coverImage || null,
        published: validated.published,
        featured: validated.featured,
      },
    });

    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);
    revalidatePath("/admin/blog");
    revalidatePath("/admin/settings");
    revalidatePath("/", "layout");

    return { success: true, post };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create blog post." };
  }
}

export async function updateBlogPost(id: string, formData: FormData | Record<string, any>) {
  await verifyAdminRole();

  const existingPost = await db.blogPost.findUnique({ where: { id } });
  if (!existingPost) {
    throw new Error("Blog post not found.");
  }

  const isFormData = formData instanceof FormData;
  const rawData: Record<string, any> = isFormData
    ? {
        title: formData.get("title"),
        pageTitle: formData.get("pageTitle") || null,
        slug: formData.get("slug"),
        summary: formData.get("summary"),
        content: formData.get("content"),
        category: formData.get("category"),
        readTime: formData.get("readTime"),
        author: formData.get("author"),
        coverImage: formData.get("coverImage") || null,
        published: formData.get("published") === "true" || formData.get("published") === "on",
        featured: formData.get("featured") === "true" || formData.get("featured") === "on",
      }
    : {
        ...formData,
        pageTitle: formData.pageTitle || null,
        published: Boolean(formData.published),
        featured: Boolean(formData.featured),
      };

  const parsed = blogSchema.safeParse(rawData);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || "Validation failed";
    return { success: false, error: errorMsg };
  }
  const validated = parsed.data;

  let targetSlug = validated.slug && validated.slug.trim() !== ""
    ? slugify(validated.slug)
    : slugify(validated.title);

  if (!targetSlug) {
    targetSlug = existingPost.slug;
  }

  // If slug changed, ensure no other post uses it
  if (targetSlug !== existingPost.slug) {
    const conflict = await db.blogPost.findUnique({ where: { slug: targetSlug } });
    if (conflict && conflict.id !== id) {
      targetSlug = `${targetSlug}-${Date.now().toString().slice(-4)}`;
    }
  }

  const readTime = validated.readTime && validated.readTime.trim() !== ""
    ? validated.readTime
    : estimateReadTime(validated.content);

  try {
    const updated = await db.blogPost.update({
      where: { id },
      data: {
        title: validated.title.trim(),
        pageTitle: validated.pageTitle?.trim() || null,
        slug: targetSlug,
        summary: validated.summary.trim(),
        content: validated.content.trim(),
        category: validated.category.trim() || "Engineering",
        readTime,
        author: validated.author.trim() || "ABCD Team",
        coverImage: validated.coverImage || null,
        published: validated.published,
        featured: validated.featured,
      },
    });

    revalidatePath("/blog");
    revalidatePath(`/blog/${existingPost.slug}`);
    if (targetSlug !== existingPost.slug) {
      revalidatePath(`/blog/${targetSlug}`);
    }
    revalidatePath("/admin/blog");
    revalidatePath("/admin/settings");
    revalidatePath("/", "layout");

    return { success: true, post: updated };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update blog post." };
  }
}

export async function deleteBlogPost(id: string) {
  await verifyAdminRole();

  const existingPost = await db.blogPost.findUnique({ where: { id } });
  if (!existingPost) {
    throw new Error("Blog post not found.");
  }

  await db.blogPost.delete({ where: { id } });

  revalidatePath("/blog");
  revalidatePath(`/blog/${existingPost.slug}`);
  revalidatePath("/admin/blog");
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");

  return { success: true };
}

export async function toggleBlogPostPublished(id: string) {
  await verifyAdminRole();

  const post = await db.blogPost.findUnique({ where: { id } });
  if (!post) {
    throw new Error("Blog post not found.");
  }

  const updated = await db.blogPost.update({
    where: { id },
    data: { published: !post.published },
  });

  revalidatePath("/blog");
  revalidatePath(`/blog/${post.slug}`);
  revalidatePath("/admin/blog");
  revalidatePath("/admin/settings");

  return { success: true, published: updated.published };
}

// ----------------------------------------------------------------------------
// BLOG CATEGORY ACTIONS
// ----------------------------------------------------------------------------

const DEFAULT_BLOG_CATEGORIES = [
  "Engineering",
  "AI & Automation",
  "Architecture",
  "Cloud & DevOps",
  "Design & UX",
  "Case Study",
];

export async function getBlogCategories() {
  try {
    const delegate = db.blogCategory;
    if (!delegate || typeof delegate.findMany !== "function") {
      return DEFAULT_BLOG_CATEGORIES.map((c, i) => ({ id: `cat-${i}`, name: c }));
    }

    let categories = await delegate.findMany({
      orderBy: { name: "asc" },
    });

    if (categories.length === 0 && typeof delegate.upsert === "function") {
      for (const name of DEFAULT_BLOG_CATEGORIES) {
        await delegate.upsert({
          where: { name },
          update: {},
          create: { name },
        });
      }
      categories = await delegate.findMany({
        orderBy: { name: "asc" },
      });
    }

    return categories;
  } catch (err) {
    console.error("Error fetching blog categories:", err);
    return DEFAULT_BLOG_CATEGORIES.map((c, i) => ({ id: `cat-${i}`, name: c }));
  }
}

export async function createBlogCategory(name: string) {
  await verifyAdminRole();
  const trimmed = name.trim();
  if (!trimmed) {
    return { success: false, error: "Category name is required." };
  }

  try {
    const category = await db.blogCategory.create({
      data: { name: trimmed },
    });
    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    return { success: true, category };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { success: false, error: "Category already exists." };
    }
    return { success: false, error: error.message || "Failed to create category." };
  }
}

export async function updateBlogCategory(id: string, newName: string) {
  await verifyAdminRole();
  const trimmed = newName.trim();
  if (!trimmed) {
    return { success: false, error: "Category name is required." };
  }

  try {
    const existing = await db.blogCategory.findUnique({ where: { id } });
    const category = await db.blogCategory.update({
      where: { id },
      data: { name: trimmed },
    });

    // Also update any blog posts with the old category name to the new name
    if (existing && existing.name !== trimmed) {
      await db.blogPost.updateMany({
        where: { category: existing.name },
        data: { category: trimmed },
      });
    }

    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    return { success: true, category };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { success: false, error: "Category name already exists." };
    }
    return { success: false, error: error.message || "Failed to update category." };
  }
}

export async function deleteBlogCategory(id: string) {
  await verifyAdminRole();

  try {
    await db.blogCategory.delete({
      where: { id },
    });
    revalidatePath("/admin/blog");
    revalidatePath("/blog");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete category." };
  }
}

