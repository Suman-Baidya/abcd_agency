"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface ClientInput {
  name: string;
  contactPerson?: string;
  email: string;
  phone?: string;
  isWhatsappSame?: boolean;
  whatsapp?: string;
  industry?: string;
  location?: string;
  website?: string;
  status?: string;
  totalSpend?: string;
  dueBalance?: string;
  notes?: string;
}

const DEFAULT_SEEDS = [
  {
    name: "ApexFlow Inc.",
    contactPerson: "Marcus Vance",
    email: "contact@apexflow.com",
    phone: "+91 98765 43210",
    isWhatsappSame: true,
    whatsapp: null,
    industry: "Enterprise SaaS & AI",
    location: "San Francisco, USA",
    website: "https://apexflow.io",
    totalSpend: "₹48,500",
    totalSpendRaw: 48500,
    dueBalance: "₹8,500",
    dueBalanceRaw: 8500,
    status: "Active",
    joinedDate: new Date("2025-01-12"),
    notes: "Key enterprise client. Long-term contract up for renewal in Q4.",
  },
  {
    name: "Nexus Labs",
    contactPerson: "Elena Rostova",
    email: "hello@nexuslabs.ai",
    phone: "+91 98123 45678",
    isWhatsappSame: true,
    whatsapp: null,
    industry: "Machine Learning & Robotics",
    location: "Boston, USA",
    website: "https://nexuslabs.ai",
    totalSpend: "₹64,000",
    totalSpendRaw: 64000,
    dueBalance: "₹14,000",
    dueBalanceRaw: 14000,
    status: "Active",
    joinedDate: new Date("2025-03-05"),
    notes: "High-value tech startup. Ongoing development for custom web platform and analytics dashboard.",
  },
  {
    name: "Govt Sector (RGYCSP)",
    contactPerson: "Debabrata Roy",
    email: "admin@rgycsp.gov",
    phone: "+91 381 234 5678",
    isWhatsappSame: true,
    whatsapp: null,
    industry: "Public Sector & Education",
    location: "Agartala, Tripura, India",
    website: "https://rgycsp.org",
    totalSpend: "₹45,000",
    totalSpendRaw: 45000,
    dueBalance: "₹0",
    dueBalanceRaw: 0,
    status: "Active",
    joinedDate: new Date("2025-06-18"),
    notes: "Government skill development portal & certification infrastructure.",
  },
  {
    name: "FinEdge Capital",
    contactPerson: "Sarah Jenkins",
    email: "team@finedge.com",
    phone: "+91 98450 11223",
    isWhatsappSame: false,
    whatsapp: "+91 98450 99887",
    industry: "Fintech & Wealth Management",
    location: "London, UK",
    website: "https://finedgecapital.co.uk",
    totalSpend: "₹28,000",
    totalSpendRaw: 28000,
    dueBalance: "₹6,000",
    dueBalanceRaw: 6000,
    status: "Active",
    joinedDate: new Date("2025-09-01"),
    notes: "Institutional investment branding and client portal design.",
  },
  {
    name: "Meridian Group",
    contactPerson: "Arthur Campbell",
    email: "ops@meridian.io",
    phone: "+91 97740 55667",
    isWhatsappSame: true,
    whatsapp: null,
    industry: "Real Estate & Logistics",
    location: "Chicago, USA",
    website: "https://meridiangroup.io",
    totalSpend: "₹15,000",
    totalSpendRaw: 15000,
    dueBalance: "₹0",
    dueBalanceRaw: 0,
    status: "Inactive",
    joinedDate: new Date("2025-11-14"),
    notes: "Project completed successfully. Paused pending Q3 expansion budget.",
  },
  {
    name: "CloudSync Ltd.",
    contactPerson: "Kenji Sato",
    email: "dev@cloudsync.co",
    phone: "+91 99033 77889",
    isWhatsappSame: true,
    whatsapp: null,
    industry: "Cloud Infrastructure",
    location: "Tokyo, Japan",
    website: "https://cloudsync.co",
    totalSpend: "₹36,000",
    totalSpendRaw: 36000,
    dueBalance: "₹10,500",
    dueBalanceRaw: 10500,
    status: "Active",
    joinedDate: new Date("2026-02-22"),
    notes: "Multi-regional cloud monitoring interface and design system implementation.",
  },
  {
    name: "Brightpath Digital",
    contactPerson: "Chloe Bennett",
    email: "info@brightpath.com",
    phone: "+91 94361 22334",
    isWhatsappSame: true,
    whatsapp: null,
    industry: "E-Commerce & Retail",
    location: "Sydney, Australia",
    website: "https://brightpathdigital.com.au",
    totalSpend: "₹12,000",
    totalSpendRaw: 12000,
    dueBalance: "₹0",
    dueBalanceRaw: 0,
    status: "Active",
    joinedDate: new Date("2026-04-10"),
    notes: "Shopify Plus headless storefront transformation.",
  },
  {
    name: "Orion Ventures",
    contactPerson: "David Sterling",
    email: "partners@orionv.com",
    phone: "+91 96120 44556",
    isWhatsappSame: true,
    whatsapp: null,
    industry: "Venture Capital",
    location: "New York, USA",
    website: "https://orionventures.vc",
    totalSpend: "₹0",
    totalSpendRaw: 0,
    dueBalance: "₹0",
    dueBalanceRaw: 0,
    status: "Prospect",
    joinedDate: new Date("2026-07-28"),
    notes: "Proposal submitted for brand redesign and portfolio showcase website.",
  },
];

