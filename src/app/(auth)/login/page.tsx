"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { loginUser } from "./actions";
import { verifyOtpCode } from "../register/actions";
import { CheckCircle2, UserPlus, PhoneCall, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawCallbackUrl = searchParams.get("callbackUrl");

  // Validate callbackUrl to prevent open redirects (must be relative path starting with / and not //)
  const safeCallbackUrl =
    rawCallbackUrl && rawCallbackUrl.startsWith("/") && !rawCallbackUrl.startsWith("//")
      ? rawCallbackUrl
      : null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const authErrorParam = searchParams.get("error");
  const oauthErrorMessage = React.useMemo(() => {
    if (!authErrorParam) return null;
    switch (authErrorParam) {
      case "GoogleAuthCancelled":
        return "Google sign-in was cancelled. You can try again or sign in with your credentials below.";
      case "AccountSuspended":
        return "Your account has been suspended. Please contact agency support.";
      case "GoogleNotConfigured":
        return "Google Sign-In is temporarily unavailable. Please sign in with your email.";
      default:
        return "Unable to sign in with Google. Please try again or use your email.";
    }
  }, [authErrorParam]);

  // OTP Modal State if user registered but unverified
  const [otpState, setOtpState] = useState<{
    isOpen: boolean;
    userId: string;
    email: string;
    otpValue: string;
    devOtp?: string;
  }>({
    isOpen: false,
    userId: "",
    email: "",
    otpValue: "",
  });
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await loginUser({ email, password, rememberMe });
      if (!res.success) {
        if (res.needsVerification && res.userId) {
          setOtpState({
            isOpen: true,
            userId: res.userId,
            email,
            otpValue: "",
          });
          toast.error(res.error || "Email not verified.");
        } else {
          setError(res.error || "Invalid email or password.");
        }
        setIsLoading(false);
        return;
      }

      toast.success("Signed in successfully!");
      const target = (safeCallbackUrl && safeCallbackUrl !== "/app") ? safeCallbackUrl : (res.redirectTo || "/portal");
      router.push(target);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Failed to sign in.");
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpState.otpValue || otpState.otpValue.length < 6) {
      toast.error("Please enter the 6-digit code.");
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const res = await verifyOtpCode(otpState.userId, otpState.otpValue);
      if (!res.success) {
        toast.error(res.error || "Invalid code.");
        setIsVerifyingOtp(false);
        return;
      }
      toast.success("Email verified!");
      const target = safeCallbackUrl || res.redirectTo || "/portal";
      router.push(target);
      router.refresh();
    } catch {
      toast.error("Verification failed.");
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Top Welcome Title */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-[#737373] dark:text-neutral-400">
          Enter your credentials to access the ABCD Agency portal.
        </p>
      </div>

      <Card variant="default" className="p-6 sm:p-8">
        {oauthErrorMessage && (
          <div className="mb-5 p-3.5 text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-md">
            {oauthErrorMessage}
          </div>
        )}

        {/* Google OAuth One-Click Sign-In */}
        <div className="space-y-4 mb-6">
          <a
            href={`/api/auth/google?callbackUrl=${encodeURIComponent(safeCallbackUrl || "/portal")}`}
            onClick={() => setIsGoogleLoading(true)}
            className={`w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-md border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] text-sm font-semibold text-[#0A0A0A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#151515] transition-colors shadow-sm focus-visible:ring-2 ring-black whitespace-nowrap ${
              isGoogleLoading ? "opacity-75 pointer-events-none" : ""
            }`}
          >
            {isGoogleLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin" />
                <span>Redirecting to Google...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </a>

          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-[#E5E5E5] dark:border-[#262626]" />
            <span className="flex-shrink-0 mx-4 text-[11px] font-semibold uppercase tracking-wider text-[#737373] whitespace-nowrap">
              Or with email
            </span>
            <div className="flex-grow border-t border-[#E5E5E5] dark:border-[#262626]" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-[#0A0A0A] dark:text-white mb-2"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] px-4 py-2.5 text-sm text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:border-[#0A0A0A] dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white transition-colors"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-[#0A0A0A] dark:text-white"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-[#737373] hover:text-[#0A0A0A] dark:text-neutral-400 dark:hover:text-white transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] pl-4 pr-10 py-2.5 text-sm text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:border-[#0A0A0A] dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Option */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs font-medium text-[#737373] dark:text-neutral-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-xs border-[#E5E5E5] dark:border-[#262626] text-[#0A0A0A] dark:text-white focus:ring-[#0A0A0A] dark:focus:ring-white accent-[#0A0A0A] dark:accent-white"
                />
                <span>Remember this device (30 days)</span>
              </label>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full justify-center py-2.5"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in to Dashboard"}
          </Button>
        </form>

        {/* New user banner & Register Link */}
        <div className="mt-8 pt-6 border-t border-[#E5E5E5] dark:border-[#262626] space-y-3">
          <div className="p-3.5 bg-[#F9F9F9] dark:bg-[#151515] border border-[#EBEBEB] dark:border-[#262626] rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#0A0A0A] dark:text-white">New to ABCD Agency?</p>
              <p className="text-[11px] text-[#737373] dark:text-neutral-400">Register your company to collaborate.</p>
            </div>
            <Link
              href="/register"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Register
            </Link>
          </div>

          {/* Contact Direct Link */}
          <div className="flex items-center justify-between px-1 text-xs">
            <span className="text-[#737373] dark:text-neutral-400">Need direct assistance?</span>
            <Link
              href="/contact"
              className="font-medium text-[#0A0A0A] dark:text-white underline hover:opacity-80 flex items-center gap-1"
            >
              <PhoneCall className="w-3 h-3" />
              Contact Our Team
            </Link>
          </div>
        </div>
      </Card>

      {/* OTP Verification Modal */}
      {otpState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#262626] rounded-2xl shadow-2xl p-6 space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0A0A0A] dark:text-white">Verify Your Account</h3>
              <p className="text-xs text-[#737373] dark:text-neutral-400 mt-1">
                Enter the 6-digit verification code sent to <span className="font-semibold text-[#0A0A0A] dark:text-white">{otpState.email}</span>.
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input
                type="text"
                maxLength={6}
                autoFocus
                required
                value={otpState.otpValue}
                onChange={(e) => setOtpState((prev) => ({ ...prev, otpValue: e.target.value.replace(/[^0-9]/g, "") }))}
                placeholder="000000"
                className="block w-full text-center tracking-[0.5em] font-mono text-2xl py-3 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] dark:focus:ring-white"
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full justify-center py-2.5"
                disabled={isVerifyingOtp}
              >
                {isVerifyingOtp ? "Verifying..." : "Verify & Sign In"}
              </Button>
            </form>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setOtpState((prev) => ({ ...prev, isOpen: false }))}
                className="text-xs text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md mx-auto h-96 flex items-center justify-center text-xs text-[#737373]">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
