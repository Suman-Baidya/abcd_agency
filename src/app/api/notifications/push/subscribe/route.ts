import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-session";
import { db } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subscription, userAgent } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: "Invalid subscription payload" },
        { status: 400 }
      );
    }

    const user = await getCurrentUser().catch(() => null);

    const endpoint = subscription.endpoint;
    const p256dh = subscription.keys.p256dh;
    const auth = subscription.keys.auth;

    // Upsert subscription
    await (db as any).pushSubscription.upsert({
      where: { endpoint },
      update: {
        userId: user?.id || null,
        role: user?.role || "USER",
        p256dh,
        auth,
        userAgent: userAgent || null,
      },
      create: {
        endpoint,
        p256dh,
        auth,
        userId: user?.id || null,
        role: user?.role || "USER",
        userAgent: userAgent || null,
      },
    });

    return NextResponse.json({ success: true, message: "Push subscription saved" });
  } catch (error: any) {
    console.error("Error saving push subscription:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json({ error: "Endpoint required" }, { status: 400 });
    }

    await (db as any).pushSubscription.deleteMany({
      where: { endpoint },
    });

    return NextResponse.json({ success: true, message: "Subscription removed" });
  } catch (error: any) {
    console.error("Error deleting push subscription:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
