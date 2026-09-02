import React from "react";
import Link from "next/link";
import Image from "next/image";
import { NavbarWrapper } from "./NavbarWrapper";
import { NavLinks } from "./NavLinks";
import { QuickContactIcons } from "./QuickContactIcons";
import { MobileMenu } from "./MobileMenu";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { AuthNavButton } from "./AuthNavButton";
import { InstallAppButton } from "@/components/ui/InstallAppButton";
import { getSiteConfig } from "@/lib/dbConfig";

export async function Navbar() {
  const siteConfig = await getSiteConfig();

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
                src={siteConfig.lightLogoUrl || "/images/Black_Logo.png"}
                alt={`${siteConfig.agencyName} — AI-Powered Business Consulting & Digitalization`}
                width={150}
                height={40}
                className="h-7 sm:h-10 w-auto object-contain block dark:hidden"
                style={{ width: "auto" }}
                priority
              />
              {/* Dark Mode Logo */}
              <Image
                src={siteConfig.darkLogoUrl || "/images/White_Logo.png"}
                alt={`${siteConfig.agencyName} — AI-Powered Business Consulting & Digitalization`}
                width={150}
                height={40}
                className="h-7 sm:h-10 w-auto object-contain hidden dark:block"
                style={{ width: "auto" }}
                priority
              />
            </Link>
          </div>

          {/* Right: Navigation Links + Action Group */}
          <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
            {/* Desktop Navigation Links */}
            <NavLinks />

            <div className="hidden lg:flex items-center border-l border-[#E5E5E5] dark:border-[#262626] pl-2 sm:pl-3">
              <QuickContactIcons siteConfig={siteConfig} />
            </div>

            {/* Desktop Actions Group: Login/Dashboard + Download Icon + Theme Toggle (Compact Gap) */}
            <div className="flex items-center gap-2">
              {/* Login / Dashboard CTA Button */}
              <div className="hidden sm:block">
                <AuthNavButton />
              </div>

              {/* Install App Quick Action (Desktop Icon Only) */}
              <InstallAppButton
                variant="icon"
                className="hidden sm:inline-flex"
              />

              {/* Theme Toggle Button (Light/Dark Switcher) */}
              <ThemeToggle />
            </div>

            {/* Mobile Hamburger Overlay (<768px) */}
            <MobileMenu siteConfig={siteConfig} />
          </div>
        </div>
      </div>
    </NavbarWrapper>
  );
}
