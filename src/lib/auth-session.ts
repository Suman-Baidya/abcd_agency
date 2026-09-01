import { cookies, headers } from "next/headers";
import { db } from "./prisma";

export interface SessionUser {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone?: string | null;
  isWhatsappSame?: boolean;
  whatsapp?: string | null;
  role: "USER" | "CLIENT" | "ADMIN" | "SUPER_ADMIN";
  status: string;
  isVerified: boolean;
  clientId?: string | null;
}

const SESSION_COOKIE_NAME = "abcd_auth_token";

export async function createSession(userId: string) {
  const cookieStore = await cookies();
  // 30 days session
  cookieStore.set(SESSION_COOKIE_NAME, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (userId) {
    try {
      await logUserActivity(userId, "LOGOUT", "User logged out of the application");
      await db.user.update({
        where: { id: userId },
        data: { lastLogoutAt: new Date() },
      });
    } catch (e) {
      console.warn("Failed to log logout activity:", e);
    }
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!userId) return null;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        companyName: true,
        email: true,
        phone: true,
        isWhatsappSame: true,
        whatsapp: true,
        role: true,
        status: true,
        isVerified: true,
        clientId: true,
      },
    });

    if (!user) return null;

    if (user.status === "Suspended") {
      cookieStore.delete(SESSION_COOKIE_NAME);
      return null;
    }

    // Update lastActiveAt in background
    db.user.update({
      where: { id: userId },
      data: { lastActiveAt: new Date() },
    }).catch(() => {});

    return user as SessionUser;
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    return null;
  }
}

export function parseClientUserAgent(ua: string): string {
  if (!ua) return "Web Browser";
  let os = "Desktop";
  if (/windows nt 10\.0/i.test(ua)) os = "Windows 10/11";
  else if (/windows nt 6\.[123]/i.test(ua)) os = "Windows";
  else if (/mac os x/i.test(ua)) {
    os = /iphone/i.test(ua) ? "iPhone" : /ipad/i.test(ua) ? "iPad" : "macOS";
  } else if (/android/i.test(ua)) os = "Android";
  else if (/linux/i.test(ua)) os = "Linux";

  let browser = "Browser";
  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/opr\/|opera/i.test(ua)) browser = "Opera";
  else if (/chrome|crios/i.test(ua)) browser = "Chrome";
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
  else if (/firefox|fxios/i.test(ua)) browser = "Firefox";

  return `${os} · ${browser}`;
}

export async function logUserActivity(
  userId: string,
  action: string,
  description?: string,
  device?: string,
  ipAddress?: string
) {
  try {
    let resolvedDevice = device;
    let resolvedIp = ipAddress;

    try {
      const headersList = await headers();
      
      if (!resolvedIp) {
        const forwarded = headersList.get("x-forwarded-for");
        const realIp = headersList.get("x-real-ip");
        const rawIp = (forwarded ? forwarded.split(",")[0].trim() : realIp) || "127.0.0.1";
        
        // Vercel Geo headers
        const city = headersList.get("x-vercel-ip-city");
        const region = headersList.get("x-vercel-ip-country-region");
        const country = headersList.get("x-vercel-ip-country");
        const geoParts = [city, region, country].filter(Boolean);
        
        if (geoParts.length > 0) {
          resolvedIp = `${rawIp} (${geoParts.join(", ")})`;
        } else if (rawIp === "127.0.0.1" || rawIp === "::1") {
          resolvedIp = "127.0.0.1 (Localhost)";
        } else {
          resolvedIp = rawIp;
        }
      }

      if (!resolvedDevice) {
        const ua = headersList.get("user-agent") || "";
        resolvedDevice = parseClientUserAgent(ua);
      }
    } catch {
      resolvedDevice = resolvedDevice || "Web Browser";
      resolvedIp = resolvedIp || "127.0.0.1";
    }

    await db.userActivity.create({
      data: {
        userId,
        action,
        description: description || null,
        device: resolvedDevice || "Web Browser",
        ipAddress: resolvedIp || "127.0.0.1",
      },
    });
  } catch (error) {
    console.error("Error logging user activity:", error);
  }
}
