"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function markInquiryAsRead(id: string) {
  await db.inquiry.update({
    where: { id },
    data: { status: "In Progress" },
  });
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin");
}

export async function updateInquiryStatus(id: string, status: string) {
  await db.inquiry.update({
    where: { id },
    data: { status },
  });
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin");
}

// Move to Trash (Soft Delete)
export async function moveToTrash(id: string) {
  await db.inquiry.update({
    where: { id },
    data: { status: "Closed" },
  });
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin");
}

// Restore from Trash
export async function restoreInquiry(id: string) {
  await db.inquiry.update({
    where: { id },
    data: { status: "New" },
  });
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin");
}

// Delete permanently from Database
export async function deletePermanently(id: string) {
  await db.inquiry.delete({ where: { id } });
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin");
}

// Empty entire Trash
export async function emptyTrash() {
  await db.inquiry.deleteMany({
    where: { status: "Closed" },
  });
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin");
}

export async function updateInquiryPriority(id: string, priority: string) {
  await db.inquiry.update({
    where: { id },
    data: { priority },
  });
  revalidatePath("/admin/inquiries");
}
