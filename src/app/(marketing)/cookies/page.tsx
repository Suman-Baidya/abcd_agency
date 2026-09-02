import React from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Cookie, Calendar, Lock } from "lucide-react";
import { getSiteConfig } from "@/lib/dbConfig";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Cookie Policy — ABCD Agency",
  description: "Essential telemetry, zero third-party data tracking, and browser session persistence policies.",
};

const DEFAULT_COOKIE_CONTENT = `## 1. Essential Cookies Only
ABCD Agency strictly utilizes functional and session cookies required for authentication, user session persistence, and portal navigation.

## 2. No Third-Party Tracking
We do not sell personal browsing behavior or telemetry to third-party ad networks. Analytics are aggregated and anonymized strictly to measure platform performance.

## 3. Managing Browser Preferences
You may configure your browser settings to reject non-essential cookies at any time without impacting public browsing access.`;

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

export default async function CookiesPage() {
  const siteConfig = await getSiteConfig();
  
  if (!siteConfig.enableCookiePolicy) {
    notFound();
  }

  const effectiveDate = siteConfig.cookiePolicyEffectiveDate || "August 2026";
  const content = siteConfig.cookiePolicyContent || DEFAULT_COOKIE_CONTENT;

  return (
    <div className="bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white transition-colors duration-200">
      <PageHeader
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Cookie Policy", href: "/cookies" },
        ]}
        title="Cookie Policy"
        description="Essential telemetry, zero third-party data tracking, and browser session persistence policies."
        icon={<Cookie className="w-32 h-32" />}
      />

      <div className="py-16 sm:py-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Effective Date & Privacy Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 mb-10 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111]">
          <div className="flex items-center gap-2 text-xs text-[#737373] dark:text-neutral-400">
            <Calendar className="w-3.5 h-3.5 text-[#0A0A0A] dark:text-white" />
            <span>Effective Date: <strong className="text-[#0A0A0A] dark:text-white font-medium">{effectiveDate}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#737373] dark:text-neutral-400">
            <Lock className="w-3.5 h-3.5 text-[#0A0A0A] dark:text-white" />
            <span>Zero Third-Party Ad Tracking</span>
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
