"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { 
  updatePrivacyPolicySettings,
  updateTermsOfServiceSettings,
  updateRefundPolicySettings,
  updateCookiePolicySettings,
  toggleLegalPageVisibility
} from "./actions";
import toast from "react-hot-toast";
import { 
  FileText, 
  ExternalLink, 
  Calendar,
  Lock,
  ChevronDown,
  Cookie,
  CreditCard
} from "lucide-react";

const DEFAULT_PRIVACY_POLICY = `## 1. Overview & Commitment
ABCD Agency ("we," "our," or "us") is committed to protecting client confidential data, codebase integrity, and personal information. We strictly limit data collection to what is strictly necessary to deliver high-quality software engineering and consulting services.

## 2. Information We Collect
When you submit an inquiry or partner with us, we may collect:
- Contact details (name, work email, phone number, company name).
- Project requirements, architectural specifications, and budget ranges.
- Operational and telemetry data necessary for deployment support.

## 3. Mutual NDA & Code Confidentiality
All proprietary project information, algorithms, credentials, and business logic shared with ABCD Agency are treated with strict confidentiality under enforceable mutual Non-Disclosure Agreements (NDAs). We never share, sell, or disclose client source code to third parties.

## 4. Security & Data Storage
All databases, media assets, and codebase repositories utilize industry-standard TLS 1.3 encryption in transit and AES-256 at rest. Access is strictly role-gated to authorized engineering staff.

## 5. Contact Us
For privacy-related inquiries or data deletion requests, contact our data protection team directly at privacy@abcdagency.com.`;

const DEFAULT_TERMS_OF_SERVICE = `## 1. Engagement Scope
All software engineering, design, and consulting engagements conducted by ABCD Agency are governed by formal Statement of Work (SOW) documents outlining explicit deliverables, milestones, sprint cycles, and acceptance criteria.

## 2. Intellectual Property (IP) Ownership
Upon receipt of full payment for agreed milestones, 100% of all intellectual property, source code, database architectures, and graphical assets created specifically for the client are irrevocably transferred to the client.

## 3. Warranty & Code Quality
We deliver code in compliance with modern production standards (strict TypeScript, unit and integration tests, automated CI/CD). Fixed-scope projects include a 30-day post-launch warranty for bug fixes relating to agreed specifications.

## 4. Payment Terms & Milestone Invoicing
Invoices are issued on a milestone or sprint basis as defined in the project scope. Payments are due within 14 calendar days of milestone verification.

## 5. Mutual Confidentiality
Both parties agree to protect and maintain the confidentiality of all proprietary technical, financial, and strategic information exchanged throughout the lifecycle of the engagement.

## 6. Inquiries
For legal and contractual questions, reach out directly to legal@abcdagency.com.`;

const DEFAULT_REFUND_POLICY = `## 1. Milestone Settlement Model
All engineering and consulting services provided by ABCD Agency follow milestone-based deliverable sign-offs. Payments made for verified sprint milestones are non-refundable once approved and deployed.

## 2. Deposit & Cancellation
Initial deposits covering sprint sprint preparation and discovery architecture may be refunded up to 70% if cancellation occurs prior to development kickoff.

## 3. Defect Remediation Warranty
Fixed-scope engagements include a 30-day warranty. In the event of code deviations from the agreed SOW, our team remediates issues with maximum priority without additional charge.`;

const DEFAULT_COOKIE_POLICY = `## 1. Essential Cookies Only
ABCD Agency strictly utilizes functional and session cookies required for authentication, user session persistence, and portal navigation.

## 2. No Third-Party Tracking
We do not sell personal browsing behavior or telemetry to third-party ad networks. Analytics are aggregated and anonymized strictly to measure platform performance.`;

