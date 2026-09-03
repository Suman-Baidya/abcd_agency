"use server";

import { db } from "@/lib/prisma";
import { verifyPasswordResetToken } from "@/lib/auth-token";
import { hashPassword, logUserActivity } from "@/lib/auth-session";

export async function performPasswordReset(token: string, newPassword: string) {
  try {
    if (!token || typeof token !== "string") {
      return { success: false, error: "Invalid password reset link." };
    }

    const payload = await verifyPasswordResetToken(token);
    if (!payload || !payload.uid) {
      return {
        success: false,
        error: "This password reset link has expired or has already been used. Please request a new link.",
      };
    }

    if (!newPassword || newPassword.length < 8) {
      return { success: false, error: "Password must be at least 8 characters long." };
    }

    const user = await db.user.findUnique({
      where: { id: payload.uid },
    });

    if (!user) {
      return { success: false, error: "Account not found." };
    }

    const hashedPassword = hashPassword(newPassword);

    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        lastActiveAt: new Date(),
      },
    });

    await logUserActivity(user.id, "PASSWORD_RESET", "Password successfully changed via secure reset email link");

    return { success: true, message: "Your password has been successfully updated." };
  } catch (error) {
    console.error("Error resetting password:", error);
    return { success: false, error: "Unable to update password. Please try again." };
  }
}
