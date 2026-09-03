"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { InstallAppButton } from "@/components/ui/InstallAppButton";
import { ContextTourButton } from "@/components/dashboard/ContextTourButton";

interface Notification {
  id: string;
  name: string;
  createdAt: Date;
  projectType?: string;
  title?: string;
  subtitle?: string;
  href?: string;
  type?: "inquiry" | "user";
}

interface TopbarProps {
  lightLogoUrl?: string | null;
  darkLogoUrl?: string | null;
  agencyName?: string;
  userName?: string | null;
  userRole?: string | null;
  notifications?: Notification[];
}

export function Topbar({ 
  lightLogoUrl, 
  darkLogoUrl, 
  agencyName = "ABCD Agency", 
  userName,
  userRole,
  notifications = [] 
}: TopbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [readNotifIds, setReadNotifIds] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load dismissed/read notification IDs from localStorage and listen for updates
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

  const markAsRead = (id: string) => {
    let currentStored: string[] = [];
    try {
      const stored = localStorage.getItem("abcd_read_notifications");
      if (stored) currentStored = JSON.parse(stored);
    } catch {}

    const updated = Array.from(new Set([...currentStored, ...readNotifIds, id]));
    try {
      localStorage.setItem("abcd_read_notifications", JSON.stringify(updated));
    } catch {}
    setReadNotifIds(updated);

    setTimeout(() => {
      window.dispatchEvent(new Event("notifications_updated"));
    }, 0);
  };

  const markAllAsRead = () => {
    let currentStored: string[] = [];
    try {
      const stored = localStorage.getItem("abcd_read_notifications");
      if (stored) currentStored = JSON.parse(stored);
    } catch {}

    const allIds = notifications.map((n) => n.id);
    const updated = Array.from(new Set([...currentStored, ...readNotifIds, ...allIds]));
    try {
      localStorage.setItem("abcd_read_notifications", JSON.stringify(updated));
    } catch {}
    setReadNotifIds(updated);

    setTimeout(() => {
      window.dispatchEvent(new Event("notifications_updated"));
    }, 0);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter out notifications that have already been clicked / viewed
  const unreadNotifications = notifications.filter((n) => !readNotifIds.includes(n.id));
  const isClientPortal = userRole?.toLowerCase().includes("portal") || userRole?.toLowerCase().includes("client") || userRole?.toLowerCase().includes("prospect");

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
      <div className="hidden md:flex items-center gap-2.5">
        {userName && (
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="font-bold text-[#0A0A0A] dark:text-white tracking-tight">
              {userName}
            </span>
            <span className="text-[#A3A3A3] dark:text-neutral-600">/</span>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#737373] dark:text-neutral-400">
              {userRole === "SUPER_ADMIN" ? "Super Admin" : userRole === "ADMIN" ? "Admin Workspace" : userRole || "Workspace"}
            </span>
          </div>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Toggle notifications"
            className="relative w-9 h-9 flex items-center justify-center rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] text-[#737373] hover:text-[#0A0A0A] dark:text-neutral-400 dark:hover:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1E1E1E] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-white cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadNotifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 border border-white dark:border-[#0A0A0A]"></span>
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              {/* Mobile backdrop to dismiss when tapping outside */}
              <div
                className="sm:hidden fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 transition-opacity animate-in fade-in"
                onClick={() => setShowNotifications(false)}
              />
              <div className="fixed left-3 right-3 sm:left-auto sm:right-0 sm:absolute top-14 sm:top-full sm:mt-2 w-auto sm:w-84 max-w-md sm:max-w-none bg-white dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#262626] rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E5E5] dark:border-[#262626]">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-[#0A0A0A] dark:text-white">Notifications</h3>
                    {unreadNotifications.length > 0 && (
                      <span className="text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.2 rounded-full">
                        {unreadNotifications.length}
                      </span>
                    )}
                  </div>
                  {unreadNotifications.length > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] font-semibold text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white transition-colors cursor-pointer"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="max-h-[320px] overflow-y-auto divide-y divide-[#F5F5F5] dark:divide-[#1A1A1A]">
                  {unreadNotifications.length > 0 ? (
                    unreadNotifications.map((notif) => (
                      <Link
                        key={notif.id}
                        href={notif.href || (isClientPortal ? "/portal/revisions" : notif.type === "user" ? "/admin/users" : "/admin/inquiries")}
                        onClick={() => {
                          markAsRead(notif.id);
                          setShowNotifications(false);
                        }}
                        className="block px-4 py-3 hover:bg-[#F9F9F9] dark:hover:bg-[#1A1A1A] transition-colors group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-bold text-[#0A0A0A] dark:text-white group-hover:underline line-clamp-1">
                            {notif.title || (notif.type === "user" ? `New User: ${notif.name}` : `New Inquiry: ${notif.name}`)}
                          </p>
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1" />
                        </div>
                        <p className="text-[11px] text-[#737373] dark:text-neutral-400 line-clamp-2 mt-0.5 leading-relaxed">
                          {notif.subtitle || (notif.projectType ? notif.projectType.replace("-", " ") : "New update available")}
                        </p>
                        <div className="flex items-center justify-between mt-1.5 text-[10px] text-[#A3A3A3] dark:text-neutral-500 font-mono">
                          <span>{notif.name}</span>
                          <span>
                            {new Date(notif.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "2-digit",
                            })}
                          </span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center space-y-1">
                      <p className="text-xs font-semibold text-[#0A0A0A] dark:text-white">All caught up!</p>
                      <p className="text-[11px] text-[#737373] dark:text-neutral-400">No unread notifications right now.</p>
                    </div>
                  )}
                </div>
                <div className="p-2.5 border-t border-[#E5E5E5] dark:border-[#262626] flex items-center justify-between text-xs font-semibold px-3 bg-[#FBFBFB] dark:bg-[#141414] rounded-b-xl">
                  {isClientPortal ? (
                    <>
                      <Link
                        href="/portal/revisions"
                        onClick={() => setShowNotifications(false)}
                        className="text-[#0A0A0A] dark:text-white hover:underline"
                      >
                        Revisions Hub →
                      </Link>
                      <Link
                        href="/portal/projects"
                        onClick={() => setShowNotifications(false)}
                        className="text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white transition-colors"
                      >
                        Projects →
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/admin/revisions"
                        onClick={() => setShowNotifications(false)}
                        className="text-[#0A0A0A] dark:text-white hover:underline"
                      >
                        Revisions →
                      </Link>
                      <Link
                        href="/admin/inquiries"
                        onClick={() => setShowNotifications(false)}
                        className="text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white transition-colors"
                      >
                        Inquiries →
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        <ContextTourButton />
        <InstallAppButton variant="icon" />
        <ThemeToggle />
        <button
          onClick={async () => {
            const { logoutUser } = await import("@/app/(auth)/login/actions");
            await logoutUser();
            window.location.href = "/login";
          }}
          className="inline-flex items-center gap-1.5 px-3 h-9 text-xs font-semibold text-[#737373] hover:text-[#0A0A0A] dark:text-neutral-400 dark:hover:text-white border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] hover:bg-[#F5F5F5] dark:hover:bg-[#1E1E1E] rounded-lg transition-colors cursor-pointer"
          title="Sign out of account"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>
    </header>
  );
}
