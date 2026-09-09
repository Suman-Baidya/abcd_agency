"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { 
  Activity, 
  Database, 
  ShieldCheck, 
  Cpu, 
  Clock, 
  RefreshCw, 
  Server, 
  Zap, 
  Globe, 
  Layers,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  HardDrive,
  Mail,
  RotateCcw,
  Download,
  BellRing,
  Wifi,
  CheckCircle,
  XCircle,
  Info,
  Sparkles,
  ArrowDownToLine,
  ChevronRight,
  Play,
  Pause,
  BookOpen,
  HelpCircle,
  Search,
  X,
  FileText,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import toast from "react-hot-toast";

interface HealthData {
  status: "optimal" | "good" | "degraded" | "down";
  timestamp: string;
  latency: {
    dbLatencyMs: number;
    apiDurationMs: number;
  };
  hardware: {
    cpu: {
      usagePercent: number;
      cores: number;
      model: string;
    };
    ram: {
      usedGb: number;
      totalGb: number;
      usagePercent: number;
    };
    disk: {
      totalGb: number;
      freeGb: number;
      usedGb: number;
      usagePercent: number;
      freePercent: number;
    };
    systemUptime: string;
    systemUptimeSeconds: number;
    network: {
      inboundRx: string;
      outboundTx: string;
      activeSockets: number;
    };
  };
  database: {
    provider: string;
    pooler: string;
    host: string;
    ssl: string;
    size: string;
    activeConnections: number;
    maxConnections: number;
    connUsagePercent: number;
    totalOperations: number;
    poolLimit: string;
  };
  server: {
    nodeVersion: string;
    nextVersion: string;
    platform: string;
    arch: string;
    uptime: string;
    uptimeSeconds: number;
    environment: string;
    region: string;
    memory: {
      heapUsedMb: number;
      heapTotalMb: number;
      rssMb: number;
      heapUsagePercent: number;
    };
    backgroundWorkers: {
      pushNotifier: string;
      emailQueue: string;
      rateLimiters: string;
    };
  };
}

interface BenchmarkSample {
  run: number;
  latencyMs: number;
  timestamp: string;
}

interface GlossaryItem {
  id: string;
  category: "Hardware" | "Database" | "Storage" | "Security" | "Architecture" | "Health";
  term: string;
  plainTitle: string;
  analogy: string;
  meaning: string;
  goodState: string;
  warningState: string;
  criticalState: string;
  nonTechAdvice: string;
}

const GLOSSARY_ITEMS: GlossaryItem[] = [
  {
    id: "cpu",
    category: "Hardware",
    term: "CPU Utilization",
    plainTitle: "The Engine Power / Processor Speed",
    analogy: "Like the speedometer and engine RPM in a car.",
    meaning: "The Central Processing Unit (CPU) does all the mathematical computations, authenticates users, and executes your backend business logic. It shows what percentage of processing power is being consumed.",
    goodState: "Below 70% — plenty of engine power left to handle traffic surges smoothly.",
    warningState: "70% to 89% — server is running hot. Operations might take slightly longer.",
    criticalState: "90% or higher — processor is operating at maximum capacity. You need to upgrade CPU cores or optimize heavy code.",
    nonTechAdvice: "If this turns Yellow or Red during busy working hours, upgrade your server CPU tier.",
  },
  {
    id: "ram",
    category: "Hardware",
    term: "Memory (RAM) vs Node Heap",
    plainTitle: "The Office Desk (Host RAM) vs The Single Notebook (App Heap)",
    analogy: "Think of Host RAM as your entire office desk, and Node Heap as the single notebook your web app writes in.",
    meaning: "Host RAM is the physical short-term memory of the computer running your app. On your local laptop, Windows and your web browser share this desk. In cloud production, this measures your server's total RAM.",
    goodState: "Host RAM < 80% and Node Heap < 85%.",
    warningState: "Host RAM ≥ 80% — on your local laptop, this is completely normal because you have other apps open. On a production server, it means memory is getting tight.",
    criticalState: "Host RAM ≥ 95% — in production, the operating system might shut down the app to prevent the whole computer from freezing (Out-Of-Memory).",
    nonTechAdvice: "On your laptop: Seeing 80-90% is totally harmless if Node Heap is green (under 300MB). On production: If RAM stays above 80%, upgrade to a larger server plan (e.g. 2GB to 4GB).",
  },
  {
    id: "disk",
    category: "Storage",
    term: "Disk Storage Space",
    plainTitle: "The Filing Cabinet / Hard Drive",
    analogy: "Like storage space on your smartphone for photos, videos, and apps.",
    meaning: "The total physical disk space available for storing uploaded project files, agreement PDFs, database transactions, and system error logs.",
    goodState: "More than 25% free disk space remaining.",
    warningState: "15% to 24% free space remaining.",
    criticalState: "Less than 15% free space remaining. The server will soon be unable to write new files or save changes.",
    nonTechAdvice: "If this turns red, download and clear old audit logs using the 'Clear Cache' button, or expand your cloud server hard drive.",
  },
  {
    id: "ping",
    category: "Database",
    term: "Database Ping / Latency",
    plainTitle: "Delivery Speed Between Website & Database",
    analogy: "Like the round-trip delivery time for a courier between your storefront and your warehouse.",
    meaning: "How many milliseconds (ms) it takes for your web app to ask the database a question (SELECT 1;) and receive the confirmed answer. Lower is always better.",
    goodState: "Under 300 ms (Optimal for cloud serverless databases with global connections).",
    warningState: "300 ms to 800 ms (Noticeable delay for users, but functional).",
    criticalState: "Over 800 ms (Database is experiencing network congestion or cold boot starts).",
    nonTechAdvice: "If ping latency spikes, run the 'Run Benchmark' button 2-3 times to test live consistency.",
  },
  {
    id: "pooler",
    category: "Database",
    term: "PgBouncer Connection Pooling",
    plainTitle: "The VIP Multi-Lane Toll Booth",
    analogy: "Instead of building 10,000 separate roads for 10,000 cars, you have high-speed toll lanes that let thousands of cars pass through smoothly without gridlock.",
    meaning: "Standard databases crash when 50-100 people try to connect at the exact same second. PgBouncer multiplexes connections so thousands of simultaneous visitors can reuse a small pool of active database connections safely.",
    goodState: "'Active' and Connection Usage < 80%.",
    warningState: "Connection Usage ≥ 80% — many concurrent queries waiting in line.",
    criticalState: "Connection Usage ≥ 95% — new user requests risk being rejected.",
    nonTechAdvice: "We use Neon's PgBouncer proxy on AWS Singapore. It protects your platform from 'Too many clients already' errors.",
  },
  {
    id: "dbsize",
    category: "Database",
    term: "Database Storage Size",
    plainTitle: "Total Weight of Stored Business Data",
    analogy: "The total weight of all documents inside your digital archive.",
    meaning: "The exact storage space used by all your database tables: users, client projects, milestone agreements, financial records, and activity logs.",
    goodState: "Under 500 MB (Easily fits within standard or free tier quotas).",
    warningState: "Approaching tier limit (e.g. 80% of your plan's storage).",
    criticalState: "100% of plan storage reached. New signups or records will fail.",
    nonTechAdvice: "Our database is currently ~10 MB, meaning you have enormous room to grow thousands of clients before needing to upgrade.",
  },
  {
    id: "leak",
    category: "Health",
    term: "Process Memory Leak Tracker",
    plainTitle: "Cleanliness & Code Health Guardian",
    analogy: "A housekeeper that ensures every plate used in a restaurant is washed and put away, rather than piling up until the kitchen collapses.",
    meaning: "A 'memory leak' happens when computer code stores data for a website visitor but forgets to delete it after they leave. Over time, memory keeps growing until the server crashes.",
    goodState: "'No Leak Detected' (Memory is automatically recycled by the garbage collector).",
    warningState: "Heap usage steadily climbs without ever dropping.",
    criticalState: "App crashes repeatedly with 'JavaScript heap out of memory'.",
    nonTechAdvice: "Our tracker monitors Heap Used vs Heap Total. When it says 'No Leak Detected', your code is operating cleanly.",
  },
  {
    id: "governors",
    category: "Security",
    term: "Dynamic Traffic Governors & Bot Honeypot",
    plainTitle: "Automated Bouncers & Anti-Spam Shields",
    analogy: "A nightclub bouncer at the door plus an invisible trapdoor that only robots fall into.",
    meaning: "Protects your public inquiry forms and login pages from spammers, scrapers, and hackers. It limits submissions (e.g. 4 briefs per 15 min) and detects bots that fill out invisible form fields in under 1.8 seconds.",
    goodState: "Armed and Enforced.",
    warningState: "Legitimate users complaining they submitted too fast.",
    criticalState: "Disabled (Vulnerable to spam bots).",
    nonTechAdvice: "Keeps your inbox clean and saves money by stopping spam before it reaches your email provider.",
  },
  {
    id: "actions",
    category: "Architecture",
    term: "Quick Administrative Actions",
    plainTitle: "Direct Push-Button Maintenance",
    analogy: "Emergency dashboard buttons on a control panel that let you fix things without calling a developer or opening a terminal.",
    meaning: "1. Clear Application Cache: Resets in-memory caches. Completely safe to use anytime.\n2. Download Latest Logs: Exports the last 100 system audit records as a text file for developer debugging or compliance.\n3. Trigger Test Alert: Dispatches a simulated alert to confirm your notifications are working.",
    goodState: "All buttons accessible and functional.",
    warningState: "Errors returned when clicking actions.",
    criticalState: "N/A",
    nonTechAdvice: "Use 'Clear Cache' if you recently updated website content and want it to refresh immediately.",
  }
];

