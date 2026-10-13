"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth-session";
import { slugify } from "@/lib/slugify";

function ensureAdmin(user: any) {
  if (!user || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) {
    throw new Error("Unauthorized: Admin credentials required.");
  }
}

export async function createEcoSystemPlatform(formData: FormData) {
  const user = await getCurrentUser();
  ensureAdmin(user);

  const name = formData.get("name") as string;
  if (!name || !name.trim()) throw new Error("Platform name is required.");

  let slug = (formData.get("slug") as string)?.trim() || slugify(name);
  const tagline = (formData.get("tagline") as string) || "";
  const description = (formData.get("description") as string) || "";
  const category = (formData.get("category") as string) || "AI Automation";
  const status = (formData.get("status") as string) || "Live Platform";
  const appUrl = (formData.get("appUrl") as string) || null;
  const demoEmail = (formData.get("demoEmail") as string) || null;
  const demoPassword = (formData.get("demoPassword") as string) || null;
  const thumbnailUrl = (formData.get("thumbnailUrl") as string) || null;
  const targetAudience = (formData.get("targetAudience") as string) || null;
  const pricingModel = (formData.get("pricingModel") as string) || "SaaS & Custom White-Label Licensing";
  const isPublished = formData.get("isPublished") === "true";

  // Parse features and techStack
  const featuresRaw = (formData.get("features") as string) || "";
  const features = featuresRaw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const techStackRaw = (formData.get("techStack") as string) || "";
  const techStack = techStackRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const screenshotsRaw = (formData.get("screenshots") as string) || "";
  const screenshots = screenshotsRaw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  // Check unique slug
  const existing = await db.ecoSystemPlatform.findUnique({ where: { slug } });
  if (existing) {
    slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
  }

  await db.ecoSystemPlatform.create({
    data: {
      name: name.trim(),
      slug,
      tagline: tagline.trim(),
      description: description.trim(),
      category: category.trim(),
      status: status.trim(),
      appUrl: appUrl ? appUrl.trim() : null,
      demoEmail: demoEmail ? demoEmail.trim() : null,
      demoPassword: demoPassword ? demoPassword.trim() : null,
      thumbnailUrl: thumbnailUrl ? thumbnailUrl.trim() : null,
      screenshots,
      targetAudience: targetAudience ? targetAudience.trim() : null,
      pricingModel: pricingModel ? pricingModel.trim() : null,
      features,
      techStack,
      isPublished,
    },
  });

  revalidatePath("/ecosystem");
  revalidatePath("/admin/ecosystem");
  revalidatePath("/portal/ecosystem");
}

export async function updateEcoSystemPlatform(id: string, formData: FormData) {
  const user = await getCurrentUser();
  ensureAdmin(user);

  const name = formData.get("name") as string;
  if (!name || !name.trim()) throw new Error("Platform name is required.");

  const slug = (formData.get("slug") as string)?.trim() || slugify(name);
  const tagline = (formData.get("tagline") as string) || "";
  const description = (formData.get("description") as string) || "";
  const category = (formData.get("category") as string) || "AI Automation";
  const status = (formData.get("status") as string) || "Live Platform";
  const appUrl = (formData.get("appUrl") as string) || null;
  const demoEmail = (formData.get("demoEmail") as string) || null;
  const demoPassword = (formData.get("demoPassword") as string) || null;
  const thumbnailUrl = (formData.get("thumbnailUrl") as string) || null;
  const targetAudience = (formData.get("targetAudience") as string) || null;
  const pricingModel = (formData.get("pricingModel") as string) || "SaaS & Custom White-Label Licensing";
  const isPublished = formData.get("isPublished") === "true";

  const featuresRaw = (formData.get("features") as string) || "";
  const features = featuresRaw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  const techStackRaw = (formData.get("techStack") as string) || "";
  const techStack = techStackRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const screenshotsRaw = (formData.get("screenshots") as string) || "";
  const screenshots = screenshotsRaw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  await db.ecoSystemPlatform.update({
    where: { id },
    data: {
      name: name.trim(),
      slug,
      tagline: tagline.trim(),
      description: description.trim(),
      category: category.trim(),
      status: status.trim(),
      appUrl: appUrl ? appUrl.trim() : null,
      demoEmail: demoEmail ? demoEmail.trim() : null,
      demoPassword: demoPassword ? demoPassword.trim() : null,
      thumbnailUrl: thumbnailUrl ? thumbnailUrl.trim() : null,
      screenshots,
      targetAudience: targetAudience ? targetAudience.trim() : null,
      pricingModel: pricingModel ? pricingModel.trim() : null,
      features,
      techStack,
      isPublished,
    },
  });

  revalidatePath("/ecosystem");
  revalidatePath("/admin/ecosystem");
  revalidatePath("/portal/ecosystem");
}

export async function deleteEcoSystemPlatform(id: string) {
  const user = await getCurrentUser();
  ensureAdmin(user);

  await db.ecoSystemPlatform.delete({ where: { id } });

  revalidatePath("/ecosystem");
  revalidatePath("/admin/ecosystem");
  revalidatePath("/portal/ecosystem");
}

export async function toggleEcoSystemPublish(id: string, publishState: boolean) {
  const user = await getCurrentUser();
  ensureAdmin(user);

  await db.ecoSystemPlatform.update({
    where: { id },
    data: { isPublished: publishState },
  });

  revalidatePath("/ecosystem");
  revalidatePath("/admin/ecosystem");
  revalidatePath("/portal/ecosystem");
}