export async function getClientsWithProjectCounts() {
  try {
    if (!db.client) {
      console.warn("db.client not ready, returning initial seeds");
      return DEFAULT_SEEDS.map((s, idx) => ({
        id: `cl-${idx + 1}`,
        ...s,
        isWhatsappSame: s.isWhatsappSame ?? true,
        whatsapp: s.whatsapp || undefined,
        projects: 1,
        activeProjects: s.status === "Active" ? 1 : 0,
        joined: s.joinedDate.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        joinedDate: s.joinedDate.toISOString().slice(0, 10),
        initials: s.name.slice(0, 2).toUpperCase(),
        status: s.status as "Active" | "Prospect" | "Inactive",
      }));
    }

    const count = await db.client.count();
    if (count === 0) {
      await db.client.createMany({
        data: DEFAULT_SEEDS,
      });
    }

    const [clients, projects] = await Promise.all([
      db.client.findMany({
        orderBy: { createdAt: "desc" },
      }),
      db.project.findMany({
        select: { client: true, status: true },
      }),
    ]);

    return clients.map((c: any) => {
      const clientProjects = projects.filter(
        (p: any) => p.client.toLowerCase() === c.name.toLowerCase()
      );
      const activeProjects = clientProjects.filter(
        (p: any) => p.status === "On Track" || p.status === "In Review"
      ).length;

      const words = c.name.trim().split(" ");
      const initials =
        words.length > 1
          ? `${words[0][0]}${words[1][0]}`.toUpperCase()
          : c.name.slice(0, 2).toUpperCase();

      return {
        id: c.id,
        name: c.name,
        contactPerson: c.contactPerson || "Account Manager",
        email: c.email,
        phone: c.phone || "N/A",
        isWhatsappSame: c.isWhatsappSame ?? true,
        whatsapp: c.whatsapp || undefined,
        industry: c.industry || "General",
        location: c.location || "Remote",
        website: c.website || undefined,
        projects: clientProjects.length,
        activeProjects,
        totalSpend: c.totalSpend || "₹0",
        totalSpendRaw: c.totalSpendRaw || 0,
        dueBalance: c.dueBalance || "₹0",
        dueBalanceRaw: c.dueBalanceRaw || 0,
        status: (c.status || "Active") as "Active" | "Prospect" | "Inactive",
        joined: new Date(c.joinedDate || c.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        }),
        joinedDate: (c.joinedDate || c.createdAt).toISOString().slice(0, 10),
        initials,
        notes: c.notes || undefined,
      };
    });
  } catch (error) {
    console.error("Error fetching clients from db:", error);
    return DEFAULT_SEEDS.map((s, idx) => ({
      id: `cl-${idx + 1}`,
      ...s,
      isWhatsappSame: s.isWhatsappSame ?? true,
      whatsapp: s.whatsapp || undefined,
      projects: 1,
      activeProjects: s.status === "Active" ? 1 : 0,
      joined: s.joinedDate.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
      joinedDate: s.joinedDate.toISOString().slice(0, 10),
      initials: s.name.slice(0, 2).toUpperCase(),
      status: s.status as "Active" | "Prospect" | "Inactive",
    }));
  }
}

