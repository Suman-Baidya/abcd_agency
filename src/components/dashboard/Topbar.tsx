"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function Topbar() {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 md:px-8 h-12 md:h-16 bg-white/80 dark:bg-[#0A0A0A]/80 backdrop-blur-md border-b border-[#E5E5E5] dark:border-[#262626] transition-colors duration-200">
      {/* Mobile left side (Logo) */}
      <div className="md:hidden flex items-center">
        <Link href="/" className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-white rounded-xs">
          <Image
            src="/images/Black_Logo.png"
            alt="ABCD Agency Logo"
            width={120}
            height={36}
            className="h-7 w-auto block dark:hidden"
            style={{ width: "auto" }}
          />
          <Image
            src="/images/White_Logo.png"
            alt="ABCD Agency Logo"
            width={120}
            height={36}
            className="h-7 w-auto hidden dark:block"
            style={{ width: "auto" }}
          />
        </Link>
      </div>

      {/* Desktop left side (Page title/breadcrumbs could go here, for now just empty space) */}
      <div className="hidden md:flex items-center gap-4">
        {/* Placeholder for Breadcrumbs or Search */}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3 sm:gap-4 ml-auto">
        <button className="p-2 text-[#737373] hover:text-[#0A0A0A] dark:text-neutral-400 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-white rounded-full">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
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
