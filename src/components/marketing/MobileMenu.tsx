"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { navItems } from "./NavLinks";
import { QuickContactIcons } from "./QuickContactIcons";
import { Button } from "@/components/ui/Button";
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
        className="fixed inset-0 z-[9999] w-screen h-screen flex flex-col justify-between p-6 sm:p-8 bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white overflow-y-auto transition-colors duration-200"
      >
        {/* Top Bar: Brand Logo & Close Button */}
        <div className="flex items-center justify-between w-full pb-4 border-b border-[#E5E5E5] dark:border-[#262626]">
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
              width={160}
              height={40}
              className="h-7 sm:h-9 w-auto object-contain block dark:hidden"
              style={{ width: "auto" }}
              priority
            />
            {/* Dark Mode Logo */}
            <Image
              src={siteConfig.darkLogoUrl || "/images/White_Logo.png"}
              alt="ABCD Agency"
              width={160}
              height={40}
              className="h-7 sm:h-9 w-auto object-contain hidden dark:block"
              style={{ width: "auto" }}
              priority
            />
          </Link>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-2 rounded-lg text-[#0A0A0A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#262626] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-white cursor-pointer transition-colors border border-[#E5E5E5] dark:border-[#262626]"
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-5 my-auto py-8" aria-label="Mobile links">
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
                className={`text-2xl sm:text-3xl tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-white rounded-xs inline-flex items-center gap-3 py-1 ${
                  isActive
                    ? "font-bold text-[#0A0A0A] dark:text-white underline underline-offset-8 decoration-2"
                    : "font-semibold text-[#737373] dark:text-neutral-300 hover:text-[#0A0A0A] dark:hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions: Contact Icons + Login + Book a Call */}
        <div className="pt-5 border-t border-[#E5E5E5] dark:border-[#262626] flex flex-col gap-4 w-full">
          {/* Quick Contact Icons with explicit contrast in light & dark */}
          <div className="flex items-center justify-center gap-4 py-1">
            {siteConfig.contactEmail && (
              <a
                href={`mailto:${siteConfig.contactEmail}`}
                title="Email Us"
                aria-label="Email Us"
                className="w-10 h-10 rounded-full flex items-center justify-center border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#161616] text-[#0A0A0A] dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
            )}
            {siteConfig.contactPhone && (
              <a
                href={`tel:${siteConfig.contactPhone}`}
                title="Call Us"
                aria-label="Call Us"
                className="w-10 h-10 rounded-full flex items-center justify-center border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#161616] text-[#0A0A0A] dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
              >
                <Phone className="w-4 h-4" />
              </a>
            )}
            {siteConfig.whatsappNumber && (
              <a
                href={`https://wa.me/${siteConfig.whatsappNumber.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                title="WhatsApp"
                aria-label="WhatsApp"
                className="w-10 h-10 rounded-full flex items-center justify-center border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#161616] text-[#0A0A0A] dark:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            )}
          </div>

          {/* Primary Action Buttons (Login & Book a Call) */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <Button
              href="/login"
              variant="secondary"
              size="md"
              className="w-full text-center justify-center font-semibold text-sm h-11"
              onClick={() => setIsOpen(false)}
            >
              Login
            </Button>
            <Button
              href="/contact"
              variant="primary"
              size="md"
              className="w-full text-center justify-center font-bold text-sm h-11"
              onClick={() => setIsOpen(false)}
            >
              Book a Call
            </Button>
          </div>

          <p className="text-xs text-[#737373] dark:text-neutral-400 text-center tracking-tight">
            {siteConfig.contactEmail}
          </p>
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
