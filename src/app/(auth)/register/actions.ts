"use server";

import { db } from "@/lib/prisma";
import { getSiteConfig } from "@/lib/dbConfig";
import { createSession, logUserActivity } from "@/lib/auth-session";
import { revalidatePath } from "next/cache";

export interface RegisterInput {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  isWhatsappSame: boolean;
  whatsapp?: string;
  industry: string;
  location: string;
  website?: string;
  password: string;
}

export async function registerUser(data: RegisterInput) {
  try {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanCompany = data.companyName.trim();
    const cleanContactPerson = data.contactPerson?.trim() || cleanCompany;

    // Check if email already registered
    const existing = await db.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return { success: false, error: "An account with this email address already exists. Please log in." };
    }

    // Check config for OTP verification
    const config = await getSiteConfig();
    const requireOtp = config.requireEmailVerification ?? false;

    // Generate 6-digit OTP if required
    let otpCode: string | null = null;
    let otpExpiry: Date | null = null;

    if (requireOtp) {
      otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry
      console.log(`[Verification OTP] Generated code for ${cleanEmail}: ${otpCode}`);
    }

    const isSameWhatsapp = data.isWhatsappSame;
    const whatsappVal = isSameWhatsapp ? data.phone.trim() : (data.whatsapp?.trim() || null);

    // Create user record
    const user = await db.user.create({
      data: {
        name: cleanContactPerson,
        companyName: cleanCompany,
        email: cleanEmail,
        password: data.password, // In a real production app, bcrypt hash here
        phone: data.phone?.trim() || null,
        isWhatsappSame: isSameWhatsapp,
        whatsapp: whatsappVal,
        industry: data.industry?.trim() || null,
        location: data.location?.trim() || null,
        website: data.website?.trim() || null,
        role: "USER", // Prospect by default
        status: "Active",
        isVerified: !requireOtp,
        verificationOtp: otpCode,
        otpExpiresAt: otpExpiry,
        lastLoginAt: requireOtp ? null : new Date(),
        lastActiveAt: requireOtp ? null : new Date(),
      },
    });

    // Log registration activity
    await logUserActivity(
      user.id,
      "REGISTER",
      `New user account registered for company "${cleanCompany}"`
    );

    if (requireOtp) {
      return {
        success: true,
        requiresVerification: true,
        email: cleanEmail,
        userId: user.id,
        // In development / demo, we include the OTP in the response for convenience
        devOtp: process.env.NODE_ENV !== "production" ? otpCode : undefined,
      };
    }

    // If OTP is off, establish session immediately
    await createSession(user.id);
    await logUserActivity(user.id, "LOGIN", "Automatic initial session login");

    revalidatePath("/admin/users");
    revalidatePath("/admin");

    return {
      success: true,
      requiresVerification: false,
      redirectTo: "/portal",
    };
  } catch (error: any) {
    console.error("Registration error:", error);
    return { success: false, error: error?.message || "Failed to create account. Please try again." };
  }
}

export async function verifyOtpCode(userId: string, enteredCode: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: "User record not found." };
    }

    if (user.isVerified) {
      await createSession(user.id);
      return { success: true, redirectTo: "/portal" };
    }

    if (!user.verificationOtp || user.verificationOtp !== enteredCode.trim()) {
      return { success: false, error: "Invalid verification code. Please check and try again." };
    }

    if (user.otpExpiresAt && new Date() > user.otpExpiresAt) {
      return { success: false, error: "Verification code has expired. Please request a new one." };
    }

    // Mark verified
    await db.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationOtp: null,
        otpExpiresAt: null,
        lastLoginAt: new Date(),
        lastActiveAt: new Date(),
      },
    });

    await logUserActivity(user.id, "EMAIL_VERIFIED", "User successfully verified email via OTP");
    await createSession(user.id);

    revalidatePath("/admin/users");

    return { success: true, redirectTo: "/portal" };
  } catch (error: any) {
    console.error("Error verifying OTP:", error);
    return { success: false, error: "Failed to verify code. Please try again." };
  }
}

export async function resendOtpCode(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: "User not found." };
    }

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    await db.user.update({
      where: { id: user.id },
      data: {
        verificationOtp: newCode,
        otpExpiresAt: expiry,
      },
    });

    console.log(`[Resent OTP] New verification code for ${user.email}: ${newCode}`);
    await logUserActivity(user.id, "OTP_RESENT", "User requested a new verification OTP");

    return {
      success: true,
      message: "A new 6-digit code has been sent.",
      devOtp: process.env.NODE_ENV !== "production" ? newCode : undefined,
    };
  } catch (error: any) {
    console.error("Error resending OTP:", error);
    return { success: false, error: "Failed to resend code." };
  }
}
