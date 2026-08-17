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
      <header className="absolute top-0 w-full p-4 sm:p-6 lg:p-8 flex items-center justify-between z-10">
        <Link href="/" className="flex items-center group">
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
        <ThemeToggle />
      </header>
      
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
    </div>
  );
}
