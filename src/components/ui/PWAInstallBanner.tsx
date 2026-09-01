"use client";

import React, { useState, useEffect } from "react";
import { Download, X, Smartphone, Monitor, Share2, PlusSquare, RefreshCw, WifiOff, Wifi, CheckCircle2, MoreVertical, ArrowUpRight } from "lucide-react";
import { Button } from "./Button";
import toast from "react-hot-toast";

type GuidePlatform = "ios" | "android" | "desktop";

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);
  const [isStandalone, setIsStandalone] = useState(false);

  // Custom Modal Guide State
  const [guideModal, setGuideModal] = useState<{ isOpen: boolean; platform: GuidePlatform }>({
    isOpen: false,
    platform: "desktop",
  });

  // App Update State
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Offline / Online Network State
  const [isOffline, setIsOffline] = useState(false);
  const [showOnlineToast, setShowOnlineToast] = useState(false);

  useEffect(() => {
    // A. Online / Offline Network Listeners
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
    }

    // B. Register Service Worker
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

          // Check on window focus (Zero background CPU usage)
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

    // C. Standalone Check
    const isRunningStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(isRunningStandalone);
    if (isRunningStandalone) return;

    // D. Dismissal check
    const dismissedTimestamp = localStorage.getItem("abcd_pwa_dismissed");
    if (dismissedTimestamp) {
      const parsedTime = parseInt(dismissedTimestamp, 10);
      if (Date.now() - parsedTime < 7 * 24 * 60 * 60 * 1000) {
        return;
      }
    }

    setIsDismissed(false);

    // E. Detect Device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleMobile = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome|crios|crmo/.test(userAgent);

    if (isAppleMobile && isSafari) {
      setIsIOS(true);
      setIsInstallable(true);
    }

    // F. Chromium beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
      localStorage.setItem("abcd_pwa_installed", "true");
      toast.success("ABCD App installed successfully! Access it anytime from your home screen or desktop.");
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
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

  // Install handler with custom alert/modal
  const handleInstallClick = async () => {
    if (isIOS) {
      setGuideModal({ isOpen: true, platform: "ios" });
      return;
    }

    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        if (outcome === "accepted") {
          setIsInstallable(false);
          toast.success("Installing ABCD App...");
        }
      } catch (err) {
        setGuideModal({ isOpen: true, platform: "desktop" });
      }
      return;
    }

    // Fallback: Open tailored custom guide modal
    const isMobile = /android|iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    setGuideModal({
      isOpen: true,
      platform: isMobile ? "android" : "desktop",
    });
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("abcd_pwa_dismissed", Date.now().toString());
  };

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
              className="text-neutral-400 hover:text-white dark:text-neutral-500 dark:hover:text-black p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 4. Native PWA Install Banner */}
      {!isStandalone && !isDismissed && isInstallable && !updateAvailable && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-88 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] border border-[#262626] dark:border-[#E5E5E5] p-4 rounded-2xl shadow-2xl flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white/10 dark:bg-black/10 flex items-center justify-center shrink-0">
                <Smartphone className="w-4 h-4 text-white dark:text-[#0A0A0A] sm:hidden" />
                <Monitor className="w-4 h-4 text-white dark:text-[#0A0A0A] hidden sm:block" />
              </div>
              <div className="space-y-1 min-w-0">
                <h4 className="text-xs font-bold tracking-tight truncate">
                  Install ABCD App
                </h4>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-600 leading-snug">
                  Quick 1-tap launch and offline access.
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="px-3 py-1.5 rounded-lg bg-white text-[#0A0A0A] dark:bg-[#0A0A0A] dark:text-white font-bold text-xs shadow-xs hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Install</span>
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
              className="text-neutral-400 hover:text-white dark:text-neutral-500 dark:hover:text-black p-1 rounded-md transition-colors"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 5. Custom Install Guide Alert Modal */}
      {guideModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#262626] rounded-3xl max-w-sm w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] dark:border-[#262626] pb-3">
              <h3 className="text-sm font-bold text-[#0A0A0A] dark:text-white flex items-center gap-2">
                {guideModal.platform === "ios" && <Smartphone className="w-4 h-4" />}
                {guideModal.platform === "android" && <Smartphone className="w-4 h-4" />}
                {guideModal.platform === "desktop" && <Monitor className="w-4 h-4" />}
                Install ABCD App
              </h3>
              <button
                onClick={() => setGuideModal({ isOpen: false, platform: "desktop" })}
                className="p-1 text-[#737373] hover:text-black dark:hover:text-white rounded-full cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* iOS Instructions */}
              {guideModal.platform === "ios" && (
                <>
                  <p className="text-[#737373] dark:text-neutral-400 leading-relaxed">
                    Follow these 3 simple steps in Safari to add ABCD App to your iPhone:
                  </p>
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-3 p-3 bg-[#F9F9F9] dark:bg-[#161616] rounded-xl border border-[#E5E5E5] dark:border-[#262626]">
                      <div className="w-6 h-6 rounded-lg bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] flex items-center justify-center font-bold text-xs shrink-0">
                        1
                      </div>
                      <div>
                        <span className="font-bold text-[#0A0A0A] dark:text-white block">Tap Share Button</span>
                        <span className="text-[#737373] flex items-center gap-1 mt-0.5">
                          Tap the <Share2 className="w-3 h-3 inline text-blue-500" /> Share icon at the bottom of Safari.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-[#F9F9F9] dark:bg-[#161616] rounded-xl border border-[#E5E5E5] dark:border-[#262626]">
                      <div className="w-6 h-6 rounded-lg bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] flex items-center justify-center font-bold text-xs shrink-0">
                        2
                      </div>
                      <div>
                        <span className="font-bold text-[#0A0A0A] dark:text-white block">Add to Home Screen</span>
                        <span className="text-[#737373] flex items-center gap-1 mt-0.5">
                          Scroll and tap <PlusSquare className="w-3 h-3 inline" /> &quot;Add to Home Screen&quot;.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-[#F9F9F9] dark:bg-[#161616] rounded-xl border border-[#E5E5E5] dark:border-[#262626]">
                      <div className="w-6 h-6 rounded-lg bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] flex items-center justify-center font-bold text-xs shrink-0">
                        3
                      </div>
                      <div>
                        <span className="font-bold text-[#0A0A0A] dark:text-white block">Tap &quot;Add&quot;</span>
                        <span className="text-[#737373] mt-0.5">
                          Confirm in the top right corner.
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Android Instructions */}
              {guideModal.platform === "android" && (
                <>
                  <p className="text-[#737373] dark:text-neutral-400 leading-relaxed">
                    Install ABCD App on your Android device:
                  </p>
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-3 p-3 bg-[#F9F9F9] dark:bg-[#161616] rounded-xl border border-[#E5E5E5] dark:border-[#262626]">
                      <div className="w-6 h-6 rounded-lg bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] flex items-center justify-center font-bold text-xs shrink-0">
                        1
                      </div>
                      <div>
                        <span className="font-bold text-[#0A0A0A] dark:text-white block">Open Chrome Menu</span>
                        <span className="text-[#737373] flex items-center gap-1 mt-0.5">
                          Tap <MoreVertical className="w-3 h-3 inline" /> in the top right corner.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-[#F9F9F9] dark:bg-[#161616] rounded-xl border border-[#E5E5E5] dark:border-[#262626]">
                      <div className="w-6 h-6 rounded-lg bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] flex items-center justify-center font-bold text-xs shrink-0">
                        2
                      </div>
                      <div>
                        <span className="font-bold text-[#0A0A0A] dark:text-white block">Install or Add</span>
                        <span className="text-[#737373] mt-0.5">
                          Select &quot;Install app&quot; or &quot;Add to Home screen&quot;.
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Desktop Instructions (Chrome / Edge / Windows / Mac) */}
              {guideModal.platform === "desktop" && (
                <>
                  <p className="text-[#737373] dark:text-neutral-400 leading-relaxed">
                    Install ABCD App as a native desktop application:
                  </p>
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-3 p-3 bg-[#F9F9F9] dark:bg-[#161616] rounded-xl border border-[#E5E5E5] dark:border-[#262626]">
                      <div className="w-6 h-6 rounded-lg bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] flex items-center justify-center font-bold text-xs shrink-0">
                        1
                      </div>
                      <div>
                        <span className="font-bold text-[#0A0A0A] dark:text-white block">Check Address Bar</span>
                        <span className="text-[#737373] flex items-center gap-1 mt-0.5">
                          Click the <Download className="w-3 h-3 inline" /> or <ArrowUpRight className="w-3 h-3 inline" /> install icon in your browser address bar.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-[#F9F9F9] dark:bg-[#161616] rounded-xl border border-[#E5E5E5] dark:border-[#262626]">
                      <div className="w-6 h-6 rounded-lg bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] flex items-center justify-center font-bold text-xs shrink-0">
                        2
                      </div>
                      <div>
                        <span className="font-bold text-[#0A0A0A] dark:text-white block">Click Install</span>
                        <span className="text-[#737373] mt-0.5">
                          The app will be added to your Windows Start Menu or macOS Launchpad.
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <Button
              variant="primary"
              size="sm"
              className="w-full justify-center cursor-pointer"
              onClick={() => setGuideModal({ isOpen: false, platform: "desktop" })}
            >
              Got it
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
