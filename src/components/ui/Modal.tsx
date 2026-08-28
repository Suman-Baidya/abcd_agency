"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  variant?: "centered" | "slide-over";
  headerActions?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, variant = "centered", headerActions }: ModalProps) {
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

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex ${
        variant === "slide-over" ? "justify-end" : "items-center justify-center"
      } transition-opacity duration-300 ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0A0A0A]/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div
        className={`relative bg-white dark:bg-[#0A0A0A] shadow-2xl transition-transform duration-300 ease-in-out ${
          variant === "slide-over"
            ? `h-full w-full max-w-2xl border-l border-[#E5E5E5] dark:border-[#262626] ${
                isOpen ? "translate-x-0" : "translate-x-full"
              }`
            : `w-full max-w-md rounded-xl border border-[#E5E5E5] dark:border-[#262626] m-4 scale-95 ${
                isOpen ? "scale-100" : ""
              }`
        } flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] z-10 shrink-0">
          <h2 className="text-xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">
            {title}
          </h2>
          <div className="flex items-center gap-2">
            {headerActions}
            <div className="w-px h-5 bg-[#E5E5E5] dark:bg-[#262626] mx-1 hidden sm:block"></div>
            <button
              onClick={onClose}
              className="p-1.5 text-[#737373] hover:text-[#0A0A0A] dark:text-neutral-400 dark:hover:text-white transition-colors rounded-full hover:bg-[#F5F5F5] dark:hover:bg-[#262626]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
}
