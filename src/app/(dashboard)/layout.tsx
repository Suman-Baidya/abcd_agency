import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-session";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { getSiteConfig } from "@/lib/dbConfig";
import { db } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || user.status === "Suspended") {
    redirect("/login");
  }

  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    redirect("/portal");
  }

  const siteConfig = await getSiteConfig();

  // Fetch unread inquiries, new user registrations, pending revisions & security alerts
  const [
    unreadInquiries,
    newUsers,
    pendingRevisions,
    recentSecurityAlerts,
    unreadInquiriesCount,
    newUsersCount,
    pendingRevisionsCount
  ] = await Promise.all([
    db.inquiry.findMany({
      where: { status: "New" },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { id: true, name: true, createdAt: true, projectType: true },
    }),
    db.user.findMany({
      where: { role: "USER", isViewed: false } as any,
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { id: true, name: true, companyName: true, createdAt: true },
    }),
    db.revisionRequest.findMany({
      where: { status: { in: ["Pending", "New"] } },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { id: true, title: true, createdAt: true, clientRel: { select: { name: true } } },
    }),
    db.userActivity.findMany({
      where: { action: { in: ["SECURITY_ALERT", "BOT_TRAPPED"] } },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { id: true, action: true, description: true, ipAddress: true, createdAt: true },
    }),
    db.inquiry.count({
      where: { status: "New" },
    }),
    db.user.count({
      where: { role: "USER", isViewed: false } as any,
    }),
    db.revisionRequest.count({
      where: { status: { in: ["Pending", "New"] } },
    }),
  ]);

  // Combine notifications
  const allNotifications = [
    ...unreadInquiries.map((inq: any) => ({
      id: `inq-${inq.id}`,
      name: inq.name,
      title: `New Inquiry: ${inq.name}`,
      subtitle: inq.projectType?.replace("-", " ") || "Consultation Request",
      createdAt: inq.createdAt,
      type: "inquiry" as const,
      href: "/admin/inquiries",
    })),
    ...newUsers.map((u: any) => ({
      id: `usr-${u.id}`,
      name: u.companyName || u.name,
      title: `New User: ${u.companyName || u.name}`,
      subtitle: `Representative: ${u.name}`,
      createdAt: u.createdAt,
      type: "user" as const,
      href: "/admin/users",
    })),
    ...pendingRevisions.map((rev: any) => ({
      id: `rev-${rev.id}`,
      name: rev.clientRel?.name || "Client",
      title: `Revision Request: ${rev.title}`,
      subtitle: `From ${rev.clientRel?.name || "Client"}`,
      createdAt: rev.createdAt,
      type: "inquiry" as const,
      href: "/admin/revisions",
    })),
    ...recentSecurityAlerts.map((alert: any) => ({
      id: `sec-${alert.id}`,
      name: alert.ipAddress || "Security Guard",
      title: alert.action === "BOT_TRAPPED" ? "⚠️ Bot Attack Blocked" : "🚨 Suspicious Login Alert",
      subtitle: alert.description || "Unusual traffic blocked by system",
      createdAt: alert.createdAt,
      type: "inquiry" as const,
      href: "/admin/users",
    })),
  ].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-[#0A0A0A] transition-colors duration-200">
      {/* Sidebar for desktop */}
      <Sidebar 
        user={user}
        lightLogoUrl={siteConfig.lightLogoUrl} 
        darkLogoUrl={siteConfig.darkLogoUrl} 
        agencyName={siteConfig.agencyName} 
        unreadInquiriesCount={unreadInquiriesCount}
        newUsersCount={newUsersCount}
        pendingRevisionsCount={pendingRevisionsCount}
      />

      {/* Main Content Wrapper */}
      <div className="flex flex-col flex-1 overflow-hidden w-full relative">
        <Topbar 
          lightLogoUrl={siteConfig.lightLogoUrl} 
          darkLogoUrl={siteConfig.darkLogoUrl} 
          agencyName={siteConfig.agencyName} 
          userName={user?.name}
          userRole={user?.role}
          notifications={allNotifications}
        />

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto pt-2 sm:pt-3 lg:pt-4 px-4 sm:px-6 lg:px-8 pb-24 md:pb-8 w-full">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
