import React from "react";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = {
  title: "Terms of Service — ABCD Agency",
  description: "Terms of Service and engagement conditions at ABCD Agency.",
};

export default function TermsPage() {
  return (
    <div className="bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white transition-colors duration-200">
      <PageHeader
        subtitle="Legal & Compliance"
        title="Terms of Service"
        description="Effective Date: August 2026"
      />

      <div className="py-16 sm:py-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8 text-sm text-[#262626] dark:text-neutral-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#0A0A0A] dark:text-white">1. Engagement Scope</h2>
            <p>
              All software engineering, design, and consulting engagements conducted by ABCD Agency are governed by formal Statement of Work (SOW) documents outlining explicit deliverables, milestones, sprint cycles, and acceptance criteria.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#0A0A0A] dark:text-white">2. Intellectual Property (IP) Ownership</h2>
            <p>
              Upon receipt of full payment for agreed milestones, 100% of all intellectual property, source code, database architectures, and graphical assets created specifically for the client are irrevocably transferred to the client.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#0A0A0A] dark:text-white">3. Warranty &amp; Code Quality</h2>
            <p>
              We deliver code in compliance with modern production standards (strict TypeScript, unit and integration tests, automated CI/CD). Fixed-scope projects include a 30-day post-launch warranty for bug fixes relating to agreed specifications.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#0A0A0A] dark:text-white">4. Inquiries</h2>
            <p>
              For legal and contractual questions, reach out directly to{" "}
              <a href="mailto:legal@abcdagency.com" className="font-semibold underline">
                legal@abcdagency.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
