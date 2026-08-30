"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { syncClientAndProjectBalances } from "@/lib/sync-financials";

export async function quickUpdateStatus(id: string, status: string) {
  let statusColor = "neutral";
  if (status === "On Track") statusColor = "emerald";
  if (status === "Delayed") statusColor = "amber";

  await db.project.update({
    where: { id },
    data: { status, statusColor },
  });
  
  revalidatePath("/admin/projects");
  revalidatePath("/admin/clients");
  revalidatePath("/admin");
}

export async function quickUpdateProgress(id: string, progress: number) {
  await db.project.update({
    where: { id },
    data: { progress },
  });
  
  revalidatePath("/admin/projects");
  revalidatePath("/admin/clients");
  revalidatePath("/admin");
}

export async function deleteProject(id: string) {
  const proj = await db.project.findUnique({
    where: { id },
    select: { clientId: true, client: true },
  });

  await db.project.delete({
    where: { id },
  });

  if (proj?.clientId || proj?.client) {
    await syncClientAndProjectBalances(proj.clientId || proj.client);
  }
  
  revalidatePath("/admin/projects");
  revalidatePath("/admin/clients");
  revalidatePath("/admin/finance");
  revalidatePath("/admin");
  revalidatePath("/work");
  revalidatePath("/");
}
