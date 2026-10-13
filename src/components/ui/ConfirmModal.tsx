"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Trash2, X, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "neutral";
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!mounted || !isOpen || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0A0A0A]/60 dark:bg-black/75 backdrop-blur-xs transition-opacity duration-200"
        onClick={() => !isLoading && onClose()}
      />

      {/* Modal Dialog Box */}
      <div className="relative w-full max-w-sm sm:max-w-md bg-white dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#262626] rounded-2xl p-6 sm:p-7 shadow-2xl transition-all transform duration-200 z-10 space-y-5 animate-in fade-in zoom-in-95">
        {/* Close Icon Button */}
        <button
          type="button"
          onClick={() => !isLoading && onClose()}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1.5 text-[#737373] hover:text-[#0A0A0A] dark:text-neutral-400 dark:hover:text-white rounded-lg hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-colors cursor-pointer disabled:opacity-40"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon Header */}
        <div className="flex justify-center">
          {variant === "danger" ? (
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400">
              <AlertTriangle className="w-6 h-6 stroke-[2]" />
            </div>
          ) : variant === "warning" ? (
            <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-6 h-6 stroke-[2]" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-[#1A1A1A] border border-[#E5E5E5] dark:border-[#262626] flex items-center justify-center text-[#0A0A0A] dark:text-white">
              <Info className="w-6 h-6 stroke-[2]" />
            </div>
          )}
        </div>

        {/* Text Content */}
        <div className="text-center space-y-2">
          <h3
            id="confirm-modal-title"
            className="text-base sm:text-lg font-bold tracking-tight text-[#0A0A0A] dark:text-white"
          >
            {title}
          </h3>
          <div className="text-xs sm:text-sm text-[#737373] dark:text-neutral-400 leading-relaxed">
            {description}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 justify-center text-xs sm:text-sm cursor-pointer"
          >
            {cancelLabel}
          </Button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              variant === "danger"
                ? "bg-red-600 hover:bg-red-700 active:bg-red-800 text-white"
                : "bg-[#0A0A0A] text-white hover:bg-neutral-800 dark:bg-white dark:text-[#0A0A0A] dark:hover:bg-neutral-200"
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : variant === "danger" ? (
              <Trash2 className="w-4 h-4" />
            ) : null}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
