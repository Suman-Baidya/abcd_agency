"use server";

import { db } from "@/lib/prisma";
import { getCurrentUser, logUserActivity } from "@/lib/auth-session";
import { z } from "zod";

const onboardingSchema = z.object({
  companyName: z.string().min(2, "Company or organization name must be at least 2 characters"),
  phone: z.string().min(10, "Please enter a valid phone number (at least 10 digits)"),
  isWhatsappSame: z.boolean().default(true),
  whatsapp: z.string().optional(),
  industry: z.string().min(1, "Please select an industry"),
  location: z.string().min(2, "Please provide your business location (city / country)"),
  website: z.string().optional(),
}).refine((data) => {
  if (!data.isWhatsappSame && (!data.whatsapp || data.whatsapp.trim().length < 10)) {
    return false;
  }
  return true;
}, {
  message: "Please enter a valid WhatsApp number",
  path: ["whatsapp"],
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;

export async function getOnboardingInitialData() {
  const user = await getCurrentUser();
  if (!user) return null;

  return {
    name: user.name,
    email: user.email,
    companyName: user.companyName === "Individual Client" ? "" : user.companyName,
    phone: user.phone || "",
    industry: user.industry === "General" ? "" : (user.industry || ""),
    location: user.location === "Not Specified" ? "" : (user.location || ""),
    website: user.website || "",
    isWhatsappSame: user.isWhatsappSame,
    whatsapp: user.whatsapp || "",
  };
}

export async function completeOnboardingProfile(data: OnboardingFormData) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    const validated = onboardingSchema.parse(data);

    await db.user.update({
      where: { id: user.id },
      data: {
        companyName: validated.companyName.trim(),
        phone: validated.phone.trim(),
        isWhatsappSame: validated.isWhatsappSame,
        whatsapp: validated.isWhatsappSame ? validated.phone.trim() : (validated.whatsapp?.trim() || null),
        industry: validated.industry.trim(),
        location: validated.location.trim(),
        website: validated.website?.trim() || null,
        lastActiveAt: new Date(),
      },
    });

    await logUserActivity(
      user.id,
      "PROFILE_COMPLETED",
      `Completed onboarding business profile: ${validated.companyName} (${validated.industry})`
    ).catch(() => {});

    return { success: true, redirectTo: "/portal" };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0]?.message || "Validation failed" };
    }
    console.error("Error completing onboarding:", error);
    return { success: false, error: "Unable to save your details. Please try again." };
  }
}
