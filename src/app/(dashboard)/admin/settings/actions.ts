"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const defaultSiteConfig = {
  id: "1",
  agencyName: "ABCD Agency",
  contactEmail: "hello@abcdagency.com",
  contactPhone: "+1 234 567 890",
  websiteUrl: "https://abcdagency.com",
  address: "Tripura, India",
};

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
      create: { ...defaultSiteConfig, ...updateData }
    });
    
    revalidatePath("/", "layout");
    revalidatePath("/admin/settings");
  } catch (e: any) {
    console.error("Failed to update branding settings", e);
    throw new Error(e?.message || "Failed to update branding settings");
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
      create: { ...defaultSiteConfig, ...updateData }
    });
    
    revalidatePath("/", "layout");
    revalidatePath("/admin/settings");
  } catch (e: any) {
    console.error("Failed to update contact and social settings", e);
    throw new Error(e?.message || "Failed to update contact and social settings");
  }
}

export async function updateWidgetSettings(formData: FormData) {
  try {
    const enableWhatsappWidget = formData.get("enableWhatsappWidget") === "on";
    
    await db.siteConfig.upsert({
      where: { id: "1" },
      update: { enableWhatsappWidget },
      create: { ...defaultSiteConfig, enableWhatsappWidget }
    });
    
    revalidatePath("/", "layout");
    revalidatePath("/admin/settings");
  } catch (e: any) {
    console.error("Failed to update widget settings", e);
    throw new Error(e?.message || "Failed to update widget settings");
  }
}

export async function updateAuthSettings(formData: FormData) {
  try {
    const requireEmailVerification = formData.get("requireEmailVerification") === "on";
    
    await db.siteConfig.upsert({
      where: { id: "1" },
      update: { requireEmailVerification },
      create: { ...defaultSiteConfig, requireEmailVerification }
    });
    
    revalidatePath("/admin/settings");
    revalidatePath("/", "layout");
  } catch (e: any) {
    console.error("Failed to update auth settings", e);
    throw new Error(e?.message || "Failed to update auth settings");
  }
}

