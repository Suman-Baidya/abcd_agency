"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Activity } from "lucide-react";

export function SystemHealthWidget() {
  const [latency, setLatency] = useState<number | null>(null);
  const [status, setStatus] = useState<"optimal" | "good" | "degraded" | "down">("optimal");
  const [mounted, setMounted] = useState(false);

  const checkHealth = async () => {
    if (typeof document !== "undefined" && document.hidden) return;
    try {
      const res = await fetch("/api/system/health", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setLatency(data.latency?.dbLatencyMs ?? null);
        setStatus(data.status || "optimal");
      } else {
        setStatus("degraded");
      }
    } catch {
      setStatus("down");
    }
  };

  useEffect(() => {
    setMounted(true);
    checkHealth();

    // Relaxed ping interval: 120 seconds, and freezes when tab is hidden
    const interval = setInterval(checkHealth, 120000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] text-xs opacity-50">
        <span className="w-2 h-2 rounded-full bg-neutral-400" />
        <span className="text-[11px] font-mono text-[#737373]">Checking...</span>
      </div>
    );
  }

  const dotColor =
    status === "optimal"
      ? "bg-emerald-500"
      : status === "good"
      ? "bg-amber-500"
      : "bg-rose-500";

  return (
    <Link
      href="/admin/system"
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] hover:bg-[#F5F5F5] dark:hover:bg-[#1C1C1C] transition-colors text-xs group cursor-pointer shadow-2xs"
      title="View live database connection pool, latency & system load"
    >
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${dotColor} opacity-75`} />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColor}`} />
      </span>

      <span className="text-[11px] font-semibold text-[#0A0A0A] dark:text-white group-hover:underline">
        {status === "optimal" ? "All Systems Normal" : status === "good" ? "System Healthy" : "Latency Elevated"}
      </span>

      {latency !== null && (
        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#F5F5F5] dark:bg-[#1E1E1E] text-[#737373] dark:text-neutral-400 border border-[#E5E5E5] dark:border-[#333]">
          {latency}ms
        </span>
      )}

      <Activity className="w-3 h-3 text-[#A3A3A3] dark:text-neutral-500 group-hover:text-[#0A0A0A] dark:group-hover:text-white transition-colors ml-0.5" />
    </Link>
  );
}
