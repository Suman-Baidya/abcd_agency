import webpush from "web-push";
import { db } from "@/lib/prisma";

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
  actions?: Array<{ action: string; title: string }>;
}

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:hello@abcdagency.com";

let isVapidConfigured = false;
if (vapidPublicKey && vapidPrivateKey) {
  try {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
    isVapidConfigured = true;
  } catch (err) {
    console.warn("Failed to set VAPID details:", err);
  }
}

/**
 * Send push notification to a single PushSubscription record
 */
export async function sendPushToSubscription(
  sub: { id: string; endpoint: string; p256dh: string; auth: string },
  payload: PushNotificationPayload
) {
  if (!isVapidConfigured) {
    console.warn("Cannot send push notification: VAPID keys not configured");
    return { success: false, reason: "VAPID not configured" };
  }

  const pushSubscription = {
    endpoint: sub.endpoint,
    keys: {
      p256dh: sub.p256dh,
      auth: sub.auth,
    },
  };

  const stringified = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: payload.icon || "/images/abcd_square_logo.png",
    badge: payload.badge || "/favicon.ico",
    url: payload.url || "/",
    tag: payload.tag || `notif-${Date.now()}`,
    actions: payload.actions,
  });

  try {
    await webpush.sendNotification(pushSubscription, stringified);
    return { success: true };
  } catch (err: any) {
    // 404 or 410 means subscription has expired / user uninstalled
    if (err?.statusCode === 410 || err?.statusCode === 404) {
      try {
        await (db as any).pushSubscription.delete({ where: { id: sub.id } });
      } catch {}
    }
    return { success: false, error: err?.message || String(err) };
  }
}

/**
 * Send push notification to all devices registered to a specific user
 */
export async function sendPushToUser(userId: string, payload: PushNotificationPayload) {
  try {
    const subscriptions = await (db as any).pushSubscription.findMany({
      where: { userId },
    });
    if (!subscriptions || subscriptions.length === 0) return { deliveredCount: 0 };

    const results = await Promise.all(
      subscriptions.map((sub: any) => sendPushToSubscription(sub, payload))
    );
    return { deliveredCount: results.filter((r) => r.success).length };
  } catch (err) {
    console.error("Error in sendPushToUser:", err);
    return { deliveredCount: 0 };
  }
}

/**
 * Send push notification to all users matching a specific role (e.g. "SUPER_ADMIN" or "ADMIN")
 */
export async function sendPushToRole(role: string, payload: PushNotificationPayload) {
  try {
    const subscriptions = await (db as any).pushSubscription.findMany({
      where: {
        OR: [
          { role },
          ...(role === "ADMIN" ? [{ role: "SUPER_ADMIN" }] : []),
        ],
      },
    });
    if (!subscriptions || subscriptions.length === 0) return { deliveredCount: 0 };

    const results = await Promise.all(
      subscriptions.map((sub: any) => sendPushToSubscription(sub, payload))
    );
    return { deliveredCount: results.filter((r) => r.success).length };
  } catch (err) {
    console.error("Error in sendPushToRole:", err);
    return { deliveredCount: 0 };
  }
}

/**
 * Broadcast push notification to all registered devices across the app
 */
export async function sendBroadcastPush(payload: PushNotificationPayload) {
  try {
    const subscriptions = await (db as any).pushSubscription.findMany({});
    if (!subscriptions || subscriptions.length === 0) return { deliveredCount: 0 };

    const results = await Promise.all(
      subscriptions.map((sub: any) => sendPushToSubscription(sub, payload))
    );
    return { deliveredCount: results.filter((r) => r.success).length };
  } catch (err) {
    console.error("Error in sendBroadcastPush:", err);
    return { deliveredCount: 0 };
  }
}
