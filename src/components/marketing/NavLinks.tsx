"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  label: string;
  href: string;
}

export const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Work", href: "/work" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-9" aria-label="Main Navigation">
      {navItems.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href || (pathname?.startsWith(item.href) ?? false);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative py-1 text-[15px] tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-white rounded-xs ${isActive
              ? "font-semibold text-[#0A0A0A] dark:text-white"
              : "font-normal text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white"
              }`}
          >
            {item.label}
            {isActive && (
              <span
                className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#0A0A0A] dark:bg-white"
                aria-hidden="true"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
