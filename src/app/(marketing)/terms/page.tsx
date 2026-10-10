import React from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { FileCheck, Calendar, ShieldCheck } from "lucide-react";
import { getSiteConfig } from "@/lib/dbConfig";

export const metadata = {
  title: "Terms of Service — ABCD Digital Hub",
  description: "Our mutual terms of service, intellectual property ownership guarantees, and professional engineering engagement standards.",
};

const DEFAULT_TERMS_CONTENT = `## 1. Engagement Scope
All software engineering, design, and consulting engagements conducted by ABCD Digital Hub are governed by formal Statement of Work (SOW) documents outlining explicit deliverables, milestones, sprint cycles, and acceptance criteria.

## 2. Intellectual Property (IP) Ownership
Upon receipt of full payment for agreed milestones, 100% of all intellectual property, source code, database architectures, and graphical assets created specifically for the client are irrevocably transferred to the client.

## 3. Warranty & Code Quality
We deliver code in compliance with modern production standards (strict TypeScript, unit and integration tests, automated CI/CD). Fixed-scope projects include a 30-day post-launch warranty for bug fixes relating to agreed specifications.

## 4. Payment Terms & Milestone Invoicing
Invoices are issued on a milestone or sprint basis as defined in the project scope. Payments are due within 14 calendar days of milestone verification.

## 5. Mutual Confidentiality
Both parties agree to protect and maintain the confidentiality of all proprietary technical, financial, and strategic information exchanged throughout the lifecycle of the engagement.

## 6. Inquiries
For legal and contractual questions, reach out directly to legal@abcddigitalhub.com.`;

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

export default async function TermsPage() {
  const siteConfig = await getSiteConfig();
  const effectiveDate = siteConfig.termsOfServiceEffectiveDate || "August 2026";
  const content = siteConfig.termsOfServiceContent || DEFAULT_TERMS_CONTENT;

  return (
    <div className="bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white transition-colors duration-200">
      <PageHeader
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Terms of Service", href: "/terms" },
        ]}
        title="Terms of Service"
        description="Our mutual terms of service, intellectual property ownership guarantees, and professional engineering engagement standards."
        icon={<FileCheck className="w-32 h-32" />}
      />

      <div className="py-16 sm:py-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Effective Date & IP Guarantee Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 mb-10 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111]">
          <div className="flex items-center gap-2 text-xs text-[#737373] dark:text-neutral-400">
            <Calendar className="w-3.5 h-3.5 text-[#0A0A0A] dark:text-white" />
            <span>Effective Date: <strong className="text-[#0A0A0A] dark:text-white font-medium">{effectiveDate}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#737373] dark:text-neutral-400">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0A0A0A] dark:text-white" />
            <span>100% IP Transfer On Settlement</span>
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
