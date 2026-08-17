"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";

interface FormData {
  name: string;
  email: string;
  projectType: string;
  budget: string;
  message: string;
}

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    projectType: "web-app",
    budget: "$5k - $15k",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");

    // Simulate reliable submission
    setTimeout(() => {
      setStatus("success");
    }, 600);
  };

  if (status === "success") {
    return (
      <div className="rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#111111] p-8 sm:p-12 text-center animate-in fade-in duration-200">
        <div className="w-12 h-12 rounded-full bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] flex items-center justify-center mx-auto mb-6">
          <svg className="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold tracking-tight text-[#0A0A0A] dark:text-white mb-2">
          Message Received
        </h3>
        <p className="text-sm text-[#737373] dark:text-neutral-400 max-w-md mx-auto mb-8 leading-relaxed">
          Thank you, <span className="font-semibold text-[#0A0A0A] dark:text-white">{formData.name}</span>. Our technical leads will review your project requirements and respond within 24 hours.
        </p>
        <Button
          variant="secondary"
          size="md"
          onClick={() => {
            setFormData({
              name: "",
              email: "",
              projectType: "web-app",
              budget: "$5k - $15k",
              message: "",
            });
            setStatus("idle");
          }}
        >
          Submit Another Request
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Name */}
        <div className="space-y-2">
          <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-[#0A0A0A] dark:text-neutral-300">
            Your Name <span className="text-[#737373] dark:text-neutral-400">*</span>
          </label>
          <input
            id="name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Alex Sharma"
            className="w-full min-h-[44px] px-4 text-sm rounded-md border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] text-[#0A0A0A] dark:text-white placeholder-[#737373] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-white"
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-[#0A0A0A] dark:text-neutral-300">
            Work Email <span className="text-[#737373] dark:text-neutral-400">*</span>
          </label>
          <input
            id="email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="alex@company.com"
            className="w-full min-h-[44px] px-4 text-sm rounded-md border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] text-[#0A0A0A] dark:text-white placeholder-[#737373] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Project Type */}
        <div className="space-y-2">
          <label htmlFor="projectType" className="block text-xs font-semibold uppercase tracking-wider text-[#0A0A0A] dark:text-neutral-300">
            Project Type
          </label>
          <select
            id="projectType"
            value={formData.projectType}
            onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
            className="w-full min-h-[44px] px-4 text-sm rounded-md border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] text-[#0A0A0A] dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-white"
          >
            <option value="web-app">Web &amp; SaaS Development</option>
            <option value="digitalization">Business Digitalization / ERP</option>
            <option value="ui-ux">UI/UX &amp; Design Systems</option>
            <option value="ai-integration">AI Integration &amp; Automation</option>
            <option value="other">Other / Custom Architecture</option>
          </select>
        </div>

        {/* Budget */}
        <div className="space-y-2">
          <label htmlFor="budget" className="block text-xs font-semibold uppercase tracking-wider text-[#0A0A0A] dark:text-neutral-300">
            Estimated Budget
          </label>
          <select
            id="budget"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
            className="w-full min-h-[44px] px-4 text-sm rounded-md border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] text-[#0A0A0A] dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-white"
          >
            <option value="< $5k">&lt; $5,000 (Sprint / MVP)</option>
            <option value="$5k - $15k">$5,000 – $15,000 (Core Platform)</option>
            <option value="$15k - $30k">$15,000 – $30,000 (Scale &amp; AI)</option>
            <option value="$30k+">$30,000+ (Enterprise Transformation)</option>
          </select>
        </div>
      </div>

      {/* Message */}
      <div className="space-y-2">
        <label htmlFor="message" className="block text-xs font-semibold uppercase tracking-wider text-[#0A0A0A] dark:text-neutral-300">
          Project Overview <span className="text-[#737373] dark:text-neutral-400">*</span>
        </label>
        <textarea
          id="message"
          rows={5}
          required
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="Briefly describe what you're building, key requirements, or existing technical stack..."
          className="w-full p-4 text-sm rounded-md border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] text-[#0A0A0A] dark:text-white placeholder-[#737373] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-white"
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={status === "submitting"}
        className="w-full font-semibold"
      >
        {status === "submitting" ? "Sending Request..." : "Submit Project Inquiry"}
      </Button>

      <p className="text-[11px] text-[#737373] dark:text-neutral-400 text-center">
        Strict mutual NDA guaranteed. We respect your privacy.
      </p>
    </form>
  );
}
