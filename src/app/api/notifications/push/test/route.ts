import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-session";
import { sendPushToSubscription, sendPushToUser } from "@/lib/push-notifications";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { subscription } = body;
    const user = await getCurrentUser().catch(() => null);

    const payload = {
      title: "ABCD Agency — Push Alert",
      body: `Live push notification successfully delivered to your device! [${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}]`,
      icon: "/images/abcd_square_logo.png",
      badge: "/favicon.ico",
      url: user?.role === "ADMIN" || user?.role === "SUPER_ADMIN" ? "/admin" : "/portal",
    };

    // If subscription object is passed directly from client
    if (subscription && subscription.endpoint && subscription.keys) {
      const res = await sendPushToSubscription(
        {
          id: "direct",
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
        payload
      );
      if (!res.success) {
        return NextResponse.json(
          { error: res.error || "Failed to send push" },
          { status: 500 }
        );
      }
      return NextResponse.json({ success: true, message: "Test push sent to device!" });
    }

    // Otherwise send to current user's registered devices
    if (user?.id) {
      const res = await sendPushToUser(user.id, payload);
      return NextResponse.json({
        success: true,
        deliveredCount: res.deliveredCount,
        message: `Test push dispatched to ${res.deliveredCount} device(s)`,
      });
    }

    return NextResponse.json(
      { error: "No target device or user specified" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Error in test push route:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
