"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { registerUser, verifyOtpCode, resendOtpCode } from "./actions";
import { Building2, User, Mail, Phone, Globe, MapPin, Briefcase, Lock, CheckCircle2, ArrowRight, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isWhatsappSame, setIsWhatsappSame] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    whatsapp: "",
    industry: "",
    location: "",
    website: "",
    password: "",
    confirmPassword: "",
  });

  const [honeypot, setHoneypot] = useState("");

  // OTP Modal State
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
    devOtp: undefined,
  });

  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 1. Honeypot anti-spam
    if (honeypot.trim().length > 0) {
      setError("Registration rejected. Suspicious activity detected.");
      return;
    }

    // 2. Company Name
    if (!formData.companyName.trim() || formData.companyName.trim().length < 2) {
      setError("Please enter a valid Company or Client Name (at least 2 characters).");
      return;
    }

    // 3. Contact Person Full Name (Must have at least 2 words)
    const contactPerson = formData.contactPerson.trim();
    if (!contactPerson) {
      setError("Contact Person name is required.");
      return;
    }
    const nameWords = contactPerson.split(/\s+/).filter((w) => w.length > 0);
    if (nameWords.length < 2) {
      setError("Please provide your full contact name with at least 2 words (e.g. John Doe).");
      return;
    }
    if (nameWords.some((w) => w.length < 2)) {
      setError("Each part of your name must have at least 2 characters.");
      return;
    }
    if (!/^[a-zA-Z\s.'-]+$/.test(contactPerson)) {
      setError("Contact person name can only contain letters, spaces, and hyphens.");
      return;
    }

    // 4. Email validation
    const email = formData.email.trim().toLowerCase();
    if (!email) {
      setError("Email address is required.");
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError("Please provide a valid email address (e.g. name@company.com).");
      return;
    }

    // 5. Phone validation (10 to 15 digits)
    const phoneDigits = formData.phone.replace(/[^0-9]/g, "");
    if (!formData.phone.trim() || phoneDigits.length < 10 || phoneDigits.length > 15) {
      setError("Please enter a valid 10 to 15-digit Phone Number with country code.");
      return;
    }

    // 6. WhatsApp validation (if different from phone)
    if (!isWhatsappSame) {
      const whatsappDigits = formData.whatsapp.replace(/[^0-9]/g, "");
      if (!formData.whatsapp.trim() || whatsappDigits.length < 10 || whatsappDigits.length > 15) {
        setError("Please enter a valid 10 to 15-digit WhatsApp Number.");
        return;
      }
    }

    // 7. Industry validation
    if (!formData.industry.trim() || formData.industry.trim().length < 2) {
      setError("Industry / Domain is required (e.g. FinTech, SaaS, Healthcare, E-Commerce).");
      return;
    }

    // 8. Location validation
    if (!formData.location.trim() || formData.location.trim().length < 3) {
      setError("Location is required (City, Country, e.g. Bangalore, India).");
      return;
    }

    // 9. Password validation
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await registerUser({
        companyName: formData.companyName,
        contactPerson: formData.contactPerson,
        email: formData.email,
        phone: formData.phone,
        isWhatsappSame,
        whatsapp: formData.whatsapp,
        industry: formData.industry,
        location: formData.location,
        website: formData.website,
        password: formData.password,
        honeypot: honeypot,
      });

      if (!res.success) {
        setError(res.error || "Failed to create account.");
        setIsLoading(false);
        return;
      }

      if (res.requiresVerification && res.userId) {
        setIsLoading(false);
        setOtpState({
          isOpen: true,
          userId: res.userId,
          email: res.email || formData.email,
          otpValue: "",
          devOtp: res.devOtp || undefined,
        });
        toast.success("Verification code sent to your email!");
      } else if (res.redirectTo) {
        toast.success("Registration successful! Welcome aboard.");
        router.push(res.redirectTo);
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpState.otpValue || otpState.otpValue.length < 6) {
      toast.error("Please enter the 6-digit verification code.");
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

      toast.success("Email verified! Redirecting to your dashboard...");
      router.push(res.redirectTo || "/portal");
    } catch (err: any) {
      toast.error(err?.message || "Failed to verify.");
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const res = await resendOtpCode(otpState.userId);
      if (res.success) {
        toast.success("A new verification code has been generated.");
        if (res.devOtp) {
          setOtpState((prev) => ({ ...prev, devOtp: res.devOtp }));
        }
      } else {
        toast.error(res.error || "Could not resend code.");
      }
    } catch (e) {
      toast.error("Error resending code.");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-2">
      {/* Header */}
      <div className="text-center mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">
          Create Your Account
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-[#737373] dark:text-neutral-400 max-w-md mx-auto">
          Register to collaborate with our engineering team and access your client portal.
        </p>
      </div>

      <Card variant="default" className="p-6 sm:p-8">
        {error && (
          <div className="mb-6 p-4 text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Honeypot anti-spam trap for bots */}
          <div aria-hidden="true" className="opacity-0 pointer-events-none absolute -left-[9999px] h-0 overflow-hidden">
            <label htmlFor="website_trap_field">Do not fill this</label>
            <input
              id="website_trap_field"
              type="text"
              name="website_trap_field"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          {/* Section 1: Organization & Contact Info */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#737373] dark:text-neutral-400 border-b border-[#E5E5E5] dark:border-[#262626] pb-2 mb-4">
              1. Organization & Contact Info
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
                  Company / Organization Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737373]">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="companyName"
                    required
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="e.g. Acme Innovations Corp"
                    className="block w-full pl-9 pr-3 py-2.5 text-sm rounded-md border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:border-[#0A0A0A] dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
                  Contact Person (Full Name) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737373]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="contactPerson"
                    required
                    value={formData.contactPerson}
                    onChange={handleChange}
                    placeholder="e.g. John Doe (At least 2 words)"
                    className="block w-full pl-9 pr-3 py-2.5 text-sm rounded-md border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:border-[#0A0A0A] dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white transition-colors"
                  />
                </div>
                <span className="text-[10px] text-[#737373] mt-1 block">Full legal name (First & Last name)</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737373]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@company.com"
                    className="block w-full pl-9 pr-3 py-2.5 text-sm rounded-md border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:border-[#0A0A0A] dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white transition-colors"
                  />
                </div>
                <span className="text-[10px] text-[#737373] mt-1 block">Work or personal active email</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737373]">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className="block w-full pl-9 pr-3 py-2.5 text-sm rounded-md border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:border-[#0A0A0A] dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white transition-colors"
                  />
                </div>
                <span className="text-[10px] text-[#737373] mt-1 block">10 to 15 digits with country code</span>
              </div>
            </div>

            {/* WhatsApp Options */}
            <div className="mt-3.5 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isWhatsappSame}
                  onChange={(e) => setIsWhatsappSame(e.target.checked)}
                  className="rounded border-[#E5E5E5] text-[#0A0A0A] focus:ring-[#0A0A0A] dark:border-[#262626] dark:bg-[#111111]"
                />
                <span className="text-xs text-[#737373] dark:text-neutral-300">
                  WhatsApp number is the same as phone number
                </span>
              </label>

              {!isWhatsappSame && (
                <div>
                  <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
                    WhatsApp Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative max-w-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737373]">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      name="whatsapp"
                      required={!isWhatsappSame}
                      value={formData.whatsapp}
                      onChange={handleChange}
                      placeholder="+91 98123 45678"
                      className="block w-full pl-9 pr-3 py-2.5 text-sm rounded-md border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:border-[#0A0A0A] dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white transition-colors"
                    />
                  </div>
                  <span className="text-[10px] text-[#737373] mt-1 block">Dedicated WhatsApp contact for direct updates</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Industry & Business Details */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#737373] dark:text-neutral-400 border-b border-[#E5E5E5] dark:border-[#262626] pb-2 mb-4">
              2. Industry & Business Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
                  Industry / Domain <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737373]">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="industry"
                    required
                    value={formData.industry}
                    onChange={handleChange}
                    placeholder="e.g. FinTech / SaaS"
                    className="block w-full pl-9 pr-3 py-2.5 text-sm rounded-md border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:border-[#0A0A0A] dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white transition-colors"
                  />
                </div>
                <span className="text-[10px] text-[#737373] mt-1 block">Domain or sector</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
                  Location (City, Country) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737373]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="location"
                    required
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Bangalore, India"
                    className="block w-full pl-9 pr-3 py-2.5 text-sm rounded-md border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:border-[#0A0A0A] dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white transition-colors"
                  />
                </div>
                <span className="text-[10px] text-[#737373] mt-1 block">City and country</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
                  Website URL (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737373]">
                    <Globe className="w-4 h-4" />
                  </div>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    className="block w-full pl-9 pr-3 py-2.5 text-sm rounded-md border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:border-[#0A0A0A] dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white transition-colors"
                  />
                </div>
                <span className="text-[10px] text-[#737373] mt-1 block">Online web presence</span>
              </div>
            </div>
          </div>

          {/* Section 3: Credentials */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#737373] dark:text-neutral-400 border-b border-[#E5E5E5] dark:border-[#262626] pb-2 mb-4">
              3. Security & Password
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
                  Set Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737373]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="block w-full pl-9 pr-10 py-2.5 text-sm rounded-md border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:border-[#0A0A0A] dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white transition-colors"
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
                <span className="text-[10px] text-[#737373] mt-1 block">Minimum 6 characters</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#737373]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    required
                    minLength={6}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="block w-full pl-9 pr-10 py-2.5 text-sm rounded-md border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:border-[#0A0A0A] dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white focus:outline-none"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[10px] text-[#737373] mt-1 block">Must match password</span>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full justify-center py-3 text-sm font-semibold cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? "Creating Your Account..." : "Complete Registration & Access Portal"}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#E5E5E5] dark:border-[#262626] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#737373] dark:text-neutral-400">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-[#0A0A0A] dark:text-white underline hover:opacity-80">
              Sign In Here
            </Link>
          </p>
          <p className="text-xs text-[#737373] dark:text-neutral-400">
            Have questions first?{" "}
            <Link href="/contact" className="font-bold text-[#0A0A0A] dark:text-white underline hover:opacity-80">
              Contact Sales
            </Link>
          </p>
        </div>
      </Card>

      {/* OTP Verification Modal (When verification active in admin settings) */}
      {otpState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#262626] rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0A0A0A] dark:text-white">Verify Your Email</h3>
              <p className="text-xs text-[#737373] dark:text-neutral-400 mt-1">
                We sent a 6-digit verification code to <span className="font-semibold text-[#0A0A0A] dark:text-white">{otpState.email}</span>.
              </p>
            </div>

            {otpState.devOtp && (
              <div className="p-3 text-xs bg-[#F5F5F5] dark:bg-[#1A1A1A] border border-[#E5E5E5] dark:border-[#333333] rounded-md text-center">
                <span className="text-[#737373]">Demo/Dev Verification Code:</span>{" "}
                <span className="font-mono font-bold text-[#0A0A0A] dark:text-white tracking-widest">{otpState.devOtp}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white text-center mb-2">
                  Enter 6-Digit OTP Code
                </label>
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
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full justify-center py-2.5"
                disabled={isVerifyingOtp}
              >
                {isVerifyingOtp ? "Verifying..." : "Verify & Open Dashboard"}
              </Button>
            </form>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-[#E5E5E5] dark:border-[#262626]">
              <button
                type="button"
                onClick={handleResendOtp}
                className="text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white underline"
              >
                Resend Code
              </button>
              <button
                type="button"
                onClick={() => setOtpState((prev) => ({ ...prev, isOpen: false }))}
                className="text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
