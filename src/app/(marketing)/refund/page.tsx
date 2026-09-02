import React from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { CreditCard, Calendar, ShieldCheck } from "lucide-react";
import { getSiteConfig } from "@/lib/dbConfig";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Refund & Cancellation Policy — ABCD Agency",
  description: "Our milestone settlement framework, deposit guidelines, and sprint cancellation remediation terms.",
};

const DEFAULT_REFUND_CONTENT = `## 1. Milestone Settlement Model
All engineering and consulting services provided by ABCD Agency follow milestone-based deliverable sign-offs. Payments made for verified sprint milestones are non-refundable once approved and deployed.

## 2. Deposit & Cancellation
Initial deposits covering sprint preparation and discovery architecture may be refunded up to 70% if cancellation occurs prior to development kickoff.

## 3. Defect Remediation Warranty
Fixed-scope engagements include a 30-day warranty. In the event of code deviations from the agreed SOW, our team remediates issues with maximum priority without additional charge.`;

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

export default async function RefundPage() {
  const siteConfig = await getSiteConfig();
  
  if (!siteConfig.enableRefundPolicy) {
    notFound();
  }

  const effectiveDate = siteConfig.refundPolicyEffectiveDate || "August 2026";
  const content = siteConfig.refundPolicyContent || DEFAULT_REFUND_CONTENT;

  return (
    <div className="bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white transition-colors duration-200">
      <PageHeader
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Refund Policy", href: "/refund" },
        ]}
        title="Refund Policy"
        description="Our milestone settlement framework, deposit guidelines, and sprint cancellation remediation terms."
        icon={<CreditCard className="w-32 h-32" />}
      />

      <div className="py-16 sm:py-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Effective Date & Guarantee Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 mb-10 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111]">
          <div className="flex items-center gap-2 text-xs text-[#737373] dark:text-neutral-400">
            <Calendar className="w-3.5 h-3.5 text-[#0A0A0A] dark:text-white" />
            <span>Effective Date: <strong className="text-[#0A0A0A] dark:text-white font-medium">{effectiveDate}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#737373] dark:text-neutral-400">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0A0A0A] dark:text-white" />
            <span>30-Day Defect Remediation Warranty</span>
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
