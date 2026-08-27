"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { navItems } from "./NavLinks";
import { QuickContactIcons } from "./QuickContactIcons";
import { Button } from "@/components/ui/Button";

export function MobileMenu({ siteConfig }: { siteConfig: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Close menu on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
        className="fixed inset-0 z-[100] w-screen h-screen flex flex-col justify-between p-6 sm:p-8 bg-[#0A0A0A] text-white overflow-y-auto"
        style={{
          backgroundColor: "#0A0A0A",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
        }}
      >
        {/* Top Bar: Logo & Close Button */}
        <div className="flex items-center justify-between w-full">
          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-xs"
            aria-label="ABCD Agency Home"
          >
            <Image
              src="/images/White_Logo.png"
              alt="ABCD Agency — AI-Powered Business Consulting & Digitalization"
              width={180}
              height={50}
              className="h-7 sm:h-10 w-auto object-contain"
              style={{ width: "auto" }}
            />
          </Link>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-[#262626] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer transition-colors"
          >
            <svg
              className="w-7 h-7 stroke-white"
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
        <nav className="flex flex-col gap-6 my-auto py-10" aria-label="Mobile links">
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
                className={`text-3xl sm:text-4xl tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-xs inline-flex items-center gap-3 ${
                  isActive
                    ? "font-bold text-white underline underline-offset-8 decoration-2 decoration-white"
                    : "font-semibold text-white/90 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-[#262626] flex flex-col gap-4 w-full">
          <div className="flex items-center justify-center gap-6 py-1">
            <QuickContactIcons siteConfig={siteConfig} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              href="/login"
              variant="white-outline"
              size="md"
              className="w-full text-center"
              onClick={() => setIsOpen(false)}
            >
              Login
            </Button>
            <Button
              href="/contact"
              variant="white"
              size="md"
              className="w-full text-center font-bold"
              onClick={() => setIsOpen(false)}
            >
              Book a Call
            </Button>
          </div>
          <p className="text-xs text-[#737373] text-center tracking-tight">
            {siteConfig.contactEmail}
          </p>
        </div>
      </div>,
      document.body
    )
  ) : null;

  return (
    <div className="md:hidden flex items-center">
      {/* Hamburger Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-expanded={isOpen}
        aria-controls="mobile-menu-overlay"
        aria-label="Open main menu"
        className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center p-2 rounded-md text-[#0A0A0A] hover:bg-[#F5F5F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] cursor-pointer transition-colors"
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
