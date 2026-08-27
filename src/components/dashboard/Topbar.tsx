"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface Notification {
  id: string;
  name: string;
  createdAt: Date;
  projectType: string;
}

interface TopbarProps {
  lightLogoUrl?: string | null;
  darkLogoUrl?: string | null;
  agencyName?: string;
  notifications?: Notification[];
}

export function Topbar({ lightLogoUrl, darkLogoUrl, agencyName = "ABCD Agency", notifications = [] }: TopbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 md:px-8 h-12 md:h-16 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-md border-b border-[#E5E5E5] dark:border-[#262626] transition-colors duration-200">
      {/* Mobile left side (Logo) */}
      <div className="md:hidden flex items-center">
        <Link href="/" className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-white rounded-xs">
          <Image
            src={lightLogoUrl || "/images/Black_Logo.png"}
            alt={`${agencyName} Logo`}
            width={120}
            height={36}
            className="h-7 w-auto block dark:hidden"
            style={{ width: "auto" }}
          />
          <Image
            src={darkLogoUrl || "/images/White_Logo.png"}
            alt={`${agencyName} Logo`}
            width={120}
            height={36}
            className="h-7 w-auto hidden dark:block"
            style={{ width: "auto" }}
          />
        </Link>
      </div>

      {/* Desktop left side */}
      <div className="hidden md:flex items-center gap-4"></div>

      {/* Right actions */}
      <div className="flex items-center gap-3 sm:gap-4 ml-auto">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-[#737373] hover:text-[#0A0A0A] dark:text-neutral-400 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-white rounded-full"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-[#0A0A0A]"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 md:w-80 bg-white dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#262626] rounded-xl shadow-lg z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E5E5] dark:border-[#262626]">
                <h3 className="font-semibold text-sm text-[#0A0A0A] dark:text-white">Notifications</h3>
                <span className="text-xs font-medium bg-[#F5F5F5] dark:bg-[#262626] text-[#737373] dark:text-neutral-300 px-2 py-0.5 rounded-full">
                  {notifications.length} New
                </span>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <Link
                      key={notif.id}
                      href={`/admin/inquiries`}
                      onClick={() => setShowNotifications(false)}
                      className="block px-4 py-3 border-b border-[#F5F5F5] dark:border-[#1A1A1A] last:border-0 hover:bg-[#F9F9F9] dark:hover:bg-[#1A1A1A] transition-colors"
                    >
                      <p className="text-sm font-semibold text-[#0A0A0A] dark:text-white line-clamp-1">
                        New Inquiry: {notif.name}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-[#737373] dark:text-neutral-400 capitalize">
                          {notif.projectType.replace("-", " ")}
                        </p>
                        <p className="text-[10px] text-[#A3A3A3] dark:text-neutral-500">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm text-[#737373] dark:text-neutral-400">No new notifications</p>
                  </div>
                )}
              </div>
              <div className="p-2 border-t border-[#E5E5E5] dark:border-[#262626]">
                <Link
                  href="/admin/inquiries"
                  onClick={() => setShowNotifications(false)}
                  className="block w-full text-center py-2 text-xs font-semibold text-[#0A0A0A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#262626] rounded-md transition-colors"
                >
                  View all inquiries
                </Link>
              </div>
            </div>
          )}
        </div>
        <ThemeToggle />
        <Link
          href="/login"
          className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-[#0A0A0A] dark:text-white bg-[#F5F5F5] dark:bg-[#111111] hover:bg-[#E5E5E5] dark:hover:bg-[#262626] rounded-md transition-colors"
        >
          Sign out
        </Link>
      </div>
    </header>
  );
}