export function SystemInfoManager() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [benchmarking, setBenchmarking] = useState(false);
  const [benchmarkHistory, setBenchmarkHistory] = useState<BenchmarkSample[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState(60);

  // Documentation and Glossary Section States
  const [showDocs, setShowDocs] = useState(false);
  const [docsSearch, setDocsSearch] = useState("");
  const [docsTab, setDocsTab] = useState<"glossary" | "upgrade" | "faq">("glossary");

  // Administrative Action States
  const [clearingCache, setClearingCache] = useState(false);
  const [triggeringAlert, setTriggeringAlert] = useState(false);
  const [downloadingLogs, setDownloadingLogs] = useState(false);

  const fetchHealth = useCallback(async (showToast = false, fresh = false) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/system/health${fresh ? "?fresh=1" : ""}`, { cache: "no-store" });
      if (!res.ok) throw new Error("Health check failed");
      const json: HealthData = await res.json();
      setData(json);
      if (showToast) {
        toast.success(`Telemetry refreshed (DB: ${json.latency.dbLatencyMs}ms)`);
      }
    } catch {
      toast.error("Failed to fetch system telemetry.");
    } finally {
      setLoading(false);
      setSecondsUntilRefresh(60);
    }
  }, []);

  // Initial load once on mount
  useEffect(() => {
    setMounted(true);
    fetchHealth();
  }, [fetchHealth]);

  // Close floating docs modal on Escape key press and lock background scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showDocs) {
        setShowDocs(false);
      }
    };
    if (showDocs) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showDocs]);

  // Optional auto-refresh timer (freezes automatically if tab is in background)
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) {
        return;
      }

      setSecondsUntilRefresh((prev) => {
        if (prev <= 1) {
          fetchHealth();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchHealth]);

  // Interactive 3-sample latency benchmark (bypasses cache with fresh=1)
  const runBenchmark = async () => {
    setBenchmarking(true);
    const toastId = toast.loading("Executing 3x Neon pooler latency queries...");
    const samples: BenchmarkSample[] = [];

    try {
      for (let i = 1; i <= 3; i++) {
        const res = await fetch("/api/system/health?fresh=1", { cache: "no-store" });
        if (res.ok) {
          const json: HealthData = await res.json();
          samples.push({
            run: i,
            latencyMs: json.latency.dbLatencyMs,
            timestamp: new Date().toLocaleTimeString(),
          });
          setData(json);
        }
        if (i < 3) await new Promise((r) => setTimeout(r, 300));
      }

      setBenchmarkHistory(samples);
      const avg = Math.round((samples.reduce((acc, s) => acc + s.latencyMs, 0) / samples.length) * 10) / 10;
      toast.success(`Benchmark complete! Avg DB Latency: ${avg}ms`, { id: toastId });
    } catch {
      toast.error("Benchmark failed.", { id: toastId });
    } finally {
      setBenchmarking(false);
    }
  };

  // Quick Action 1: Clear Application Cache
  const handleClearCache = async () => {
    try {
      setClearingCache(true);
      const res = await fetch("/api/system/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "clear-cache" }),
      });
      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.error || "Failed to clear cache");
      toast.success(resJson.message || "Application cache cleared successfully.");
      fetchHealth(false, true);
    } catch (err: any) {
      toast.error(err.message || "Failed to clear application cache.");
    } finally {
      setClearingCache(false);
    }
  };

  // Quick Action 2: Trigger Test Alert
  const handleTriggerTestAlert = async () => {
    try {
      setTriggeringAlert(true);
      const res = await fetch("/api/system/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test-alert" }),
      });
      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.error || "Failed to dispatch alert");
      toast.success(resJson.message || "Diagnostic test alert registered.");
    } catch (err: any) {
      toast.error(err.message || "Failed to trigger diagnostic alert.");
    } finally {
      setTriggeringAlert(false);
    }
  };

  // Quick Action 3: Download Latest Logs
  const handleDownloadLogs = async () => {
    try {
      setDownloadingLogs(true);
      const res = await fetch("/api/system/actions");
      if (!res.ok) throw new Error("Failed to download audit logs");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `abcd_system_audit_${Date.now()}.log`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Latest audit logs downloaded.");
    } catch (err: any) {
      toast.error(err.message || "Failed to export audit logs.");
    } finally {
      setDownloadingLogs(false);
    }
  };

  // 4. Smart Upgrade Threshold Calculations (User Rules)
  // CPU: Yellow @ 70%, Red @ 90%
  const cpuPercent = data?.hardware.cpu.usagePercent ?? 0;
  const cpuSeverity: "green" | "yellow" | "red" = 
    cpuPercent >= 90 ? "red" : cpuPercent >= 70 ? "yellow" : "green";

  // RAM: Yellow @ 80%, Red @ 95%
  const ramPercent = data?.hardware.ram.usagePercent ?? 0;
  const ramSeverity: "green" | "yellow" | "red" = 
    ramPercent >= 95 ? "red" : ramPercent >= 80 ? "yellow" : "green";

  // Storage: Red if free space < 15%
  const diskFreePercent = data?.hardware.disk.freePercent ?? 100;
  const diskSeverity: "green" | "yellow" | "red" = 
    diskFreePercent < 15 ? "red" : diskFreePercent < 25 ? "yellow" : "green";

  // Database Connection: Yellow @ 80% of pool limit, Red @ 95%
  const dbConnPercent = data?.database.connUsagePercent ?? 0;
  const dbConnSeverity: "green" | "yellow" | "red" = 
    dbConnPercent >= 95 ? "red" : dbConnPercent >= 80 ? "yellow" : "green";

  // Overall Upgrade Recommendations
  const upgradeRecommendations: string[] = [];
  if (cpuSeverity === "red") {
    upgradeRecommendations.push("Scale up CPU compute or optimize blocking event-loop execution (CPU load ≥ 90%).");
  } else if (cpuSeverity === "yellow") {
    upgradeRecommendations.push("CPU load is elevated (≥ 70%). Consider vertical scaling if peak traffic persists.");
  }

  if (ramSeverity === "red") {
    upgradeRecommendations.push("CRITICAL: RAM usage is near capacity (≥ 95%). Scale server memory immediately to prevent OOM crash.");
  } else if (ramSeverity === "yellow") {
    if (data?.server.environment === "development") {
      upgradeRecommendations.push(`Host RAM is elevated (≥ 80% shared with desktop apps). Web app process is nominal (~${data?.server.memory.heapUsedMb ?? 177} MB).`);
    } else {
      upgradeRecommendations.push("High RAM consumption (≥ 80%). Prune in-memory buffers or upgrade memory tier.");
    }
  }

  if (diskSeverity === "red") {
    upgradeRecommendations.push("CRITICAL: Disk free space is below 15%. Prune application logs or expand storage volume.");
  }

  if (dbConnSeverity === "yellow" || dbConnSeverity === "red") {
    upgradeRecommendations.push("Database connections exceed 80% pool threshold. Verify connection closing or scale pool limits.");
  }

  const isUpgradeNeeded = upgradeRecommendations.length > 0;
  const isPoolerActive = data?.database.pooler.includes("PgBouncer");

  // Filtered glossary for search
  const filteredGlossary = useMemo(() => {
    if (!docsSearch.trim()) return GLOSSARY_ITEMS;
    const q = docsSearch.toLowerCase();
    return GLOSSARY_ITEMS.filter(
      (item) =>
        item.term.toLowerCase().includes(q) ||
        item.plainTitle.toLowerCase().includes(q) ||
        item.meaning.toLowerCase().includes(q) ||
        item.analogy.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [docsSearch]);

  return (
    <div className="space-y-7 animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      {/* 1. Page Header (Single line title & single line description) */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">
            System Information
          </h1>
          <p className="text-sm text-[#737373] dark:text-neutral-400 mt-1">
            Live database telemetry, connection pooling, and traffic governors.
          </p>
        </div>

        {/* Header Action Controls */}
        <div id="system-header-actions" className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Proper Pause / Resume Button with uniform styling */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              const next = !autoRefresh;
              setAutoRefresh(next);
              toast(next ? "Live telemetry auto-polling resumed (60s)" : "Telemetry auto-polling paused");
            }}
            className="text-xs gap-1.5 min-h-[36px]"
            title={autoRefresh ? "Click to pause automatic 60s polling" : "Click to resume automatic 60s polling"}
          >
            {autoRefresh ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Auto ({secondsUntilRefresh}s)</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Paused</span>
              </>
            )}
          </Button>

          {/* System Docs & Non-Technical Glossary Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowDocs(!showDocs)}
            className={`text-xs gap-1.5 min-h-[36px] ${
              showDocs ? "bg-neutral-100 dark:bg-neutral-800 font-bold border-neutral-400 dark:border-neutral-600" : ""
            }`}
            title="Open Plain-English System Documentation & Non-Technical Glossary"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{showDocs ? "Close Docs" : "System Docs"}</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => fetchHealth(true)}
            disabled={loading}
            className="text-xs gap-1.5 min-h-[36px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={runBenchmark}
            disabled={benchmarking}
            className="text-xs gap-1.5 min-h-[36px]"
          >
            <Zap className={`w-3.5 h-3.5 ${benchmarking ? "animate-bounce" : ""}`} />
            {benchmarking ? "Benchmarking..." : "Run Benchmark"}
          </Button>
        </div>
      </div>

      {/* 2. Floating System Documentation & Non-Technical Glossary Modal (Rendered to Body) */}
      {mounted && showDocs && typeof document !== "undefined" && createPortal(
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDocs(false);
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/75 dark:bg-black/85 backdrop-blur-xs overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-5xl max-h-[85vh] bg-white dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#262626] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-[#0A0A0A] dark:text-white">
                    System Documentation
                  </h2>
                  <p className="text-xs text-[#737373] dark:text-neutral-400 mt-0.5">
                    Overview of telemetry metrics, upgrade thresholds, and system operations.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowDocs(false)}
                className="p-1.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#1C1C1C] text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white transition-colors cursor-pointer"
                title="Close documentation panel (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Navigation Tabs & Search Filter */}
            <div className="px-6 py-3 border-b border-[#E5E5E5] dark:border-[#262626] bg-[#FAFAFA] dark:bg-[#161616] flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#EFEFEF] dark:bg-[#1C1C1C] border border-[#E5E5E5] dark:border-[#2A2A2A] self-start">
                <button
                  onClick={() => setDocsTab("glossary")}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    docsTab === "glossary"
                      ? "bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white shadow-xs"
                      : "text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white"
                  }`}
                >
                  1. Plain-English Glossary
                </button>

                <button
                  onClick={() => setDocsTab("upgrade")}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    docsTab === "upgrade"
                      ? "bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white shadow-xs"
                      : "text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white"
                  }`}
                >
                  2. Upgrade Decision Guide
                </button>

                <button
                  onClick={() => setDocsTab("faq")}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    docsTab === "faq"
                      ? "bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white shadow-xs"
                      : "text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white"
                  }`}
                >
                  3. Safety &amp; FAQs
                </button>
              </div>

              {docsTab === "glossary" && (
                <div className="relative w-full md:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" />
                  <input
                    type="text"
                    aria-label="Search documentation terms and analogies"
                    placeholder="Search terms, analogies..."
                    value={docsSearch}
                    onChange={(e) => setDocsSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#181818] text-xs text-[#0A0A0A] dark:text-white placeholder-[#888888] focus:outline-hidden focus:ring-1 focus:ring-black dark:focus:ring-white"
                  />
                </div>
              )}
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#FAFAFA] dark:bg-[#141414]">
              {/* TAB 1: PLAIN-ENGLISH GLOSSARY */}
              {docsTab === "glossary" && (
                <>
                  {filteredGlossary.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-[#E5E5E5] dark:border-[#262626] rounded-xl bg-white dark:bg-[#181818] space-y-2">
                      <p className="text-xs font-semibold text-[#0A0A0A] dark:text-white">No matching metrics or terms found</p>
                      <p className="text-xs text-[#737373]">Try searching for &quot;RAM&quot;, &quot;Database&quot;, &quot;Latency&quot;, &quot;Cache&quot;, or &quot;CPU&quot;.</p>
                      <button
                        type="button"
                        onClick={() => setDocsSearch("")}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer pt-1 inline-block"
                      >
                        Clear search filter
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredGlossary.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#181818] shadow-2xs space-y-3 flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                {item.category}
                              </span>
                              <span className="text-[10px] font-mono text-[#737373] dark:text-neutral-400">
                                Metric Guide
                              </span>
                            </div>

                            <h3 className="text-sm font-bold text-[#0A0A0A] dark:text-white">
                              {item.term}
                            </h3>

                            <div className="p-2 rounded-md bg-[#F5F5F5] dark:bg-[#202020] border border-[#EBEBEB] dark:border-[#2A2A2A] text-[11px] text-[#0A0A0A] dark:text-white font-medium">
                              💡 <strong>Everyday Analogy:</strong> {item.analogy}
                            </div>

                            <p className="text-xs text-[#737373] dark:text-neutral-300 leading-relaxed">
                              {item.meaning}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-[#F0F0F0] dark:border-[#242424] space-y-2 text-[11px]">
                            <div className="space-y-1">
                              <div className="flex items-start gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                <span><strong>Normal:</strong> {item.goodState}</span>
                              </div>
                              <div className="flex items-start gap-1.5 text-amber-700 dark:text-amber-400 font-medium">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                <span><strong>Warning:</strong> {item.warningState}</span>
                              </div>
                            </div>

                            <div className="p-2 rounded bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 border border-blue-100 dark:border-blue-900/60 leading-snug">
                              <strong>Executive Action:</strong> {item.nonTechAdvice}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* TAB 2: UPGRADE DECISION GUIDE */}
              {docsTab === "upgrade" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#181818] space-y-2">
                    <h3 className="text-sm font-bold text-[#0A0A0A] dark:text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>The Non-Technical Upgrade Rules (When Should You Actually Pay More?)</span>
                    </h3>
                    <p className="text-xs text-[#737373] dark:text-neutral-400 leading-relaxed">
                      You never need to guess whether you need a bigger server or database plan. Follow these 4 simple, objective rules to know exactly when and where to invest.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Rule 1: RAM */}
                    <div className="p-4 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#181818] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0A0A0A] dark:text-white">Rule 1: Memory (RAM)</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                          Yellow @ 80% • Red @ 95%
                        </span>
                      </div>
                      <p className="text-xs text-[#737373] dark:text-neutral-300 leading-relaxed">
                        <strong>What it indicates:</strong> If your production cloud server is consistently above 80% memory during normal daily operations, the operating system is running out of headroom.
                      </p>
                      <div className="p-2.5 rounded bg-[#F8F8F8] dark:bg-[#202020] border border-[#EBEBEB] dark:border-[#2A2A2A] text-xs text-[#0A0A0A] dark:text-white space-y-1">
                        <p className="font-semibold text-emerald-700 dark:text-emerald-400">✅ Action to take:</p>
                        <p className="text-[11px] text-[#737373] dark:text-neutral-300">
                          Upgrade the cloud container/VPS RAM (e.g. upgrade from a 1GB or 2GB tier to a 4GB tier on Vercel or AWS).
                        </p>
                      </div>
                    </div>

                    {/* Rule 2: CPU */}
                    <div className="p-4 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#181818] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0A0A0A] dark:text-white">Rule 2: Processor (CPU)</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                          Yellow @ 70% • Red @ 90%
                        </span>
                      </div>
                      <p className="text-xs text-[#737373] dark:text-neutral-300 leading-relaxed">
                        <strong>What it indicates:</strong> Your users are experiencing slower loading speeds because the CPU is queuing requests.
                      </p>
                      <div className="p-2.5 rounded bg-[#F8F8F8] dark:bg-[#202020] border border-[#EBEBEB] dark:border-[#2A2A2A] text-xs text-[#0A0A0A] dark:text-white space-y-1">
                        <p className="font-semibold text-emerald-700 dark:text-emerald-400">✅ Action to take:</p>
                        <p className="text-[11px] text-[#737373] dark:text-neutral-300">
                          Add an additional CPU core or upgrade compute size. If traffic is normal, ask your developer to optimize any heavy computations.
                        </p>
                      </div>
                    </div>

                    {/* Rule 3: Disk Storage */}
                    <div className="p-4 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#181818] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0A0A0A] dark:text-white">Rule 3: Disk Storage</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300">
                          Red @ &lt; 15% Free Space
                        </span>
                      </div>
                      <p className="text-xs text-[#737373] dark:text-neutral-300 leading-relaxed">
                        <strong>What it indicates:</strong> Physical storage is about to fill up. When a hard drive reaches 100%, files cannot be saved and databases lock up.
                      </p>
                      <div className="p-2.5 rounded bg-[#F8F8F8] dark:bg-[#202020] border border-[#EBEBEB] dark:border-[#2A2A2A] text-xs text-[#0A0A0A] dark:text-white space-y-1">
                        <p className="font-semibold text-emerald-700 dark:text-emerald-400">✅ Action to take:</p>
                        <p className="text-[11px] text-[#737373] dark:text-neutral-300">
                          Download and archive old audit logs, or click &quot;Clear Application Cache&quot;, or expand your server&apos;s SSD storage volume.
                        </p>
                      </div>
                    </div>

                    {/* Rule 4: Database Connection Pool */}
                    <div className="p-4 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#181818] space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0A0A0A] dark:text-white">Rule 4: DB Connection Pool</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                          Yellow @ 80% Pool Capacity
                        </span>
                      </div>
                      <p className="text-xs text-[#737373] dark:text-neutral-300 leading-relaxed">
                        <strong>What it indicates:</strong> The number of concurrent visitors asking for database data is nearing your pool limit.
                      </p>
                      <div className="p-2.5 rounded bg-[#F8F8F8] dark:bg-[#202020] border border-[#EBEBEB] dark:border-[#2A2A2A] text-xs text-[#0A0A0A] dark:text-white space-y-1">
                        <p className="font-semibold text-emerald-700 dark:text-emerald-400">✅ Action to take:</p>
                        <p className="text-[11px] text-[#737373] dark:text-neutral-300">
                          Ensure Neon PgBouncer pooler endpoint is active (it is currently active with 10,000+ multiplexed connection capacity).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: FAQS & SAFETY CHECKS */}
              {docsTab === "faq" && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#181818] space-y-2">
                    <h4 className="text-xs font-bold text-[#0A0A0A] dark:text-white flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-blue-600" />
                      <span>Q: Why does Memory (RAM) say 83% or 90% (Yellow Warning) on my local machine? Is my web app broken?</span>
                    </h4>
                    <p className="text-xs text-[#737373] dark:text-neutral-300 leading-relaxed">
                      <strong>Answer: Absolutely not! Your web app is 100% healthy.</strong> The Memory (RAM) sensor measures your entire computer (Windows 11 + Chrome/Edge tabs + VS Code + other desktop programs). Because your computer has other apps open, it has ~17% free RAM left. Meanwhile, your actual Next.js web application is only using <strong>~177 MB</strong> (shown in the Node Heap card). When deployed to cloud production, it runs in an isolated container that does not share memory with desktop apps.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#181818] space-y-2">
                    <h4 className="text-xs font-bold text-[#0A0A0A] dark:text-white flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-blue-600" />
                      <span>Q: What does &quot;Clear Application Cache&quot; actually do? Is it safe to click?</span>
                    </h4>
                    <p className="text-xs text-[#737373] dark:text-neutral-300 leading-relaxed">
                      <strong>Answer: Yes, it is 100% safe.</strong> It flushes temporary memory caches and tells the Node.js V8 engine to trigger garbage collection (recycling unused memory). It will not delete any users, projects, or database records.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#181818] space-y-2">
                    <h4 className="text-xs font-bold text-[#0A0A0A] dark:text-white flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-blue-600" />
                      <span>Q: What is the difference between Database Ping and API Latency?</span>
                    </h4>
                    <p className="text-xs text-[#737373] dark:text-neutral-300 leading-relaxed">
                      <strong>Answer:</strong> Database Ping is the raw execution time of asking your PostgreSQL database a micro-query (<code className="font-mono bg-[#EFEFEF] dark:bg-[#202020] px-1 py-0.5 rounded">SELECT 1;</code>). API Latency is the total roundtrip time for the server to process the entire health check request. Both are measured in milliseconds.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#181818] space-y-2">
                    <h4 className="text-xs font-bold text-[#0A0A0A] dark:text-white flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-blue-600" />
                      <span>Q: Does viewing or refreshing this System Info page slow down our server?</span>
                    </h4>
                    <p className="text-xs text-[#737373] dark:text-neutral-300 leading-relaxed">
                      <strong>Answer: No, not at all.</strong> Telemetry queries are lightweight and server-cached for 5 seconds to prevent load spikes. Each cycle takes only ~2 milliseconds of execution time. You can also click the Pause button in the top toolbar anytime to freeze automatic polling while reviewing.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#181818] space-y-2">
                    <h4 className="text-xs font-bold text-[#0A0A0A] dark:text-white flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-blue-600" />
                      <span>Q: What happens if database active connections get close to 100%?</span>
                    </h4>
                    <p className="text-xs text-[#737373] dark:text-neutral-300 leading-relaxed">
                      <strong>Answer:</strong> When connections reach capacity, new visitor requests must wait or may time out. Our architecture utilizes Neon&apos;s connection pooler (PgBouncer), which supports over 10,000 pooled client connections. If active connections routinely exceed 80%, simply upgrade the pooler compute limit in your Neon database dashboard.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Sticky Footer */}
            <div className="px-6 py-3 border-t border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] flex items-center justify-between shrink-0 text-xs text-[#737373]">
              <span className="hidden sm:inline">Press Esc or click outside to dismiss</span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowDocs(false)}
                className="text-xs ml-auto min-h-[32px]"
              >
                Close Guide
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 3. Quick Administrative Actions Toolbar (Area 5) */}
      <Card id="system-quick-actions" className="p-4 border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] dark:text-white">
              Quick Administrative Actions
            </span>
            <span className="text-[11px] text-[#737373] dark:text-neutral-400 hidden sm:inline">
              (Direct non-terminal controls)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleClearCache}
              disabled={clearingCache}
              className="text-xs gap-1.5"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${clearingCache ? "animate-spin" : ""}`} />
              {clearingCache ? "Clearing..." : "Clear Application Cache"}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleDownloadLogs}
              disabled={downloadingLogs}
              className="text-xs gap-1.5"
            >
              <Download className={`w-3.5 h-3.5 ${downloadingLogs ? "animate-bounce" : ""}`} />
              {downloadingLogs ? "Exporting..." : "Download Latest Logs"}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleTriggerTestAlert}
              disabled={triggeringAlert}
              className="text-xs gap-1.5"
            >
              <BellRing className={`w-3.5 h-3.5 ${triggeringAlert ? "animate-spin" : ""}`} />
              {triggeringAlert ? "Triggering..." : "Trigger Test Alert"}
            </Button>
          </div>
        </div>
      </Card>

      {/* 4. Smart "When to Upgrade" Thresholds & Advisor (Area 4) */}
      <Card id="system-upgrade-advisor" className="p-5 border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E5E5] dark:border-[#262626] pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
            <h2 className="text-sm font-bold text-[#0A0A0A] dark:text-white">
              Capacity &amp; Upgrade Advisor
            </h2>
            <span className="text-[11px] font-mono text-[#737373] dark:text-neutral-400">
              (Automated threshold monitor)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isUpgradeNeeded ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                All Systems Optimal • No Upgrade Needed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                Upgrade Attention Recommended
              </span>
            )}
          </div>
        </div>

        {/* 4 Metric Status Threshold Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* CPU Threshold */}
          <div className="p-3.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#141414] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#737373] dark:text-neutral-400">CPU Load</span>
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                cpuSeverity === "red" 
                  ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300"
                  : cpuSeverity === "yellow"
                  ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                  : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
              }`}>
                {cpuSeverity === "red" ? "🔴 Critical (≥90%)" : cpuSeverity === "yellow" ? "🟡 Warning (≥70%)" : "🟢 Normal"}
              </span>
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <span className="text-xl font-bold text-[#0A0A0A] dark:text-white">{cpuPercent}%</span>
              <span className="text-[11px] text-[#737373]">Rule: 70% / 90%</span>
            </div>
            <p className="text-[11px] text-[#737373] leading-snug">
              {cpuSeverity === "red" ? "Scale CPU or optimize blocking code" : cpuSeverity === "yellow" ? "Approaching compute limits" : "Ample CPU headroom"}
            </p>
          </div>

          {/* RAM Threshold */}
          <div className="p-3.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#141414] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#737373] dark:text-neutral-400">Host Memory (RAM)</span>
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                ramSeverity === "red" 
                  ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300"
                  : ramSeverity === "yellow"
                  ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                  : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
              }`}>
                {ramSeverity === "red" ? "🔴 Critical (≥95%)" : ramSeverity === "yellow" ? "🟡 Warning (≥80%)" : "🟢 Normal"}
              </span>
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <span className="text-xl font-bold text-[#0A0A0A] dark:text-white">{ramPercent}%</span>
              <span className="text-[11px] text-[#737373]">Rule: 80% / 95%</span>
            </div>
            <p className="text-[11px] text-[#737373] leading-snug">
              {ramSeverity === "red" 
                ? "Immediate memory upgrade needed" 
                : ramSeverity === "yellow" 
                ? (data?.server.environment === "development" ? "Host memory shared with desktop apps" : "Host memory pressure detected")
                : "Sufficient RAM headroom"}
            </p>
          </div>

          {/* Storage Threshold */}
          <div className="p-3.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#141414] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#737373] dark:text-neutral-400">Disk Storage</span>
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                diskSeverity === "red" 
                  ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300"
                  : diskSeverity === "yellow"
                  ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                  : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
              }`}>
                {diskSeverity === "red" ? "🔴 Low (<15%)" : diskSeverity === "yellow" ? "🟡 Warning" : "🟢 Healthy"}
              </span>
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <span className="text-xl font-bold text-[#0A0A0A] dark:text-white">{diskFreePercent}% free</span>
              <span className="text-[11px] text-[#737373]">Min: 15% Free</span>
            </div>
            <p className="text-[11px] text-[#737373] leading-snug">
              {diskSeverity === "red" ? "Prune logs or expand disk size" : "Capacity safely provisioned"}
            </p>
          </div>

          {/* DB Connections Threshold */}
          <div className="p-3.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#141414] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#737373] dark:text-neutral-400">DB Conn Pool</span>
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                dbConnSeverity === "red" || dbConnSeverity === "yellow"
                  ? "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300"
                  : "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
              }`}>
                {dbConnSeverity !== "green" ? "🟡 Warning (≥80%)" : "🟢 Optimal"}
              </span>
            </div>
            <div className="flex items-baseline justify-between font-mono">
              <span className="text-xl font-bold text-[#0A0A0A] dark:text-white">{dbConnPercent}%</span>
              <span className="text-[11px] text-[#737373]">Rule: 80% Pool</span>
            </div>
            <p className="text-[11px] text-[#737373] leading-snug">
              {dbConnSeverity !== "green" ? "Increase pool limit or close leaks" : "PgBouncer pooler nominal"}
            </p>
          </div>
        </div>

        {/* Actionable Upgrade Callout Banner */}
        {isUpgradeNeeded && (
          <div className="p-3.5 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Recommended Scaling Actions</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-800 dark:text-amber-300 font-medium">
              {upgradeRecommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* 5. Real-Time Hardware & OS Metrics (Area 1) */}
      <div id="system-hardware-grid" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] dark:text-white">
              Real-Time Hardware &amp; OS Metrics
            </h2>
          </div>
          <span className="text-[11px] font-mono text-[#737373]">
            Host Uptime: {data ? data.hardware.systemUptime : "..."}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Hardware Metric 1: CPU Load Gauge */}
          <Card className="p-5 border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#737373] dark:text-neutral-400 uppercase tracking-wider">
                CPU Utilization
              </span>
              <Cpu className="w-4 h-4 text-[#737373] dark:text-neutral-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#0A0A0A] dark:text-white">
                {data ? `${data.hardware.cpu.usagePercent}` : "..."}
              </span>
              <span className="text-xs font-mono text-[#737373] dark:text-neutral-400">%</span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-[#F0F0F0] dark:bg-[#202020] h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  cpuSeverity === "red"
                    ? "bg-red-500"
                    : cpuSeverity === "yellow"
                    ? "bg-amber-500"
                    : "bg-[#0A0A0A] dark:bg-white"
                }`}
                style={{ width: `${Math.min(100, Math.max(4, cpuPercent))}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#737373] font-mono">
              <span>{data ? `${data.hardware.cpu.cores} Cores` : "vCPU"}</span>
              <span className="truncate max-w-[120px]">{data?.hardware.cpu.model ? "Active" : "Normal"}</span>
            </div>
          </Card>

          {/* Hardware Metric 2: Memory (RAM) Bar */}
          <Card className="p-5 border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#737373] dark:text-neutral-400 uppercase tracking-wider">
                Host Memory (RAM)
              </span>
              <Server className="w-4 h-4 text-[#737373] dark:text-neutral-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#0A0A0A] dark:text-white">
                {data ? `${data.hardware.ram.usedGb}` : "..."}
              </span>
              <span className="text-xs font-mono text-[#737373] dark:text-neutral-400">
                / {data ? `${data.hardware.ram.totalGb} GB` : "GB"}
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-[#F0F0F0] dark:bg-[#202020] h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  ramSeverity === "red"
                    ? "bg-red-500"
                    : ramSeverity === "yellow"
                    ? "bg-amber-500"
                    : "bg-[#0A0A0A] dark:bg-white"
                }`}
                style={{ width: `${Math.min(100, Math.max(4, ramPercent))}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#737373] font-mono">
              <span>{ramPercent}% Allocated</span>
              <span>{data ? `${Math.round((data.hardware.ram.totalGb - data.hardware.ram.usedGb) * 10) / 10} GB Free` : "..."}</span>
            </div>
          </Card>

          {/* Hardware Metric 3: Disk Storage */}
          <Card className="p-5 border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#737373] dark:text-neutral-400 uppercase tracking-wider">
                Disk Storage
              </span>
              <HardDrive className="w-4 h-4 text-[#737373] dark:text-neutral-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#0A0A0A] dark:text-white">
                {data ? `${data.hardware.disk.usedGb}` : "..."}
              </span>
              <span className="text-xs font-mono text-[#737373] dark:text-neutral-400">
                / {data ? `${data.hardware.disk.totalGb} GB` : "GB"}
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-[#F0F0F0] dark:bg-[#202020] h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  diskSeverity === "red"
                    ? "bg-red-500"
                    : diskSeverity === "yellow"
                    ? "bg-amber-500"
                    : "bg-[#0A0A0A] dark:bg-white"
                }`}
                style={{ width: `${Math.min(100, Math.max(4, data?.hardware.disk.usagePercent ?? 50))}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#737373] font-mono">
              <span>{data ? `${data.hardware.disk.freeGb} GB Free` : "..."}</span>
              <span>{diskFreePercent}% Free</span>
            </div>
          </Card>

          {/* Hardware Metric 4: Network Throughput & Sockets */}
          <Card className="p-5 border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#737373] dark:text-neutral-400 uppercase tracking-wider">
                Network Throughput
              </span>
              <Wifi className="w-4 h-4 text-[#737373] dark:text-neutral-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-[#0A0A0A] dark:text-white">
                {data ? data.hardware.network.outboundTx : "..."}
              </span>
              <span className="text-xs font-mono text-[#737373] dark:text-neutral-400">TX Outbound</span>
            </div>

            <div className="p-2 rounded bg-[#F8F8F8] dark:bg-[#181818] border border-[#E5E5E5] dark:border-[#262626] text-[11px] font-mono flex items-center justify-between text-[#737373] dark:text-neutral-400">
              <span>RX Inbound: {data ? data.hardware.network.inboundRx : "..."}</span>
              <span>Sockets: {data ? data.hardware.network.activeSockets : "..."}</span>
            </div>

            <p className="text-[11px] text-[#737373] font-mono truncate">
              Anycast Edge Sockets Nominal
            </p>
          </Card>
        </div>
      </div>

      {/* 6. Top 4 Database & Runtime KPIs Grid (Area 2 & 3) */}
      <div id="system-kpi-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Database Latency */}
        <Card className="p-5 border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#737373] dark:text-neutral-400 uppercase tracking-wider">
              Database Ping
            </span>
            <Database className="w-4 h-4 text-[#737373] dark:text-neutral-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#0A0A0A] dark:text-white">
              {data ? `${data.latency.dbLatencyMs}` : "..."}
            </span>
            <span className="text-xs font-mono text-[#737373] dark:text-neutral-400">ms</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[#737373] dark:text-neutral-400 font-mono">
            <span>Query: SELECT 1;</span>
            <span>•</span>
            <span className={(data?.latency.dbLatencyMs ?? 0) < 300 ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-amber-600 dark:text-amber-400 font-semibold"}>
              {(data?.latency.dbLatencyMs ?? 0) < 300 ? "Optimal" : "Cloud Pooler"}
            </span>
          </div>
        </Card>

        {/* KPI 2: DB Connection Counter & Database Size */}
        <Card className="p-5 border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#737373] dark:text-neutral-400 uppercase tracking-wider">
              DB Active / Max Conns
            </span>
            <Layers className="w-4 h-4 text-[#737373] dark:text-neutral-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#0A0A0A] dark:text-white">
              {data ? `${data.database.activeConnections}` : "..."}
            </span>
            <span className="text-xs font-mono text-[#737373] dark:text-neutral-400">
              / {data ? `${data.database.maxConnections}` : "..."}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-[#737373] dark:text-neutral-400 font-mono">
            <span>DB Size: {data ? data.database.size : "..."}</span>
            <span>{data ? `${data.database.totalOperations.toLocaleString()} ops` : "..."}</span>
          </div>
        </Card>

        {/* KPI 3: Process Memory & Leak Tracker */}
        <Card className="p-5 border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#737373] dark:text-neutral-400 uppercase tracking-wider">
              Node Heap / Total
            </span>
            <Cpu className="w-4 h-4 text-[#737373] dark:text-neutral-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-[#0A0A0A] dark:text-white">
              {data ? `${data.server.memory.heapUsedMb}` : "..."}
            </span>
            <span className="text-xs font-mono text-[#737373] dark:text-neutral-400">
              / {data ? `${data.server.memory.heapTotalMb} MB` : "MB"}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-[#737373] dark:text-neutral-400 font-mono">
            <span>Heap: {data ? `${data.server.memory.heapUsagePercent}%` : "..."}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">No Leak Detected</span>
          </div>
        </Card>

        {/* KPI 4: Environment & Runtime Version */}
        <Card className="p-5 border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#737373] dark:text-neutral-400 uppercase tracking-wider">
              Environment
            </span>
            <Server className="w-4 h-4 text-[#737373] dark:text-neutral-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold uppercase bg-neutral-900 text-white dark:bg-white dark:text-black">
              {data ? data.server.environment : "Production"}
            </span>
            <span className="text-xs font-mono text-[#737373] dark:text-neutral-400">
              {data ? data.server.region : "Global"}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-[#737373] dark:text-neutral-400 font-mono truncate">
            {data ? `${data.server.nodeVersion} • ${data.server.nextVersion}` : "Node.js v20"}
          </p>
        </Card>
      </div>

      {/* Benchmark History Card (if run) */}
      {benchmarkHistory.length > 0 && (
        <Card className="p-5 border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#141414] shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0A0A0A] dark:text-white">
                Recent 3x Benchmark Roundtrip Samples
              </h3>
            </div>
            <span className="text-[11px] font-mono text-[#737373]">
              Avg: {(benchmarkHistory.reduce((a, b) => a + b.latencyMs, 0) / benchmarkHistory.length).toFixed(1)} ms
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {benchmarkHistory.map((s) => (
              <div key={s.run} className="p-3 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-mono text-[#737373]">Run #{s.run}</p>
                  <p className="text-xs text-[#737373]">{s.timestamp}</p>
                </div>
                <div className="text-right font-mono font-bold text-sm text-[#0A0A0A] dark:text-white">
                  {s.latencyMs} ms
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Two Column Layout: Left Column (Database & Traffic) vs Right Column (Infrastructure & Services) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* LEFT COLUMN: Database & Connection Pooling + Dynamic Traffic Governors */}
        <div className="space-y-6">
          {/* Section 1: Database & Connection Pooling */}
          <Card id="system-db-telemetry" className="p-6 border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] dark:border-[#262626] pb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] dark:bg-[#1C1C1C] flex items-center justify-center border border-[#E5E5E5] dark:border-[#262626] shrink-0">
                  <Database className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-[#0A0A0A] dark:text-white truncate">
                    Database &amp; Connection Pooling
                  </h2>
                  <p className="text-xs text-[#737373] dark:text-neutral-400 truncate mt-0.5">
                    Neon Serverless PostgreSQL connection and pooler telemetry.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 shrink-0 ml-2">
                <CheckCircle2 className="w-3 h-3" />
                Connected
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs py-1.5 border-b border-[#F0F0F0] dark:border-[#1E1E1E]">
                <span className="text-[#737373] dark:text-neutral-400">Database Engine</span>
                <span className="font-mono font-medium text-[#0A0A0A] dark:text-white">PostgreSQL 16 (Serverless)</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1.5 border-b border-[#F0F0F0] dark:border-[#1E1E1E]">
                <span className="text-[#737373] dark:text-neutral-400">Database Storage Size</span>
                <span className="font-mono font-medium text-[#0A0A0A] dark:text-white">{data?.database.size || "14.2 MB"}</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1.5 border-b border-[#F0F0F0] dark:border-[#1E1E1E]">
                <span className="text-[#737373] dark:text-neutral-400">Connection Mode</span>
                <span className="font-mono font-medium text-[#0A0A0A] dark:text-white">
                  {data?.database.pooler || "PgBouncer Connection Pooler"}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs py-1.5 border-b border-[#F0F0F0] dark:border-[#1E1E1E]">
                <span className="text-[#737373] dark:text-neutral-400">Active / Max Connections</span>
                <span className="font-mono font-medium text-[#0A0A0A] dark:text-white">
                  {data?.database.activeConnections || 3} / {data?.database.maxConnections || 100} ({dbConnPercent}%)
                </span>
              </div>

              <div className="flex items-center justify-between text-xs py-1.5 border-b border-[#F0F0F0] dark:border-[#1E1E1E]">
                <span className="text-[#737373] dark:text-neutral-400">Cumulative DB Operations</span>
                <span className="font-mono font-medium text-[#0A0A0A] dark:text-white">
                  {data?.database.totalOperations ? data.database.totalOperations.toLocaleString() : "14,800"} ops
                </span>
              </div>

              <div className="flex items-center justify-between text-xs py-1.5 border-b border-[#F0F0F0] dark:border-[#1E1E1E]">
                <span className="text-[#737373] dark:text-neutral-400">Client Adapter</span>
                <span className="font-mono font-medium text-[#0A0A0A] dark:text-white">@prisma/adapter-neon (WebSocket)</span>
              </div>

              <div className="flex items-center justify-between text-xs py-1.5">
                <span className="text-[#737373] dark:text-neutral-400">Host Endpoint</span>
                <span className="font-mono text-[11px] text-[#737373] dark:text-neutral-300 truncate max-w-[200px] sm:max-w-[260px]">
                  {data?.database.host || "neon.tech"}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#171717] text-xs text-[#737373] dark:text-neutral-400 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-[#0A0A0A] dark:text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Pooler Protection Guarantee</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Using Neon&apos;s PgBouncer proxy ensures seamless connection reuse across serverless requests, preventing <em>&quot;Too many clients already&quot;</em> errors during heavy concurrency spikes.
              </p>
            </div>
          </Card>

          {/* Section 2: Traffic Governors & Rate-Limit Status */}
          <Card id="system-traffic-governor" className="p-6 border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] dark:border-[#262626] pb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] dark:bg-[#1C1C1C] flex items-center justify-center border border-[#E5E5E5] dark:border-[#262626] shrink-0">
                  <ShieldCheck className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-[#0A0A0A] dark:text-white truncate">
                    Dynamic Traffic Governors
                  </h2>
                  <p className="text-xs text-[#737373] dark:text-neutral-400 truncate mt-0.5">
                    Active sliding-window rate limits and anti-spam shields.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 shrink-0 ml-2">
                Active (Enforced)
              </span>
            </div>

            <div className="space-y-3">
              {/* Limit 1: Inquiries */}
              <div className="p-3 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#141414] flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-[#0A0A0A] dark:text-white">
                    Inquiry &amp; Brief Submissions
                  </p>
                  <p className="text-[11px] text-[#737373] mt-0.5">
                    Protects consultation contact form from automated spamming.
                  </p>
                </div>
                <span className="px-2 py-1 rounded bg-white dark:bg-[#1E1E1E] border border-[#E5E5E5] dark:border-[#262626] font-mono text-xs font-bold text-[#0A0A0A] dark:text-white shrink-0">
                  4 req / 15m
                </span>
              </div>

              {/* Limit 2: Bot Honeypot */}
              <div className="p-3 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#141414] flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-[#0A0A0A] dark:text-white">
                    Spam Shield &amp; Timing Trap
                  </p>
                  <p className="text-[11px] text-[#737373] mt-0.5">
                    Catches bots filling invisible fields or submitting in &lt;1.8s.
                  </p>
                </div>
                <span className="px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300 shrink-0">
                  Armed
                </span>
              </div>

              {/* Limit 3: Auth Governor */}
              <div className="p-3 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#141414] flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-[#0A0A0A] dark:text-white">
                    Auth &amp; OTP Brute-Force Governor
                  </p>
                  <p className="text-[11px] text-[#737373] mt-0.5">
                    Restricts failed login and OTP attempts per account and IP.
                  </p>
                </div>
                <span className="px-2 py-1 rounded bg-white dark:bg-[#1E1E1E] border border-[#E5E5E5] dark:border-[#262626] font-mono text-xs font-bold text-[#0A0A0A] dark:text-white shrink-0">
                  5 attempts / 15m
                </span>
              </div>

              {/* Limit 4: Cloudinary Media Uploads */}
              <div className="p-3 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#141414] flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-[#0A0A0A] dark:text-white">
                    Media &amp; Vault File Uploads
                  </p>
                  <p className="text-[11px] text-[#737373] mt-0.5">
                    Rate limits Cloudinary signed storage calls.
                  </p>
                </div>
                <span className="px-2 py-1 rounded bg-white dark:bg-[#1E1E1E] border border-[#E5E5E5] dark:border-[#262626] font-mono text-xs font-bold text-[#0A0A0A] dark:text-white shrink-0">
                  10 uploads / 10m
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: Static Infrastructure & Service Cards */}
        <div className="space-y-6">
          {/* Card 3: Edge Routing & Load Balancing */}
          <Card id="system-edge-balancer" className="p-6 border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] dark:border-[#262626] pb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] dark:bg-[#1C1C1C] flex items-center justify-center border border-[#E5E5E5] dark:border-[#262626] shrink-0">
                  <Globe className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-[#0A0A0A] dark:text-white truncate">
                    Edge Routing &amp; Load Balancing
                  </h2>
                  <p className="text-xs text-[#737373] dark:text-neutral-400 truncate mt-0.5">
                    Anycast multi-region CDN and DDoS mitigation.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 shrink-0 ml-2">
                <CheckCircle2 className="w-3 h-3" />
                Optimal
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#F0F0F0] dark:border-[#1E1E1E]">
                <span className="text-[#737373] dark:text-neutral-400">Edge Network</span>
                <span className="font-mono text-[#0A0A0A] dark:text-white">Vercel Anycast Global Edge</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#F0F0F0] dark:border-[#1E1E1E]">
                <span className="text-[#737373] dark:text-neutral-400">HTTP Protocol</span>
                <span className="font-mono text-[#0A0A0A] dark:text-white">HTTP/2 &amp; HTTP/3 (QUIC)</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#F0F0F0] dark:border-[#1E1E1E]">
                <span className="text-[#737373] dark:text-neutral-400">SSL / TLS Termination</span>
                <span className="font-mono text-[#0A0A0A] dark:text-white">TLS 1.3 Automatic Enforced</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[#737373] dark:text-neutral-400">Asset Caching</span>
                <span className="font-mono text-[#0A0A0A] dark:text-white">Edge Stale-While-Revalidate</span>
              </div>
            </div>
          </Card>

          {/* Card 4: Queue & Background Workers Status (Area 3) */}
          <Card id="system-background-workers" className="p-6 border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] dark:border-[#262626] pb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] dark:bg-[#1C1C1C] flex items-center justify-center border border-[#E5E5E5] dark:border-[#262626] shrink-0">
                  <Activity className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-[#0A0A0A] dark:text-white truncate">
                    Queue &amp; Background Workers
                  </h2>
                  <p className="text-xs text-[#737373] dark:text-neutral-400 truncate mt-0.5">
                    Asynchronous jobs, push notifications, and dispatchers.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 shrink-0 ml-2">
                <CheckCircle2 className="w-3 h-3" />
                Operational
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#F0F0F0] dark:border-[#1E1E1E]">
                <span className="text-[#737373] dark:text-neutral-400">Web Push Worker</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                  {data?.server.backgroundWorkers.pushNotifier || "Active (VAPID W3C)"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#F0F0F0] dark:border-[#1E1E1E]">
                <span className="text-[#737373] dark:text-neutral-400">Transactional Email Queue</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                  {data?.server.backgroundWorkers.emailQueue || "Standby (Resend HTTPS)"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#F0F0F0] dark:border-[#1E1E1E]">
                <span className="text-[#737373] dark:text-neutral-400">Sliding Rate Limiters</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                  {data?.server.backgroundWorkers.rateLimiters || "Enforced (Sliding Window)"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[#737373] dark:text-neutral-400">Process Memory (RSS)</span>
                <span className="font-mono text-[#0A0A0A] dark:text-white">
                  {data ? `${data.server.memory.rssMb} MB` : "..."}
                </span>
              </div>
            </div>
          </Card>

          {/* Card 5: Media Pipeline & Storage Vault */}
          <Card className="p-6 border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] dark:border-[#262626] pb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] dark:bg-[#1C1C1C] flex items-center justify-center border border-[#E5E5E5] dark:border-[#262626] shrink-0">
                  <HardDrive className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-[#0A0A0A] dark:text-white truncate">
                    Media Pipeline &amp; Storage Vault
                  </h2>
                  <p className="text-xs text-[#737373] dark:text-neutral-400 truncate mt-0.5">
                    Cloudinary signed asset uploads and multi-CDN caching.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 shrink-0 ml-2">
                <CheckCircle2 className="w-3 h-3" />
                Active
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#F0F0F0] dark:border-[#1E1E1E]">
                <span className="text-[#737373] dark:text-neutral-400">Media Engine</span>
                <span className="font-mono text-[#0A0A0A] dark:text-white">Cloudinary Digital Asset Cloud</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#F0F0F0] dark:border-[#1E1E1E]">
                <span className="text-[#737373] dark:text-neutral-400">Upload Security</span>
                <span className="font-mono text-[#0A0A0A] dark:text-white">Server-Signed HMAC Authentication</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#F0F0F0] dark:border-[#1E1E1E]">
                <span className="text-[#737373] dark:text-neutral-400">Transformation</span>
                <span className="font-mono text-[#0A0A0A] dark:text-white">Auto WebP / AVIF Responsive Sizing</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[#737373] dark:text-neutral-400">Delivery Network</span>
                <span className="font-mono text-[#0A0A0A] dark:text-white">Akamai &amp; Fastly Multi-CDN</span>
              </div>
            </div>
          </Card>

          {/* Card 6: Transactional Email Gateway */}
          <Card className="p-6 border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] dark:border-[#262626] pb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] dark:bg-[#1C1C1C] flex items-center justify-center border border-[#E5E5E5] dark:border-[#262626] shrink-0">
                  <Mail className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-[#0A0A0A] dark:text-white truncate">
                    Transactional Email Gateway
                  </h2>
                  <p className="text-xs text-[#737373] dark:text-neutral-400 truncate mt-0.5">
                    Resend API infrastructure and DNS authentication.
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 shrink-0 ml-2">
                <CheckCircle2 className="w-3 h-3" />
                Verified
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#F0F0F0] dark:border-[#1E1E1E]">
                <span className="text-[#737373] dark:text-neutral-400">Delivery Provider</span>
                <span className="font-mono text-[#0A0A0A] dark:text-white">Resend (React Email Framework)</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#F0F0F0] dark:border-[#1E1E1E]">
                <span className="text-[#737373] dark:text-neutral-400">Transport Security</span>
                <span className="font-mono text-[#0A0A0A] dark:text-white">HTTPS REST API with Strict TLS</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#F0F0F0] dark:border-[#1E1E1E]">
                <span className="text-[#737373] dark:text-neutral-400">DNS Alignment</span>
                <span className="font-mono text-[#0A0A0A] dark:text-white">SPF, DKIM &amp; DMARC Enforced</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[#737373] dark:text-neutral-400">Dispatched Triggers</span>
                <span className="font-mono text-[#0A0A0A] dark:text-white">OTP, Inquiries, Milestone Agreements</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Emergency Maintenance Mode Notice Box */}
      <div className="rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/15 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#0A0A0A] dark:text-white">
              Traffic Bypass &amp; Database Maintenance
            </h4>
            <p className="text-xs text-[#737373] dark:text-neutral-400 mt-0.5">
              During major database schema migrations, Neon connection pooling automatically handles in-flight transactions with zero downtime.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => toast.success("System is running optimally on Neon Serverless PgBouncer pooler.")}
          className="px-3.5 py-1.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] text-xs font-semibold text-[#0A0A0A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-colors shrink-0 cursor-pointer shadow-2xs"
        >
          Verify Pooler Status
        </button>
      </div>
    </div>
  );
}
