"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function quickUpdateStatus(id: string, status: string) {
  let statusColor = "neutral";
  if (status === "On Track") statusColor = "emerald";
  if (status === "Delayed") statusColor = "amber";

  await db.project.update({
    where: { id },
    data: { status, statusColor },
  });
  
  revalidatePath("/admin/projects");
}

export async function quickUpdateProgress(id: string, progress: number) {
  await db.project.update({
    where: { id },
    data: { progress },
  });
  
  revalidatePath("/admin/projects");
}

export async function deleteProject(id: string) {
  await db.project.delete({
    where: { id },
  });
  
  revalidatePath("/admin/projects");
  revalidatePath("/work");
  revalidatePath("/");
}
