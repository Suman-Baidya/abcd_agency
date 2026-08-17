"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate short network delay
    setTimeout(() => {
      if (email === "suman.baidya.pro@gmail.com" && password === "Suman2002") {
        router.push("/admin");
      } else {
        setError("Invalid email or password.");
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="w-full max-w-md w-full">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-[#737373] dark:text-neutral-400">
          Enter your credentials to access the portal.
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
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] px-4 py-2.5 text-sm text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:border-[#0A0A0A] dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full justify-center py-2.5"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#E5E5E5] dark:border-[#262626]">
          <p className="text-center text-xs text-[#737373] dark:text-neutral-400">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-[#0A0A0A] dark:hover:text-white">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-[#0A0A0A] dark:hover:text-white">
              Privacy Policy
            </Link>.
          </p>
        </div>
      </Card>
    </div>
  );
}
