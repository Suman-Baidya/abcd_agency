"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { logUserActivity } from "@/lib/auth-session";
import { formatNumberToINR } from "@/lib/sync-financials";

export interface UserItem {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string | null;
  isWhatsappSame: boolean;
  whatsapp: string | null;
  industry: string | null;
  location: string | null;
  website: string | null;
  role: "USER" | "CLIENT" | "ADMIN" | "SUPER_ADMIN";
  status: string;
  isVerified: boolean;
  clientId: string | null;
  clientName?: string | null;
  lastLoginAt: Date | null;
  lastLogoutAt: Date | null;
  lastActiveAt: Date | null;
  createdAt: Date;
  activitiesCount: number;
  recentActivity?: string | null;
  isViewed?: boolean;
}

export async function getUsersList(): Promise<UserItem[]> {
  try {
    const users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        clientRel: {
          select: {
            id: true,
            name: true,
          },
        },
        activities: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: {
            action: true,
            description: true,
            createdAt: true,
          },
        },
        _count: {
          select: { activities: true },
        },
      },
    });

    return users.map((u: any) => ({
      id: u.id,
      name: u.name,
      companyName: u.companyName,
      email: u.email,
      phone: u.phone,
      isWhatsappSame: u.isWhatsappSame,
      whatsapp: u.whatsapp,
      industry: u.industry,
      location: u.location,
      website: u.website,
      role: u.role as any,
      status: u.status,
      isVerified: u.isVerified,
      isViewed: u.isViewed,
      clientId: u.clientId,
      clientName: u.clientRel?.name || null,
      lastLoginAt: u.lastLoginAt,
      lastLogoutAt: u.lastLogoutAt,
      lastActiveAt: u.lastActiveAt,
      createdAt: u.createdAt,
      activitiesCount: u._count.activities,
      recentActivity: u.activities[0] ? `${u.activities[0].action}: ${u.activities[0].description || ""}` : null,
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export async function markUserAsViewed(userId: string) {
  try {
    await db.user.update({
      where: { id: userId },
      data: { isViewed: true },
    });
    revalidatePath("/admin/users");
    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error marking user as viewed:", error);
    return { success: false };
  }
}

export async function getUserActivities(userId: string) {
  try {
    const fortyFiveDaysAgo = new Date();
    fortyFiveDaysAgo.setDate(fortyFiveDaysAgo.getDate() - 45);

    // Auto-prune logs older than 45 days in the background
    db.userActivity.deleteMany({
      where: {
        createdAt: { lt: fortyFiveDaysAgo },
      },
    }).catch(() => {});

    // Fetch this user's activities from the last 45 days
    const activities = await db.userActivity.findMany({
      where: {
        userId,
        createdAt: { gte: fortyFiveDaysAgo },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return activities;
  } catch (error) {
    console.error("Error fetching user activities:", error);
    return [];
  }
}

export async function clearUserActivities(userId: string) {
  try {
    await db.userActivity.deleteMany({
      where: { userId },
    });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Error clearing user activities:", error);
    throw new Error("Failed to clear user activity history");
  }
}

export async function convertUserToClient(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { clientRel: true },
    });

    if (!user) {
      throw new Error("User not found.");
    }

    if (user.clientId && user.clientRel) {
      // Already has client record, ensure role is CLIENT
      await db.user.update({
        where: { id: userId },
        data: { role: "CLIENT" },
      });
      revalidatePath("/admin/users");
      revalidatePath("/admin/clients");
      return { success: true, clientId: user.clientId };
    }

    // Create a new Client record in the database
    const newClient = await db.client.create({
      data: {
        name: user.companyName || user.name,
        contactPerson: user.name,
        email: user.email,
        phone: user.phone || "",
        isWhatsappSame: user.isWhatsappSame,
        whatsapp: user.whatsapp || null,
        industry: user.industry || "General",
        location: user.location || "Remote",
        website: user.website || null,
        status: "Active",
        totalSpend: "₹0",
        totalSpendRaw: 0,
        dueBalance: "₹0",
        dueBalanceRaw: 0,
        notes: `Converted from registered user account on ${new Date().toLocaleDateString()}.`,
      },
    });

    // Link user to client and update role
    await db.user.update({
      where: { id: userId },
      data: {
        role: "CLIENT",
        clientId: newClient.id,
        status: "Active",
        isVerified: true,
      },
    });

    await logUserActivity(
      userId,
      "CONVERTED_TO_CLIENT",
      `User was officially verified and converted to Client account (${newClient.name}) by Super Admin`
    );

    revalidatePath("/admin/users");
    revalidatePath("/admin/clients");
    revalidatePath("/admin/projects");
    revalidatePath("/admin/finance");
    revalidatePath("/admin");

    return { success: true, clientId: newClient.id };
  } catch (error: any) {
    console.error("Error converting user to client:", error);
    throw new Error(error?.message || "Failed to convert user to client.");
  }
}

export async function updateUserStatus(userId: string, status: string) {
  try {
    await db.user.update({
      where: { id: userId },
      data: { status },
    });

    await logUserActivity(userId, "STATUS_UPDATED", `Account status changed to ${status}`);

    revalidatePath("/admin/users");
    revalidatePath("/admin");
    revalidatePath("/portal");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating user status:", error);
    throw new Error("Failed to update status");
  }
}

export async function deleteUserAccount(userId: string) {
  try {
    await db.user.delete({
      where: { id: userId },
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin/clients");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting user:", error);
    throw new Error("Failed to delete user account");
  }
}
