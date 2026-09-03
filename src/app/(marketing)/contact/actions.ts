"use server";

import { db } from "@/lib/prisma";
import { z } from "zod";
import { contactFormSchema, type ContactFormData } from "@/lib/validations/contact";
import { inquiryLimiter, getClientIp } from "@/lib/rate-limit";
import { checkSpamShield } from "@/lib/spam-protection";

export async function submitInquiry(data: ContactFormData) {
  try {
    // 1. Rate limiting check
    const clientIp = await getClientIp();
    const limitStatus = inquiryLimiter.record(clientIp);
    if (!limitStatus.allowed) {
      const mins = Math.ceil(limitStatus.retryAfterSeconds / 60);
      return {
        success: false,
        error: `Too many inquiry submissions from this network. Please wait ${mins} minute${mins > 1 ? "s" : ""} before submitting again.`,
      };
    }

    // 2. Anti-spam shield (honeypot, submission speed, disposable email)
    const spamCheck = checkSpamShield({
      honeypot: data.honeypot,
      formLoadedAt: data.formLoadedAt,
      email: data.email,
      minElapsedMs: 1800,
    });

    if (spamCheck.isSpam) {
      // Silently accept honeypot triggers so bots don't adapt, but don't save to DB
      if (data.honeypot && data.honeypot.trim().length > 0) {
        const admin = await db.user.findFirst({ where: { role: "SUPER_ADMIN" }, select: { id: true } });
        if (admin) {
          const { logUserActivity } = await import("@/lib/auth-session");
          await logUserActivity(
            admin.id,
            "BOT_TRAPPED",
            `Honeypot caught automated spam bot from IP: ${clientIp}`,
            undefined,
            clientIp
          ).catch(() => {});
        }
        return { success: true, inquiryId: "inq_bot_trapped" };
      }
      return { success: false, error: spamCheck.reason || "Submission rejected." };
    }

    // 3. Schema validation
    const parsedData = contactFormSchema.parse(data);
    
    // 4. Save to database
    const inquiry = await db.inquiry.create({
      data: {
        name: parsedData.name,
        email: parsedData.email,
        mobile: parsedData.mobile,
        isWhatsappSame: parsedData.isWhatsappSame,
        whatsapp: parsedData.isWhatsappSame ? parsedData.mobile : parsedData.whatsapp,
        businessType: parsedData.businessType,
        services: parsedData.services,
        projectType: parsedData.projectType,
        budget: parsedData.budget,
        message: parsedData.message,
        status: "New",
        priority: "Medium",
      },
    });

    return { success: true, inquiryId: inquiry.id };
  } catch (error) {
    console.error("Error submitting inquiry:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: "Validation failed" };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}
