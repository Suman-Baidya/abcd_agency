"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { 
  ExternalLink, 
  Copy, 
  Check, 
  Cpu, 
  Database, 
  ShieldCheck, 
  Server, 
  KeyRound, 
  CheckCircle2, 
  Send, 
  Layers
} from "lucide-react";
import type { EcoSystemPlatformData } from "./EcoSystemCard";

interface EcoSystemBlueprintModalProps {
  platform: EcoSystemPlatformData | null;
  isOpen: boolean;
  onClose: () => void;
  portalMode?: boolean;
}

export function EcoSystemBlueprintModal({
  platform,
  isOpen,
  onClose,
  portalMode = false,
}: EcoSystemBlueprintModalProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  if (!platform) return null;

  const copyToClipboard = (text: string, type: "email" | "password") => {
    navigator.clipboard.writeText(text);
    if (type === "email") {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    } else {
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  const licenseHref = portalMode
    ? `/portal/inquiries?type=custom&notes=${encodeURIComponent(`Client request for platform: ${platform.name}`)}`
    : `/contact?inquiry=${encodeURIComponent(`Apps License: ${platform.name}`)}&service=Custom Software`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Interactive Blueprint: ${platform.name}`}
      size="3xl"
    >
      <div className="space-y-6 max-h-[75vh] overflow-y-auto px-1">
        {/* Top Header Summary */}
        <div className="p-4 sm:p-5 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#FAFAFA] dark:bg-[#141414] space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-[11px] font-bold text-[#737373] uppercase tracking-wider">
              {platform.category}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{platform.status}</span>
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">
            {platform.name}
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-[#525252] dark:text-neutral-300">
            {platform.tagline}
          </p>
          <p className="text-xs text-[#737373] dark:text-neutral-400 leading-relaxed pt-1">
            {platform.description}
          </p>
        </div>

        {/* Live Test Sandbox Credentials Strip */}
        {platform.appUrl ? (
          <div className="p-4 sm:p-5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span className="text-xs font-bold font-mono uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                  Live Interactive Sandbox Credentials
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-900/80 text-emerald-900 dark:text-emerald-200">
                Test Mode Active
              </span>
            </div>

            <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
              Explore the live hosted application with pre-configured demo test records. Use the credentials below to log in as a test administrator.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Email Credential */}
              <div className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-[#111111] flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <p className="text-[10px] font-mono text-[#737373] uppercase">Test Login</p>
                  <p className="text-xs font-mono font-semibold text-[#0A0A0A] dark:text-white truncate">
                    {platform.demoEmail || "demo@abcdagency.com"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(platform.demoEmail || "demo@abcdagency.com", "email")}
                  className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[#737373] hover:text-black dark:hover:text-white transition-colors cursor-pointer shrink-0"
                  title="Copy email"
                >
                  {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Password Credential */}
              <div className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-[#111111] flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <p className="text-[10px] font-mono text-[#737373] uppercase">Test Password</p>
                  <p className="text-xs font-mono font-semibold text-[#0A0A0A] dark:text-white truncate">
                    {platform.demoPassword || "demo123"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(platform.demoPassword || "demo123", "password")}
                  className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[#737373] hover:text-black dark:hover:text-white transition-colors cursor-pointer shrink-0"
                  title="Copy password"
                >
                  {copiedPassword ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Launch App Button */}
            <div className="pt-1">
              <a
                href={platform.appUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0A0A0A] hover:bg-neutral-800 text-white dark:bg-white dark:text-[#0A0A0A] dark:hover:bg-neutral-200 text-xs font-bold transition-all shadow-xs cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              >
                <span>Launch Test Sandbox in New Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#FAFAFA] dark:bg-[#141414] text-xs text-[#737373] flex items-center gap-2">
            <Server className="w-4 h-4 text-[#737373] shrink-0" />
            <span>This platform is provisioned on private cloud VPC clusters. Request a private demonstration below.</span>
          </div>
        )}

        {/* Architectural Specs Grid */}
        <div className="space-y-3">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#737373] block">
            System Architecture &amp; Delivery Standard
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0A0A0A] dark:text-white">
                <Database className="w-3.5 h-3.5 text-[#737373]" />
                <span>Data Isolation</span>
              </div>
              <p className="text-[11px] text-[#737373] leading-relaxed">
                Multi-tenant schema routing with tenant-isolated database records.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0A0A0A] dark:text-white">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Security &amp; RBAC</span>
              </div>
              <p className="text-[11px] text-[#737373] leading-relaxed">
                Role-based access control, encrypted sessions, and signed API requests.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#0A0A0A] dark:text-white">
                <Cpu className="w-3.5 h-3.5 text-[#737373]" />
                <span>Production SLA</span>
              </div>
              <p className="text-[11px] text-[#737373] leading-relaxed">
                Edge load-balanced with 99.9% uptime and 30-day launch warranty.
              </p>
            </div>
          </div>
        </div>

        {/* Features Checklist */}
        {platform.features && platform.features.length > 0 && (
          <div className="space-y-2.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#737373] block">
              Full Feature Matrix
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {platform.features.map((f, i) => (
                <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] text-xs text-[#262626] dark:text-neutral-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-snug">{f}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tech Stack */}
        {platform.techStack && platform.techStack.length > 0 && (
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#737373] block">
              Underlying Technology Stack
            </span>
            <div className="flex flex-wrap gap-1.5">
              {platform.techStack.map((tech) => (
                <Badge key={tech} variant="outline" size="sm" className="text-[10px] font-mono font-medium">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Modal Action Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-[#E5E5E5] dark:border-[#262626] gap-3">
          <Button variant="secondary" onClick={onClose} size="sm">
            Close Blueprint
          </Button>

          <Link
            href={licenseHref}
            onClick={onClose}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0A0A0A] hover:bg-neutral-800 text-white dark:bg-white dark:text-[#0A0A0A] dark:hover:bg-neutral-200 text-xs font-bold transition-all shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Inquire &amp; License Platform</span>
          </Link>
        </div>
      </div>
    </Modal>
  );
}
