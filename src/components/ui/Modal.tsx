"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  variant?: "centered" | "slide-over";
  size?: ModalSize;
  className?: string;
  headerActions?: React.ReactNode;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  variant = "centered",
  size = "2xl",
  className = "",
  headerActions,
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted) return null;

  const widthClass = variant === "slide-over" ? "max-w-2xl" : sizeClasses[size] || "max-w-2xl";

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex ${
        variant === "slide-over" ? "justify-end" : "items-center justify-center p-4 sm:p-6"
      } transition-opacity duration-300 ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0A0A0A]/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content Container */}
      <div
        className={`relative bg-white dark:bg-[#0A0A0A] shadow-2xl transition-transform duration-300 ease-in-out ${
          variant === "slide-over"
            ? `h-full w-full ${widthClass} border-l border-[#E5E5E5] dark:border-[#262626] ${
                isOpen ? "translate-x-0" : "translate-x-full"
              }`
            : `w-full ${widthClass} rounded-xl border border-[#E5E5E5] dark:border-[#262626] overflow-hidden scale-95 max-h-[90vh] ${
                isOpen ? "scale-100" : ""
              }`
        } flex flex-col ${className}`}
      >
        {/* Header with explicit rounded top corners matching parent */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b-2 border-[#0A0A0A] dark:border-white/20 bg-[#FAFAFA] dark:bg-[#0A0A0A] rounded-t-xl z-10 shrink-0 gap-3 min-h-[66px]">
          <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#0A0A0A] dark:text-white shrink-0">
            {title}
          </h2>
          {headerActions && (
            <div className="flex-1 flex justify-center items-center min-w-0">
              {headerActions}
            </div>
          )}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onClose}
              className="p-2 text-[#737373] hover:text-[#0A0A0A] dark:text-neutral-400 dark:hover:text-white transition-colors rounded-lg hover:bg-[#E5E5E5] dark:hover:bg-[#262626] cursor-pointer"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}
