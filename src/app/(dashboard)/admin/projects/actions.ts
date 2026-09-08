"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { syncClientAndProjectBalances, parseCurrencyToNumber, formatNumberToINR } from "@/lib/sync-financials";
import { slugify } from "@/lib/slugify";
import { convertUserToClient } from "@/app/(dashboard)/admin/users/actions";
import {
  calculateAgreementFinancials,
  generateAgreementNumber,
  DEFAULT_AGREEMENT_TERMS,
  ProjectAgreementData,
  ConfirmationEvent,
  formatISTDateTime,
  parseConfirmationHistory,
} from "@/lib/agreement-defaults";
import { getCurrentUser } from "@/lib/auth-session";
import { headers } from "next/headers";
import crypto from "crypto";
import { sendSignedAgreementEmail, sendAgreementAmendmentEmail } from "@/lib/email";

export async function getAvailableClients() {
  try {
    const [clients, users] = await Promise.all([
      db.client.findMany({
        select: {
          id: true,
          name: true,
          email: true,
        },
        orderBy: { name: "asc" },
      }),
      db.user.findMany({
        where: {
          role: "USER",
          clientId: null,
        },
        select: {
          id: true,
          name: true,
          companyName: true,
          email: true,
        },
        orderBy: { name: "asc" },
      }),
    ]);

    const clientItems = clients.map((c: any) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      isUser: false,
    }));

    const userItems = users.map((u: any) => ({
      id: `user:${u.id}`,
      name: u.companyName || u.name,
      email: u.email,
      isUser: true,
    }));

    return [...clientItems, ...userItems];
  } catch (error) {
    console.error("Error fetching clients list:", error);
    return [];
  }
}

async function resolveAndPromoteClient(clientIdFromForm?: string | null, clientName?: string | null) {
  let resolvedClientId: string | null = clientIdFromForm || null;
  let resolvedClientName: string = clientName || "Agency Client";

  if (resolvedClientId && resolvedClientId.startsWith("user:")) {
    const userId = resolvedClientId.replace("user:", "");
    const promo = await convertUserToClient(userId);
    if (promo?.clientId) {
      resolvedClientId = promo.clientId;
      const cl = await db.client.findUnique({ where: { id: resolvedClientId } });
      if (cl) {
        resolvedClientName = cl.name;
      }
    }
  } else if (!resolvedClientId && clientName) {
    const existingClient = await db.client.findFirst({
      where: { name: { equals: clientName, mode: "insensitive" } },
    });
    if (existingClient) {
      resolvedClientId = existingClient.id;
      resolvedClientName = existingClient.name;
    }
  } else if (resolvedClientId && !clientName) {
    const existingClient = await db.client.findUnique({
      where: { id: resolvedClientId },
    });
    if (existingClient) {
      resolvedClientName = existingClient.name;
    }
  }

  return { resolvedClientId, resolvedClientName };
}

export async function getUniqueProjectSlug(desiredSlug: string, currentProjectId?: string): Promise<string> {
  const base = slugify(desiredSlug) || "project";
  let candidate = base;
  let counter = 1;

  while (true) {
    const existing = await db.project.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing || (currentProjectId && existing.id === currentProjectId)) {
      return candidate;
    }

    candidate = `${base}-${counter}`;
    counter++;
  }
}

