"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logUserActivity } from "@/lib/auth-session";

export async function getAdminRevisionsData() {
  try {
    const [revisions, projects, clients] = await Promise.all([
      db.revisionRequest.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          clientRel: {
            select: {
              id: true,
              name: true,
              email: true,
              contactPerson: true,
              phone: true,
            },
          },
          projectRel: {
            select: {
              id: true,
              title: true,
              slug: true,
              category: true,
              status: true,
            },
          },
        },
      }),
      db.project.findMany({
        select: {
          id: true,
          title: true,
          client: true,
          clientId: true,
          status: true,
          category: true,
        },
        orderBy: { title: "asc" },
      }),
      db.client.findMany({
        select: {
          id: true,
          name: true,
          email: true,
        },
        orderBy: { name: "asc" },
      }),
    ]);

    return { revisions, projects, clients };
  } catch (error) {
    console.error("Error fetching admin revisions data:", error);
    return { revisions: [], projects: [], clients: [] };
  }
}

export async function updateRevisionStatus(id: string, status: string) {
  try {
    const updated = await db.revisionRequest.update({
      where: { id },
      data: { status },
      include: {
        clientRel: true,
        projectRel: true,
      },
    });

    if (updated.clientRel?.id) {
      await logUserActivity(
        updated.clientRel.id,
        "REVISION_STATUS_UPDATED",
        `Revision "${updated.title}" status changed to ${status}`
      );
    }

    revalidatePath("/admin/revisions");
    revalidatePath("/portal/revisions");
    revalidatePath("/admin");
    return { success: true, revision: updated };
  } catch (error: any) {
    console.error("Failed to update revision status:", error);
    throw new Error(error.message || "Failed to update status");
  }
}

export async function replyToRevision(id: string, responseText: string, status?: string) {
  try {
    const dataToUpdate: any = {
      response: responseText.trim(),
    };
    if (status) {
      dataToUpdate.status = status;
    }

    const updated = await db.revisionRequest.update({
      where: { id },
      data: dataToUpdate,
      include: {
        clientRel: true,
        projectRel: true,
      },
    });

    if (updated.clientRel?.id) {
      await logUserActivity(
        updated.clientRel.id,
        "REVISION_REPLIED",
        `Admin responded to revision "${updated.title}"`
      );
    }

    revalidatePath("/admin/revisions");
    revalidatePath("/portal/revisions");
    return { success: true, revision: updated };
  } catch (error: any) {
    console.error("Failed to reply to revision:", error);
    throw new Error(error.message || "Failed to send response");
  }
}

export async function deleteRevision(id: string) {
  try {
    await db.revisionRequest.delete({
      where: { id },
    });

    revalidatePath("/admin/revisions");
    revalidatePath("/portal/revisions");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete revision:", error);
    throw new Error(error.message || "Failed to delete revision request");
  }
}
