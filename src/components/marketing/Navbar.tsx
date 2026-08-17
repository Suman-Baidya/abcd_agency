import React from "react";
import Link from "next/link";
import Image from "next/image";
import { NavbarWrapper } from "./NavbarWrapper";
import { NavLinks } from "./NavLinks";
import { QuickContactIcons } from "./QuickContactIcons";
import { MobileMenu } from "./MobileMenu";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  return (
    <NavbarWrapper>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-16">
          {/* Left: Brand Logo (Adaptive for Light & Dark mode) */}
          <div className="flex-shrink-0 flex items-center h-full">
            <Link
              href="/"
              className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-white rounded-xs"
              aria-label="ABCD Agency Home"
            >
              {/* Light Mode Logo */}
              <Image
                src="/images/Black_Logo.png"
                alt="ABCD Agency — AI-Powered Business Consulting & Digitalization"
                width={150}
                height={40}
                className="h-7 sm:h-10 w-auto object-contain block dark:hidden"
                style={{ width: "auto" }}
                priority
              />
              {/* Dark Mode Logo */}
              <Image
                src="/images/White_Logo.png"
                alt="ABCD Agency — AI-Powered Business Consulting & Digitalization"
                width={150}
                height={40}
                className="h-7 sm:h-10 w-auto object-contain hidden dark:block"
                style={{ width: "auto" }}
                priority
              />
            </Link>
          </div>

          {/* Right: Everything Aligned on the Right per Reference Layout */}
          <div className="flex items-center gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {/* Desktop Navigation Links */}
            <NavLinks />

            {/* Quick Contact Icons (Phone, WhatsApp, Email) */}
            <div className="hidden lg:flex items-center border-l border-[#E5E5E5] dark:border-[#262626] pl-2 sm:pl-3">
              <QuickContactIcons />
            </div>

            {/* Login CTA Button */}
            <div className="hidden sm:block">
              <Button
                href="/login"
                variant="primary"
                size="sm"
                className="font-semibold dark:bg-white dark:text-[#0A0A0A] dark:border-white dark:hover:bg-[#E5E5E5]"
              >
                Login
              </Button>
            </div>

            {/* Theme Toggle Button (Light/Dark Switcher) */}
            <ThemeToggle />

            {/* Mobile Hamburger Overlay (<768px) */}
            <MobileMenu />
          </div>
        </div>
      </div>
    </NavbarWrapper>
  );
}