async function syncProjectAgreement(
  projectId: string,
  projectSlug: string,
  budgetRaw: number,
  startDate?: string,
  endDate?: string,
  formData?: FormData
) {
  try {
    const existingAgr = await (db as any).projectAgreement.findUnique({ where: { projectId } }).catch(() => null);

    const agreementNumber =
      (formData?.get("agreementNumber") as string)?.trim() ||
      existingAgr?.agreementNumber ||
      generateAgreementNumber(undefined, projectSlug);

    const advancePercent = formData?.has("advancePercent")
      ? parseInt((formData?.get("advancePercent") as string) || "40")
      : (existingAgr?.advancePercent ?? 40);

    const deliveryPercent = formData?.has("deliveryPercent")
      ? parseInt((formData?.get("deliveryPercent") as string) || "40")
      : (existingAgr?.deliveryPercent ?? 40);

    const finalPercent = formData?.has("finalPercent")
      ? parseInt((formData?.get("finalPercent") as string) || "20")
      : (existingAgr?.finalPercent ?? 20);

    const paymentDueDays = formData?.has("paymentDueDays")
      ? parseInt((formData?.get("paymentDueDays") as string) || "7")
      : (existingAgr?.paymentDueDays ?? 7);

    const reviewWindowDays = formData?.has("reviewWindowDays")
      ? parseInt((formData?.get("reviewWindowDays") as string) || "14")
      : (existingAgr?.reviewWindowDays ?? 14);

    const revisionRounds = formData?.has("revisionRounds")
      ? parseInt((formData?.get("revisionRounds") as string) || "2")
      : (existingAgr?.revisionRounds ?? 2);

    const estimatedDuration = formData?.has("estimatedDuration")
      ? ((formData?.get("estimatedDuration") as string)?.trim() || "4 Weeks")
      : (existingAgr?.estimatedDuration || "4 Weeks");

    const termsAndPolicy = formData?.has("termsAndPolicy")
      ? ((formData?.get("termsAndPolicy") as string)?.trim() || DEFAULT_AGREEMENT_TERMS)
      : (existingAgr?.termsAndPolicy || DEFAULT_AGREEMENT_TERMS);

    const notes = formData?.has("agreementNotes")
      ? ((formData?.get("agreementNotes") as string)?.trim() || null)
      : (existingAgr?.notes ?? null);

    const fin = calculateAgreementFinancials(
      budgetRaw,
      advancePercent,
      deliveryPercent,
      finalPercent,
      paymentDueDays
    );

    await (db as any).projectAgreement.upsert({
      where: { projectId },
      create: {
        projectId,
        agreementNumber,
        startDate: startDate || null,
        deliveryDate: endDate || null,
        estimatedDuration: estimatedDuration || null,
        totalAmountRaw: budgetRaw,
        advancePercent: fin.advancePercent,
        advanceAmountRaw: fin.advanceAmountRaw,
        deliveryPercent: fin.deliveryPercent,
        deliveryAmountRaw: fin.deliveryAmountRaw,
        finalPercent: fin.finalPercent,
        finalAmountRaw: fin.finalAmountRaw,
        paymentDueDays: fin.paymentDueDays,
        reviewWindowDays,
        revisionRounds,
        termsAndPolicy,
        notes: notes || null,
      },
      update: {
        startDate: startDate || null,
        deliveryDate: endDate || null,
        estimatedDuration: estimatedDuration || null,
        totalAmountRaw: budgetRaw,
        advancePercent: fin.advancePercent,
        advanceAmountRaw: fin.advanceAmountRaw,
        deliveryPercent: fin.deliveryPercent,
        deliveryAmountRaw: fin.deliveryAmountRaw,
        finalPercent: fin.finalPercent,
        finalAmountRaw: fin.finalAmountRaw,
        paymentDueDays: fin.paymentDueDays,
        reviewWindowDays,
        revisionRounds,
        termsAndPolicy,
        notes: notes || null,
      },
    });
  } catch (err) {
    console.error("Failed to sync project agreement:", err);
  }
}

export async function createProject(formData: FormData) {
  const title = (formData.get("title") as string)?.trim() || "Untitled Project";
  const rawSlug = (formData.get("slug") as string)?.trim() || title;
  const slug = await getUniqueProjectSlug(rawSlug);
  let client = (formData.get("client") as string)?.trim();
  const clientIdFromForm = formData.get("clientId") as string;
  const category = formData.get("category") as string;
  const tagline = formData.get("tagline") as string;
  const summary = formData.get("summary") as string;
  const impact = formData.get("impact") as string;
  const techStackRaw = formData.get("techStack") as string;
  const techStack = techStackRaw ? techStackRaw.split(",").map(t => t.trim()) : [];
  
  const isFeatured = formData.get("isFeatured") === "on";
  
  const status = (formData.get("status") as string) || "In Review";
  
  let statusColor = "neutral";
  if (status === "On Track") statusColor = "emerald";
  else if (status === "Delayed") statusColor = "amber";
  else if (status === "On Hold") statusColor = "neutral";
  
  const progress = parseInt((formData.get("progress") as string) || "0");
  const rawBudgetInput = formData.get("budget") as string;
  const budgetRaw = parseCurrencyToNumber(rawBudgetInput);
  const budget = formatNumberToINR(budgetRaw);

  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const deadline = JSON.stringify({ startDate, endDate });
  const content = formData.get("content") as string || "";

  const { resolvedClientId, resolvedClientName } = await resolveAndPromoteClient(clientIdFromForm, client);
  client = resolvedClientName;

  const project = await db.project.create({
    data: {
      title,
      slug,
      client: client || "Agency Client",
      clientId: resolvedClientId,
      category,
      tagline,
      summary,
      impact,
      techStack,
      isFeatured,
      status,
      statusColor,
      progress,
      budget,
      budgetRaw,
      deadline,
      content,
    }
  });

  // Automatically provision and link official project agreement
  await syncProjectAgreement(project.id, project.slug, budgetRaw, startDate, endDate, formData);

  if (resolvedClientId || client) {
    await syncClientAndProjectBalances(resolvedClientId || client);
  }

  revalidatePath("/admin/projects");
  revalidatePath("/admin/clients");
  revalidatePath("/admin/finance");
  revalidatePath("/admin");
  revalidatePath("/work");
  revalidatePath("/");
  
  redirect("/admin/projects");
}

