"use server";

import { db } from "@/lib/prisma";
import { createSession, logUserActivity, verifyPassword, hashPassword } from "@/lib/auth-session";
import { loginLimiter, getClientIp } from "@/lib/rate-limit";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function loginUser(formData: { email: string; password?: string; rememberMe?: boolean }) {
  try {
    const cleanEmail = formData.email.trim().toLowerCase();
    const cleanPassword = formData.password?.trim() || "";
    const rememberMe = formData.rememberMe !== undefined ? formData.rememberMe : true;

    // 0. Rate limiting check per IP + email
    const clientIp = await getClientIp();
    const rateLimitKey = `${clientIp}:${cleanEmail}`;

    const limitStatus = loginLimiter.check(rateLimitKey);
    if (!limitStatus.allowed) {
      const mins = Math.ceil(limitStatus.retryAfterSeconds / 60);
      return {
        success: false,
        error: `Too many failed login attempts. Please wait ${mins} minute${mins > 1 ? "s" : ""} before trying again.`,
      };
    }

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
            name: cleanEmail.includes("suman") ? "Suman Baidya" : "Agency Admin",
            companyName: "ABCD Agency",
            email: cleanEmail,
            password: hashPassword(cleanPassword),
            role: "SUPER_ADMIN",
            status: "Active",
            isVerified: true,
            lastLoginAt: new Date(),
          },
        });
      } else {
        const updateData: any = {
          lastLoginAt: new Date(),
          lastActiveAt: new Date(),
        };
        // Auto-upgrade password if still plain text
        if (!adminUser.password.startsWith("scrypt:")) {
          updateData.password = hashPassword(cleanPassword);
        }
        await db.user.update({
          where: { id: adminUser.id },
          data: updateData,
        });
      }

      // Successful login resets rate limit counter
      loginLimiter.reset(rateLimitKey);

      const cookieStore = await cookies();
      cookieStore.delete("abcd_new_client_tour");

      await createSession(adminUser.id, adminUser.role, rememberMe);
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
      const strikeRes = loginLimiter.record(rateLimitKey);
      if (!strikeRes.allowed) {
        const admin = await db.user.findFirst({ where: { role: "SUPER_ADMIN" }, select: { id: true } });
        if (admin) {
          await logUserActivity(
            admin.id,
            "SECURITY_ALERT",
            `Brute force attack on non-existent account (${cleanEmail}) from IP: ${clientIp}`,
            undefined,
            clientIp
          ).catch(() => {});
        }
      }
      return { success: false, error: "No account found with this email address." };
    }

    // Check password (supports scrypt hashes and backwards-compatible plaintext)
    const isPasswordValid = verifyPassword(cleanPassword, user.password);
    if (!isPasswordValid) {
      const strikeRes = loginLimiter.record(rateLimitKey);
      if (!strikeRes.allowed) {
        await logUserActivity(
          user.id,
          "SECURITY_ALERT",
          `Account locked (5 failed password attempts) from IP: ${clientIp}`,
          undefined,
          clientIp
        ).catch(() => {});
      }
      const remaining = limitStatus.remaining - 1;
      const warning = remaining > 0 && remaining <= 2 ? ` (${remaining} attempt${remaining > 1 ? "s" : ""} remaining)` : "";
      return { success: false, error: `Incorrect password. Please try again.${warning}` };
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

    // Successful login resets rate limit counter
    loginLimiter.reset(rateLimitKey);

    // Upgrade plaintext password to scrypt hash on successful login
    const updateData: any = {
      lastLoginAt: new Date(),
      lastActiveAt: new Date(),
    };
    if (!user.password.startsWith("scrypt:")) {
      updateData.password = hashPassword(cleanPassword);
    }

    await db.user.update({
      where: { id: user.id },
      data: updateData,
    });

    const cookieStore = await cookies();
    cookieStore.delete("abcd_new_client_tour");

    await createSession(user.id, user.role, rememberMe);
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
  revalidatePath("/", "layout");
  return { success: true };
}
