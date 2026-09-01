"use server";

import { db } from "@/lib/prisma";
import { createSession, logUserActivity } from "@/lib/auth-session";
import { revalidatePath } from "next/cache";

export async function loginUser(formData: { email: string; password?: string }) {
  try {
    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanPassword = formData.password?.trim() || "";

    // 1. Check if super admin master login
    if (
      (cleanEmail === "suman.baidya.pro@gmail.com" && cleanPassword === "Suman2002") ||
      (cleanEmail === "admin@abcdagency.com" && cleanPassword === "Admin123")
    ) {
      // Find or create admin user in DB
      let adminUser = await db.user.findUnique({
        where: { email: cleanEmail },
      });

      if (!adminUser) {
        adminUser = await db.user.create({
          data: {
            name: "Suman Baidya",
            companyName: "ABCD Agency",
            email: cleanEmail,
            password: cleanPassword,
            role: "SUPER_ADMIN",
            status: "Active",
            isVerified: true,
            lastLoginAt: new Date(),
          },
        });
      } else {
        await db.user.update({
          where: { id: adminUser.id },
          data: { lastLoginAt: new Date(), lastActiveAt: new Date() },
        });
      }

      await createSession(adminUser.id);
      await logUserActivity(adminUser.id, "LOGIN", "Super Admin logged in");

      return {
        success: true,
        redirectTo: "/admin",
        role: "SUPER_ADMIN",
      };
    }

    // 2. Query User table
    const user = await db.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return { success: false, error: "No account found with this email address." };
    }

    // Check password
    if (user.password !== cleanPassword) {
      return { success: false, error: "Incorrect password. Please try again." };
    }

    // Check verification status
    if (!user.isVerified) {
      return {
        success: false,
        error: "Your email is not verified yet. Please enter your verification code.",
        needsVerification: true,
        userId: user.id,
      };
    }

    if (user.status === "Suspended") {
      return { success: false, error: "Your account is currently suspended. Please contact support." };
    }

    // Update lastLogin
    await db.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastActiveAt: new Date(),
      },
    });

    await createSession(user.id);
    await logUserActivity(user.id, "LOGIN", `User logged into portal as ${user.role}`);

    const destination = user.role === "SUPER_ADMIN" || user.role === "ADMIN" ? "/admin" : "/portal";

    return {
      success: true,
      redirectTo: destination,
      role: user.role,
    };
  } catch (error: any) {
    console.error("Login error:", error);
    return { success: false, error: "Failed to sign in. Please try again." };
  }
}

export async function logoutUser() {
  const { destroySession } = await import("@/lib/auth-session");
  await destroySession();
  return { success: true };
}