export async function updateProjectFull(id: string, formData: FormData) {
  const title = (formData.get("title") as string)?.trim() || "Untitled Project";
  const rawSlug = (formData.get("slug") as string)?.trim() || title;
  const slug = await getUniqueProjectSlug(rawSlug, id);
  let client = (formData.get("client") as string)?.trim();
  const clientIdFromForm = formData.get("clientId") as string;
  const category = formData.get("category") as string;
  const tagline = formData.get("tagline") as string;
  const summary = formData.get("summary") as string;
  const impact = formData.get("impact") as string;
  const techStackRaw = formData.get("techStack") as string;
  const techStack = techStackRaw ? techStackRaw.split(",").map(t => t.trim()) : [];
  
  const isFeatured = formData.get("isFeatured") === "on";
  
  const status = (formData.get("status") as string) || "In Review";
  const statusColor = (formData.get("statusColor") as string) || "neutral";
  const progress = parseInt((formData.get("progress") as string) || "0");
  const rawBudgetInput = formData.get("budget") as string;
  const budgetRaw = parseCurrencyToNumber(rawBudgetInput);
  const budget = formatNumberToINR(budgetRaw);

  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const deadline = JSON.stringify({ startDate, endDate });
  const content = formData.get("content") as string || "";

  const { resolvedClientId, resolvedClientName } = await resolveAndPromoteClient(clientIdFromForm, client);
  client = resolvedClientName;

  const updated = await db.project.update({
    where: { id },
    data: {
      title,
      slug,
      client: client || "Agency Client",
      clientId: resolvedClientId,
      category,
      tagline,
      summary,
      impact,
      techStack,
      isFeatured,
      status,
      statusColor,
      progress,
      budget,
      budgetRaw,
      deadline,
      content,
    }
  });

  // Sync project agreement
  await syncProjectAgreement(id, slug, budgetRaw, startDate, endDate, formData);

  if (resolvedClientId || client) {
    await syncClientAndProjectBalances(resolvedClientId || client);
  }

  revalidatePath("/admin/projects");
  revalidatePath("/admin/clients");
  revalidatePath("/admin/finance");
  revalidatePath("/admin");
  revalidatePath("/work");
  revalidatePath("/");
}

export async function createProjectInline(formData: FormData) {
  const title = (formData.get("title") as string)?.trim() || "Untitled Project";
  const rawSlug = (formData.get("slug") as string)?.trim() || title;
  const slug = await getUniqueProjectSlug(rawSlug);
  let client = (formData.get("client") as string)?.trim();
  const clientIdFromForm = formData.get("clientId") as string;
  const category = formData.get("category") as string;
  const tagline = formData.get("tagline") as string;
  const summary = formData.get("summary") as string;
  const impact = formData.get("impact") as string;
  const techStackRaw = formData.get("techStack") as string;
  const techStack = techStackRaw ? techStackRaw.split(",").map(t => t.trim()) : [];
  
  const isFeatured = formData.get("isFeatured") === "on";
  
  const status = (formData.get("status") as string) || "In Review";
  const statusColor = (formData.get("statusColor") as string) || "neutral";
  const progress = parseInt((formData.get("progress") as string) || "0");
  const rawBudgetInput = formData.get("budget") as string;
  const budgetRaw = parseCurrencyToNumber(rawBudgetInput);
  const budget = formatNumberToINR(budgetRaw);

  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const deadline = (startDate || endDate) ? JSON.stringify({ startDate, endDate }) : (formData.get("deadline") as string || "");
  const content = formData.get("content") as string || "";

  const { resolvedClientId, resolvedClientName } = await resolveAndPromoteClient(clientIdFromForm, client);
  client = resolvedClientName;

  const created = await db.project.create({
    data: {
      title,
      slug,
      client: client || "Agency Client",
      clientId: resolvedClientId,
      category,
      tagline,
      summary,
      impact,
      techStack,
      isFeatured,
      status,
      statusColor,
      progress,
      budget,
      budgetRaw,
      deadline,
      content,
    }
  });

  // Sync project agreement
  await syncProjectAgreement(created.id, created.slug, budgetRaw, startDate, endDate, formData);

  if (resolvedClientId || client) {
    await syncClientAndProjectBalances(resolvedClientId || client);
  }

  revalidatePath("/admin/projects");
  revalidatePath("/admin/clients");
  revalidatePath("/admin/finance");
  revalidatePath("/admin");
  revalidatePath("/work");
  revalidatePath("/");
  return created;
}

