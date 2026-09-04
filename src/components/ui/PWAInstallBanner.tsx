"use client";

import React, { useState, useEffect } from "react";
import {
  Download,
  X,
  Smartphone,
  Monitor,
  RefreshCw,
  WifiOff,
  Wifi,
  Share2,
  PlusSquare,
  MoreVertical,
  CheckCircle2,
  ExternalLink,
  Copy,
  Sparkles,
} from "lucide-react";
import { Button } from "./Button";
import toast from "react-hot-toast";

type PlatformType = "desktop" | "android" | "ios";

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activePlatform, setActivePlatform] = useState<PlatformType>("desktop");
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isWebView, setIsWebView] = useState(false);

  // App Update State
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Offline / Online Network State
  const [isOffline, setIsOffline] = useState(false);
  const [showOnlineToast, setShowOnlineToast] = useState(false);

  useEffect(() => {
    setMounted(true);

    // 1. Online / Offline Network Listeners
    const handleOnline = () => {
      setIsOffline(false);
      setShowOnlineToast(true);
      setTimeout(() => setShowOnlineToast(false), 3500);
      toast.success("Back Online! Live synced.", { id: "network-status" });
    };

    const handleOffline = () => {
      setIsOffline(true);
      toast.error("You are offline. Running in cached mode.", { id: "network-status" });
    };

    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      // Theme Color Sync with Dark / Light Mode
      const updateThemeColor = () => {
        const isDark = document.documentElement.classList.contains("dark");
        let metaTheme = document.querySelector('meta[name="theme-color"]');
        if (!metaTheme) {
          metaTheme = document.createElement("meta");
          metaTheme.setAttribute("name", "theme-color");
          document.head.appendChild(metaTheme);
        }
        metaTheme.setAttribute("content", isDark ? "#0A0A0A" : "#FFFFFF");
      };

      updateThemeColor();
      const themeObserver = new MutationObserver(updateThemeColor);
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

      // App Badging API (Taskbar / Dock Unread Counter)
      const updateBadge = () => {
        if ("setAppBadge" in navigator) {
          try {
            const stored = localStorage.getItem("abcd_read_notifications");
            const readIds = stored ? JSON.parse(stored) : [];
            // If there's an active count event or badge count
            const customCount = (window as any).__abcd_unread_count;
            if (typeof customCount === "number" && customCount > 0) {
              navigator.setAppBadge(customCount).catch(() => {});
            } else if (readIds && readIds.length > 0) {
              (navigator as any).clearAppBadge?.().catch(() => {});
            }
          } catch {}
        }
      };

      updateBadge();
      window.addEventListener("notifications_updated", updateBadge);
    }

    // 2. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          if (registration.waiting) {
            setWaitingWorker(registration.waiting);
            setUpdateAvailable(true);
          }

          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  setWaitingWorker(newWorker);
                  setUpdateAvailable(true);
                }
              });
            }
          });

          // Check on window focus
          const handleFocus = () => {
            registration.update().catch((e) => console.debug("SW update check on focus:", e));
          };
          window.addEventListener("focus", handleFocus);

          return () => {
            window.removeEventListener("focus", handleFocus);
          };
        })
        .catch((err) => {
          console.warn("[PWA] Service Worker registration failed:", err);
        });

      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }

    // 3. Standalone & Installed Check
    const isRunningStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true ||
      window.matchMedia("(display-mode: fullscreen)").matches;

    const isAlreadyInstalled = localStorage.getItem("abcd_pwa_installed") === "true";

    setIsStandalone(isRunningStandalone);
    if (isRunningStandalone || isAlreadyInstalled) {
      setIsDismissed(true);
      return;
    }

    // 4. Check dismissal history (show again after 3 days if dismissed)
    const dismissedTimestamp = localStorage.getItem("abcd_pwa_dismissed");
    if (dismissedTimestamp) {
      const parsedTime = parseInt(dismissedTimestamp, 10);
      if (Date.now() - parsedTime < 3 * 24 * 60 * 60 * 1000) {
        setIsDismissed(true);
      }
    }

    // 5. Detect Platform and In-App WebViews
    const userAgent = typeof navigator !== "undefined" ? navigator.userAgent.toLowerCase() : "";
    const isAppleMobile = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const inAppWebView = /fbav|instagram|fban|linkedinapp|twitter|snapchat|musical_ly|tiktok|line|micromessenger/i.test(
      userAgent
    );

    setIsWebView(inAppWebView);

    if (isAppleMobile) {
      setActivePlatform("ios");
    } else if (isAndroid) {
      setActivePlatform("android");
    } else {
      setActivePlatform("desktop");
    }

    // 6. Chromium beforeinstallprompt event capture
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (typeof window !== "undefined") {
        (window as any).__deferredPrompt = e;
        // If the browser fires beforeinstallprompt, the app is NOT installed (e.g. uninstalled/deleted)
        localStorage.removeItem("abcd_pwa_installed");
      }
    };

    const handlePromptReady = () => {
      if (typeof window !== "undefined" && (window as any).__deferredPrompt) {
        setDeferredPrompt((window as any).__deferredPrompt);
        localStorage.removeItem("abcd_pwa_installed");
      }
    };

    // 7. On-demand manual trigger from buttons/links
    const handleOpenPWAInstall = () => {
      handleInstallClick();
    };

    if (typeof window !== "undefined" && (window as any).__deferredPrompt) {
      setDeferredPrompt((window as any).__deferredPrompt);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("pwa_prompt_ready", handlePromptReady);
    window.addEventListener("open_pwa_install", handleOpenPWAInstall);

    const handleAppInstalled = () => {
      setIsDismissed(true);
      setShowInstallModal(false);
      setDeferredPrompt(null);
      if (typeof window !== "undefined") {
        (window as any).__deferredPrompt = null;
      }
      localStorage.setItem("abcd_pwa_installed", "true");
      toast.success("ABCD App installed successfully! Access it anytime from your desktop or home screen.");
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("pwa_prompt_ready", handlePromptReady);
      window.removeEventListener("open_pwa_install", handleOpenPWAInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Update handler
  const handleApplyUpdate = () => {
    if (waitingWorker) {
      setIsUpdating(true);
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
    } else {
      window.location.reload();
    }
  };

  // Primary Install Action
  const handleInstallClick = async () => {
    const promptEvent =
      deferredPrompt ||
      (typeof window !== "undefined" ? (window as any).__deferredPrompt : null);

    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        setDeferredPrompt(null);
        if (typeof window !== "undefined") {
          (window as any).__deferredPrompt = null;
        }
        if (outcome === "accepted") {
          setIsDismissed(true);
          setShowInstallModal(false);
          toast.success("Installing ABCD App...");
          return;
        }
      } catch (err) {
        console.debug("Native prompt trigger error:", err);
      }
    }

    // If browser prompt wasn't immediately available or user is on iOS / Chrome Desktop / Android
    setShowInstallModal(true);
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.origin);
      toast.success("App link copied to clipboard!");
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("abcd_pwa_dismissed", Date.now().toString());
  };

  if (!mounted || isStandalone) {
    return null;
  }

  return (
    <>
      {/* 1. Offline Mode Badge */}
      {isOffline && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 duration-300 pointer-events-none">
          <div className="px-3.5 py-1.5 rounded-full bg-neutral-900 text-white border border-neutral-700 shadow-xl flex items-center gap-2 text-xs font-semibold">
            <WifiOff className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Offline Mode — Using Cached Data</span>
          </div>
        </div>
      )}

      {/* 2. Reconnected Online Toast */}
      {showOnlineToast && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 duration-300 pointer-events-none">
          <div className="px-3.5 py-1.5 rounded-full bg-[#0A0A0A] text-white border border-[#262626] shadow-xl flex items-center gap-2 text-xs font-bold">
            <Wifi className="w-3.5 h-3.5 text-white" />
            <span>Back Online — Live Synced</span>
          </div>
        </div>
      )}

      {/* 3. New Version Available Banner */}
      {updateAvailable && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-88 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] border border-neutral-700 dark:border-neutral-200 p-4 rounded-2xl shadow-2xl flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white/10 dark:bg-black/10 flex items-center justify-center shrink-0">
                <RefreshCw className={`w-4 h-4 ${isUpdating ? "animate-spin" : ""}`} />
              </div>
              <div className="space-y-1 min-w-0">
                <h4 className="text-xs font-bold tracking-tight">
                  Update Ready
                </h4>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-600 leading-snug">
                  Latest enhancements and fixes available.
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleApplyUpdate}
                    disabled={isUpdating}
                    className="px-3 py-1.5 rounded-lg bg-white text-[#0A0A0A] dark:bg-[#0A0A0A] dark:text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isUpdating ? "animate-spin" : ""}`} />
                    <span>{isUpdating ? "Updating..." : "Update"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpdateAvailable(false)}
                    className="px-2.5 py-1.5 text-xs text-neutral-400 hover:text-white dark:text-neutral-500 dark:hover:text-black transition-colors cursor-pointer"
                  >
                    Later
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setUpdateAvailable(false)}
              className="text-neutral-400 hover:text-white dark:text-neutral-500 dark:hover:text-black p-1 rounded-md cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 4. Universal PWA Install Floating Banner */}
      {!isDismissed && !updateAvailable && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-88 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] border border-[#262626] dark:border-[#E5E5E5] p-4 rounded-2xl shadow-2xl flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 border border-neutral-700/60 dark:border-neutral-200/60 bg-[#0A0A0A] flex items-center justify-center">
                <img src="/images/abcd_square_logo.png" alt="ABCD Agency App" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold tracking-tight truncate">
                    Install ABCD App
                  </h4>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white/15 dark:bg-black/10 text-neutral-300 dark:text-neutral-700">
                    PWA
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-600 leading-snug">
                  1-click desktop/mobile app with offline access.
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="px-3.5 py-1.5 rounded-lg bg-white text-[#0A0A0A] dark:bg-[#0A0A0A] dark:text-white font-bold text-xs shadow-xs hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Install App</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="px-2.5 py-1.5 text-xs text-neutral-400 dark:text-neutral-500 hover:text-white dark:hover:text-black transition-colors cursor-pointer"
                  >
                    Later
                  </button>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDismiss}
              className="text-neutral-400 hover:text-white dark:text-neutral-500 dark:hover:text-black p-1 rounded-md transition-colors cursor-pointer"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 5. Interactive Install Guide / Browser Dialog Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111111] text-[#0A0A0A] dark:text-white border border-[#E5E5E5] dark:border-[#262626] rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#E5E5E5] dark:border-[#262626] pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 border border-[#E5E5E5] dark:border-[#262626] bg-[#0A0A0A] flex items-center justify-center">
                  <img src="/images/abcd_square_logo.png" alt="ABCD Agency" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight">
                    Install ABCD Agency App
                  </h3>
                  <p className="text-[11px] text-[#737373] dark:text-neutral-400">
                    Fast launch, standalone window & offline support
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowInstallModal(false)}
                className="p-1.5 text-[#737373] hover:text-black dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* In-App WebView Notice if user is viewing inside Instagram/Facebook/LinkedIn etc. */}
            {isWebView && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
                <ExternalLink className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold block">In-App Browser Detected</span>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    Tap the <strong>⋯</strong> or <strong>Share</strong> icon and choose <strong>&quot;Open in Chrome / Safari&quot;</strong> to install the app.
                  </p>
                </div>
              </div>
            )}

            {/* Platform Selector Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-[#F5F5F5] dark:bg-[#1A1A1A] p-1 rounded-xl border border-[#E5E5E5] dark:border-[#262626]">
              <button
                type="button"
                onClick={() => setActivePlatform("desktop")}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activePlatform === "desktop"
                    ? "bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white shadow-xs"
                    : "text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white"
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePlatform("android")}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activePlatform === "android"
                    ? "bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white shadow-xs"
                    : "text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePlatform("ios")}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activePlatform === "ios"
                    ? "bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white shadow-xs"
                    : "text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>iPhone/iPad</span>
              </button>
            </div>

            {/* Step-by-Step Instructions by Platform */}
            <div className="space-y-3 text-xs">
              {/* Desktop Instructions */}
              {activePlatform === "desktop" && (
                <div className="space-y-2.5">
                  <div className="p-3 bg-[#F9F9F9] dark:bg-[#161616] rounded-xl border border-[#E5E5E5] dark:border-[#262626] flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] flex items-center justify-center font-bold text-xs shrink-0">
                      1
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold block">Look at Browser Address Bar (Top Right)</span>
                      <p className="text-[#737373] dark:text-neutral-400 text-[11px] leading-relaxed">
                        In Chrome, Edge, or Brave, look at the right end of the address URL bar for the{" "}
                        <strong className="text-black dark:text-white font-bold">Install App (📥 / 🖥️)</strong> icon.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-[#F9F9F9] dark:bg-[#161616] rounded-xl border border-[#E5E5E5] dark:border-[#262626] flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] flex items-center justify-center font-bold text-xs shrink-0">
                      2
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold block">Or Open Browser Menu (⋮)</span>
                      <p className="text-[#737373] dark:text-neutral-400 text-[11px] leading-relaxed">
                        Click the 3 dots in the top right → select <strong className="text-black dark:text-white font-bold">&quot;Save and share&quot;</strong> or <strong className="text-black dark:text-white font-bold">&quot;Install ABCD Agency&quot;</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-[#F9F9F9] dark:bg-[#161616] rounded-xl border border-[#E5E5E5] dark:border-[#262626] flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] flex items-center justify-center font-bold text-xs shrink-0">
                      3
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold block">Click &quot;Install&quot;</span>
                      <p className="text-[#737373] dark:text-neutral-400 text-[11px] leading-relaxed">
                        The app opens in its own clean window and adds a shortcut to your Desktop and Taskbar.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Android Instructions */}
              {activePlatform === "android" && (
                <div className="space-y-2.5">
                  <div className="p-3 bg-[#F9F9F9] dark:bg-[#161616] rounded-xl border border-[#E5E5E5] dark:border-[#262626] flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] flex items-center justify-center font-bold text-xs shrink-0">
                      1
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold block">Tap Chrome Menu</span>
                      <p className="text-[#737373] dark:text-neutral-400 text-[11px] leading-relaxed">
                        Tap the three dots <MoreVertical className="w-3 h-3 inline" /> at the top-right corner of Chrome.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-[#F9F9F9] dark:bg-[#161616] rounded-xl border border-[#E5E5E5] dark:border-[#262626] flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] flex items-center justify-center font-bold text-xs shrink-0">
                      2
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold block">Select &quot;Install app&quot; or &quot;Add to Home screen&quot;</span>
                      <p className="text-[#737373] dark:text-neutral-400 text-[11px] leading-relaxed">
                        Tap <strong className="text-black dark:text-white font-bold">&quot;Install app&quot;</strong> (or &quot;Add to Home screen&quot;).
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-[#F9F9F9] dark:bg-[#161616] rounded-xl border border-[#E5E5E5] dark:border-[#262626] flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] flex items-center justify-center font-bold text-xs shrink-0">
                      3
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold block">Confirm Install</span>
                      <p className="text-[#737373] dark:text-neutral-400 text-[11px] leading-relaxed">
                        Tap Install in the browser prompt to add ABCD App to your home screen and app drawer.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* iOS Instructions */}
              {activePlatform === "ios" && (
                <div className="space-y-2.5">
                  <div className="p-3 bg-[#F9F9F9] dark:bg-[#161616] rounded-xl border border-[#E5E5E5] dark:border-[#262626] flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] flex items-center justify-center font-bold text-xs shrink-0">
                      1
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold block">Tap Safari Share Button</span>
                      <p className="text-[#737373] dark:text-neutral-400 text-[11px] leading-relaxed">
                        Tap the <Share2 className="w-3.5 h-3.5 inline text-blue-500" /> Share button at the bottom of Safari toolbar.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-[#F9F9F9] dark:bg-[#161616] rounded-xl border border-[#E5E5E5] dark:border-[#262626] flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] flex items-center justify-center font-bold text-xs shrink-0">
                      2
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold block">Add to Home Screen</span>
                      <p className="text-[#737373] dark:text-neutral-400 text-[11px] leading-relaxed">
                        Scroll down the share sheet and select <PlusSquare className="w-3.5 h-3.5 inline" /> <strong className="text-black dark:text-white font-bold">&quot;Add to Home Screen&quot;</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-[#F9F9F9] dark:bg-[#161616] rounded-xl border border-[#E5E5E5] dark:border-[#262626] flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] flex items-center justify-center font-bold text-xs shrink-0">
                      3
                    </div>
                    <div className="space-y-1">
                      <span className="font-bold block">Tap &quot;Add&quot;</span>
                      <p className="text-[#737373] dark:text-neutral-400 text-[11px] leading-relaxed">
                        Confirm &quot;Add&quot; in the top-right corner to place the app on your home screen.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
              {deferredPrompt && (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full sm:w-auto flex-1 px-4 py-2.5 rounded-xl bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] font-bold text-xs shadow-sm hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Show Browser Prompt</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#F5F5F5] dark:bg-[#1E1E1E] text-[#0A0A0A] dark:text-white border border-[#E5E5E5] dark:border-[#262626] font-semibold text-xs hover:bg-[#E5E5E5] dark:hover:bg-[#2A2A2A] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy App URL</span>
              </button>
              <button
                type="button"
                onClick={() => setShowInstallModal(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-[#737373] hover:text-black dark:hover:text-white transition-colors cursor-pointer text-center"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

