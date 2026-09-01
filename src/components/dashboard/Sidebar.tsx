"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { IndianRupee } from "lucide-react";

interface SidebarProps {
  lightLogoUrl?: string | null;
  darkLogoUrl?: string | null;
  agencyName?: string;
  unreadInquiriesCount?: number;
  newUsersCount?: number;
  pendingRevisionsCount?: number;
}

export function Sidebar({ 
  lightLogoUrl, 
  darkLogoUrl, 
  agencyName = "ABCD Agency", 
  unreadInquiriesCount = 0,
  newUsersCount = 0,
  pendingRevisionsCount = 0,
}: SidebarProps) {
  const pathname = usePathname();
  const [isSmartMenuOpen, setIsSmartMenuOpen] = useState(false);

  // Close smart menu when navigating
  useEffect(() => {
    setIsSmartMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when smart menu is open on mobile
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

  // 4 Primary Mobile Bottom Bar items
  const primaryNavItems = [
    { 
      label: "Overview", 
      href: "/admin", 
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    { 
      label: "Projects", 
      href: "/admin/projects", 
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      label: "Revisions", 
      href: "/admin/revisions", 
      badgeCount: pendingRevisionsCount,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )
    },
    { 
      label: "Finance", 
      href: "/admin/finance", 
      icon: <IndianRupee className="w-5 h-5" strokeWidth={2} />
    },
  ];

  // Grouped Navigation List for Scalable Mobile Smart Menu
  const smartMenuSections = [
    {
      title: "Agency Operations",
      items: [
        { 
          label: "Users", 
          description: "All users, activity logs & conversion",
          href: "/admin/users", 
          badgeCount: newUsersCount,
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          )
        },
        { 
          label: "Clients", 
          description: "Client accounts, balance & CRM",
          href: "/admin/clients", 
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )
        },
        { 
          label: "Projects", 
          description: "All client systems & deliverables",
          href: "/admin/projects", 
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )
        },
        { 
          label: "Revisions", 
          description: "Live client feedback & change requests",
          href: "/admin/revisions", 
          badgeCount: pendingRevisionsCount,
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )
        },
        { 
          label: "Finance", 
          description: "Cash flow, billings & expenses",
          href: "/admin/finance", 
          icon: <IndianRupee className="w-5 h-5" strokeWidth={2} />
        },
        { 
          label: "Inquiries", 
          description: "Incoming project consultation leads",
          href: "/admin/inquiries", 
          badgeCount: unreadInquiriesCount,
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          )
        },
      ]
    },
    {
      title: "System & Management",
      items: [
        { 
          label: "Profile", 
          description: "Account credentials & team settings",
          href: "/admin/profile", 
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )
        },
        { 
          label: "Settings", 
          description: "Site configuration, logos & integrations",
          href: "/admin/settings", 
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )
        },
      ]
    }
  ];

  // All flat items for desktop sidebar
  const allDesktopNavItems = [
    { label: "Overview", href: "/admin", icon: primaryNavItems[0].icon },
    { label: "Users", href: "/admin/users", icon: smartMenuSections[0].items[0].icon, badgeCount: newUsersCount },
    { label: "Projects", href: "/admin/projects", icon: primaryNavItems[1].icon },
    { label: "Clients", href: "/admin/clients", icon: smartMenuSections[0].items[1].icon },
    { label: "Revisions", href: "/admin/revisions", icon: primaryNavItems[2].icon, badgeCount: pendingRevisionsCount },
    { label: "Finance", href: "/admin/finance", icon: primaryNavItems[3].icon },
    { label: "Inquiries", href: "/admin/inquiries", icon: smartMenuSections[0].items[5].icon, badgeCount: unreadInquiriesCount },
    { label: "Profile", href: "/admin/profile", icon: smartMenuSections[1].items[0].icon },
    { label: "Settings", href: "/admin/settings", icon: smartMenuSections[1].items[1].icon },
  ];

  // Check if any secondary item is active
  const isSecondaryActive = smartMenuSections.some((sec) =>
    sec.items.some((item) => pathname === item.href || pathname?.startsWith(`${item.href}/`))
  );

  return (
    <>
      {/* ========================================================================= */}
      {/* DESKTOP SIDEBAR */}
      {/* ========================================================================= */}
      <aside className="hidden md:flex flex-col w-64 border-r border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111] h-screen sticky top-0 transition-colors duration-200">
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center">
          <Link href="/" className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-white rounded-xs">
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
              className="h-10 w-auto object-contain hidden dark:block"
              style={{ width: "auto" }}
            />
          </Link>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {allDesktopNavItems.map((item) => {
            const isActive = item.href === "/admin"
              ? pathname === "/admin"
              : pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
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

        {/* User Card */}
        <div className="p-4 border-t border-[#E5E5E5] dark:border-[#262626]">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] flex items-center justify-center text-xs font-bold shrink-0">
              SB
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-[#0A0A0A] dark:text-white truncate">Suman Baidya</p>
              <p className="text-[10px] text-[#737373] dark:text-neutral-400 truncate">suman.baidya.pro@gmail.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MOBILE BOTTOM NAVIGATION (4 Main Items + 1 Smart Menu Toggle) */}
      {/* ========================================================================= */}
      <nav 
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 border-t border-[#E5E5E5] dark:border-[#262626] bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md z-50 px-2 py-1.5 flex items-center justify-around pb-safe transition-colors duration-200"
      >
        {/* 4 Primary Nav Items */}
        {primaryNavItems.map((item) => {
          const isActive = item.href === "/admin"
            ? pathname === "/admin"
            : pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-12 gap-0.5 rounded-lg transition-colors relative focus-visible:outline-none ${
                isActive
                  ? "text-[#0A0A0A] dark:text-white font-bold"
                  : "text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white"
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.label === "Inquiries" && unreadInquiriesCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 min-w-[14px] h-3.5 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white dark:border-[#0A0A0A]">
                    {unreadInquiriesCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium tracking-tight truncate max-w-[56px] text-center">
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#0A0A0A] dark:bg-white" />
              )}
            </Link>
          );
        })}

        {/* 5th Item: "More" (Smart Menu Toggle) */}
        <button
          type="button"
          onClick={() => setIsSmartMenuOpen(!isSmartMenuOpen)}
          aria-expanded={isSmartMenuOpen}
          aria-label="Open smart menu"
          className={`flex flex-col items-center justify-center flex-1 h-12 gap-0.5 rounded-lg transition-colors relative focus-visible:outline-none ${
            isSmartMenuOpen || isSecondaryActive
              ? "text-[#0A0A0A] dark:text-white font-bold"
              : "text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white"
          }`}
        >
          <div className="relative">
            {isSmartMenuOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
            {isSecondaryActive && !isSmartMenuOpen && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#0A0A0A] dark:bg-white rounded-full"></span>
            )}
          </div>
          <span className="text-[10px] font-medium tracking-tight">More</span>
          {isSecondaryActive && (
            <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#0A0A0A] dark:bg-white" />
          )}
        </button>
      </nav>

      {/* ========================================================================= */}
      {/* MOBILE SMART MENU (List-Wise Scalable Bottom Sheet) */}
      {/* ========================================================================= */}
      {isSmartMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end animate-in fade-in duration-200">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsSmartMenuOpen(false)}
          />

          {/* Smart Menu Sheet */}
          <div className="relative bg-white dark:bg-[#111111] border-t border-[#E5E5E5] dark:border-[#262626] rounded-t-3xl shadow-2xl z-10 animate-in slide-in-from-bottom-8 duration-200 flex flex-col max-h-[82vh]">
            
            {/* Sheet Handle */}
            <div className="pt-3 pb-1 flex justify-center">
              <div className="w-10 h-1.5 rounded-full bg-[#E5E5E5] dark:bg-[#333333]" />
            </div>

            {/* Fixed Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#E5E5E5] dark:border-[#262626]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                  SB
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0A0A0A] dark:text-white leading-none">Suman Baidya</h3>
                  <p className="text-[11px] text-[#737373] dark:text-neutral-400 mt-1">suman.baidya.pro@gmail.com</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSmartMenuOpen(false)}
                className="p-2 text-[#737373] hover:text-[#0A0A0A] dark:text-neutral-400 dark:hover:text-white rounded-full hover:bg-[#F5F5F5] dark:hover:bg-[#262626] transition-colors"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Body: Categorized List Layout */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-5">
              {smartMenuSections.map((section, sIdx) => (
                <div key={section.title || sIdx} className="space-y-1.5">
                  {/* Category Header */}
                  <div className="flex items-center justify-between px-2 pt-1 pb-1">
                    <p className="text-[11px] font-bold text-[#737373] dark:text-neutral-400 uppercase tracking-wider">
                      {section.title}
                    </p>
                    <span className="text-[10px] font-mono text-[#A3A3A3] dark:text-neutral-500">
                      {section.items.length} items
                    </span>
                  </div>

                  {/* List-wise Stack */}
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsSmartMenuOpen(false)}
                          className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl transition-all group ${
                            isActive
                              ? "bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] shadow-xs"
                              : "text-[#0A0A0A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]"
                          }`}
                        >
                          {/* Icon Container */}
                          <div className={`p-2 rounded-lg shrink-0 transition-colors ${
                            isActive
                              ? "bg-white/15 dark:bg-black/15 text-white dark:text-[#0A0A0A]"
                              : "bg-[#F5F5F5] dark:bg-[#222222] text-[#0A0A0A] dark:text-white border border-[#EBEBEB] dark:border-[#333333]"
                          }`}>
                            {item.icon}
                          </div>

                          {/* Text Block */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate leading-tight">
                              {item.label}
                            </p>
                            <p className={`text-[11px] truncate mt-0.5 ${
                              isActive
                                ? "text-white/70 dark:text-black/70"
                                : "text-[#737373] dark:text-neutral-400"
                            }`}>
                              {item.description}
                            </p>
                          </div>

                          {/* Right elements: Badge or Active Indicator or Arrow */}
                          <div className="flex items-center gap-2 shrink-0">
                            {item.badgeCount && item.badgeCount > 0 ? (
                              <span className="min-w-[18px] h-4 px-1.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                {item.badgeCount}
                              </span>
                            ) : isActive ? (
                              <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-black" />
                            ) : (
                              <svg className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-[#737373] dark:text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Sticky Action Footer */}
            <div className="p-4 border-t border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] flex items-center justify-between gap-3 pb-8 sm:pb-4">
              <Link
                href="/"
                onClick={() => setIsSmartMenuOpen(false)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-[#E5E5E5] dark:border-[#262626] text-xs font-semibold text-[#0A0A0A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#262626] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View Live Site
              </Link>
              <Link
                href="/login"
                onClick={() => setIsSmartMenuOpen(false)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#F5F5F5] dark:bg-[#1F1F1F] text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </Link>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
