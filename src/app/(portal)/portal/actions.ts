"use server";

import { db } from "@/lib/prisma";
import { getCurrentUser, logUserActivity } from "@/lib/auth-session";
import { revalidatePath } from "next/cache";

export async function getPortalData() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [fullUser, pricingPackages, pricingServices, featuredProjects, userInquiries] = await Promise.all([
    db.user.findUnique({
      where: { id: user.id },
      include: {
        clientRel: {
          include: {
            projects: {
              include: {
                transactions: true,
                revisionRequests: true,
                tasks: { orderBy: [{ order: "asc" }, { createdAt: "desc" }] },
              },
            },
            transactions: true,
            documents: { orderBy: { createdAt: "desc" } },
            revisionRequests: { orderBy: { createdAt: "desc" } },
            meetings: { orderBy: { createdAt: "desc" } },
          },
        },
        activities: {
          take: 10,
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    db.pricingPackage.findMany({ orderBy: { order: "asc" } }),
    db.pricingService.findMany({ orderBy: { order: "asc" } }),
    db.project.findMany({
      where: { isFeatured: true },
      take: 6,
      orderBy: { createdAt: "desc" },
    }),
    db.inquiry.findMany({
      where: { email: user.email },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    user: fullUser,
    client: fullUser?.clientRel || null,
    pricingPackages,
    pricingServices,
    featuredProjects,
    userInquiries,
  };
}

export async function submitPortalInquiry(data: {
  businessType: string;
  services: string[];
  projectType: string;
  budget: string;
  message: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const inquiry = await db.inquiry.create({
    data: {
      name: user.name,
      email: user.email,
      mobile: user.phone || "N/A",
      isWhatsappSame: user.isWhatsappSame ?? true,
      whatsapp: user.isWhatsappSame ? (user.phone || null) : (user.whatsapp || null),
      businessType: data.businessType,
      services: data.services,
      projectType: data.projectType,
      budget: data.budget,
      message: data.message,
      status: "New",
      priority: "High",
    },
  });

  await logUserActivity(
    user.id,
    "INQUIRY_SUBMITTED",
    `Submitted new project inquiry for ${data.projectType} (Budget: ${data.budget})`
  );

  revalidatePath("/admin/inquiries");
  revalidatePath("/portal");
  revalidatePath("/portal/inquiries");

  return inquiry;
}

export async function submitRevisionRequest(data: {
  projectId?: string;
  title: string;
  description: string;
  priority?: string;
}) {
  const user = await getCurrentUser();
  if (!user || !user.clientId) throw new Error("Only active clients can submit revision requests.");

  const revision = await db.revisionRequest.create({
    data: {
      clientId: user.clientId,
      projectId: data.projectId || null,
      title: data.title.trim(),
      description: data.description.trim(),
      priority: data.priority || "Medium",
      status: "Pending",
    },
  });

  await logUserActivity(
    user.id,
    "REVISION_REQUESTED",
    `Submitted revision request: "${data.title}"`
  );

  revalidatePath("/portal/revisions");
  revalidatePath("/portal/projects");
  revalidatePath("/admin/projects");
  return revision;
}

export async function clientApproveTask(taskId: string) {
  const user = await getCurrentUser();
  if (!user || !user.clientId) throw new Error("Only active clients can approve deliverables.");

  const task = await db.projectTask.update({
    where: { id: taskId },
    data: { status: "Approved" },
    include: { projectRel: { select: { id: true, title: true } } },
  });

  if (task.projectId) {
    const allTasks = await db.projectTask.findMany({
      where: { projectId: task.projectId },
      select: { status: true },
    });

    if (allTasks.length > 0) {
      const completedCount = allTasks.filter((t: { status: string }) => t.status === "Approved" || t.status === "Done").length;
      const computedProgress = Math.round((completedCount / allTasks.length) * 100);

      await db.project.update({
        where: { id: task.projectId },
        data: {
          progress: computedProgress,
          ...(computedProgress === 100 ? { status: "Completed" } : {}),
        },
      });
    }
  }

  await logUserActivity(
    user.id,
    "TASK_APPROVED",
    `Approved deliverable: "${task.title}" in ${task.projectRel?.title || "Project"}`
  );

  revalidatePath("/portal/projects");
  revalidatePath("/portal");
  revalidatePath("/admin/projects");

  return { success: true, task };
}

export async function scheduleMeeting(data: {
  title: string;
  date: string;
  time: string;
  duration?: string;
  notes?: string;
}) {
  const user = await getCurrentUser();
  if (!user || !user.clientId) throw new Error("Only active clients can schedule consultations.");

  const meeting = await db.clientMeeting.create({
    data: {
      clientId: user.clientId,
      title: data.title.trim(),
      date: data.date,
      time: data.time,
      duration: data.duration || "30 mins",
      meetingLink: "https://meet.google.com/abc-defg-hij", // Agency standard meeting link
      status: "Scheduled",
      notes: data.notes?.trim() || null,
    },
  });

  await logUserActivity(
    user.id,
    "MEETING_SCHEDULED",
    `Booked meeting: "${data.title}" for ${data.date} at ${data.time}`
  );

  revalidatePath("/portal/meetings");
  return meeting;
}

export async function updatePortalProfile(data: {
  name: string;
  companyName: string;
  phone?: string;
  whatsapp?: string;
  isWhatsappSame?: boolean;
  industry?: string;
  location?: string;
  website?: string;
  newPassword?: string;
}) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const updatePayload: any = {
    name: data.name.trim(),
    companyName: data.companyName.trim(),
    phone: data.phone?.trim() || null,
    isWhatsappSame: data.isWhatsappSame ?? true,
    whatsapp: data.isWhatsappSame ? data.phone?.trim() || null : (data.whatsapp?.trim() || null),
    industry: data.industry?.trim() || null,
    location: data.location?.trim() || null,
    website: data.website?.trim() || null,
  };

  if (data.newPassword && data.newPassword.length >= 6) {
    updatePayload.password = data.newPassword;
  }

  const updatedUser = await db.user.update({
    where: { id: user.id },
    data: updatePayload,
  });

  if (user.clientId) {
    await db.client.update({
      where: { id: user.clientId },
      data: {
        name: data.companyName.trim(),
        contactPerson: data.name.trim(),
        phone: data.phone?.trim() || "",
        isWhatsappSame: data.isWhatsappSame ?? true,
        whatsapp: data.isWhatsappSame ? null : (data.whatsapp?.trim() || null),
        industry: data.industry?.trim() || "",
        location: data.location?.trim() || "",
        website: data.website?.trim() || null,
      },
    });
  }

  await logUserActivity(user.id, "PROFILE_UPDATED", "Updated organization contact & profile information");

  revalidatePath("/portal/profile");
  revalidatePath("/admin/users");
  revalidatePath("/admin/clients");

  return updatedUser;
}
