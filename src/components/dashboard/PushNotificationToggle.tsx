"use client";

import React, { useState, useEffect } from "react";
import { Bell, BellOff, CheckCircle2, AlertCircle, Smartphone, Send, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationToggle() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      checkCurrentSubscription();
    } else {
      setPermission("unsupported");
    }
  }, []);

  const checkCurrentSubscription = async () => {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        setIsSubscribed(true);
        setSubscription(sub);
      } else {
        setIsSubscribed(false);
        setSubscription(null);
      }
    } catch (e) {
      console.warn("Could not check push subscription:", e);
    }
  };

  const handleSubscribe = async () => {
    if (!isSupported) {
      toast.error("Push notifications are not supported by this browser");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Request permission
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== "granted") {
        toast.error("Notification permission was denied in browser settings");
        setIsLoading(false);
        return;
      }

      // 2. Register / Get Service Worker
      const reg = await navigator.serviceWorker.ready;

      // 3. Subscribe with VAPID Public Key
      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicKey) {
        throw new Error("VAPID public key is missing");
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      // 4. Save to backend database
      const res = await fetch("/api/notifications/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: sub.toJSON(),
          userAgent: navigator.userAgent,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to save subscription on server");
      }

      setIsSubscribed(true);
      setSubscription(sub);
      toast.success("Android & device push notifications enabled!");
    } catch (err: any) {
      console.error("Subscription error:", err);
      toast.error(err?.message || "Failed to enable push notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!subscription) return;
    setIsLoading(true);
    try {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();

      await fetch("/api/notifications/push/subscribe", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint }),
      }).catch(() => {});

      setIsSubscribed(false);
      setSubscription(null);
      toast.success("Device push notifications turned off");
    } catch (err: any) {
      console.error("Unsubscribe error:", err);
      toast.error("Failed to disable push notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTestPush = async () => {
    if (!subscription) {
      toast.error("Please enable push notifications first");
      return;
    }

    setIsTesting(true);
    try {
      const res = await fetch("/api/notifications/push/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to dispatch test notification");
      }

      toast.success("Test notification sent! Check your top notification bar.");
    } catch (err: any) {
      console.error("Test push error:", err);
      toast.error(err?.message || "Could not deliver test notification");
    } finally {
      setIsTesting(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] p-5 sm:p-6 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#F5F5F5] dark:bg-[#1A1A1A] border border-[#E5E5E5] dark:border-[#262626] flex items-center justify-center shrink-0">
            {isSubscribed ? (
              <Bell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <BellOff className="w-5 h-5 text-[#737373] dark:text-neutral-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#0A0A0A] dark:text-white">
                Android &amp; System Push Notifications
              </h3>
              {isSubscribed ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" /> Active
                </span>
              ) : permission === "denied" ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20">
                  <AlertCircle className="w-3 h-3" /> Blocked
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F5F5F5] dark:bg-[#1E1E1E] text-[#737373] border border-[#E5E5E5] dark:border-[#333]">
                  Inactive
                </span>
              )}
            </div>
            <p className="text-xs text-[#737373] dark:text-neutral-400 mt-1">
              Receive instant alerts in your Android status bar, lock screen, and desktop notification drawer.
            </p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {isSubscribed ? (
            <>
              <button
                type="button"
                onClick={handleSendTestPush}
                disabled={isTesting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-[#F9F9F9] dark:bg-[#141414] hover:bg-[#F0F0F0] dark:hover:bg-[#1C1C1C] text-xs font-semibold text-[#0A0A0A] dark:text-white transition-colors cursor-pointer disabled:opacity-60"
              >
                {isTesting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Test Alert</span>
              </button>
              <button
                type="button"
                onClick={handleUnsubscribe}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer disabled:opacity-60"
              >
                {isLoading ? "Turning off..." : "Disable"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleSubscribe}
              disabled={isLoading || permission === "denied"}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] hover:opacity-90 text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Smartphone className="w-3.5 h-3.5" />
              )}
              <span>{permission === "denied" ? "Blocked in Settings" : "Enable Push Notifications"}</span>
            </button>
          )}
        </div>
      </div>

      {permission === "denied" && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-900 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            Notifications are currently blocked in your browser or phone site settings. Tap the padlock/tune icon in the browser address bar and select &quot;Reset Permission&quot; or allow notifications.
          </span>
        </div>
      )}
    </div>
  );
}
