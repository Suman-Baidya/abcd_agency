"use client";

import React from "react";
import { useInMarketingLayout } from "./MarketingLayoutContext";

interface NotFoundShellProps {
  navbar: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}

export function NotFoundShell({
  navbar,
  footer,
  children,
}: NotFoundShellProps) {
  const inMarketingLayout = useInMarketingLayout();

  // If already mounted inside MarketingLayout (e.g. client-side router transition
  // or nested segment), suppress duplicate navbar and footer.
  if (inMarketingLayout) {
    return <>{children}</>;
  }

  // Standalone root 404 (direct URL entry or outside MarketingLayout)
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white transition-colors duration-200">
      {navbar}
      {children}
      {footer}
    </div>
  );
}
