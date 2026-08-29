"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface SidebarProps {
  lightLogoUrl?: string | null;
  darkLogoUrl?: string | null;
  agencyName?: string;
  unreadInquiriesCount?: number;
}

export function Sidebar({ lightLogoUrl, darkLogoUrl, agencyName = "ABCD Agency", unreadInquiriesCount = 0 }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Overview", href: "/admin", icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    )},
    { label: "Projects", href: "/admin/projects", icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )},
    { label: "Clients", href: "/admin/clients", icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )},
    { label: "Finance", href: "/admin/finance", icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 3h12M6 8h12M6 13h3c6.667 0 6.667-10 0-10M6 13l8.5 8" />
      </svg>
    )},
    { label: "Inquiries", href: "/admin/inquiries", icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    )},
    { label: "Profile", href: "/admin/profile", icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )},
    { label: "Settings", href: "/admin/settings", icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )}
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111] h-screen sticky top-0 transition-colors duration-200">
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

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
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
                  {item.label === "Inquiries" && unreadInquiriesCount > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold text-white bg-red-500 rounded-full">
                      {unreadInquiriesCount}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

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

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-[#E5E5E5] dark:border-[#262626] bg-white/90 dark:bg-[#0A0A0A]/90 backdrop-blur-md z-50 px-2 sm:px-4 py-2 flex items-center justify-around pb-safe transition-colors duration-200">
        {navItems.map((item) => {
          const isActive = item.href === "/admin"
              ? pathname === "/admin"
              : pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-w-[48px] h-11 gap-0.5 rounded-md transition-colors relative ${
                isActive
                  ? "text-[#0A0A0A] dark:text-white font-bold"
                  : "text-[#737373] dark:text-neutral-500 hover:text-[#0A0A0A] dark:hover:text-white"
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.label === "Inquiries" && unreadInquiriesCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-[#0A0A0A] rounded-full"></span>
                )}
              </div>
              <span className="text-[9px] font-semibold tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
