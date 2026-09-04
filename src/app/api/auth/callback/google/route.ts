import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { signSessionToken } from "@/lib/auth-token";
import { logUserActivity } from "@/lib/auth-session";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");
  const stateRaw = searchParams.get("state");
  const authError = searchParams.get("error");

  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const baseUrl = `${proto}://${host}`;

  // Parse state to preserve destination
  let callbackUrl = "/portal";
  if (stateRaw) {
    try {
      const decoded = JSON.parse(Buffer.from(stateRaw, "base64url").toString("utf-8"));
      if (decoded.callbackUrl && decoded.callbackUrl.startsWith("/") && !decoded.callbackUrl.startsWith("//")) {
        callbackUrl = decoded.callbackUrl;
      }
    } catch {
      // Keep default /portal
    }
  }

  if (authError || !code) {
    console.warn("[Google OAuth] Authorization error or cancellation:", authError);
    return NextResponse.redirect(`${baseUrl}/login?error=GoogleAuthCancelled`);
  }

  const rawClientId = process.env.GOOGLE_CLIENT_ID;
  const rawClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const clientMatch = rawClientId?.match(/([0-9]+-[a-z0-9_]+\.apps\.googleusercontent\.com)/i);
  const secretMatch = (rawClientSecret || rawClientId)?.match(/(GOCSPX-[a-zA-Z0-9_-]+)/);
  const clientId = clientMatch ? clientMatch[1] : rawClientId?.trim().replace(/^["']|["']$/g, "");
  const clientSecret = secretMatch ? secretMatch[1] : rawClientSecret?.trim().replace(/^["']|["']$/g, "");

  if (!clientId || !clientSecret) {
    console.error("[Google OAuth] Missing Google Client ID or Secret.");
    return NextResponse.redirect(`${baseUrl}/login?error=GoogleNotConfigured`);
  }

  const redirectUri = `${baseUrl}/api/auth/callback/google`;

  try {
    // 1. Exchange authorization code for access tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error("[Google OAuth Token Error]:", tokenData);
      return NextResponse.redirect(`${baseUrl}/login?error=GoogleTokenExchangeFailed`);
    }

    // 2. Fetch Google profile info
    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profile = await profileResponse.json();

    if (!profileResponse.ok || !profile.email) {
      console.error("[Google OAuth Profile Error]:", profile);
      return NextResponse.redirect(`${baseUrl}/login?error=GoogleProfileFailed`);
    }

    const email = profile.email.toLowerCase().trim();
    const name = profile.name || email.split("@")[0] || "Google User";
    const picture = profile.picture || null;

    // 3. Find or auto-provision user in database
    let user = await db.user.findUnique({
      where: { email },
    });

    let isNewRegistration = false;

    if (user) {
      if (user.status === "Suspended") {
        return NextResponse.redirect(`${baseUrl}/login?error=AccountSuspended`);
      }

      // Automatically verify email and touch lastActiveAt
      await db.user.update({
        where: { id: user.id },
        data: {
          isVerified: true,
          lastActiveAt: new Date(),
        },
      });
    } else {
      isNewRegistration = true;
      // Auto-provision client user
      user = await db.user.create({
        data: {
          name,
          email,
          password: "", // Google OAuth user
          role: "USER",
          status: "Active",
          isVerified: true,
          companyName: "Individual Client",
          industry: "General",
          location: "Not Specified",
          lastActiveAt: new Date(),
        },
      });
    }

    // 4. Issue 30-day signed session token
    const sessionToken = await signSessionToken(
      { uid: user.id, role: user.role },
      30 * 24 * 60 * 60 // 30 days
    );

    // 5. Log activity
    await logUserActivity(
      user.id,
      isNewRegistration ? "REGISTER_GOOGLE" : "LOGIN_GOOGLE",
      isNewRegistration
        ? "Account created via Google OAuth"
        : "Signed in with Google One-Tap"
    ).catch(() => {});

    // 6. Determine redirect target
    let destination = callbackUrl;
    if (user.role === "ADMIN" || user.role === "SUPER_ADMIN") {
      destination = callbackUrl.startsWith("/admin") ? callbackUrl : "/admin";
    } else {
      const isProfileIncomplete = !user.phone || !user.companyName || user.companyName === "Individual Client" || !user.industry;
      if (isProfileIncomplete) {
        destination = "/onboarding";
      } else {
        destination = (callbackUrl === "/app" || callbackUrl.startsWith("/admin")) ? "/portal" : callbackUrl;
      }
    }

    const response = NextResponse.redirect(`${baseUrl}${destination}`);
    response.cookies.set({
      name: "abcd_auth_token",
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[Google OAuth Callback Exception]:", error);
    return NextResponse.redirect(`${baseUrl}/login?error=GoogleAuthException`);
  }
}
