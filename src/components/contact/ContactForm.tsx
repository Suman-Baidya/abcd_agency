"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { submitInquiry } from "@/app/(marketing)/contact/actions";
import { contactFormSchema, type ContactFormData } from "@/lib/validations/contact";
import { toast } from "react-hot-toast";

const availableServices = [
  "Website Development",
  "Web Application Development",
  "UI/UX Design",
  "Meta Ads",
  "Google Ads",
  "SEO",
  "AI Automation",
  "WhatsApp Automation",
  "Custom Software",
  "Other",
];

const businessTypes = [
  "Startup",
  "Small Business",
  "Educational Institute",
  "Enterprise / Organization",
  "Other",
];

/* ─── input class helper ─── */
const inputCls = (hasError?: boolean) =>
  `w-full min-h-[44px] px-4 text-sm rounded-md border transition-colors bg-white dark:bg-[#111111] text-[#0A0A0A] dark:text-white placeholder-[#A3A3A3] focus-visible:outline-none focus-visible:ring-2 ${
    hasError
      ? "border-red-400 dark:border-red-500 focus-visible:ring-red-400"
      : "border-[#E5E5E5] dark:border-[#262626] focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-white"
  }`;

/* ─── Field shell ─── */
function Field({
  label,
  required,
  error,
  children,
  className = "",
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="block text-xs font-semibold uppercase tracking-wider text-[#0A0A0A] dark:text-neutral-300">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
          <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

/* ─── Phone Input ─── */
function PhoneInput({ id, hasError, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }) {
  return (
    <div className="relative">
      <span className="absolute left-0 top-0 h-full flex items-center px-3 text-sm font-semibold text-[#737373] dark:text-neutral-400 border-r border-[#E5E5E5] dark:border-[#262626] pointer-events-none select-none">
        +91
      </span>
      <input
        id={id}
        type="tel"
        placeholder="98765 43210"
        className={`${inputCls(hasError)} pl-[3.75rem]`}
        {...rest}
      />
    </div>
  );
}

/* ─── Custom Single Select Dropdown ─── */
function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select…",
  hasError,
}: {
  options: string[];
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  hasError?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full min-h-[44px] flex items-center justify-between px-4 text-sm rounded-md border transition-colors bg-white dark:bg-[#111111] focus-visible:outline-none focus-visible:ring-2 ${
          hasError
            ? "border-red-400 dark:border-red-500 focus-visible:ring-red-400"
            : "border-[#E5E5E5] dark:border-[#262626] focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-white"
        } ${value ? "text-[#0A0A0A] dark:text-white" : "text-[#A3A3A3]"}`}
      >
        <span>{value || placeholder}</span>
        <svg
          className={`w-4 h-4 text-[#737373] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] shadow-lg py-1 animate-in fade-in slide-in-from-top-1 duration-100">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-colors ${
                value === opt
                  ? "text-[#0A0A0A] dark:text-white font-semibold"
                  : "text-[#737373] dark:text-neutral-400"
              }`}
            >
              <span className={`w-4 h-4 rounded-sm border flex-shrink-0 flex items-center justify-center ${
                value === opt
                  ? "bg-[#0A0A0A] dark:bg-white border-[#0A0A0A] dark:border-white"
                  : "border-[#E5E5E5] dark:border-[#333333]"
              }`}>
                {value === opt && (
                  <svg className="w-2.5 h-2.5 text-white dark:text-[#0A0A0A]" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </span>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Custom Multi Select Dropdown ─── */
function MultiSelect({
  options,
  value,
  onChange,
  hasError,
}: {
  options: string[];
  value: string[];
  onChange: (val: string[]) => void;
  hasError?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (opt: string) => {
    const s = new Set(value);
    s.has(opt) ? s.delete(opt) : s.add(opt);
    onChange(Array.from(s));
  };

  const displayText =
    value.length === 0
      ? "Select services…"
      : value.length === 1
      ? value[0]
      : `${value[0]} +${value.length - 1} more`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full min-h-[44px] flex items-center justify-between px-4 text-sm rounded-md border transition-colors bg-white dark:bg-[#111111] focus-visible:outline-none focus-visible:ring-2 ${
          hasError
            ? "border-red-400 dark:border-red-500 focus-visible:ring-red-400"
            : "border-[#E5E5E5] dark:border-[#262626] focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-white"
        } ${value.length > 0 ? "text-[#0A0A0A] dark:text-white" : "text-[#A3A3A3]"}`}
      >
        <span className="truncate">{displayText}</span>
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {value.length > 0 && (
            <span className="text-[10px] font-bold bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] rounded-full px-1.5 py-0.5">
              {value.length}
            </span>
          )}
          <svg
            className={`w-4 h-4 text-[#737373] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] shadow-lg py-1 animate-in fade-in slide-in-from-top-1 duration-100 max-h-64 overflow-y-auto">
          {options.map((opt) => {
            const active = value.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => toggle(opt)}
                className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] transition-colors"
              >
                <span className={`w-4 h-4 rounded-sm border flex-shrink-0 flex items-center justify-center transition-colors ${
                  active
                    ? "bg-[#0A0A0A] dark:bg-white border-[#0A0A0A] dark:border-white"
                    : "border-[#D4D4D4] dark:border-[#333333]"
                }`}>
                  {active && (
                    <svg className="w-2.5 h-2.5 text-white dark:text-[#0A0A0A]" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                <span className={active ? "text-[#0A0A0A] dark:text-white font-medium" : "text-[#737373] dark:text-neutral-400"}>
                  {opt}
                </span>
              </button>
            );
          })}
          {value.length > 0 && (
            <div className="border-t border-[#F0F0F0] dark:border-[#1E1E1E] mt-1 pt-1 px-3 pb-1">
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs text-[#737373] hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════
   Main Form
════════════════════════════════════════════════ */
export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      isWhatsappSame: true,
      services: [],
      businessType: "",
      projectType: "web-dev",
      budget: "₹5k - ₹15k",
    },
  });

  const isWhatsappSame = watch("isWhatsappSame");
  const selectedServices = watch("services") || [];
  const selectedBusiness = watch("businessType");
  const nameValue = watch("name");

  const onSubmit = async (data: ContactFormData) => {
    setStatus("submitting");
    try {
      const res = await submitInquiry(data);
      if (res.success) {
        setStatus("success");
      } else {
        setStatus("error");
        setSubmitMessage(res.error || "Something went wrong.");
        toast.error("Failed to submit inquiry.");
      }
    } catch {
      setStatus("error");
      setSubmitMessage("An unexpected error occurred.");
      toast.error("Failed to submit inquiry.");
    }
  };

  /* ─── Success ─── */
  if (status === "success") {
    return (
      <div className="rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#111111] p-8 sm:p-12 text-center animate-in fade-in duration-200">
        <div className="w-12 h-12 rounded-full bg-[#0A0A0A] dark:bg-white flex items-center justify-center mx-auto mb-6">
          <svg className="w-6 h-6 text-white dark:text-[#0A0A0A]" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold tracking-tight text-[#0A0A0A] dark:text-white mb-2">Message Received</h3>
        <p className="text-sm text-[#737373] dark:text-neutral-400 max-w-md mx-auto mb-8 leading-relaxed">
          Thank you, <span className="font-semibold text-[#0A0A0A] dark:text-white">{nameValue}</span>. Our technical leads will respond within 24 hours.
        </p>
        <Button variant="secondary" size="md" onClick={() => { reset(); setStatus("idle"); }}>
          Submit Another Request
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-10">

      {status === "error" && (
        <div className="p-4 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium border border-red-200 dark:border-red-900/50">
          {submitMessage}
        </div>
      )}

      {/* ══════════════ SECTION 1 ══════════════ */}
      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] text-[10px] font-bold flex items-center justify-center">1</span>
          <h4 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A] dark:text-white">Contact Details</h4>
          <div className="flex-1 h-px bg-[#E5E5E5] dark:bg-[#262626]" />
        </div>

        {/* Name + Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Full Name" required error={errors.name?.message}>
            <input
              id="name"
              type="text"
              {...register("name")}
              placeholder="e.g. Arjun Sharma"
              className={inputCls(!!errors.name)}
            />
          </Field>
          <Field label="Work Email" required error={errors.email?.message}>
            <input
              id="email"
              type="email"
              {...register("email")}
              placeholder="arjun@company.com"
              className={inputCls(!!errors.email)}
            />
          </Field>
        </div>

        {/* Mobile (left) | WhatsApp toggle→input (right) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Left: Mobile */}
          <Field label="Mobile Number" required error={errors.mobile?.message}>
            <PhoneInput
              id="mobile"
              hasError={!!errors.mobile}
              {...register("mobile")}
            />
          </Field>

          {/* Right: WhatsApp — morphs between checkbox label and input */}
          <div className="space-y-1.5">
            {isWhatsappSame ? (
              /* Checkbox mode */
              <>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#0A0A0A] dark:text-neutral-300 opacity-0 select-none pointer-events-none">
                  WhatsApp
                </label>
                <label className="flex items-center gap-3 min-h-[44px] px-4 rounded-md border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] cursor-pointer group transition-colors hover:border-[#0A0A0A] dark:hover:border-neutral-400">
                  <div className="relative flex-shrink-0">
                    <input
                      type="checkbox"
                      {...register("isWhatsappSame")}
                      className="peer sr-only"
                    />
                    <div className="w-4 h-4 rounded border-2 border-[#D4D4D4] dark:border-[#444444] peer-checked:bg-[#0A0A0A] peer-checked:border-[#0A0A0A] dark:peer-checked:bg-white dark:peer-checked:border-white transition-colors" />
                    <svg className="absolute inset-0 w-4 h-4 text-white dark:text-[#0A0A0A] opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <span className="text-sm text-[#737373] dark:text-neutral-400 group-hover:text-[#0A0A0A] dark:group-hover:text-white transition-colors">
                    WhatsApp number is the same as Mobile
                  </span>
                </label>
              </>
            ) : (
              /* Input mode — label + phone input */
              <Field label="WhatsApp Number" required error={errors.whatsapp?.message}>
                <div className="relative">
                  {/* hidden checkbox to keep RHF state */}
                  <input type="checkbox" {...register("isWhatsappSame")} className="sr-only" />
                  <PhoneInput
                    id="whatsapp"
                    hasError={!!errors.whatsapp}
                    {...register("whatsapp")}
                  />
                  {/* small "same as mobile" link */}
                  <button
                    type="button"
                    onClick={() => setValue("isWhatsappSame", true)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-[#737373] dark:text-neutral-500 hover:text-[#0A0A0A] dark:hover:text-white transition-colors underline underline-offset-2"
                  >
                    Same as mobile
                  </button>
                </div>
              </Field>
            )}
          </div>
        </div>

        {/* Uncheck cue — only shown in checkbox mode */}
        {isWhatsappSame && (
          <p className="text-[11px] text-[#A3A3A3] dark:text-neutral-500 -mt-2">
            Uncheck the box if your WhatsApp number is different.
          </p>
        )}
      </section>

      {/* ══════════════ SECTION 2 ══════════════ */}
      <section className="space-y-5">
        <div className="flex items-center gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] text-[10px] font-bold flex items-center justify-center">2</span>
          <h4 className="text-sm font-bold uppercase tracking-widest text-[#0A0A0A] dark:text-white">Project Overview</h4>
          <div className="flex-1 h-px bg-[#E5E5E5] dark:bg-[#262626]" />
        </div>

        {/* Business Type — custom single-select dropdown */}
        <Field label="Business Type" required error={errors.businessType?.message}>
          <CustomSelect
            options={businessTypes}
            value={selectedBusiness}
            onChange={(val) => setValue("businessType", val, { shouldValidate: true })}
            placeholder="Select your business type…"
            hasError={!!errors.businessType}
          />
          <input type="hidden" {...register("businessType")} />
        </Field>

        {/* Services — multi-select dropdown */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#0A0A0A] dark:text-neutral-300">
            Services Interested In{" "}
            <span className="text-red-500">*</span>
            <span className="ml-2 normal-case font-normal text-[#A3A3A3] dark:text-neutral-500 tracking-normal">
              — you can choose multiple
            </span>
          </label>
          <MultiSelect
            options={availableServices}
            value={selectedServices}
            onChange={(val) => setValue("services", val, { shouldValidate: true })}
            hasError={!!errors.services}
          />
          {errors.services && (
            <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
              <svg className="w-3 h-3 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
              {errors.services.message}
            </p>
          )}
        </div>

        {/* Engagement Type + Budget */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Engagement Type" required>
            <div className="relative">
              <select
                id="projectType"
                {...register("projectType")}
                className="w-full min-h-[44px] px-4 pr-9 text-sm rounded-md border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] text-[#0A0A0A] dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-white transition-colors appearance-none cursor-pointer"
              >
                <option value="web-dev">Custom Web & Software Dev</option>
                <option value="ui-ux">UI/UX & Product Design</option>
                <option value="marketing">Performance Marketing</option>
                <option value="automation">Business Automation & AI</option>
                <option value="other">Other / Custom</option>
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#737373]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>
          </Field>

          <Field label="Estimated Budget" required>
            <div className="relative">
              <select
                id="budget"
                {...register("budget")}
                className="w-full min-h-[44px] px-4 pr-9 text-sm rounded-md border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] text-[#0A0A0A] dark:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-white transition-colors appearance-none cursor-pointer"
              >
                <option value="< ₹5k">&lt; ₹5,000 — Sprint / MVP</option>
                <option value="₹5k - ₹15k">₹5,000 – ₹15,000 — Core Platform</option>
                <option value="₹15k - ₹30k">₹15,000 – ₹30,000 — Scale & AI</option>
                <option value="₹30k+">₹30,000+ — Enterprise</option>
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#737373]">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>
          </Field>
        </div>

        {/* Message */}
        <Field label="Project Description" required error={errors.message?.message}>
          <textarea
            id="message"
            rows={5}
            {...register("message")}
            placeholder="Briefly describe what you're building, key requirements, or existing technical stack…"
            className={`${inputCls(!!errors.message)} py-3 resize-none`}
          />
        </Field>
      </section>

      {/* Submit */}
      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={status === "submitting"}
          className="w-full font-semibold tracking-wide"
        >
          {status === "submitting" ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Sending Request…
            </span>
          ) : "Submit Project Inquiry →"}
        </Button>
        <p className="text-[11px] text-[#A3A3A3] dark:text-neutral-500 text-center mt-3">
          Strict mutual NDA guaranteed. We respect your privacy.
        </p>
      </div>
    </form>
  );
}
