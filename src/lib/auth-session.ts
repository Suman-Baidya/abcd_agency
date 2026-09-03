import { cookies, headers } from "next/headers";
import crypto from "crypto";
import { db } from "./prisma";
import { signSessionToken, verifySessionToken } from "./auth-token";

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
  lastActiveAt?: Date | null;
}

export const SESSION_COOKIE_NAME = "abcd_auth_token";

/**
 * Securely hashes passwords using scrypt with random salt.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

/**
 * Verifies a password against an scrypt hash or plaintext fallback for legacy records.
 */
export function verifyPassword(password: string, stored: string): boolean {
  if (!stored) return false;
  if (!stored.startsWith("scrypt:")) {
    // Backwards compatibility for existing plain text database passwords
    return password === stored;
  }
  const parts = stored.split(":");
  if (parts.length !== 3) return false;
  const [, salt, hash] = parts;
  const testHash = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(testHash, "hex"));
}

export async function createSession(userId: string, role: string = "USER", rememberMe: boolean = true) {
  const cookieStore = await cookies();
  const expiresInSeconds = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24; // 30 days vs 1 day
  const token = await signSessionToken({ uid: userId, role }, expiresInSeconds);

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(rememberMe ? { maxAge: expiresInSeconds } : {}),
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    const session = await verifySessionToken(token);
    const userId = session?.uid;
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
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const session = await verifySessionToken(token);
    if (!session?.uid) return null;

    const user = await db.user.findUnique({
      where: { id: session.uid },
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
        lastActiveAt: true,
      },
    });

    if (!user) return null;

    if (user.status === "Suspended") {
      cookieStore.delete(SESSION_COOKIE_NAME);
      return null;
    }

    // Throttle lastActiveAt update in background to only update if > 10 mins have passed
    const TEN_MINUTES_MS = 10 * 60 * 1000;
    if (!user.lastActiveAt || Date.now() - new Date(user.lastActiveAt).getTime() > TEN_MINUTES_MS) {
      db.user.update({
        where: { id: user.id },
        data: { lastActiveAt: new Date() },
      }).catch(() => {});
    }

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
