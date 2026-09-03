"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { LogIn, LayoutDashboard } from "lucide-react";

interface AuthNavButtonProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary";
  onClick?: () => void;
}

export function AuthNavButton({
  className = "",
  size = "sm",
  variant = "primary",
  onClick,
}: AuthNavButtonProps) {
  const [user, setUser] = useState<{ role?: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const isDashboard = Boolean(user);
  const dashboardHref =
    user?.role === "ADMIN" || user?.role === "SUPER_ADMIN" ? "/admin" : "/portal";

  const sizeClasses = {
    sm: "min-h-[36px] px-3.5 py-1.5 text-xs font-semibold rounded-lg gap-1.5",
    md: "min-h-[44px] px-5 py-2.5 text-sm font-semibold rounded-lg gap-2",
    lg: "min-h-[48px] px-6 py-3 text-base font-semibold rounded-lg gap-2.5",
  }[size];

  // Explicit, foolproof colors that guarantee high contrast in both light and dark modes
  const variantClasses =
    variant === "secondary"
      ? "bg-white text-[#0A0A0A] border border-[#E5E5E5] hover:bg-[#F5F5F5] active:bg-[#EAEAEA] dark:bg-[#161616] dark:text-white dark:border-[#333333] dark:hover:bg-[#222222] dark:active:bg-[#262626] shadow-xs"
      : "bg-[#0A0A0A] text-white border border-[#0A0A0A] hover:bg-[#262626] dark:bg-white dark:text-[#0A0A0A] dark:border-white dark:hover:bg-[#E5E5E5] shadow-xs";

  const href = isDashboard ? dashboardHref : "/login";

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`inline-flex items-center justify-center font-sans transition-all duration-150 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-white ${sizeClasses} ${variantClasses} ${className}`}
    >
      {isDashboard ? (
        <>
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          <span>Dashboard</span>
        </>
      ) : (
        <>
          <LogIn className="w-4 h-4 shrink-0" />
          <span>Login</span>
        </>
      )}
    </Link>
  );
}