export function LegalTabContent({ initialConfig }: { initialConfig: any }) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    privacy: false,
    terms: false,
    refund: false,
    cookies: false,
  });

  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // State: Privacy Policy
  const [enablePrivacy, setEnablePrivacy] = useState<boolean>(
    initialConfig.enablePrivacyPolicy !== false
  );
  const [privacyDate, setPrivacyDate] = useState<string>(
    initialConfig.privacyPolicyEffectiveDate || "August 2026"
  );
  const [privacyContent, setPrivacyContent] = useState<string>(
    initialConfig.privacyPolicyContent || DEFAULT_PRIVACY_POLICY
  );

  // State: Terms of Service
  const [enableTerms, setEnableTerms] = useState<boolean>(
    initialConfig.enableTermsOfService !== false
  );
  const [termsDate, setTermsDate] = useState<string>(
    initialConfig.termsOfServiceEffectiveDate || "August 2026"
  );
  const [termsContent, setTermsContent] = useState<string>(
    initialConfig.termsOfServiceContent || DEFAULT_TERMS_OF_SERVICE
  );

  // State: Refund Policy
  const [enableRefund, setEnableRefund] = useState<boolean>(
    !!initialConfig.enableRefundPolicy
  );
  const [refundDate, setRefundDate] = useState<string>(
    initialConfig.refundPolicyEffectiveDate || "August 2026"
  );
  const [refundContent, setRefundContent] = useState<string>(
    initialConfig.refundPolicyContent || DEFAULT_REFUND_POLICY
  );

  // State: Cookie Policy
  const [enableCookie, setEnableCookie] = useState<boolean>(
    !!initialConfig.enableCookiePolicy
  );
  const [cookieDate, setCookieDate] = useState<string>(
    initialConfig.cookiePolicyEffectiveDate || "August 2026"
  );
  const [cookieContent, setCookieContent] = useState<string>(
    initialConfig.cookiePolicyContent || DEFAULT_COOKIE_POLICY
  );

  // Atomic Visibility Toggle Handler
  const handleToggleVisibility = async (
    page: "privacy" | "terms" | "refund" | "cookies",
    currentVal: boolean,
    setter: (val: boolean) => void,
    title: string
  ) => {
    if (isUpdating) return;
    const newVal = !currentVal;
    setter(newVal);
    setIsUpdating(page);

    try {
      await toggleLegalPageVisibility(page, newVal);
      toast.success(
        newVal 
          ? `${title} is now ACTIVE (visible in footer)` 
          : `${title} is now INACTIVE (hidden from footer)`
      );
    } catch (err: any) {
      setter(currentVal); // revert on failure
      toast.error(`Failed to update ${title} visibility: ${err?.message || "Server error"}`);
    } finally {
      setIsUpdating(null);
    }
  };

  // Content Save Handlers (Saves text, timing, and clauses)
  const handleSavePrivacyContent = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const formData = new FormData();
    formData.append("enablePrivacyPolicy", enablePrivacy ? "true" : "false");
    formData.append("privacyPolicyEffectiveDate", privacyDate);
    formData.append("privacyPolicyContent", privacyContent);

    const promise = updatePrivacyPolicySettings(formData);
    toast.promise(promise, {
      loading: "Saving Privacy Policy content...",
      success: "Privacy Policy content and effective date saved!",
      error: "Failed to update privacy policy.",
    });
  };

  const handleSaveTermsContent = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const formData = new FormData();
    formData.append("enableTermsOfService", enableTerms ? "true" : "false");
    formData.append("termsOfServiceEffectiveDate", termsDate);
    formData.append("termsOfServiceContent", termsContent);

    const promise = updateTermsOfServiceSettings(formData);
    toast.promise(promise, {
      loading: "Saving Terms of Service content...",
      success: "Terms of Service content and effective date saved!",
      error: "Failed to update terms of service.",
    });
  };

  const handleSaveRefundContent = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const formData = new FormData();
    formData.append("enableRefundPolicy", enableRefund ? "true" : "false");
    formData.append("refundPolicyEffectiveDate", refundDate);
    formData.append("refundPolicyContent", refundContent);

    const promise = updateRefundPolicySettings(formData);
    toast.promise(promise, {
      loading: "Saving Refund Policy content...",
      success: "Refund Policy content and effective date saved!",
      error: "Failed to update refund policy.",
    });
  };

  const handleSaveCookieContent = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const formData = new FormData();
    formData.append("enableCookiePolicy", enableCookie ? "true" : "false");
    formData.append("cookiePolicyEffectiveDate", cookieDate);
    formData.append("cookiePolicyContent", cookieContent);

    const promise = updateCookiePolicySettings(formData);
    toast.promise(promise, {
      loading: "Saving Cookie Policy content...",
      success: "Cookie Policy content and effective date saved!",
      error: "Failed to update cookie policy.",
    });
  };

  return (
    <div className="space-y-4">
      {/* Section 1: Privacy Policy */}
      <div className="rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] overflow-hidden transition-all duration-300 shadow-sm">
        <div className="w-full flex items-center justify-between p-4 px-5 text-left hover:bg-[#FBFBFB] dark:hover:bg-[#111111] transition-colors">
          <button
            type="button"
            onClick={() => toggleSection("privacy")}
            className="flex items-center gap-4 flex-1 text-left focus-visible:outline-none cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111] flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-bold text-[#0A0A0A] dark:text-white tracking-tight">
                  Privacy Policy
                </h3>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#737373] dark:text-neutral-400">
                  /privacy
                </span>
                {enablePrivacy ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                    Public (Footer Active)
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#737373]">
                    Hidden from Footer
                  </span>
                )}
              </div>
              <p className="text-xs text-[#737373] mt-0.5">
                Client codebase confidentiality, NDA terms, and GDPR/data protection policies.
              </p>
            </div>
          </button>
          <div className="flex items-center gap-4">
            {/* Direct Switch Button (No synthetic event bubbling) */}
            <button
              type="button"
              role="switch"
              aria-checked={enablePrivacy}
              disabled={isUpdating === "privacy"}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleVisibility("privacy", enablePrivacy, setEnablePrivacy, "Privacy Policy");
              }}
              className="flex items-center gap-2 cursor-pointer focus-visible:outline-none p-1.5 -m-1.5 rounded-lg hover:bg-[#F0F0F0] dark:hover:bg-[#1A1A1A] transition-colors"
            >
              <span className="text-[11px] text-[#737373] hidden sm:inline select-none">
                {enablePrivacy ? "Enabled" : "Disabled"}
              </span>
              <div className="relative inline-flex items-center shrink-0">
                <div
                  className={`w-8 h-4.5 rounded-full transition-colors ${
                    enablePrivacy ? "bg-[#0A0A0A] dark:bg-white" : "bg-[#E5E5E5] dark:bg-[#262626]"
                  }`}
                >
                  <div
                    className={`absolute top-[2px] left-[2px] w-3.5 h-3.5 rounded-full transition-transform ${
                      enablePrivacy
                        ? "translate-x-3.5 bg-white dark:bg-[#0A0A0A]"
                        : "bg-white dark:bg-[#0A0A0A]"
                    }`}
                  />
                </div>
              </div>
            </button>

            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 text-xs text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white transition-colors"
            >
              <span>Live View</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              type="button"
              onClick={() => toggleSection("privacy")}
              className="p-1 text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white transition-transform duration-300 cursor-pointer"
            >
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expandedSections.privacy ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        {expandedSections.privacy && (
          <div className="p-6 border-t border-[#E5E5E5] dark:border-[#262626] space-y-4 bg-white dark:bg-[#0A0A0A]">
            <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-[#E5E5E5] dark:border-[#262626]">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#737373]" />
                <span className="text-xs text-[#737373] font-medium">Effective Date:</span>
                <input
                  type="text"
                  value={privacyDate}
                  onChange={(e) => setPrivacyDate(e.target.value)}
                  placeholder="e.g. August 2026"
                  className="text-xs px-3 py-1.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-transparent text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white w-36"
                />
              </div>
              <button
                type="button"
                onClick={() => setPrivacyContent(DEFAULT_PRIVACY_POLICY)}
                className="text-xs text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white underline cursor-pointer"
              >
                Reset Template
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0A0A0A] dark:text-white flex items-center justify-between">
                <span>Markdown Clauses &amp; Policy Text</span>
                <span className="text-[10px] text-[#737373] font-normal">Expanded editor for comfortable clause structuring</span>
              </label>
              <textarea
                rows={16}
                value={privacyContent}
                onChange={(e) => setPrivacyContent(e.target.value)}
                className="w-full min-h-[350px] text-xs sm:text-[13px] font-mono p-4 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-transparent text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white leading-relaxed resize-y"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-[#737373]">
                Click below to save changes made to the text content &amp; effective date.
              </span>
              <Button variant="primary" size="sm" type="button" onClick={handleSavePrivacyContent}>
                Save Privacy Policy Content
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Terms of Service */}
      <div className="rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] overflow-hidden transition-all duration-300 shadow-sm">
        <div className="w-full flex items-center justify-between p-4 px-5 text-left hover:bg-[#FBFBFB] dark:hover:bg-[#111111] transition-colors">
          <button
            type="button"
            onClick={() => toggleSection("terms")}
            className="flex items-center gap-4 flex-1 text-left focus-visible:outline-none cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111] flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-bold text-[#0A0A0A] dark:text-white tracking-tight">
                  Terms of Service
                </h3>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#737373] dark:text-neutral-400">
                  /terms
                </span>
                {enableTerms ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                    Public (Footer Active)
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#737373]">
                    Hidden from Footer
                  </span>
                )}
              </div>
              <p className="text-xs text-[#737373] mt-0.5">
                Statement of work engagement terms, 100% intellectual property transfer, and warranty.
              </p>
            </div>
          </button>
          <div className="flex items-center gap-4">
            {/* Direct Switch Button (No synthetic event bubbling) */}
            <button
              type="button"
              role="switch"
              aria-checked={enableTerms}
              disabled={isUpdating === "terms"}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleVisibility("terms", enableTerms, setEnableTerms, "Terms of Service");
              }}
              className="flex items-center gap-2 cursor-pointer focus-visible:outline-none p-1.5 -m-1.5 rounded-lg hover:bg-[#F0F0F0] dark:hover:bg-[#1A1A1A] transition-colors"
            >
              <span className="text-[11px] text-[#737373] hidden sm:inline select-none">
                {enableTerms ? "Enabled" : "Disabled"}
              </span>
              <div className="relative inline-flex items-center shrink-0">
                <div
                  className={`w-8 h-4.5 rounded-full transition-colors ${
                    enableTerms ? "bg-[#0A0A0A] dark:bg-white" : "bg-[#E5E5E5] dark:bg-[#262626]"
                  }`}
                >
                  <div
                    className={`absolute top-[2px] left-[2px] w-3.5 h-3.5 rounded-full transition-transform ${
                      enableTerms
                        ? "translate-x-3.5 bg-white dark:bg-[#0A0A0A]"
                        : "bg-white dark:bg-[#0A0A0A]"
                    }`}
                  />
                </div>
              </div>
            </button>

            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1 text-xs text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white transition-colors"
            >
              <span>Live View</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              type="button"
              onClick={() => toggleSection("terms")}
              className="p-1 text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white transition-transform duration-300 cursor-pointer"
            >
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expandedSections.terms ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        {expandedSections.terms && (
          <div className="p-6 border-t border-[#E5E5E5] dark:border-[#262626] space-y-4 bg-white dark:bg-[#0A0A0A]">
            <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-[#E5E5E5] dark:border-[#262626]">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#737373]" />
                <span className="text-xs text-[#737373] font-medium">Effective Date:</span>
                <input
                  type="text"
                  value={termsDate}
                  onChange={(e) => setTermsDate(e.target.value)}
                  placeholder="e.g. August 2026"
                  className="text-xs px-3 py-1.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-transparent text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white w-36"
                />
              </div>
              <button
                type="button"
                onClick={() => setTermsContent(DEFAULT_TERMS_OF_SERVICE)}
                className="text-xs text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white underline cursor-pointer"
              >
                Reset Template
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0A0A0A] dark:text-white flex items-center justify-between">
                <span>Markdown Clauses &amp; Engagement Terms</span>
                <span className="text-[10px] text-[#737373] font-normal">Expanded editor for comfortable clause structuring</span>
              </label>
              <textarea
                rows={16}
                value={termsContent}
                onChange={(e) => setTermsContent(e.target.value)}
                className="w-full min-h-[350px] text-xs sm:text-[13px] font-mono p-4 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-transparent text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white leading-relaxed resize-y"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-[#737373]">
                Click below to save changes made to the text content &amp; effective date.
              </span>
              <Button variant="primary" size="sm" type="button" onClick={handleSaveTermsContent}>
                Save Terms of Service Content
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Section 3: Refund & Cancellation Policy */}
      <div className="rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] overflow-hidden transition-all duration-300 shadow-sm">
        <div className="w-full flex items-center justify-between p-4 px-5 text-left hover:bg-[#FBFBFB] dark:hover:bg-[#111111] transition-colors">
          <button
            type="button"
            onClick={() => toggleSection("refund")}
            className="flex items-center gap-4 flex-1 text-left focus-visible:outline-none cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111] flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-bold text-[#0A0A0A] dark:text-white tracking-tight">
                  Refund &amp; Cancellation Policy
                </h3>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#737373] dark:text-neutral-400">
                  /refund
                </span>
                {enableRefund ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                    Public (Footer Active)
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#737373]">
                    Hidden from Footer
                  </span>
                )}
              </div>
              <p className="text-xs text-[#737373] mt-0.5">
                Milestone settlement policies, deposit rules, and sprint cancellation guarantees.
              </p>
            </div>
          </button>
          <div className="flex items-center gap-4">
            {/* Direct Switch Button (No synthetic event bubbling) */}
            <button
              type="button"
              role="switch"
              aria-checked={enableRefund}
              disabled={isUpdating === "refund"}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleVisibility("refund", enableRefund, setEnableRefund, "Refund Policy");
              }}
              className="flex items-center gap-2 cursor-pointer focus-visible:outline-none p-1.5 -m-1.5 rounded-lg hover:bg-[#F0F0F0] dark:hover:bg-[#1A1A1A] transition-colors"
            >
              <span className="text-[11px] text-[#737373] hidden sm:inline select-none">
                {enableRefund ? "Enabled" : "Disabled"}
              </span>
              <div className="relative inline-flex items-center shrink-0">
                <div
                  className={`w-8 h-4.5 rounded-full transition-colors ${
                    enableRefund ? "bg-[#0A0A0A] dark:bg-white" : "bg-[#E5E5E5] dark:bg-[#262626]"
                  }`}
                >
                  <div
                    className={`absolute top-[2px] left-[2px] w-3.5 h-3.5 rounded-full transition-transform ${
                      enableRefund
                        ? "translate-x-3.5 bg-white dark:bg-[#0A0A0A]"
                        : "bg-white dark:bg-[#0A0A0A]"
                    }`}
                  />
                </div>
              </div>
            </button>

            {enableRefund && (
              <a
                href="/refund"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1 text-xs text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white transition-colors"
              >
                <span>Live View</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <button
              type="button"
              onClick={() => toggleSection("refund")}
              className="p-1 text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white transition-transform duration-300 cursor-pointer"
            >
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expandedSections.refund ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        {expandedSections.refund && (
          <div className="p-6 border-t border-[#E5E5E5] dark:border-[#262626] space-y-4 bg-white dark:bg-[#0A0A0A]">
            <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-[#E5E5E5] dark:border-[#262626]">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#737373]" />
                <span className="text-xs text-[#737373] font-medium">Effective Date:</span>
                <input
                  type="text"
                  value={refundDate}
                  onChange={(e) => setRefundDate(e.target.value)}
                  placeholder="e.g. August 2026"
                  className="text-xs px-3 py-1.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-transparent text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white w-36"
                />
              </div>
              <button
                type="button"
                onClick={() => setRefundContent(DEFAULT_REFUND_POLICY)}
                className="text-xs text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white underline cursor-pointer"
              >
                Reset Template
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0A0A0A] dark:text-white flex items-center justify-between">
                <span>Markdown Clauses &amp; Policy Text</span>
                <span className="text-[10px] text-[#737373] font-normal">Expanded editor for comfortable clause structuring</span>
              </label>
              <textarea
                rows={14}
                value={refundContent}
                onChange={(e) => setRefundContent(e.target.value)}
                className="w-full min-h-[300px] text-xs sm:text-[13px] font-mono p-4 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-transparent text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white leading-relaxed resize-y"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-[#737373]">
                Click below to save changes made to the text content &amp; effective date.
              </span>
              <Button variant="primary" size="sm" type="button" onClick={handleSaveRefundContent}>
                Save Refund Policy Content
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Section 4: Cookie Policy */}
      <div className="rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] overflow-hidden transition-all duration-300 shadow-sm">
        <div className="w-full flex items-center justify-between p-4 px-5 text-left hover:bg-[#FBFBFB] dark:hover:bg-[#111111] transition-colors">
          <button
            type="button"
            onClick={() => toggleSection("cookies")}
            className="flex items-center gap-4 flex-1 text-left focus-visible:outline-none cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111] flex items-center justify-center shrink-0">
              <Cookie className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[15px] font-bold text-[#0A0A0A] dark:text-white tracking-tight">
                  Cookie Policy &amp; Telemetry
                </h3>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#737373] dark:text-neutral-400">
                  /cookies
                </span>
                {enableCookie ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                    Public (Footer Active)
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#737373]">
                    Hidden from Footer
                  </span>
                )}
              </div>
              <p className="text-xs text-[#737373] mt-0.5">
                Essential cookie usage definitions, telemetry anonymization, and GDPR compliance.
              </p>
            </div>
          </button>
          <div className="flex items-center gap-4">
            {/* Direct Switch Button (No synthetic event bubbling) */}
            <button
              type="button"
              role="switch"
              aria-checked={enableCookie}
              disabled={isUpdating === "cookies"}
              onClick={(e) => {
                e.stopPropagation();
                handleToggleVisibility("cookies", enableCookie, setEnableCookie, "Cookie Policy");
              }}
              className="flex items-center gap-2 cursor-pointer focus-visible:outline-none p-1.5 -m-1.5 rounded-lg hover:bg-[#F0F0F0] dark:hover:bg-[#1A1A1A] transition-colors"
            >
              <span className="text-[11px] text-[#737373] hidden sm:inline select-none">
                {enableCookie ? "Enabled" : "Disabled"}
              </span>
              <div className="relative inline-flex items-center shrink-0">
                <div
                  className={`w-8 h-4.5 rounded-full transition-colors ${
                    enableCookie ? "bg-[#0A0A0A] dark:bg-white" : "bg-[#E5E5E5] dark:bg-[#262626]"
                  }`}
                >
                  <div
                    className={`absolute top-[2px] left-[2px] w-3.5 h-3.5 rounded-full transition-transform ${
                      enableCookie
                        ? "translate-x-3.5 bg-white dark:bg-[#0A0A0A]"
                        : "bg-white dark:bg-[#0A0A0A]"
                    }`}
                  />
                </div>
              </div>
            </button>

            {enableCookie && (
              <a
                href="/cookies"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1 text-xs text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white transition-colors"
              >
                <span>Live View</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <button
              type="button"
              onClick={() => toggleSection("cookies")}
              className="p-1 text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white transition-transform duration-300 cursor-pointer"
            >
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${expandedSections.cookies ? "rotate-180" : ""}`} />
            </button>
          </div>
        </div>

        {expandedSections.cookies && (
          <div className="p-6 border-t border-[#E5E5E5] dark:border-[#262626] space-y-4 bg-white dark:bg-[#0A0A0A]">
            <div className="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-[#E5E5E5] dark:border-[#262626]">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-[#737373]" />
                <span className="text-xs text-[#737373] font-medium">Effective Date:</span>
                <input
                  type="text"
                  value={cookieDate}
                  onChange={(e) => setCookieDate(e.target.value)}
                  placeholder="e.g. August 2026"
                  className="text-xs px-3 py-1.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-transparent text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white w-36"
                />
              </div>
              <button
                type="button"
                onClick={() => setCookieContent(DEFAULT_COOKIE_POLICY)}
                className="text-xs text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white underline cursor-pointer"
              >
                Reset Template
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0A0A0A] dark:text-white flex items-center justify-between">
                <span>Markdown Clauses &amp; Policy Text</span>
                <span className="text-[10px] text-[#737373] font-normal">Expanded editor for comfortable clause structuring</span>
              </label>
              <textarea
                rows={14}
                value={cookieContent}
                onChange={(e) => setCookieContent(e.target.value)}
                className="w-full min-h-[300px] text-xs sm:text-[13px] font-mono p-4 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-transparent text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white leading-relaxed resize-y"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-[#737373]">
                Click below to save changes made to the text content &amp; effective date.
              </span>
              <Button variant="primary" size="sm" type="button" onClick={handleSaveCookieContent}>
                Save Cookie Policy Content
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
