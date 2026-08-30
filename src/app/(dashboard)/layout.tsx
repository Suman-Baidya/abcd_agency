import React from "react";
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
  const siteConfig = await getSiteConfig();

  // Fetch unread inquiries for notifications
  const unreadInquiries = await db.inquiry.findMany({
    where: { status: "New" },
    orderBy: { createdAt: "desc" },
    take: 5, // latest 5 for the notification dropdown
    select: { id: true, name: true, createdAt: true, projectType: true }
  });
  
  // Total count might be more than 5, so we need a separate count query
  const unreadCount = await db.inquiry.count({
    where: { status: "New" },
  });

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-[#0A0A0A] transition-colors duration-200">
      {/* Sidebar for desktop */}
      <Sidebar 
        lightLogoUrl={siteConfig.lightLogoUrl} 
        darkLogoUrl={siteConfig.darkLogoUrl} 
        agencyName={siteConfig.agencyName} 
        unreadInquiriesCount={unreadCount}
      />

      {/* Main Content Wrapper */}
      <div className="flex flex-col flex-1 overflow-hidden w-full relative">
        <Topbar 
          lightLogoUrl={siteConfig.lightLogoUrl} 
          darkLogoUrl={siteConfig.darkLogoUrl} 
          agencyName={siteConfig.agencyName} 
          notifications={unreadInquiries}
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
