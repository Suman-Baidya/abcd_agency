"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate short network delay
    setTimeout(() => {
      setIsSubmitted(true);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">
          Reset Password
        </h1>
        <p className="mt-2 text-sm text-[#737373] dark:text-neutral-400">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <Card variant="default" className="p-6 sm:p-8">
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
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
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#0A0A0A] dark:text-white">Check your email</h2>
            <p className="text-sm text-[#737373] dark:text-neutral-400">
              We&apos;ve sent a password reset link to <span className="font-semibold">{email}</span>.
            </p>
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
