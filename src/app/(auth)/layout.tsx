import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBFB] dark:bg-[#0A0A0A] transition-colors duration-200">
      {/* Floating fixed corner elements (No navbar bar, stays in place when scrolling) */}
      <header className="fixed top-0 left-0 right-0 p-4 sm:p-6 lg:p-8 flex items-center justify-between z-50 pointer-events-none">
        <Link href="/" className="flex items-center group pointer-events-auto">
          <Image
            src="/images/Black_Logo.png"
            alt="ABCD Agency Logo"
            width={120}
            height={40}
            className="h-8 w-auto block dark:hidden transition-opacity group-hover:opacity-80"
            style={{ width: "auto" }}
          />
          <Image
            src="/images/White_Logo.png"
            alt="ABCD Agency Logo"
            width={120}
            height={40}
            className="h-8 w-auto hidden dark:block transition-opacity group-hover:opacity-80"
            style={{ width: "auto" }}
          />
        </Link>
        <div className="pointer-events-auto">
          <ThemeToggle />
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        {children}
      </main>
    </div>
  );
}