export async function createClient(data: ClientInput) {
  try {
    const spendRaw = parseInt((data.totalSpend || "0").replace(/[^0-9]/g, "") || "0", 10);
    const dueRaw = parseInt((data.dueBalance || "0").replace(/[^0-9]/g, "") || "0", 10);
    const formattedSpend = data.totalSpend?.startsWith("₹") ? data.totalSpend : `₹${data.totalSpend || "0"}`;
    const formattedDue = data.dueBalance?.startsWith("₹") ? data.dueBalance : `₹${data.dueBalance || "0"}`;

    const isSame = data.isWhatsappSame ?? true;

    const created = await db.client.create({
      data: {
        name: data.name.trim(),
        contactPerson: data.contactPerson?.trim() || "",
        email: data.email.trim(),
        phone: data.phone?.trim() || "",
        isWhatsappSame: isSame,
        whatsapp: isSame ? null : (data.whatsapp?.trim() || null),
        industry: data.industry?.trim() || "",
        location: data.location?.trim() || "",
        website: data.website?.trim() || null,
        status: data.status || "Active",
        totalSpend: formattedSpend,
        totalSpendRaw: spendRaw,
        dueBalance: formattedDue,
        dueBalanceRaw: dueRaw,
        notes: data.notes?.trim() || null,
      },
    });

    revalidatePath("/admin/clients");
    revalidatePath("/admin");
    return created;
  } catch (error: any) {
    console.error("Failed to create client:", error);
    throw new Error(error?.message || "Failed to create client in database");
  }
}

export async function updateClient(id: string, data: ClientInput) {
  try {
    const spendRaw = parseInt((data.totalSpend || "0").replace(/[^0-9]/g, "") || "0", 10);
    const dueRaw = parseInt((data.dueBalance || "0").replace(/[^0-9]/g, "") || "0", 10);
    const formattedSpend = data.totalSpend?.startsWith("₹") ? data.totalSpend : `₹${data.totalSpend || "0"}`;
    const formattedDue = data.dueBalance?.startsWith("₹") ? data.dueBalance : `₹${data.dueBalance || "0"}`;

    const isSame = data.isWhatsappSame ?? true;

    const updated = await db.client.update({
      where: { id },
      data: {
        name: data.name.trim(),
        contactPerson: data.contactPerson?.trim() || "",
        email: data.email.trim(),
        phone: data.phone?.trim() || "",
        isWhatsappSame: isSame,
        whatsapp: isSame ? null : (data.whatsapp?.trim() || null),
        industry: data.industry?.trim() || "",
        location: data.location?.trim() || "",
        website: data.website?.trim() || null,
        status: data.status || "Active",
        totalSpend: formattedSpend,
        totalSpendRaw: spendRaw,
        dueBalance: formattedDue,
        dueBalanceRaw: dueRaw,
        notes: data.notes?.trim() || null,
      },
    });

    revalidatePath("/admin/clients");
    revalidatePath("/admin");
    return updated;
  } catch (error: any) {
    console.error("Failed to update client:", error);
    throw new Error(error?.message || "Failed to update client in database");
  }
}

export async function updateClientStatus(id: string, status: string) {
  try {
    const updated = await db.client.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/admin/clients");
    revalidatePath("/admin");
    return updated;
  } catch (error: any) {
    console.error("Failed to update client status:", error);
    throw new Error(error?.message || "Failed to update client status in database");
  }
}

export async function deleteClient(id: string) {
  try {
    await db.client.delete({
      where: { id },
    });

    revalidatePath("/admin/clients");
    revalidatePath("/admin");
  } catch (error: any) {
    console.error("Failed to delete client:", error);
    throw new Error(error?.message || "Failed to delete client from database");
  }
}
