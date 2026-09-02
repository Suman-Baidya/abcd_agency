"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { navItems } from "./NavLinks";
import { QuickContactIcons } from "./QuickContactIcons";
import { Button } from "@/components/ui/Button";
import { InstallAppButton } from "@/components/ui/InstallAppButton";
import { AuthNavButton } from "./AuthNavButton";
import { Mail, Phone, MessageCircle } from "lucide-react";

export function MobileMenu({ siteConfig }: { siteConfig: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Handle body scroll locking & Esc key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      closeButtonRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsOpen(false);
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  const overlayContent = isOpen && mounted && typeof document !== "undefined" ? (
    createPortal(
      <div
        id="mobile-menu-overlay"
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className="fixed inset-0 z-[9999] w-screen h-[100dvh] max-h-[100dvh] flex flex-col justify-between p-4 sm:p-6 bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white overflow-y-auto transition-colors duration-200 select-none"
      >
        {/* Top Bar: Brand Logo + Install App + Close Button */}
        <div className="flex items-center justify-between w-full pb-3 border-b border-[#E5E5E5] dark:border-[#262626] shrink-0">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-white rounded-xs"
            aria-label="ABCD Agency Home"
          >
            {/* Light Mode Logo */}
            <Image
              src={siteConfig.lightLogoUrl || "/images/Black_Logo.png"}
              alt="ABCD Agency"
              width={140}
              height={34}
              className="h-7 w-auto object-contain block dark:hidden"
              style={{ width: "auto" }}
              priority
            />
            {/* Dark Mode Logo */}
            <Image
              src={siteConfig.darkLogoUrl || "/images/White_Logo.png"}
              alt="ABCD Agency"
              width={140}
              height={34}
              className="h-7 w-auto object-contain hidden dark:block"
              style={{ width: "auto" }}
              priority
            />
          </Link>

          <div className="flex items-center gap-2">
            {/* Top Install App Button on Mobile */}
            <InstallAppButton
              variant="compact"
              label="Install App"
              className="px-2.5 py-1.5 rounded-lg bg-[#F5F5F5] dark:bg-[#161616] border border-[#E5E5E5] dark:border-[#262626] font-bold text-[11px] text-[#0A0A0A] dark:text-white"
            />

            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
              className="w-9 h-9 inline-flex items-center justify-center rounded-lg text-[#0A0A0A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#262626] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-white cursor-pointer transition-colors border border-[#E5E5E5] dark:border-[#262626]"
            >
              <svg
                className="w-5 h-5 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Compact Navigation Links (Clean & readable under 100vh) */}
        <nav className="flex flex-col gap-1.5 py-4 my-auto overflow-y-auto" aria-label="Mobile links">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || (pathname?.startsWith(item.href) ?? false);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`text-sm sm:text-base tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-white rounded-lg flex items-center justify-between px-3 py-2.5 ${
                  isActive
                    ? "font-bold bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A]"
                    : "font-medium text-[#0A0A0A] dark:text-neutral-200 hover:bg-[#F5F5F5] dark:hover:bg-[#161616]"
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white dark:bg-[#0A0A0A]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions (Compact 2-col CTA + Contacts) */}
        <div className="pt-3 border-t border-[#E5E5E5] dark:border-[#262626] flex flex-col gap-3 w-full shrink-0">
          {/* Action Buttons in 2 columns to preserve vertical height */}
          <div className="grid grid-cols-2 gap-2.5">
            <AuthNavButton
              variant="secondary"
              size="sm"
              className="w-full text-center justify-center font-semibold text-xs h-10"
              onClick={() => setIsOpen(false)}
            />
            <Button
              href="/contact"
              variant="primary"
              size="sm"
              className="w-full text-center justify-center font-bold text-xs h-10"
              onClick={() => setIsOpen(false)}
            >
              Book a Call
            </Button>
          </div>

          {/* Quick Contact & Email Row */}
          <div className="flex items-center justify-between pt-1 text-[11px] text-[#737373] dark:text-neutral-400">
            <span className="truncate">{siteConfig.contactEmail}</span>
            <div className="flex items-center gap-2">
              {siteConfig.whatsappNumber && (
                <a
                  href={`https://wa.me/${siteConfig.whatsappNumber.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="WhatsApp"
                  aria-label="WhatsApp"
                  className="w-7 h-7 rounded-md flex items-center justify-center border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#161616] text-[#0A0A0A] dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                </a>
              )}
              {siteConfig.contactEmail && (
                <a
                  href={`mailto:${siteConfig.contactEmail}`}
                  title="Email Us"
                  aria-label="Email Us"
                  className="w-7 h-7 rounded-md flex items-center justify-center border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#161616] text-[#0A0A0A] dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>,
      document.body
    )
  ) : null;

  return (
    <div className="md:hidden flex items-center">
      {/* Hamburger Trigger Button - High Contrast for both Light & Dark modes */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="mobile-menu-overlay"
        aria-label="Open main menu"
        className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-2 rounded-lg text-[#0A0A0A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#262626] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-white cursor-pointer transition-colors"
      >
        <svg
          className="w-6 h-6 stroke-current"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      </button>

      {overlayContent}
    </div>
  );
}