export async function getProjectAgreement(projectId: string): Promise<ProjectAgreementData | null> {
  try {
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        clientRel: true,
      },
    });

    if (!project) return null;

    let agreement: any = null;
    try {
      agreement = await db.projectAgreement.findUnique({
        where: { projectId },
      });
    } catch (e) {
      console.warn("Could not find project agreement:", e);
    }

    let deadlineObj = { startDate: "", endDate: "" };
    try {
      if (project.deadline) deadlineObj = JSON.parse(project.deadline);
    } catch (e) {}

    const budgetRaw = project.budgetRaw > 0 ? project.budgetRaw : parseCurrencyToNumber(project.budget);

    // If agreement does not exist in database, auto-create default so it can be viewed & downloaded immediately
    if (!agreement) {
      const agrNumber = generateAgreementNumber(undefined, project.slug);
      const fin = calculateAgreementFinancials(budgetRaw, 40, 40, 20, 7);
      agreement = await db.projectAgreement.create({
        data: {
          projectId: project.id,
          agreementNumber: agrNumber,
          startDate: deadlineObj.startDate || null,
          deliveryDate: deadlineObj.endDate || null,
          estimatedDuration: "4 Weeks",
          totalAmountRaw: budgetRaw,
          advancePercent: fin.advancePercent,
          advanceAmountRaw: fin.advanceAmountRaw,
          deliveryPercent: fin.deliveryPercent,
          deliveryAmountRaw: fin.deliveryAmountRaw,
          finalPercent: fin.finalPercent,
          finalAmountRaw: fin.finalAmountRaw,
          paymentDueDays: 7,
          reviewWindowDays: 14,
          revisionRounds: 2,
          termsAndPolicy: DEFAULT_AGREEMENT_TERMS,
        },
      });
    }

    return {
      id: agreement.id,
      projectId: project.id,
      agreementNumber: agreement.agreementNumber,
      status: agreement.status as any,
      startDate: agreement.startDate || deadlineObj.startDate || "",
      deliveryDate: agreement.deliveryDate || deadlineObj.endDate || "",
      estimatedDuration: agreement.estimatedDuration || "4 Weeks",
      totalAmountRaw: agreement.totalAmountRaw,
      advancePercent: agreement.advancePercent,
      advanceAmountRaw: agreement.advanceAmountRaw,
      deliveryPercent: agreement.deliveryPercent,
      deliveryAmountRaw: agreement.deliveryAmountRaw,
      finalPercent: agreement.finalPercent,
      finalAmountRaw: agreement.finalAmountRaw,
      paymentDueDays: agreement.paymentDueDays,
      reviewWindowDays: agreement.reviewWindowDays,
      revisionRounds: agreement.revisionRounds,
      termsAndPolicy: agreement.termsAndPolicy || DEFAULT_AGREEMENT_TERMS,
      notes: agreement.notes || undefined,
      issuedAt: agreement.createdAt,
      updatedAt: agreement.updatedAt,
      projectTitle: project.title,
      projectCategory: project.category,
      projectSummary: project.summary,
      clientName: project.clientRel?.name || project.client || "Client Account",
      clientContactPerson: project.clientRel?.contactPerson || "",
      clientEmail: project.clientRel?.email || "",
      clientPhone: project.clientRel?.phone || "",
      clientLocation: project.clientRel?.location || "",
      signedAt: agreement.signedAt,
      signedByName: agreement.signedByName,
      signedByEmail: agreement.signedByEmail,
      signedByTitle: agreement.signedByTitle,
      signedIp: agreement.signedIp,
      signedUserAgent: agreement.signedUserAgent,
      signatureType: agreement.signatureType,
      clientSignature: agreement.clientSignature,
      contractorSignedAt: agreement.contractorSignedAt,
      contractorSignature: agreement.contractorSignature,
      signedAuditHash: agreement.signedAuditHash,
      originalSignedAt: agreement.originalSignedAt,
      originalSignedIp: agreement.originalSignedIp,
      originalAuditHash: agreement.originalAuditHash,
      confirmationHistory: agreement.confirmationHistory,
    };
  } catch (error) {
    console.error("Error retrieving project agreement:", error);
    return null;
  }
}

