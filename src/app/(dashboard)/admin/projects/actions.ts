"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { syncClientAndProjectBalances, parseCurrencyToNumber, formatNumberToINR } from "@/lib/sync-financials";
import { slugify } from "@/lib/slugify";

export async function getAvailableClients() {
  try {
    return await db.client.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Error fetching clients list:", error);
    return [];
  }
}

export async function getUniqueProjectSlug(desiredSlug: string, currentProjectId?: string): Promise<string> {
  const base = slugify(desiredSlug) || "project";
  let candidate = base;
  let counter = 1;

  while (true) {
    const existing = await db.project.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing || (currentProjectId && existing.id === currentProjectId)) {
      return candidate;
    }

    candidate = `${base}-${counter}`;
    counter++;
  }
}

export async function createProject(formData: FormData) {
  const title = (formData.get("title") as string)?.trim() || "Untitled Project";
  const rawSlug = (formData.get("slug") as string)?.trim() || title;
  const slug = await getUniqueProjectSlug(rawSlug);
  let client = (formData.get("client") as string)?.trim();
  const clientIdFromForm = formData.get("clientId") as string;
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
  const rawBudgetInput = formData.get("budget") as string;
  const budgetRaw = parseCurrencyToNumber(rawBudgetInput);
  const budget = formatNumberToINR(budgetRaw);

  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const deadline = JSON.stringify({ startDate, endDate });
  const content = formData.get("content") as string || "";

  let resolvedClientId: string | null = clientIdFromForm || null;
  if (!resolvedClientId && client) {
    const existingClient = await db.client.findFirst({
      where: { name: { equals: client, mode: "insensitive" } },
    });
    if (existingClient) {
      resolvedClientId = existingClient.id;
      client = existingClient.name;
    }
  } else if (resolvedClientId && !client) {
    const existingClient = await db.client.findUnique({
      where: { id: resolvedClientId },
    });
    if (existingClient) {
      client = existingClient.name;
    }
  }

  const project = await db.project.create({
    data: {
      title,
      slug,
      client: client || "Agency Client",
      clientId: resolvedClientId,
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
      budgetRaw,
      deadline,
      content,
    }
  });

  if (resolvedClientId || client) {
    await syncClientAndProjectBalances(resolvedClientId || client);
  }

  revalidatePath("/admin/projects");
  revalidatePath("/admin/clients");
  revalidatePath("/admin/finance");
  revalidatePath("/admin");
  revalidatePath("/work");
  revalidatePath("/");
  
  redirect("/admin/projects");
}

export async function updateProjectFull(id: string, formData: FormData) {
  const title = (formData.get("title") as string)?.trim() || "Untitled Project";
  const rawSlug = (formData.get("slug") as string)?.trim() || title;
  const slug = await getUniqueProjectSlug(rawSlug, id);
  let client = (formData.get("client") as string)?.trim();
  const clientIdFromForm = formData.get("clientId") as string;
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
  const rawBudgetInput = formData.get("budget") as string;
  const budgetRaw = parseCurrencyToNumber(rawBudgetInput);
  const budget = formatNumberToINR(budgetRaw);

  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const deadline = JSON.stringify({ startDate, endDate });
  const content = formData.get("content") as string || "";

  let resolvedClientId: string | null = clientIdFromForm || null;
  if (!resolvedClientId && client) {
    const existingClient = await db.client.findFirst({
      where: { name: { equals: client, mode: "insensitive" } },
    });
    if (existingClient) {
      resolvedClientId = existingClient.id;
      client = existingClient.name;
    }
  } else if (resolvedClientId && !client) {
    const existingClient = await db.client.findUnique({
      where: { id: resolvedClientId },
    });
    if (existingClient) {
      client = existingClient.name;
    }
  }

  await db.project.update({
    where: { id },
    data: {
      title,
      slug,
      client: client || "Agency Client",
      clientId: resolvedClientId,
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
      budgetRaw,
      deadline,
      content,
    }
  });

  if (resolvedClientId || client) {
    await syncClientAndProjectBalances(resolvedClientId || client);
  }

  revalidatePath("/admin/projects");
  revalidatePath("/admin/clients");
  revalidatePath("/admin/finance");
  revalidatePath("/admin");
  revalidatePath("/work");
  revalidatePath("/");
}

export async function createProjectInline(formData: FormData) {
  const title = (formData.get("title") as string)?.trim() || "Untitled Project";
  const rawSlug = (formData.get("slug") as string)?.trim() || title;
  const slug = await getUniqueProjectSlug(rawSlug);
  let client = (formData.get("client") as string)?.trim();
  const clientIdFromForm = formData.get("clientId") as string;
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
  const rawBudgetInput = formData.get("budget") as string;
  const budgetRaw = parseCurrencyToNumber(rawBudgetInput);
  const budget = formatNumberToINR(budgetRaw);

  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const deadline = (startDate || endDate) ? JSON.stringify({ startDate, endDate }) : (formData.get("deadline") as string || "");
  const content = formData.get("content") as string || "";

  let resolvedClientId: string | null = clientIdFromForm || null;
  if (!resolvedClientId && client) {
    const existingClient = await db.client.findFirst({
      where: { name: { equals: client, mode: "insensitive" } },
    });
    if (existingClient) {
      resolvedClientId = existingClient.id;
      client = existingClient.name;
    }
  } else if (resolvedClientId && !client) {
    const existingClient = await db.client.findUnique({
      where: { id: resolvedClientId },
    });
    if (existingClient) {
      client = existingClient.name;
    }
  }

  const created = await db.project.create({
    data: {
      title,
      slug,
      client: client || "Agency Client",
      clientId: resolvedClientId,
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
      budgetRaw,
      deadline,
      content,
    }
  });

  if (resolvedClientId || client) {
    await syncClientAndProjectBalances(resolvedClientId || client);
  }

  revalidatePath("/admin/projects");
  revalidatePath("/admin/clients");
  revalidatePath("/admin/finance");
  revalidatePath("/admin");
  revalidatePath("/work");
  revalidatePath("/");
  return created;
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
