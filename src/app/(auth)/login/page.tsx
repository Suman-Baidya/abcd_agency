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
      const target = safeCallbackUrl || res.redirectTo || "/admin";
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