export async function updateProjectAgreement(data: {
  projectId: string;
  agreementNumber?: string;
  status?: "Active" | "Draft" | "Completed";
  startDate?: string;
  deliveryDate?: string;
  estimatedDuration?: string;
  totalAmountRaw?: number;
  advancePercent?: number;
  advanceAmountRaw?: number;
  deliveryPercent?: number;
  deliveryAmountRaw?: number;
  finalPercent?: number;
  finalAmountRaw?: number;
  paymentDueDays?: number;
  reviewWindowDays?: number;
  revisionRounds?: number;
  termsAndPolicy?: string;
  notes?: string;
}) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Unauthorized. Super Admin permissions are required to modify legal agreements." };
    }

    const { projectId, ...fields } = data;
    if (!projectId) {
      return { success: false, error: "Project ID is required" };
    }

    const existingAgr = await (db as any).projectAgreement.findUnique({ where: { projectId } }).catch(() => null);

    const totalRaw = Number(fields.totalAmountRaw ?? 0);
    const advPct = Number(fields.advancePercent ?? 40);
    const delPct = Number(fields.deliveryPercent ?? 40);
    const finPct = Number(fields.finalPercent ?? 20);
    const dueDays = Number(fields.paymentDueDays ?? 7);

    const fin = calculateAgreementFinancials(totalRaw, advPct, delPct, finPct, dueDays);

    // If agreement was already signed, track the amendment in history and guarantee original audit metadata is retained
    let updateAuditFields: any = {};
    if (existingAgr?.signedAt) {
      const origAt = existingAgr.originalSignedAt || existingAgr.signedAt;
      const origIp = existingAgr.originalSignedIp || existingAgr.signedIp;
      const origHash = existingAgr.originalAuditHash || existingAgr.signedAuditHash;

      let history: ConfirmationEvent[] = parseConfirmationHistory(existingAgr.confirmationHistory);
      if (history.length === 0 && existingAgr.signedAt) {
        history.push({
          id: "evt_init",
          event: "INITIAL_EXECUTION",
          timestamp: new Date(existingAgr.signedAt).toISOString(),
          formattedTimeIST: formatISTDateTime(existingAgr.signedAt),
          ip: origIp || "Verified",
          userAgent: existingAgr.signedUserAgent || "Client Device",
          signerName: existingAgr.signedByName || "Client Signatory",
          signerTitle: existingAgr.signedByTitle || "Authorized Signatory",
          signerEmail: existingAgr.signedByEmail || "",
          signatureType: existingAgr.signatureType || "DRAW",
          auditHash: origHash || undefined,
          notes: "Initial Statement of Work execution under IT Act, 2000 § 10A",
        });
      }

      const amendmentNow = new Date();
      history.push({
        id: "evt_" + Math.random().toString(36).substring(2, 9),
        event: "SUPER_ADMIN_AMENDMENT",
        timestamp: amendmentNow.toISOString(),
        formattedTimeIST: formatISTDateTime(amendmentNow),
        adminEmail: currentUser.email || "superadmin@abcdagency.com",
        adminName: currentUser.name || "Super Admin",
        notes: "Agreement terms, deliverables or milestones updated by Super Admin",
      });

      updateAuditFields = {
        originalSignedAt: origAt,
        originalSignedIp: origIp,
        originalAuditHash: origHash,
        confirmationHistory: JSON.stringify(history),
      };
    }

    await (db as any).projectAgreement.upsert({
      where: { projectId },
      create: {
        projectId,
        agreementNumber: fields.agreementNumber || generateAgreementNumber(),
        status: fields.status || "Active",
        startDate: fields.startDate || null,
        deliveryDate: fields.deliveryDate || null,
        estimatedDuration: fields.estimatedDuration || "4 Weeks",
        totalAmountRaw: fin.totalAmountRaw,
        advancePercent: fin.advancePercent,
        advanceAmountRaw: fin.advanceAmountRaw,
        deliveryPercent: fin.deliveryPercent,
        deliveryAmountRaw: fin.deliveryAmountRaw,
        finalPercent: fin.finalPercent,
        finalAmountRaw: fin.finalAmountRaw,
        paymentDueDays: fin.paymentDueDays,
        reviewWindowDays: fields.reviewWindowDays !== undefined ? Number(fields.reviewWindowDays) : 14,
        revisionRounds: fields.revisionRounds !== undefined ? Number(fields.revisionRounds) : 2,
        termsAndPolicy: fields.termsAndPolicy || DEFAULT_AGREEMENT_TERMS,
        notes: fields.notes || null,
      },
      update: {
        ...(fields.agreementNumber ? { agreementNumber: fields.agreementNumber } : {}),
        ...(fields.status ? { status: fields.status } : {}),
        startDate: fields.startDate || null,
        deliveryDate: fields.deliveryDate || null,
        estimatedDuration: fields.estimatedDuration || null,
        totalAmountRaw: fin.totalAmountRaw,
        advancePercent: fin.advancePercent,
        advanceAmountRaw: fin.advanceAmountRaw,
        deliveryPercent: fin.deliveryPercent,
        deliveryAmountRaw: fin.deliveryAmountRaw,
        finalPercent: fin.finalPercent,
        finalAmountRaw: fin.finalAmountRaw,
        paymentDueDays: fin.paymentDueDays,
        ...(fields.reviewWindowDays !== undefined ? { reviewWindowDays: Number(fields.reviewWindowDays) } : {}),
        ...(fields.revisionRounds !== undefined ? { revisionRounds: Number(fields.revisionRounds) } : {}),
        ...(fields.termsAndPolicy !== undefined ? { termsAndPolicy: fields.termsAndPolicy } : {}),
        ...(fields.notes !== undefined ? { notes: fields.notes } : {}),
        ...updateAuditFields,
      },
    });

    // Also sync the project budget and deadline if totalAmountRaw or dates were changed
    try {
      const projectUpdateData: any = {};
      if (fields.totalAmountRaw !== undefined && fields.totalAmountRaw > 0) {
        projectUpdateData.budgetRaw = fin.totalAmountRaw;
        projectUpdateData.budget = formatNumberToINR(fin.totalAmountRaw);
      }
      if (fields.startDate || fields.deliveryDate) {
        projectUpdateData.deadline = JSON.stringify({
          startDate: fields.startDate || "",
          endDate: fields.deliveryDate || "",
        });
      }
      if (Object.keys(projectUpdateData).length > 0) {
        await db.project.update({
          where: { id: projectId },
          data: projectUpdateData,
        });
      }
    } catch (syncErr) {
      console.warn("Could not sync project record from agreement update:", syncErr);
    }

    revalidatePath("/admin/projects");
    revalidatePath("/admin/clients");
    revalidatePath("/portal/projects");
    revalidatePath("/portal/documents");

    const updatedAgreement = await getProjectAgreement(projectId);

    // If agreement was already confirmed/executed by client, dispatch formal Notice of Variation
    if (existingAgr?.signedAt && updatedAgreement) {
      const recipientEmail = updatedAgreement.signedByEmail || updatedAgreement.clientEmail;
      if (recipientEmail) {
        try {
          const formattedUpdated = updatedAgreement.updatedAt
            ? new Date(updatedAgreement.updatedAt).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                dateStyle: "medium",
                timeStyle: "short",
              }) + " IST"
            : new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

          await sendAgreementAmendmentEmail({
            to: recipientEmail,
            clientName: updatedAgreement.signedByName || updatedAgreement.clientContactPerson || updatedAgreement.clientName || "Valued Client",
            projectTitle: updatedAgreement.projectTitle || "Project Deliverables",
            agreementNumber: updatedAgreement.agreementNumber,
            updatedAtFormatted: formattedUpdated,
          });
        } catch (emailErr) {
          console.warn("Could not dispatch amendment notification email:", emailErr);
        }
      }
    }

    return { success: true, agreement: updatedAgreement };
  } catch (error: any) {
    console.error("Error updating project agreement:", error);
    return { success: false, error: error.message || "Failed to update project agreement" };
  }
}

