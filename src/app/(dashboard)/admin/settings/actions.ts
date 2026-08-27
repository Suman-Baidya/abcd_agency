"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateBrandingSettings(formData: FormData) {
  try {
    const agencyName = formData.get("agencyName") as string;
    const lightLogoUrl = formData.get("lightLogoUrl") as string;
    const darkLogoUrl = formData.get("darkLogoUrl") as string;
    const faviconUrl = formData.get("faviconUrl") as string;
    
    const updateData = { agencyName, lightLogoUrl, darkLogoUrl, faviconUrl };
    
    await db.siteConfig.upsert({
      where: { id: "1" },
      update: updateData,
      create: { id: "1", ...updateData }
    });
    
    revalidatePath("/", "layout");
  } catch (e) {
    console.error("Failed to update branding settings", e);
    throw new Error("Failed to update branding settings");
  }
}

export async function updateContactAndSocialSettings(formData: FormData) {
  try {
    const contactEmail = formData.get("contactEmail") as string;
    const contactPhone = formData.get("contactPhone") as string;
    const rawWhatsappNumber = formData.get("whatsappNumber") as string;
    const whatsappNumber = rawWhatsappNumber ? rawWhatsappNumber.replace(/[^0-9]/g, "") : "";
    
    const linkedinUrl = formData.get("linkedinUrl") as string;
    const facebookUrl = formData.get("facebookUrl") as string;
    const instagramUrl = formData.get("instagramUrl") as string;
    const youtubeUrl = formData.get("youtubeUrl") as string;
    const twitterUrl = formData.get("twitterUrl") as string;
    const behanceUrl = formData.get("behanceUrl") as string;
    
    const updateData = {
      contactEmail,
      contactPhone,
      whatsappNumber,
      linkedinUrl,
      facebookUrl,
      instagramUrl,
      youtubeUrl,
      twitterUrl,
      behanceUrl
    };
    
    await db.siteConfig.upsert({
      where: { id: "1" },
      update: updateData,
      create: { id: "1", ...updateData }
    });
    
    revalidatePath("/", "layout");
  } catch (e) {
    console.error("Failed to update contact and social settings", e);
    throw new Error("Failed to update contact and social settings");
  }
}

export async function updateWidgetSettings(formData: FormData) {
  try {
    const enableWhatsappWidget = formData.get("enableWhatsappWidget") === "on";
    
    await db.siteConfig.upsert({
      where: { id: "1" },
      update: { enableWhatsappWidget },
      create: { id: "1", enableWhatsappWidget }
    });
    
    revalidatePath("/", "layout");
  } catch (e) {
    console.error("Failed to update widget settings", e);
    throw new Error("Failed to update widget settings");
  }
}

export async function updatePricingPackage(id: string, data: any) {
  try {
    await db.pricingPackage.update({
      where: { id },
      data: {
        name: data.name,
        targetAudience: data.targetAudience,
        deliverables: data.deliverables.split("\n").map((s: string) => s.trim()).filter(Boolean),
        support: data.support,
        timeline: data.timeline,
        investment: data.investment,
      }
    });
    revalidatePath("/admin/settings");
    revalidatePath("/pricing");
  } catch (e) {
    console.error("Failed to update pricing package", e);
    throw new Error("Failed to update pricing package");
  }
}

export async function updatePricingService(id: string, data: any) {
  try {
    await db.pricingService.update({
      where: { id },
      data: {
        name: data.name,
        scope: data.scope,
        monthlyRetainer: data.monthlyRetainer,
        yearlyPlan: data.yearlyPlan,
      }
    });
    revalidatePath("/admin/settings");
    revalidatePath("/pricing");
  } catch (e) {
    console.error("Failed to update pricing service", e);
    throw new Error("Failed to update pricing service");
  }
}

