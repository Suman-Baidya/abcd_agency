"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProject(formData: FormData) {
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const client = formData.get("client") as string;
  const category = formData.get("category") as string;
  const tagline = formData.get("tagline") as string;
  const summary = formData.get("summary") as string;
  const impact = formData.get("impact") as string;
  const techStackRaw = formData.get("techStack") as string;
  const techStack = techStackRaw ? techStackRaw.split(",").map(t => t.trim()) : [];
  
  const isFeatured = formData.get("isFeatured") === "on";
  
  const status = (formData.get("status") as string) || "In Review";
  
  let statusColor = "neutral";
  if (status === "On Track") statusColor = "emerald";
  else if (status === "Delayed") statusColor = "amber";
  else if (status === "On Hold") statusColor = "neutral";
  
  const progress = parseInt((formData.get("progress") as string) || "0");
  const budget = formData.get("budget") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const deadline = JSON.stringify({ startDate, endDate });
  const content = formData.get("content") as string || "";

  await db.project.create({
    data: {
      title,
      slug,
      client,
      category,
      tagline,
      summary,
      impact,
      techStack,
      isFeatured,
      status,
      statusColor,
      progress,
      budget,
      deadline,
      content,
    }
  });

  revalidatePath("/admin/projects");
  revalidatePath("/work");
  revalidatePath("/");
  
  redirect("/admin/projects");
}

export async function updateProjectFull(id: string, formData: FormData) {
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const client = formData.get("client") as string;
  const category = formData.get("category") as string;
  const tagline = formData.get("tagline") as string;
  const summary = formData.get("summary") as string;
  const impact = formData.get("impact") as string;
  const techStackRaw = formData.get("techStack") as string;
  const techStack = techStackRaw ? techStackRaw.split(",").map(t => t.trim()) : [];
  
  const isFeatured = formData.get("isFeatured") === "on";
  
  const status = (formData.get("status") as string) || "In Review";
  const statusColor = (formData.get("statusColor") as string) || "neutral";
  const progress = parseInt((formData.get("progress") as string) || "0");
  const budget = formData.get("budget") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const deadline = JSON.stringify({ startDate, endDate });
  const content = formData.get("content") as string || "";

  await db.project.update({
    where: { id },
    data: {
      title,
      slug,
      client,
      category,
      tagline,
      summary,
      impact,
      techStack,
      isFeatured,
      status,
      statusColor,
      progress,
      budget,
      deadline,
      content,
    }
  });

  revalidatePath("/admin/projects");
  revalidatePath("/work");
  revalidatePath("/");
}

export async function createProjectInline(formData: FormData) {
  const title = formData.get("title") as string;
  const slug = formData.get("slug") as string;
  const client = formData.get("client") as string;
  const category = formData.get("category") as string;
  const tagline = formData.get("tagline") as string;
  const summary = formData.get("summary") as string;
  const impact = formData.get("impact") as string;
  const techStackRaw = formData.get("techStack") as string;
  const techStack = techStackRaw ? techStackRaw.split(",").map(t => t.trim()) : [];
  
  const isFeatured = formData.get("isFeatured") === "on";
  
  const status = (formData.get("status") as string) || "In Review";
  const statusColor = (formData.get("statusColor") as string) || "neutral";
  const progress = parseInt((formData.get("progress") as string) || "0");
  const budget = formData.get("budget") as string;
  const deadline = formData.get("deadline") as string;
  const content = formData.get("content") as string || "";

  await db.project.create({
    data: {
      title,
      slug,
      client,
      category,
      tagline,
      summary,
      impact,
      techStack,
      isFeatured,
      status,
      statusColor,
      progress,
      budget,
      deadline,
      content,
    }
  });

  revalidatePath("/admin/projects");
  revalidatePath("/work");
  revalidatePath("/");
}

// ----------------------------------------------------------------------------
// PROJECT CATEGORY ACTIONS
// ----------------------------------------------------------------------------

export async function getCategories() {
  return db.category.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createCategory(name: string) {
  try {
    const category = await db.category.create({
      data: { name: name.trim() }
    });
    revalidatePath("/admin/projects");
    return { success: true, category };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: "Category already exists." };
    }
    return { success: false, error: "Failed to create category." };
  }
}

export async function updateCategory(id: string, newName: string) {
  try {
    const category = await db.category.update({
      where: { id },
      data: { name: newName.trim() }
    });
    revalidatePath("/admin/projects");
    return { success: true, category };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: "Category name already exists." };
    }
    return { success: false, error: "Failed to update category." };
  }
}

export async function deleteCategory(id: string) {
  try {
    await db.category.delete({
      where: { id }
    });
    revalidatePath("/admin/projects");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Failed to delete category." };
  }
}
