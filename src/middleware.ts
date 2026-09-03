import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth-token";

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get("abcd_auth_token")?.value;
  const session = await verifySessionToken(token);

  const isAuthRoute = pathname === "/login" || pathname === "/register";
  const isAdminRoute = pathname.startsWith("/admin");
  const isPortalRoute = pathname.startsWith("/portal");

  // 1. If accessing login or register while already authenticated
  if (isAuthRoute && session) {
    const destination =
      session.role === "ADMIN" || session.role === "SUPER_ADMIN"
        ? new URL("/admin", request.url)
        : new URL("/portal", request.url);
    return NextResponse.redirect(destination);
  }

  // 2. Protected admin route
  if (isAdminRoute) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      const callbackPath = pathname + (search || "");
      loginUrl.searchParams.set("callbackUrl", callbackPath);
      return NextResponse.redirect(loginUrl);
    }

    if (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/portal", request.url));
    }
  }

  // 3. Protected portal route
  if (isPortalRoute) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      const callbackPath = pathname + (search || "");
      loginUrl.searchParams.set("callbackUrl", callbackPath);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 4. Protected onboarding route
  if (pathname === "/onboarding") {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/portal/:path*",
    "/login",
    "/register",
    "/onboarding",
  ],
};
