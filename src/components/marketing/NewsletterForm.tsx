"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setEmail("");
    }
  };

  if (submitted) {
    return (
      <div className="p-3 rounded-md border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#161616] text-xs font-medium text-[#0A0A0A] dark:text-white inline-flex items-center gap-2">
        <svg
          className="w-4 h-4 stroke-[#0A0A0A] dark:stroke-white"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Thank you for subscribing to our engineering insights.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email address"
        required
        aria-label="Email address"
        className="flex-1 min-h-[44px] px-4 text-xs rounded-md border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] text-[#0A0A0A] dark:text-white placeholder-[#737373] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-white"
      />
      <Button type="submit" variant="primary" size="md">
        Subscribe
      </Button>
    </form>
  );
}
