"use client";

import React, { useState } from "react";
import { Copy, Check, ExternalLink, KeyRound, Globe, ShieldCheck } from "lucide-react";

interface SandboxCredentialsCardProps {
  demoUrl?: string | null;
  demoEmail?: string | null;
  demoPassword?: string | null;
  demoRole?: string | null;
  title: string;
}

export function SandboxCredentialsCard({
  demoUrl,
  demoEmail,
  demoPassword,
  demoRole,
  title,
}: SandboxCredentialsCardProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!demoUrl && !demoEmail) {
    return null;
  }

  const handleCopy = (text: string, field: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  return (
    <div className="rounded-2xl border border-[#E5E5E5] dark:border-[#262626] bg-[#FAFAFA] dark:bg-[#111111] p-6 sm:p-8 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5E5] dark:border-[#262626] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#0A0A0A] dark:text-white flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              Live Interactive Sandbox
            </span>
          </div>
          <h3 className="text-lg font-bold text-[#0A0A0A] dark:text-white tracking-tight">
            Test-Drive the Live System
          </h3>
          <p className="text-xs text-[#737373] dark:text-neutral-400 mt-1 max-w-xl">
            This system is hosted live for prospective clients to evaluate architecture, performance, and UX. Use the pre-configured credentials below to explore the dashboard.
          </p>
        </div>

        {demoUrl && (
          <a
            href={demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-sm shrink-0"
          >
            Launch Sandbox
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Credentials Access Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Email / Username */}
        <div className="p-4 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] space-y-1.5">
          <span className="text-[11px] font-mono text-[#737373] dark:text-neutral-400 uppercase tracking-wider block">
            Demo Email / User
          </span>
          <div className="flex items-center justify-between gap-2">
            <code className="text-xs font-mono font-semibold text-[#0A0A0A] dark:text-white truncate">
              {demoEmail || "demo@abcdagency.com"}
            </code>
            {demoEmail && (
              <button
                type="button"
                onClick={() => handleCopy(demoEmail, "email")}
                className="shrink-0 p-1.5 rounded-md text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#262626] transition-colors cursor-pointer"
                title="Copy demo email"
              >
                {copiedField === "email" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Password */}
        <div className="p-4 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] space-y-1.5">
          <span className="text-[11px] font-mono text-[#737373] dark:text-neutral-400 uppercase tracking-wider block">
            Demo Password
          </span>
          <div className="flex items-center justify-between gap-2">
            <code className="text-xs font-mono font-semibold text-[#0A0A0A] dark:text-white truncate">
              {demoPassword || "••••••••"}
            </code>
            {demoPassword && (
              <button
                type="button"
                onClick={() => handleCopy(demoPassword, "password")}
                className="shrink-0 p-1.5 rounded-md text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#262626] transition-colors cursor-pointer"
                title="Copy demo password"
              >
                {copiedField === "password" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Role & Scope */}
        <div className="p-4 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] space-y-1.5">
          <span className="text-[11px] font-mono text-[#737373] dark:text-neutral-400 uppercase tracking-wider block">
            Access Scope
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-xs font-semibold text-[#0A0A0A] dark:text-white truncate">
              {demoRole || "Admin (Test Data Sandbox)"}
            </span>
          </div>
        </div>
      </div>

      {demoUrl && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#737373] dark:text-neutral-400 pt-2 border-t border-[#E5E5E5] dark:border-[#262626]">
          <span className="truncate">
            Live Deployment: <span className="font-mono text-[#0A0A0A] dark:text-neutral-300">{demoUrl}</span>
          </span>
          <span className="text-[#737373]">
            Pre-seeded with realistic production data • Read-only safety enabled
          </span>
        </div>
      )}
    </div>
  );
}