export async function updatePricingPackage(id: string, data: any) {
  try {
    await db.pricingPackage.update({
      where: { id },
      data: {
        name: data.name,
        targetAudience: data.targetAudience,
        subHeading: data.subHeading,
        subDesc: data.subDesc,
        ctaLabel: data.ctaLabel,
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

export async function createPricingService(data: any) {
  try {
    const lastService = await db.pricingService.findFirst({
      orderBy: { order: 'desc' }
    });
    const nextOrder = lastService ? lastService.order + 1 : 0;

    await db.pricingService.create({
      data: {
        name: data.name,
        scope: data.scope,
        monthlyRetainer: data.monthlyRetainer,
        yearlyPlan: data.yearlyPlan,
        order: nextOrder
      }
    });
    revalidatePath("/admin/settings");
    revalidatePath("/pricing");
  } catch (e) {
    console.error("Failed to create pricing service", e);
    throw new Error("Failed to create pricing service");
  }
}

export async function deletePricingService(id: string) {
  try {
    await db.pricingService.delete({
      where: { id }
    });
    revalidatePath("/admin/settings");
    revalidatePath("/pricing");
  } catch (e) {
    console.error("Failed to delete pricing service", e);
    throw new Error("Failed to delete pricing service");
  }
}

export async function reorderPricingService(id: string, direction: "up" | "down") {
  try {
    const current = await db.pricingService.findUnique({ where: { id } });
    if (!current) return;

    const swapWith = await db.pricingService.findFirst({
      where: direction === "up" ? { order: { lt: current.order } } : { order: { gt: current.order } },
      orderBy: { order: direction === "up" ? "desc" : "asc" }
    });

    if (swapWith) {
      // Swap their orders
      await db.$transaction([
        db.pricingService.update({ where: { id: current.id }, data: { order: swapWith.order } }),
        db.pricingService.update({ where: { id: swapWith.id }, data: { order: current.order } })
      ]);
      revalidatePath("/admin/settings");
      revalidatePath("/pricing");
    }
  } catch (e) {
    console.error("Failed to reorder pricing service", e);
    throw new Error("Failed to reorder pricing service");
  }
}

export async function updateCareersSettings(formData: FormData) {
  try {
    const enableCareers = formData.get("enableCareers") === "on";
    const careersStatusText = (formData.get("careersStatusText") as string) || (enableCareers ? "Actively Hiring" : "Currently Closed");
    const careersNotice = (formData.get("careersNotice") as string) || "";

    const updateData = {
      enableCareers,
      careersStatusText,
      careersNotice,
    };

    await db.siteConfig.upsert({
      where: { id: "1" },
      update: updateData,
      create: { ...defaultSiteConfig, ...updateData },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/careers");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (e: any) {
    console.error("Failed to update careers settings", e);
    throw new Error(e?.message || "Failed to update careers settings");
  }
}

export async function updateLegalSettings(formData: FormData) {
  try {
    const updateData: Record<string, any> = {};

    if (formData.has("enablePrivacyPolicy")) {
      updateData.enablePrivacyPolicy = formData.get("enablePrivacyPolicy") === "on" || formData.get("enablePrivacyPolicy") === "true";
    }
    if (formData.has("privacyPolicyEffectiveDate")) {
      updateData.privacyPolicyEffectiveDate = formData.get("privacyPolicyEffectiveDate") as string;
    }
    if (formData.has("privacyPolicyContent")) {
      updateData.privacyPolicyContent = formData.get("privacyPolicyContent") as string;
    }

    if (formData.has("enableTermsOfService")) {
      updateData.enableTermsOfService = formData.get("enableTermsOfService") === "on" || formData.get("enableTermsOfService") === "true";
    }
    if (formData.has("termsOfServiceEffectiveDate")) {
      updateData.termsOfServiceEffectiveDate = formData.get("termsOfServiceEffectiveDate") as string;
    }
    if (formData.has("termsOfServiceContent")) {
      updateData.termsOfServiceContent = formData.get("termsOfServiceContent") as string;
    }

    if (formData.has("enableRefundPolicy")) {
      updateData.enableRefundPolicy = formData.get("enableRefundPolicy") === "on" || formData.get("enableRefundPolicy") === "true";
    }
    if (formData.has("refundPolicyEffectiveDate")) {
      updateData.refundPolicyEffectiveDate = formData.get("refundPolicyEffectiveDate") as string;
    }
    if (formData.has("refundPolicyContent")) {
      updateData.refundPolicyContent = formData.get("refundPolicyContent") as string;
    }

    if (formData.has("enableCookiePolicy")) {
      updateData.enableCookiePolicy = formData.get("enableCookiePolicy") === "on" || formData.get("enableCookiePolicy") === "true";
    }
    if (formData.has("cookiePolicyEffectiveDate")) {
      updateData.cookiePolicyEffectiveDate = formData.get("cookiePolicyEffectiveDate") as string;
    }
    if (formData.has("cookiePolicyContent")) {
      updateData.cookiePolicyContent = formData.get("cookiePolicyContent") as string;
    }

    await db.siteConfig.upsert({
      where: { id: "1" },
      update: updateData,
      create: { ...defaultSiteConfig, ...updateData },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/privacy");
    revalidatePath("/terms");
    revalidatePath("/refund");
    revalidatePath("/cookies");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (e: any) {
    console.error("Failed to update legal settings:", e);
    throw new Error(e?.message || "Failed to update legal settings");
  }
}

export async function updatePrivacyPolicySettings(formData: FormData) {
  try {
    const enablePrivacyPolicy = formData.get("enablePrivacyPolicy") === "on" || formData.get("enablePrivacyPolicy") === "true";
    const privacyPolicyEffectiveDate = (formData.get("privacyPolicyEffectiveDate") as string) || "August 2026";
    const privacyPolicyContent = (formData.get("privacyPolicyContent") as string) || "";

    const updateData = {
      enablePrivacyPolicy,
      privacyPolicyEffectiveDate,
      privacyPolicyContent,
    };

    await db.siteConfig.upsert({
      where: { id: "1" },
      update: updateData,
      create: { ...defaultSiteConfig, ...updateData },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/privacy");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (e: any) {
    console.error("Failed to update privacy policy settings:", e);
    throw new Error(e?.message || "Failed to update privacy policy");
  }
}

export async function updateTermsOfServiceSettings(formData: FormData) {
  try {
    const enableTermsOfService = formData.get("enableTermsOfService") === "on" || formData.get("enableTermsOfService") === "true";
    const termsOfServiceEffectiveDate = (formData.get("termsOfServiceEffectiveDate") as string) || "August 2026";
    const termsOfServiceContent = (formData.get("termsOfServiceContent") as string) || "";

    const updateData = {
      enableTermsOfService,
      termsOfServiceEffectiveDate,
      termsOfServiceContent,
    };

    await db.siteConfig.upsert({
      where: { id: "1" },
      update: updateData,
      create: { ...defaultSiteConfig, ...updateData },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/terms");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (e: any) {
    console.error("Failed to update terms of service settings:", e);
    throw new Error(e?.message || "Failed to update terms of service");
  }
}

export async function updateRefundPolicySettings(formData: FormData) {
  try {
    const enableRefundPolicy = formData.get("enableRefundPolicy") === "on" || formData.get("enableRefundPolicy") === "true";
    const refundPolicyEffectiveDate = (formData.get("refundPolicyEffectiveDate") as string) || "August 2026";
    const refundPolicyContent = (formData.get("refundPolicyContent") as string) || "";

    const updateData = {
      enableRefundPolicy,
      refundPolicyEffectiveDate,
      refundPolicyContent,
    };

    await db.siteConfig.upsert({
      where: { id: "1" },
      update: updateData,
      create: { ...defaultSiteConfig, ...updateData },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/refund");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (e: any) {
    console.error("Failed to update refund policy settings:", e);
    throw new Error(e?.message || "Failed to update refund policy");
  }
}

export async function updateCookiePolicySettings(formData: FormData) {
  try {
    const enableCookiePolicy = formData.get("enableCookiePolicy") === "on" || formData.get("enableCookiePolicy") === "true";
    const cookiePolicyEffectiveDate = (formData.get("cookiePolicyEffectiveDate") as string) || "August 2026";
    const cookiePolicyContent = (formData.get("cookiePolicyContent") as string) || "";

    const updateData = {
      enableCookiePolicy,
      cookiePolicyEffectiveDate,
      cookiePolicyContent,
    };

    await db.siteConfig.upsert({
      where: { id: "1" },
      update: updateData,
      create: { ...defaultSiteConfig, ...updateData },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/cookies");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (e: any) {
    console.error("Failed to update cookie policy settings:", e);
    throw new Error(e?.message || "Failed to update cookie policy");
  }
}

export async function toggleLegalPageVisibility(
  page: "privacy" | "terms" | "refund" | "cookies",
  enabled: boolean
) {
  try {
    const fieldMap: Record<string, string> = {
      privacy: "enablePrivacyPolicy",
      terms: "enableTermsOfService",
      refund: "enableRefundPolicy",
      cookies: "enableCookiePolicy",
    };

    const fieldName = fieldMap[page];
    if (!fieldName) throw new Error("Invalid legal page key");

    await db.siteConfig.upsert({
      where: { id: "1" },
      update: { [fieldName]: enabled },
      create: { ...defaultSiteConfig, [fieldName]: enabled },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/privacy");
    revalidatePath("/terms");
    revalidatePath("/refund");
    revalidatePath("/cookies");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (e: any) {
    console.error(`Failed to toggle visibility for ${page}:`, e);
    throw new Error(e?.message || `Failed to toggle visibility for ${page}`);
  }
}
