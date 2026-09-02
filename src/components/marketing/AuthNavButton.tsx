"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { LogIn, LayoutDashboard } from "lucide-react";

interface AuthNavButtonProps {
  className?: string;
  size?: "sm" | "md";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Fetch session on client
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

  if (isDashboard) {
    return (
      <Button
        href={dashboardHref}
        variant={variant}
        size={size}
        onClick={onClick}
        className={`font-semibold gap-1.5 dark:bg-white dark:text-[#0A0A0A] dark:border-white dark:hover:bg-[#E5E5E5] ${className}`}
      >
        <LayoutDashboard className="w-3.5 h-3.5" />
        <span>Dashboard</span>
      </Button>
    );
  }

  return (
    <Button
      href="/login"
      variant={variant}
      size={size}
      onClick={onClick}
      className={`font-semibold gap-1.5 dark:bg-white dark:text-[#0A0A0A] dark:border-white dark:hover:bg-[#E5E5E5] ${className}`}
    >
      <LogIn className="w-3.5 h-3.5" />
      <span>Login</span>
    </Button>
  );
}
