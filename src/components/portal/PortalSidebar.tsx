"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Layers, 
  Send, 
  User, 
  FolderKanban, 
  FileText, 
  RotateCcw, 
  Calendar, 
  IndianRupee, 
  Users2, 
  Menu,
  X,
  ChevronRight
} from "lucide-react";

interface PortalSidebarProps {
  user: {
    id: string;
    name: string;
    companyName?: string | null;
    email: string;
    role: "USER" | "CLIENT" | "ADMIN" | "SUPER_ADMIN";
  };
  lightLogoUrl?: string | null;
  darkLogoUrl?: string | null;
  agencyName?: string;
  repliedRevisionsCount?: number;
  repliedRevisionIds?: string[];
}

export function PortalSidebar({ 
  user, 
  lightLogoUrl, 
  darkLogoUrl, 
  agencyName = "ABCD Agency",
  repliedRevisionsCount = 0,
  repliedRevisionIds = [],
}: PortalSidebarProps) {
  const pathname = usePathname();
  const [isSmartMenuOpen, setIsSmartMenuOpen] = useState(false);
  const [readNotifIds, setReadNotifIds] = useState<string[]>([]);

  const isProspect = user.role === "USER";

  // Sync read notification IDs from localStorage
  useEffect(() => {
    const syncReadNotifs = () => {
      try {
        const stored = localStorage.getItem("abcd_read_notifications");
        if (stored) {
          setReadNotifIds(JSON.parse(stored));
        }
      } catch {}
    };

    syncReadNotifs();
    window.addEventListener("notifications_updated", syncReadNotifs);
    return () => window.removeEventListener("notifications_updated", syncReadNotifs);
  }, []);

  // Filter against specific active replied revision IDs
  const effectiveRevisionsCount = repliedRevisionIds.length > 0
    ? repliedRevisionIds.filter((id) => !readNotifIds.includes(id)).length
    : Math.max(0, repliedRevisionsCount - readNotifIds.filter((id) => id.startsWith("rev-")).length);

  // Lock body scroll on mobile smart menu open
  useEffect(() => {
    if (isSmartMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSmartMenuOpen]);

  // Close drawer on path change
  useEffect(() => {
    setIsSmartMenuOpen(false);
  }, [pathname]);

  // Short menu names for Prospect / User account
  const prospectNavItems = [
    { label: "Overview", href: "/portal", icon: <LayoutDashboard className="w-5 h-5" strokeWidth={2} />, description: "Account overview & quick actions" },
    { label: "Our Services", href: "/portal/services", icon: <Layers className="w-5 h-5" strokeWidth={2} />, description: "Explore agency services & tiers" },
    { label: "Inquiries", href: "/portal/inquiries", icon: <Send className="w-5 h-5" strokeWidth={2} />, description: "Submit & track project briefs" },
    { label: "Profile", href: "/portal/profile", icon: <User className="w-5 h-5" strokeWidth={2} />, description: "Account credentials & company info" },
  ];

  // Short menu names for Client account
  const clientNavItems = [
    { label: "Overview", href: "/portal", icon: <LayoutDashboard className="w-5 h-5" strokeWidth={2} />, description: "Account snapshot & deliverables" },
    { label: "Projects", href: "/portal/projects", icon: <FolderKanban className="w-5 h-5" strokeWidth={2} />, description: "Sprint boards & milestone progress" },
    { label: "Documents", href: "/portal/documents", icon: <FileText className="w-5 h-5" strokeWidth={2} />, description: "Shared agreements & technical specs" },
    { label: "Revisions", href: "/portal/revisions", icon: <RotateCcw className="w-5 h-5" strokeWidth={2} />, description: "Quality assurance & change tickets", badgeCount: effectiveRevisionsCount },
    { label: "Meetings", href: "/portal/meetings", icon: <Calendar className="w-5 h-5" strokeWidth={2} />, description: "Book & join scheduled calls" },
    { label: "Finance", href: "/portal/billing", icon: <IndianRupee className="w-5 h-5" strokeWidth={2} />, description: "Invoices & payment ledger" },
    { label: "Team", href: "/portal/team", icon: <Users2 className="w-5 h-5" strokeWidth={2} />, description: "Assigned engineering squad" },
    { label: "Profile", href: "/portal/profile", icon: <User className="w-5 h-5" strokeWidth={2} />, description: "Company settings & credentials" },
  ];

  const currentNavItems = isProspect ? prospectNavItems : clientNavItems;

  // Mobile Bottom Bar 4 primary items
  const mobilePrimaryNav = isProspect
    ? [
        { label: "Overview", href: "/portal", icon: <LayoutDashboard className="w-5 h-5" strokeWidth={2} /> },
        { label: "Services", href: "/portal/services", icon: <Layers className="w-5 h-5" strokeWidth={2} /> },
        { label: "Inquiries", href: "/portal/inquiries", icon: <Send className="w-5 h-5" strokeWidth={2} /> },
        { label: "Profile", href: "/portal/profile", icon: <User className="w-5 h-5" strokeWidth={2} /> },
      ]
    : [
        { label: "Overview", href: "/portal", icon: <LayoutDashboard className="w-5 h-5" strokeWidth={2} /> },
        { label: "Projects", href: "/portal/projects", icon: <FolderKanban className="w-5 h-5" strokeWidth={2} /> },
        { label: "Finance", href: "/portal/billing", icon: <IndianRupee className="w-5 h-5" strokeWidth={2} /> },
        { label: "Revisions", href: "/portal/revisions", icon: <RotateCcw className="w-5 h-5" strokeWidth={2} />, badgeCount: effectiveRevisionsCount },
      ];

  const initials = (user.name || "U")
    .trim()
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. DESKTOP SIDEBAR */}
      {/* ========================================================================= */}
      <aside className="hidden md:flex flex-col w-64 border-r border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111] h-screen sticky top-0 transition-colors duration-200">
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center">
          <Link href="/portal" className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-white rounded-xs">
            <Image
              src={lightLogoUrl || "/images/Black_Logo.png"}
              alt={`${agencyName} Logo`}
              width={140}
              height={40}
              className="h-10 w-auto object-contain block dark:hidden"
              style={{ width: "auto" }}
            />
            <Image
              src={darkLogoUrl || "/images/White_Logo.png"}
              alt={`${agencyName} Logo`}
              width={140}
              height={40}
              className="h-10 w-auto hidden dark:block"
              style={{ width: "auto" }}
            />
          </Link>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {currentNavItems.map((item: any) => {
            const isActive = item.href === "/portal"
              ? pathname === "/portal"
              : pathname === item.href || pathname?.startsWith(`${item.href}/`);

            let tourId = undefined;
            if (item.href === "/portal") tourId = "portal-tour-overview";
            else if (item.href === "/portal/projects") tourId = "portal-tour-projects";
            else if (item.href === "/portal/services") tourId = "portal-tour-services";
            else if (item.href === "/portal/inquiries") tourId = "portal-tour-inquiries";
            else if (item.href === "/portal/revisions") tourId = "portal-tour-revisions";
            else if (item.href === "/portal/billing") tourId = "portal-tour-finance";

            return (
              <Link
                key={item.href}
                id={tourId}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-white ${
                  isActive
                    ? "bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A]"
                    : "text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white hover:bg-white dark:hover:bg-[#262626]"
                }`}
              >
                {item.icon}
                <div className="flex items-center justify-between flex-1">
                  <span>{item.label}</span>
                  {item.badgeCount && item.badgeCount > 0 ? (
                    <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold text-white bg-red-500 rounded-full">
                      {item.badgeCount}
                    </span>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom User Card (Matching Super Admin Sidebar) */}
        <div className="p-4 border-t border-[#E5E5E5] dark:border-[#262626]">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] flex items-center justify-center text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-[#0A0A0A] dark:text-white truncate">{user.name}</p>
              <p className="text-[10px] text-[#737373] dark:text-neutral-400 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MOBILE BOTTOM NAVIGATION */}
      {/* ========================================================================= */}
      <nav 
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 border-t border-[#E5E5E5] dark:border-[#262626] bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md z-50 px-2 py-1.5 flex items-center justify-around pb-safe transition-colors duration-200"
      >
        {mobilePrimaryNav.map((item: any) => {
          const isActive = item.href === "/portal"
            ? pathname === "/portal"
            : pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors relative ${
                isActive
                  ? "text-[#0A0A0A] dark:text-white font-bold"
                  : "text-[#737373] dark:text-neutral-400"
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badgeCount && item.badgeCount > 0 ? (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white dark:border-[#0A0A0A] animate-pulse"></span>
                ) : null}
              </div>
              <span className="mt-0.5">{item.label}</span>
            </Link>
          );
        })}

        {!isProspect && (
          <button
            onClick={() => setIsSmartMenuOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white"
          >
            <Menu className="w-5 h-5" strokeWidth={2} />
            <span className="mt-0.5">More</span>
          </button>
        )}
      </nav>

      {/* ========================================================================= */}
      {/* 3. MOBILE SMART MENU SLIDE-OVER DRAWER */}
      {/* ========================================================================= */}
      {isSmartMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full bg-white dark:bg-[#111111] rounded-t-2xl border-t border-[#E5E5E5] dark:border-[#262626] p-6 max-h-[85vh] flex flex-col space-y-4 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] dark:border-[#262626] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#0A0A0A] dark:text-white">Workspace Menu</h3>
                <p className="text-[11px] text-[#737373] dark:text-neutral-400">{user.name}</p>
              </div>
              <button
                onClick={() => setIsSmartMenuOpen(false)}
                className="p-1.5 text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white rounded-full bg-[#F5F5F5] dark:bg-[#1C1C1C]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 overflow-y-auto flex-1">
              {currentNavItems.map((item) => {
                const isActive = item.href === "/portal" ? pathname === "/portal" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsSmartMenuOpen(false)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
                      isActive
                        ? "bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] border-[#0A0A0A] dark:border-white font-bold"
                        : "border-[#E5E5E5] dark:border-[#262626] bg-[#F9F9F9] dark:bg-[#161616] text-[#0A0A0A] dark:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <div>
                        <p className="text-xs font-bold">{item.label}</p>
                        <p className={`text-[10px] ${isActive ? "text-neutral-300 dark:text-neutral-700" : "text-[#737373] dark:text-neutral-400"}`}>
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {(item as any).badgeCount && (item as any).badgeCount > 0 && (
                        <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold text-white bg-red-500 rounded-full">
                          {(item as any).badgeCount}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 opacity-60" />
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Sticky Action Footer */}
            <div className="pt-3 border-t border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] flex items-center justify-between gap-3">
              <Link
                href="/"
                onClick={() => setIsSmartMenuOpen(false)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-[#E5E5E5] dark:border-[#262626] text-xs font-semibold text-[#0A0A0A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#262626] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Live Site
              </Link>
              <button
                type="button"
                onClick={async () => {
                  setIsSmartMenuOpen(false);
                  const { logoutUser } = await import("@/app/(auth)/login/actions");
                  await logoutUser();
                  window.location.href = "/login";
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#F5F5F5] dark:bg-[#1F1F1F] text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
