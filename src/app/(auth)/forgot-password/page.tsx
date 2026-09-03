"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { requestPasswordReset } from "./actions";
import { toast } from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [devResetLink, setDevResetLink] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await requestPasswordReset(email);
      if (!res.success) {
        setError(res.error || "Failed to process request.");
        toast.error(res.error || "Request failed.");
        setIsLoading(false);
        return;
      }

      setIsSubmitted(true);
      if (res.devResetUrl) {
        setDevResetLink(res.devResetUrl);
      }
      toast.success("Password reset link dispatched.");
    } catch {
      setError("An unexpected error occurred. Please try again.");
      toast.error("Network error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">
          Reset Password
        </h1>
        <p className="mt-2 text-sm text-[#737373] dark:text-neutral-400">
          Enter your email address and we&apos;ll send you a secure recovery link.
        </p>
      </div>

      <Card variant="default" className="p-6 sm:p-8">
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-md">
                {error}
              </div>
            )}

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

            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center py-2.5"
              disabled={isLoading}
            >
              {isLoading ? "Sending link..." : "Send reset link"}
            </Button>
          </form>
        ) : (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-800">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#0A0A0A] dark:text-white">Check your email</h2>
            <p className="text-sm text-[#737373] dark:text-neutral-400 leading-relaxed">
              We&apos;ve sent a password reset link to <span className="font-semibold text-[#0A0A0A] dark:text-white">{email}</span>. The link is valid for 60 minutes.
            </p>

            {devResetLink && (
              <div className="mt-4 p-3.5 bg-[#F9F9F9] dark:bg-[#151515] border border-[#E5E5E5] dark:border-[#262626] rounded-lg text-left">
                <p className="text-[11px] font-mono font-bold text-[#0A0A0A] dark:text-white uppercase tracking-wider mb-1">
                  Local Dev Reset Link:
                </p>
                <Link
                  href={devResetLink}
                  className="text-xs text-blue-600 dark:text-blue-400 underline break-all font-mono"
                >
                  Click here to proceed to reset password &rarr;
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-[#E5E5E5] dark:border-[#262626] text-center">
          <Link
            href="/login"
            className="text-sm font-semibold text-[#737373] hover:text-[#0A0A0A] dark:text-neutral-400 dark:hover:text-white transition-colors"
          >
            &larr; Back to login
          </Link>
        </div>
      </Card>
    </div>
  );
}
