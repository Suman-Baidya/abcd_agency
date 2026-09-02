import React from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Shield, Calendar, Lock } from "lucide-react";
import { getSiteConfig } from "@/lib/dbConfig";

export const metadata = {
  title: "Privacy Policy — ABCD Agency",
  description: "Our data governance, client codebase confidentiality, and privacy compliance standards for all software engineering and consulting engagements.",
};

const DEFAULT_PRIVACY_CONTENT = `## 1. Overview & Commitment
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

function renderLegalBody(content: string) {
  const sections = content.split(/(?=^##\s+)/m).filter(Boolean);

  return sections.map((sec, idx) => {
    const lines = sec.trim().split("\n");
    const headingLine = lines[0].startsWith("##") ? lines[0].replace(/^##\s+/, "") : null;
    const bodyLines = headingLine ? lines.slice(1) : lines;

    return (
      <section key={idx} className="space-y-3">
        {headingLine && (
          <h2 className="text-base font-bold text-[#0A0A0A] dark:text-white tracking-tight">
            {headingLine}
          </h2>
        )}
        <div className="space-y-2 text-sm text-[#262626] dark:text-neutral-300 leading-relaxed">
          {bodyLines.map((line, lIdx) => {
            const trimmed = line.trim();
            if (!trimmed) return null;
            if (trimmed.startsWith("- ")) {
              return (
                <div key={lIdx} className="flex items-start gap-2 pl-2 text-[#737373] dark:text-neutral-400">
                  <span className="text-[#0A0A0A] dark:text-white shrink-0 leading-5">•</span>
                  <span>{trimmed.replace(/^- \s*/, "")}</span>
                </div>
              );
            }
            return <p key={lIdx}>{trimmed}</p>;
          })}
        </div>
      </section>
    );
  });
}

export default async function PrivacyPage() {
  const siteConfig = await getSiteConfig();
  const effectiveDate = siteConfig.privacyPolicyEffectiveDate || "August 2026";
  const content = siteConfig.privacyPolicyContent || DEFAULT_PRIVACY_CONTENT;

  return (
    <div className="bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white transition-colors duration-200">
      <PageHeader
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Privacy Policy", href: "/privacy" },
        ]}
        title="Privacy Policy"
        description="Our data governance, client codebase confidentiality, and privacy compliance standards for all software and consulting engagements."
        icon={<Shield className="w-32 h-32" />}
      />

      <div className="py-16 sm:py-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Effective Date & Security Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 mb-10 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111]">
          <div className="flex items-center gap-2 text-xs text-[#737373] dark:text-neutral-400">
            <Calendar className="w-3.5 h-3.5 text-[#0A0A0A] dark:text-white" />
            <span>Effective Date: <strong className="text-[#0A0A0A] dark:text-white font-medium">{effectiveDate}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#737373] dark:text-neutral-400">
            <Lock className="w-3.5 h-3.5 text-[#0A0A0A] dark:text-white" />
            <span>Encrypted &amp; Confidential</span>
          </div>
        </div>

        {/* Dynamic Body */}
        <div className="space-y-8">
          {renderLegalBody(content)}
        </div>
      </div>
    </div>
  );
}
