"use client";

import React, { useEffect, useState } from "react";

interface NavbarWrapperProps {
  children: React.ReactNode;
}

export function NavbarWrapper({ children }: NavbarWrapperProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 16) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Check initial position
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        isScrolled
          ? "bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md border-b border-[#E5E5E5] dark:border-[#262626] shadow-xs"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      {children}
    </header>
  );
}
