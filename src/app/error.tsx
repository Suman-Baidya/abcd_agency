"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { RotateCcw, Home, AlertCircle, ChevronDown, Terminal } from "lucide-react";

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Log error to client-side telemetry/console
    console.error("Application Runtime Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white px-4 sm:px-6 py-16 selection:bg-[#0A0A0A] selection:text-white dark:selection:bg-white dark:selection:text-[#0A0A0A] transition-colors duration-200">
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 max-w-lg w-full text-center space-y-6">
        {/* Monospace Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-400 font-mono text-[11px] tracking-wider uppercase">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>ERR_RUNTIME_EXCEPTION // 500</span>
        </div>

        {/* Headline */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">
            Something Went Off Track
          </h1>
          <p className="text-xs sm:text-sm text-[#737373] dark:text-[#A3A3A3] max-w-sm mx-auto leading-relaxed">
            An unexpected error occurred while processing this request. Our telemetry has logged the issue for investigation.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
          <Button
            type="button"
            onClick={() => reset()}
            variant="primary"
            size="sm"
            className="!min-h-[38px] px-4 py-2 text-xs font-medium rounded-lg shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5 shrink-0" />
            Try Again
          </Button>
          <Button
            href="/"
            variant="secondary"
            size="sm"
            className="!min-h-[38px] px-4 py-2 text-xs font-medium rounded-lg shrink-0"
          >
            <Home className="w-3.5 h-3.5 mr-1.5 shrink-0" />
            Return to Homepage
          </Button>
        </div>

        {/* Collapsible Error Digest for Admins & Engineers */}
        <div className="pt-4 border-t border-[#E5E5E5] dark:border-[#262626]">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white transition-colors cursor-pointer"
          >
            <span>Technical Information</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showDetails ? "rotate-180" : ""}`} />
          </button>

          {showDetails && (
            <div className="mt-3 p-3.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-[#F9F9F9] dark:bg-[#111111] text-left font-mono text-[11px] text-[#737373] dark:text-neutral-400 space-y-1.5 break-all">
              {error.digest && (
                <p>
                  <span className="font-semibold text-[#0A0A0A] dark:text-white">Digest: </span>
                  {error.digest}
                </p>
              )}
              <p>
                <span className="font-semibold text-[#0A0A0A] dark:text-white">Message: </span>
                {error.message || "An unhandled exception was caught by Next.js error boundary."}
              </p>
            </div>
          )}
        </div>

        {/* System Terminal Ping */}
        <div className="inline-flex items-center gap-1.5 font-mono text-[10px] text-[#737373] dark:text-neutral-500 pt-2">
          <Terminal className="w-3 h-3" />
          <span>STATUS: FAILSAFE ACTIVE // SYSTEM RECOVERY READY</span>
        </div>
      </div>
    </div>
  );
}
