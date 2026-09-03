"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getOnboardingInitialData, completeOnboardingProfile, type OnboardingFormData } from "./actions";
import { CheckCircle2, Building2, Phone, MapPin, Globe, Briefcase, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

const INDUSTRY_OPTIONS = [
  "E-Commerce & Retail",
  "SaaS & Technology",
  "Finance & Fintech",
  "Healthcare & Life Sciences",
  "Real Estate & Construction",
  "Education & EdTech",
  "Media, Entertainment & Creative",
  "Professional Services & Consulting",
  "Manufacturing & Logistics",
  "Hospitality & Travel",
  "Other",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const [formData, setFormData] = useState<OnboardingFormData>({
    companyName: "",
    phone: "",
    isWhatsappSame: true,
    whatsapp: "",
    industry: "",
    location: "",
    website: "",
  });

  useEffect(() => {
    getOnboardingInitialData().then((data) => {
      if (!data) {
        router.push("/login");
        return;
      }
      setUserName(data.name || "");
      setUserEmail(data.email || "");
      setFormData((prev) => ({
        ...prev,
        companyName: data.companyName || "",
        phone: data.phone || "",
        industry: data.industry || "",
        location: data.location || "",
        website: data.website || "",
        isWhatsappSame: data.isWhatsappSame ?? true,
        whatsapp: data.whatsapp || "",
      }));
      setInitialLoading(false);
    });
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.companyName.trim()) {
      setError("Company or Organization name is required.");
      return;
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 10) {
      setError("Please enter a valid phone number with country code.");
      return;
    }
    if (!formData.industry) {
      setError("Please select your business industry.");
      return;
    }
    if (!formData.location.trim()) {
      setError("Please provide your business location / city.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await completeOnboardingProfile(formData);
      if (!res.success) {
        setError(res.error || "Failed to save profile.");
        toast.error(res.error || "Error saving profile.");
        setIsSubmitting(false);
        return;
      }

      toast.success("Profile completed! Welcome aboard.");
      router.push("/portal");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="w-full max-w-lg mx-auto py-20 text-center">
        <div className="w-8 h-8 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-[#737373] tracking-widest uppercase font-mono">Initializing setup...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto py-6 px-4">
      {/* Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 mb-3">
          <ShieldCheck className="w-3.5 h-3.5" />
          Google Account Verified
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">
          Complete Your Business Profile
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-[#737373] dark:text-neutral-400 max-w-md mx-auto">
          Provide your business details to configure your client workspace.
        </p>
      </div>

      <Card variant="default" className="p-6 sm:p-8">
        {error && (
          <div className="mb-6 p-3.5 text-xs font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Read-Only Verified Google Details */}
          <div className="p-3.5 bg-[#F9F9F9] dark:bg-[#151515] border border-[#E5E5E5] dark:border-[#262626] rounded-md space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#737373]">Account Representative:</span>
              <span className="font-semibold text-[#0A0A0A] dark:text-white">{userName}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#737373]">Verified Email:</span>
              <span className="font-mono text-[#0A0A0A] dark:text-white flex items-center gap-1">
                {userEmail}
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              </span>
            </div>
          </div>

          {/* Company Name */}
          <div>
            <label htmlFor="companyName" className="block text-xs font-bold uppercase tracking-wider text-[#0A0A0A] dark:text-white mb-1.5">
              Company or Brand Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="companyName"
                name="companyName"
                type="text"
                required
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Acme Corp / Brand Studio"
                className="w-full rounded-md border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] pl-10 pr-4 py-2.5 text-sm text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:border-[#0A0A0A] dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white transition-colors"
              />
              <Building2 className="w-4 h-4 text-[#737373] absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Mobile (left) | WhatsApp toggle/input (right) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Left: Mobile Number */}
            <div>
              <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-[#0A0A0A] dark:text-white mb-1.5">
                Primary Phone <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-md border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] pl-10 pr-4 py-2.5 text-sm text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:border-[#0A0A0A] dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white transition-colors"
                />
                <Phone className="w-4 h-4 text-[#737373] absolute left-3.5 top-3" />
              </div>
            </div>

            {/* Right: WhatsApp — morphs between checkbox card and input */}
            <div>
              {formData.isWhatsappSame ? (
                <>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#0A0A0A] dark:text-neutral-300 opacity-0 select-none pointer-events-none mb-1.5">
                    WhatsApp
                  </label>
                  <label className="flex items-center gap-3 min-h-[42px] px-3.5 rounded-md border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] cursor-pointer group transition-colors hover:border-[#0A0A0A] dark:hover:border-neutral-400">
                    <div className="relative flex-shrink-0">
                      <input
                        type="checkbox"
                        checked={formData.isWhatsappSame}
                        onChange={(e) => setFormData((prev) => ({ ...prev, isWhatsappSame: e.target.checked }))}
                        className="peer sr-only"
                      />
                      <div className="w-4 h-4 rounded border-2 border-[#D4D4D4] dark:border-[#444444] peer-checked:bg-[#0A0A0A] peer-checked:border-[#0A0A0A] dark:peer-checked:bg-white dark:peer-checked:border-white transition-colors" />
                      <svg className="absolute inset-0 w-4 h-4 text-white dark:text-[#0A0A0A] opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="text-xs text-[#737373] dark:text-neutral-400 group-hover:text-[#0A0A0A] dark:group-hover:text-white transition-colors select-none">
                      WhatsApp is same as phone
                    </span>
                  </label>
                </>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="whatsapp" className="block text-xs font-bold uppercase tracking-wider text-[#0A0A0A] dark:text-white">
                      WhatsApp Number <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, isWhatsappSame: true }))}
                      className="text-[10px] font-semibold text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white transition-colors underline underline-offset-2"
                    >
                      Same as phone
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="whatsapp"
                      name="whatsapp"
                      type="tel"
                      required
                      value={formData.whatsapp}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-md border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] pl-10 pr-4 py-2.5 text-sm text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:border-[#0A0A0A] dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white transition-colors"
                    />
                    <Phone className="w-4 h-4 text-[#737373] absolute left-3.5 top-3" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {formData.isWhatsappSame && (
            <p className="text-[11px] text-[#A3A3A3] dark:text-neutral-500 -mt-3">
              Uncheck if your WhatsApp number is different from your primary phone.
            </p>
          )}

          {/* Industry & Location (Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="industry" className="block text-xs font-bold uppercase tracking-wider text-[#0A0A0A] dark:text-white mb-1.5">
                Industry <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  id="industry"
                  name="industry"
                  required
                  value={formData.industry}
                  onChange={handleChange}
                  className="w-full rounded-md border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] pl-10 pr-4 py-2.5 text-sm text-[#0A0A0A] dark:text-white focus:border-[#0A0A0A] dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white transition-colors"
                >
                  <option value="">Select industry</option>
                  {INDUSTRY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <Briefcase className="w-4 h-4 text-[#737373] absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-xs font-bold uppercase tracking-wider text-[#0A0A0A] dark:text-white mb-1.5">
                Location (City, Country) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="location"
                  name="location"
                  type="text"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Mumbai, India"
                  className="w-full rounded-md border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] pl-10 pr-4 py-2.5 text-sm text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:border-[#0A0A0A] dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white transition-colors"
                />
                <MapPin className="w-4 h-4 text-[#737373] absolute left-3.5 top-3" />
              </div>
            </div>
          </div>

          {/* Website (Optional) */}
          <div>
            <label htmlFor="website" className="block text-xs font-bold uppercase tracking-wider text-[#0A0A0A] dark:text-white mb-1.5">
              Company Website <span className="text-[#737373] font-normal lowercase">(optional)</span>
            </label>
            <div className="relative">
              <input
                id="website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://yourcompany.com"
                className="w-full rounded-md border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] pl-10 pr-4 py-2.5 text-sm text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:border-[#0A0A0A] dark:focus:border-white focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white transition-colors"
              />
              <Globe className="w-4 h-4 text-[#737373] absolute left-3.5 top-3" />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full justify-center py-3 text-sm font-semibold tracking-wide"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Setting Up Your Workspace..." : "Complete Setup & Launch Portal \u2192"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
