"use server";

import { db } from "@/lib/prisma";
import { getSiteConfig } from "@/lib/dbConfig";
import { createSession, logUserActivity, hashPassword } from "@/lib/auth-session";
import { registerLimiter, otpVerifyLimiter, otpResendLimiter, getClientIp } from "@/lib/rate-limit";
import { checkSpamShield, isDisposableEmail } from "@/lib/spam-protection";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

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
  honeypot?: string;
  formLoadedAt?: number;
}

const DUMMY_PHONE_PATTERNS = [
  "0000000000",
  "1111111111",
  "2222222222",
  "3333333333",
  "4444444444",
  "5555555555",
  "6666666666",
  "7777777777",
  "8888888888",
  "9999999999",
  "1234567890",
  "0123456789",
  "9876543210",
];

function validateRegistrationInput(data: RegisterInput): string | null {
  // 1. Anti-spam shield (honeypot, sub-second speed, disposable email)
  const spamResult = checkSpamShield({
    honeypot: data.honeypot,
    formLoadedAt: data.formLoadedAt,
    email: data.email,
    minElapsedMs: 2000,
  });
  if (spamResult.isSpam) {
    return spamResult.reason || "Registration rejected. Suspicious activity detected.";
  }

  // 2. Company Name
  const company = data.companyName?.trim();
  if (!company || company.length < 2) {
    return "Please enter a valid Company or Organization name (at least 2 characters).";
  }

  // 3. Contact Person Full Name (at least 2 words)
  const contactPerson = data.contactPerson?.trim();
  if (!contactPerson) {
    return "Contact person name is required.";
  }
  const nameWords = contactPerson.split(/\s+/).filter(w => w.length > 0);
  if (nameWords.length < 2) {
    return "Please provide your full contact name with at least 2 words (e.g. John Doe).";
  }
  if (nameWords.some(w => w.length < 2)) {
    return "Each part of your name must have at least 2 characters.";
  }
  if (!/^[a-zA-Z\s.'-]+$/.test(contactPerson)) {
    return "Contact person name can only contain letters, spaces, and hyphens.";
  }

  // 4. Email validation
  const email = data.email?.trim().toLowerCase();
  if (!email) {
    return "Email address is required.";
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return "Please provide a valid email address (e.g. name@company.com).";
  }
  if (isDisposableEmail(email)) {
    return "Disposable or temporary email addresses are not allowed. Please use a valid personal or business email.";
  }

  // 5. Phone validation
  const phone = data.phone?.trim();
  if (!phone) {
    return "Phone number is required.";
  }
  const phoneDigits = phone.replace(/[^0-9]/g, "");
  if (phoneDigits.length < 10 || phoneDigits.length > 15) {
    return "Please enter a valid 10 to 15-digit phone number with country code.";
  }
  if (DUMMY_PHONE_PATTERNS.some(p => phoneDigits.includes(p))) {
    return "Please enter a valid personal or business phone number.";
  }

  // 6. WhatsApp Number validation
  if (!data.isWhatsappSame) {
    const whatsapp = data.whatsapp?.trim();
    if (!whatsapp) {
      return "WhatsApp number is required when different from phone number.";
    }
    const whatsappDigits = whatsapp.replace(/[^0-9]/g, "");
    if (whatsappDigits.length < 10 || whatsappDigits.length > 15) {
      return "Please enter a valid 10 to 15-digit WhatsApp number.";
    }
    if (DUMMY_PHONE_PATTERNS.some(p => whatsappDigits.includes(p))) {
      return "Please enter a valid WhatsApp number.";
    }
  }

  // 7. Industry validation
  const industry = data.industry?.trim();
  if (!industry || industry.length < 2) {
    return "Industry / Domain is required (e.g. FinTech, SaaS, Healthcare, E-Commerce).";
  }

  // 8. Location validation
  const location = data.location?.trim();
  if (!location || location.length < 3) {
    return "Location is required (e.g. Bangalore, India or New York, USA).";
  }

  // 9. Password validation
  if (!data.password || data.password.length < 8) {
    return "Password must be at least 8 characters long.";
  }

  return null;
}

export async function registerUser(data: RegisterInput) {
  try {
    const clientIp = await getClientIp();
    const regStatus = registerLimiter.record(clientIp);
    if (!regStatus.allowed) {
      const mins = Math.ceil(regStatus.retryAfterSeconds / 60);
      return {
        success: false,
        error: `Too many registration attempts from this network. Please try again in ${mins} minute${mins > 1 ? "s" : ""}.`,
      };
    }

    const validationError = validateRegistrationInput(data);
    if (validationError) {
      return { success: false, error: validationError };
    }

    const cleanEmail = data.email.trim().toLowerCase();
    const cleanCompany = data.companyName.trim();
    const cleanContactPerson = data.contactPerson.trim();
    const cleanIndustry = data.industry.trim();
    const cleanLocation = data.location.trim();
    const cleanPhone = data.phone.trim();

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
        password: hashPassword(data.password),
        phone: cleanPhone,
        isWhatsappSame: isSameWhatsapp,
        whatsapp: whatsappVal,
        industry: cleanIndustry,
        location: cleanLocation,
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
    const cookieStore = await cookies();
    cookieStore.set({
      name: "abcd_new_client_tour",
      value: "1",
      maxAge: 3600 * 24,
      path: "/",
      sameSite: "lax",
    });

    await createSession(user.id, user.role);
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
    const clientIp = await getClientIp();
    const rateLimitKey = `${clientIp}:${userId}`;

    const verifyCheck = otpVerifyLimiter.check(rateLimitKey);
    if (!verifyCheck.allowed) {
      const mins = Math.ceil(verifyCheck.retryAfterSeconds / 60);
      return {
        success: false,
        error: `Too many failed verification attempts. Please wait ${mins} minute${mins > 1 ? "s" : ""} before trying again.`,
      };
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: "User record not found." };
    }

    if (user.isVerified) {
      otpVerifyLimiter.reset(rateLimitKey);
      await createSession(user.id, user.role);
      return { success: true, redirectTo: "/portal" };
    }

    if (!user.verificationOtp || user.verificationOtp !== enteredCode.trim()) {
      otpVerifyLimiter.record(rateLimitKey);
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

    // Reset rate limiter on success
    otpVerifyLimiter.reset(rateLimitKey);

    const cookieStore = await cookies();
    cookieStore.set({
      name: "abcd_new_client_tour",
      value: "1",
      maxAge: 3600 * 24,
      path: "/",
      sameSite: "lax",
    });

    await logUserActivity(user.id, "EMAIL_VERIFIED", "User successfully verified email via OTP");
    await createSession(user.id, user.role);

    revalidatePath("/admin/users");

    return { success: true, redirectTo: "/portal" };
  } catch (error: any) {
    console.error("Error verifying OTP:", error);
    return { success: false, error: "Failed to verify code. Please try again." };
  }
}

export async function resendOtpCode(userId: string) {
  try {
    const clientIp = await getClientIp();
    const rateLimitKey = `${clientIp}:${userId}`;

    const resendCheck = otpResendLimiter.record(rateLimitKey);
    if (!resendCheck.allowed) {
      const mins = Math.ceil(resendCheck.retryAfterSeconds / 60);
      return {
        success: false,
        error: `Please wait ${mins} minute${mins > 1 ? "s" : ""} before requesting another verification code.`,
      };
    }

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