export async function signProjectAgreement(data: {
  projectId: string;
  signatureType: "DRAW" | "TYPE";
  signatureData: string;
  legalName: string;
  jobTitle: string;
}) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, error: "Authentication required to execute legal agreement." };
    }

    const { projectId, signatureType, signatureData, legalName, jobTitle } = data;
    if (!projectId || !signatureData || !legalName) {
      return { success: false, error: "Legal name and signature are required." };
    }

    const project = await db.project.findUnique({
      where: { id: projectId },
      include: { clientRel: true },
    });
    if (!project) {
      return { success: false, error: "Project not found." };
    }

    // Authorization check
    const isOwnerClient = currentUser.clientId && currentUser.clientId === project.clientId;
    const isUserEmailMatch = currentUser.email && (currentUser.email === project.clientRel?.email || currentUser.email === project.client);
    const isAdmin = currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN";

    if (!isOwnerClient && !isUserEmailMatch && !isAdmin) {
      return { success: false, error: "Unauthorized. Only the contracted client or authorized administrator can execute this agreement." };
    }

    const existingAgreement = await (db as any).projectAgreement.findUnique({
      where: { projectId },
    });
    if (!existingAgreement) {
      return { success: false, error: "Project agreement has not been drafted yet." };
    }

    const headerList = await headers();
    const forwardedFor = headerList.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : (headerList.get("x-real-ip") || "127.0.0.1");
    const userAgent = headerList.get("user-agent") || "Unknown Browser Client";
    const signedDate = new Date();

    // SHA-256 Non-Repudiation Checksum
    const auditPayload = `${existingAgreement.agreementNumber}|${projectId}|${existingAgreement.totalAmountRaw}|${legalName}|${currentUser.email}|${signedDate.toISOString()}|${clientIp}`;
    const signedAuditHash = crypto.createHash("sha256").update(auditPayload).digest("hex");

    const contractorSignature = "Suman Baidya [Certified Independent Contractor]";

    const isFirstTime = !existingAgreement.signedAt;
    const originalSignedAt = existingAgreement.originalSignedAt || (isFirstTime ? signedDate : existingAgreement.signedAt);
    const originalSignedIp = existingAgreement.originalSignedIp || (isFirstTime ? clientIp : existingAgreement.signedIp);
    const originalAuditHash = existingAgreement.originalAuditHash || (isFirstTime ? signedAuditHash : existingAgreement.signedAuditHash);

    let history: ConfirmationEvent[] = parseConfirmationHistory(existingAgreement.confirmationHistory);
    if (history.length === 0 && !isFirstTime && existingAgreement.signedAt) {
      history.push({
        id: "evt_init",
        event: "INITIAL_EXECUTION",
        timestamp: new Date(existingAgreement.signedAt).toISOString(),
        formattedTimeIST: formatISTDateTime(existingAgreement.signedAt),
        ip: existingAgreement.originalSignedIp || existingAgreement.signedIp || "Verified",
        userAgent: existingAgreement.signedUserAgent || "Client Device",
        signerName: existingAgreement.signedByName || "Client Signatory",
        signerTitle: existingAgreement.signedByTitle || "Authorized Signatory",
        signerEmail: existingAgreement.signedByEmail || "",
        signatureType: existingAgreement.signatureType || "DRAW",
        auditHash: existingAgreement.originalAuditHash || existingAgreement.signedAuditHash || undefined,
        notes: "Initial Statement of Work execution under IT Act, 2000 § 10A",
      });
    }

    const formattedSignedDate = formatISTDateTime(signedDate);

    history.push({
      id: "evt_" + Math.random().toString(36).substring(2, 9),
      event: isFirstTime ? "INITIAL_EXECUTION" : "AMENDMENT_RECONFIRMATION",
      timestamp: signedDate.toISOString(),
      formattedTimeIST: formattedSignedDate,
      ip: clientIp,
      userAgent: userAgent,
      signerName: legalName.trim(),
      signerTitle: jobTitle?.trim() || "Authorized Signatory",
      signerEmail: currentUser.email || project.clientRel?.email || "",
      signatureType,
      auditHash: signedAuditHash,
      notes: isFirstTime
        ? "Initial digital execution pursuant to Indian Contract Act § 10A"
        : "Client re-confirmation & digital execution of revised terms",
    });

    await (db as any).projectAgreement.update({
      where: { projectId },
      data: {
        status: "Completed",
        signedAt: signedDate,
        signedByName: legalName.trim(),
        signedByEmail: currentUser.email || project.clientRel?.email || "",
        signedByTitle: jobTitle?.trim() || "Authorized Signatory",
        signedIp: clientIp,
        signedUserAgent: userAgent,
        signatureType,
        clientSignature: signatureData,
        contractorSignedAt: existingAgreement.contractorSignedAt || signedDate,
        contractorSignature,
        signedAuditHash,
        originalSignedAt,
        originalSignedIp,
        originalAuditHash,
        confirmationHistory: JSON.stringify(history),
      },
    });

    revalidatePath("/admin/projects");
    revalidatePath("/admin/clients");
    revalidatePath("/portal/documents");
    revalidatePath("/portal/projects");
    revalidatePath("/portal");

    // Send confirmation email asynchronously via Resend
    const clientEmail = currentUser.email || project.clientRel?.email;
    if (clientEmail) {
      const formattedTotal = formatNumberToINR(Number(existingAgreement.totalAmountRaw || 0));
      const formattedSignedDate = signedDate.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
      }) + " IST";

      sendSignedAgreementEmail({
        to: clientEmail,
        clientName: project.clientRel?.name || legalName,
        signatoryName: legalName,
        projectTitle: project.title,
        agreementNumber: existingAgreement.agreementNumber,
        totalAmount: formattedTotal,
        signedAtFormatted: formattedSignedDate,
        auditHash: signedAuditHash,
      }).catch((emailErr) => {
        console.warn("[Agreement Email Suppressed]:", emailErr);
      });
    }

    const updatedAgreement = await getProjectAgreement(projectId);
    return { success: true, agreement: updatedAgreement };
  } catch (error: any) {
    console.error("Error signing project agreement:", error);
    return { success: false, error: error.message || "Failed to sign project agreement" };
  }
}

