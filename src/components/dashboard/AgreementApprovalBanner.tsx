"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";
import { coolDownAgreementNotifications } from "@/lib/agreement-defaults";

export interface AgreementApprovalItem {
  id: string;
  action: string;
  createdAt: string | Date;
  description?: string | null;
}

interface AgreementApprovalBannerProps {
  approval: AgreementApprovalItem | null;
}

export function AgreementApprovalBanner({ approval }: AgreementApprovalBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const checkDismissed = () => {
      if (!approval) return;
      try {
        const stored = localStorage.getItem("abcd_read_notifications");
        const readIds: string[] = stored ? JSON.parse(stored) : [];

        // Check if explicitly marked read by notification id or banner id
        if (
          readIds.includes(`agr-${approval.id}`) ||
          readIds.includes(`banner-${approval.id}`) ||
          readIds.includes(approval.id)
        ) {
          setIsDismissed(true);
          return;
        }

        // Check if agreement notifications were cooled down after this activity was created
        const viewedAtStr = localStorage.getItem("abcd_last_agreement_viewed_at");
        if (viewedAtStr) {
          const viewedAt = Number(viewedAtStr);
          const actTime = new Date(approval.createdAt).getTime();
          if (viewedAt >= actTime) {
            setIsDismissed(true);
            return;
          }
        }
      } catch {}
    };

    checkDismissed();
    setMounted(true);

    window.addEventListener("notifications_updated", checkDismissed);
    return () => window.removeEventListener("notifications_updated", checkDismissed);
  }, [approval]);

  if (!mounted || !approval || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      const stored = localStorage.getItem("abcd_read_notifications");
      const readIds: string[] = stored ? JSON.parse(stored) : [];
      const updated = Array.from(
        new Set([...readIds, `agr-${approval.id}`, `banner-${approval.id}`, approval.id])
      );
      localStorage.setItem("abcd_read_notifications", JSON.stringify(updated));
      coolDownAgreementNotifications();
    } catch {}
  };

  const formattedTime = new Date(approval.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
      <div className="flex items-start sm:items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-emerald-950 dark:text-emerald-200 truncate">
              {approval.action === "AGREEMENT_RECONFIRMED"
                ? "Client Approved Agreement Re-Confirmation"
                : "Client Executed Project Agreement"}
            </h3>
            <span className="text-[10px] font-mono text-emerald-700/80 dark:text-emerald-400 shrink-0">
              {formattedTime}
            </span>
          </div>
          <p className="text-xs text-emerald-900/80 dark:text-emerald-300/90 mt-0.5 break-words">
            {approval.description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-800 dark:text-emerald-200">
          {approval.action === "AGREEMENT_RECONFIRMED" ? "Re-Confirmed & Active" : "Legally Executed"}
        </span>
        <button
          type="button"
          onClick={handleDismiss}
          className="p-1 rounded-md text-emerald-800/60 dark:text-emerald-300/60 hover:text-emerald-950 dark:hover:text-white hover:bg-emerald-500/20 transition-colors cursor-pointer"
          title="Dismiss notification"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
