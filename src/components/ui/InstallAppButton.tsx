"use client";

import React, { useState, useEffect } from "react";
import { Download, Monitor, Smartphone } from "lucide-react";

interface InstallAppButtonProps {
  className?: string;
  variant?: "button" | "link" | "compact" | "icon";
  label?: string;
}

export function InstallAppButton({
  className = "",
  variant = "link",
  label = "Install Web App",
}: InstallAppButtonProps) {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isRunningStandalone =
      typeof window !== "undefined" &&
      (window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true ||
        window.matchMedia("(display-mode: fullscreen)").matches);

    const alreadyInstalled =
      typeof window !== "undefined" &&
      localStorage.getItem("abcd_pwa_installed") === "true";

    setIsStandalone(Boolean(isRunningStandalone));
    setIsInstalled(Boolean(alreadyInstalled));

    const handleAppInstalled = () => {
      setIsInstalled(true);
    };

    const handleBeforeInstall = () => {
      setIsInstalled(false);
    };

    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleClick = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open_pwa_install"));
    }
  };

  if (!mounted || isStandalone || isInstalled) {
    return null;
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`w-9 h-9 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] text-[#0A0A0A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1E1E1E] flex items-center justify-center transition-colors cursor-pointer ${className}`}
        title="Install Web App"
        aria-label="Install ABCD Agency Web App"
      >
        <Download className="w-4 h-4" />
      </button>
    );
  }

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] text-xs font-semibold hover:opacity-90 active:scale-95 transition-all cursor-pointer ${className}`}
      >
        <Download className="w-3.5 h-3.5" />
        <span>{label}</span>
      </button>
    );
  }

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-1.5 text-xs text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white transition-colors cursor-pointer ${className}`}
        title="Install ABCD Agency Web App"
      >
        <Download className="w-3.5 h-3.5" />
        <span>{label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`text-xs text-[#0A0A0A] dark:text-[#E5E5E5] hover:underline inline-flex items-center gap-1.5 cursor-pointer text-left ${className}`}
    >
      <Download className="w-3.5 h-3.5" />
      <span>{label}</span>
    </button>
  );
}
