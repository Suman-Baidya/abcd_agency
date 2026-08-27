"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function markInquiryAsRead(id: string) {
  await db.inquiry.update({
    where: { id },
    data: { status: "In Progress" },
  });
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin"); // refresh layout for notification count
}

export async function updateInquiryStatus(id: string, status: string) {
  await db.inquiry.update({
    where: { id },
    data: { status },
  });
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin");
}

export async function deleteInquiry(id: string) {
  await db.inquiry.delete({ where: { id } });
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
