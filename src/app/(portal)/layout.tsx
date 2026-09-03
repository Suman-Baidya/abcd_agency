import React from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-session";
import { getSiteConfig } from "@/lib/dbConfig";
import { db } from "@/lib/prisma";
import { PortalSidebar } from "@/components/portal/PortalSidebar";
import { Topbar } from "@/components/dashboard/Topbar";

export const dynamic = "force-dynamic";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || user.status === "Suspended") {
    redirect("/login");
  }

  // If user registered with Google and hasn't finished business onboarding
  const isIncompleteProfile = user.role === "USER" && (!user.phone || !user.companyName || user.companyName === "Individual Client" || !user.industry);
  if (isIncompleteProfile) {
    redirect("/onboarding");
  }

  const siteConfig = await getSiteConfig();

  // Resolve client ID with fallback for clients without direct clientId on User
  let effectiveClientId = user.clientId;
  if (!effectiveClientId && user.role !== "USER") {
    const clientRecord = await db.client.findFirst({
      where: {
        OR: [
          { email: user.email },
          { userRel: { id: user.id } },
        ],
      },
      select: { id: true },
    });
    if (clientRecord) {
      effectiveClientId = clientRecord.id;
    }
  }

  // Load client/prospect-specific notifications
  const [repliedRevisions, scheduledMeetings, repliedInquiries, clientDocs] = await Promise.all([
    effectiveClientId
      ? db.revisionRequest.findMany({
          where: {
            clientId: effectiveClientId,
            OR: [
              { response: { not: null } },
              { status: { in: ["In Progress", "In Review", "Resolved"] } },
            ],
          },
          orderBy: { updatedAt: "desc" },
          take: 10,
        })
      : Promise.resolve([]),
    effectiveClientId
      ? db.clientMeeting.findMany({
          where: { clientId: effectiveClientId, status: "Scheduled" },
          orderBy: { createdAt: "desc" },
          take: 5,
        })
      : Promise.resolve([]),
    db.inquiry.findMany({
      where: {
        email: user.email,
        status: { in: ["Replied", "Closed"] },
      },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    effectiveClientId
      ? db.clientDocument.findMany({
          where: { clientId: effectiveClientId },
          orderBy: { createdAt: "desc" },
          take: 5,
        })
      : Promise.resolve([]),
  ]);

  // Extract array of all revision IDs that have engineer responses
  const repliedRevisionIds = repliedRevisions
    .filter((rev: any) => rev.response && rev.response.trim().length > 0)
    .map((rev: any) => `rev-${rev.id}`);

  // Combine and format notifications
  const portalNotifications = [
    ...repliedRevisions.map((rev: any) => ({
      id: `rev-${rev.id}`,
      name: "Engineering Squad",
      title: rev.response ? `Admin Replied: ${rev.title}` : `Status Update: ${rev.title}`,
      subtitle: rev.response || `Ticket status: ${rev.status}`,
      createdAt: rev.updatedAt,
      href: "/portal/revisions",
    })),
    ...scheduledMeetings.map((m: any) => ({
      id: `meet-${m.id}`,
      name: "Strategy Team",
      title: `Call Scheduled: ${m.title}`,
      subtitle: `${m.date} at ${m.time} (${m.duration})`,
      createdAt: m.createdAt,
      href: "/portal/meetings",
    })),
    ...repliedInquiries.map((inq: any) => ({
      id: `inq-${inq.id}`,
      name: "Lead Architect",
      title: "Project Scope & Proposal Ready",
      subtitle: `Your brief for ${inq.projectType?.replace("-", " ") || "project"} has been reviewed.`,
      createdAt: inq.updatedAt,
      href: "/portal/inquiries",
    })),
    ...clientDocs.map((doc: any) => ({
      id: `doc-${doc.id}`,
      name: doc.uploadedBy || "Agency",
      title: `New Document: ${doc.title}`,
      subtitle: `${doc.fileType} (${doc.size}) available for download`,
      createdAt: doc.createdAt,
      href: "/portal/documents",
    })),
  ].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-[#0A0A0A] transition-colors duration-200">
      {/* Sidebar */}
      <PortalSidebar
        user={user}
        lightLogoUrl={siteConfig.lightLogoUrl}
        darkLogoUrl={siteConfig.darkLogoUrl}
        agencyName={siteConfig.agencyName}
        repliedRevisionIds={repliedRevisionIds}
        repliedRevisionsCount={repliedRevisionIds.length}
      />

      {/* Main Content Wrapper with unified Topbar */}
      <div className="flex flex-col flex-1 overflow-hidden w-full relative">
        <Topbar 
          lightLogoUrl={siteConfig.lightLogoUrl} 
          darkLogoUrl={siteConfig.darkLogoUrl} 
          agencyName={siteConfig.agencyName} 
          userName={user.name}
          userRole={user.role === "USER" ? "Prospect Portal" : "Client Portal"}
          notifications={portalNotifications}
        />

        {/* Scrollable Main Content Area */}
        <main className="flex-1 overflow-y-auto pt-2 sm:pt-3 lg:pt-4 px-4 sm:px-6 lg:px-8 pb-24 md:pb-8 w-full">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