export async function generateMilestoneInvoice(data: {
  projectId: string;
  milestoneNumber: 1 | 2 | 3;
}) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN")) {
      return { success: false, error: "Super Admin privileges required to generate official milestone invoices." };
    }

    const { projectId, milestoneNumber } = data;
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: { clientRel: true },
    });
    if (!project) {
      return { success: false, error: "Project not found." };
    }

    const agreement = await (db as any).projectAgreement.findUnique({
      where: { projectId },
    });
    if (!agreement) {
      return { success: false, error: "No agreement found for this project. Save the agreement first." };
    }

    let milestoneTitle = "";
    let milestoneAmount = 0;
    let milestonePercent = 0;

    if (milestoneNumber === 1) {
      milestoneTitle = "Milestone 1: Project Mobilization & Sprint 1 Advance";
      milestoneAmount = Number(agreement.advanceAmountRaw || 0);
      milestonePercent = Number(agreement.advancePercent || 40);
    } else if (milestoneNumber === 2) {
      milestoneTitle = "Milestone 2: Functional Demo & Staging Deployment";
      milestoneAmount = Number(agreement.deliveryAmountRaw || 0);
      milestonePercent = Number(agreement.deliveryPercent || 40);
    } else {
      milestoneTitle = "Milestone 3: Final Production Delivery & Acceptance";
      milestoneAmount = Number(agreement.finalAmountRaw || 0);
      milestonePercent = Number(agreement.finalPercent || 20);
    }

    if (milestoneAmount <= 0) {
      return { success: false, error: "Milestone amount must be greater than zero." };
    }

    const now = new Date();
    const invoiceReference = `INV-${agreement.agreementNumber.replace("ABCD-AGR-", "")}-M${milestoneNumber}`;

    // Prevent duplicate invoice generation
    const existingTx = await db.transaction.findFirst({
      where: {
        OR: [
          { reference: invoiceReference },
          {
            projectId,
            category: "Project Milestone",
            description: { contains: `Milestone ${milestoneNumber}:` },
          },
        ],
      },
    });

    if (existingTx) {
      return {
        success: false,
        error: `Invoice for Milestone ${milestoneNumber} already exists (${existingTx.reference || existingTx.id}).`,
      };
    }

    const clientId = project.clientId || null;
    const clientName = project.clientRel?.name || project.client || "Client";

    const newTransaction = await db.transaction.create({
      data: {
        date: now,
        type: "Income",
        category: "Project Milestone",
        description: `${milestoneTitle} (${milestonePercent}%) - ${project.title}`,
        amount: formatNumberToINR(milestoneAmount),
        amountRaw: milestoneAmount,
        currency: "INR",
        status: "Pending",
        reference: invoiceReference,
        client: clientName,
        clientId: clientId,
        project: project.title,
        projectId: project.id,
      },
    });

    if (clientId || clientName) {
      await syncClientAndProjectBalances(clientId || clientName);
    }

    revalidatePath("/admin/finance");
    revalidatePath("/admin/projects");
    revalidatePath("/portal/billing");
    revalidatePath("/portal");

    return {
      success: true,
      transaction: newTransaction,
      message: `Invoice ${invoiceReference} for ${formatNumberToINR(milestoneAmount)} generated in Finance Ledger.`,
    };
  } catch (error: any) {
    console.error("Error generating milestone invoice:", error);
    return { success: false, error: error.message || "Failed to generate milestone invoice" };
  }
}

// ----------------------------------------------------------------------------
// PROJECT CATEGORY ACTIONS
// ----------------------------------------------------------------------------

export async function getCategories() {
  return db.category.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createCategory(name: string) {
  try {
    const category = await db.category.create({
      data: { name: name.trim() }
    });
    revalidatePath("/admin/projects");
    return { success: true, category };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: "Category already exists." };
    }
    return { success: false, error: "Failed to create category." };
  }
}

export async function updateCategory(id: string, newName: string) {
  try {
    const category = await db.category.update({
      where: { id },
      data: { name: newName.trim() }
    });
    revalidatePath("/admin/projects");
    return { success: true, category };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: "Category name already exists." };
    }
    return { success: false, error: "Failed to update category." };
  }
}

export async function deleteCategory(id: string) {
  try {
    await db.category.delete({
      where: { id }
    });
    revalidatePath("/admin/projects");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Failed to delete category." };
  }
}
