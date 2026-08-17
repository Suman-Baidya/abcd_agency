import React from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-[#0A0A0A] transition-colors duration-200">
      {/* Sidebar for desktop */}
      <Sidebar />

      {/* Main Content Wrapper */}
      <div className="flex flex-col flex-1 overflow-hidden w-full relative">
        <Topbar />

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 w-full">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
