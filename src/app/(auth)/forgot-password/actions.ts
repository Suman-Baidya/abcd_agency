"use server";

import { db } from "@/lib/prisma";
import { signPasswordResetToken } from "@/lib/auth-token";
import { sendPasswordResetEmail } from "@/lib/email";
import { getClientIp } from "@/lib/rate-limit";

// Rate limiter: Max 3 password reset requests per 15 minutes per IP
const resetLimiterMap = new Map<string, number[]>();

function checkResetRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const hits = (resetLimiterMap.get(ip) || []).filter((t) => t > now - windowMs);

  if (hits.length >= 3) {
    resetLimiterMap.set(ip, hits);
    return false;
  }

  hits.push(now);
  resetLimiterMap.set(ip, hits);
  return true;
}

export async function requestPasswordReset(email: string) {
  try {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { success: false, error: "Please provide a valid email address." };
    }

    const clientIp = await getClientIp();
    if (!checkResetRateLimit(clientIp)) {
      return {
        success: false,
        error: "Too many password reset requests. Please wait 15 minutes before requesting again.",
      };
    }

    const user = await db.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true, name: true, email: true },
    });

    let devResetUrl: string | undefined = undefined;

    if (user) {
      const resetToken = await signPasswordResetToken(user.id, user.email, 3600); // 1 hour
      const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
      const appUrl = rawAppUrl && rawAppUrl.startsWith("http") ? rawAppUrl : "http://localhost:3000";
      const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;

      // Dispatch real email via Resend
      await sendPasswordResetEmail({
        to: user.email,
        resetUrl,
        userName: user.name,
      });

      if (process.env.NODE_ENV !== "production") {
        console.log(`\n========================================`);
        console.log(`[PASSWORD RESET LINK for ${user.email}]:`);
        console.log(resetUrl);
        console.log(`========================================\n`);
        devResetUrl = resetUrl;
      }
    }

    return {
      success: true,
      message: "If an account exists with this email address, a password reset link has been dispatched.",
      devResetUrl: process.env.NODE_ENV !== "production" ? devResetUrl : undefined,
    };
  } catch (error) {
    console.error("Error in requestPasswordReset:", error);
    return { success: false, error: "Unable to process password reset. Please try again." };
  }
}
