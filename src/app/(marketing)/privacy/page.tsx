import React from "react";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata = {
  title: "Privacy Policy — ABCD Agency",
  description: "Privacy Policy and data governance practices at ABCD Agency.",
};

export default function PrivacyPage() {
  return (
    <div className="bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white transition-colors duration-200">
      <PageHeader
        subtitle="Legal & Compliance"
        title="Privacy Policy"
        description="Effective Date: August 2026"
      />

      <div className="py-16 sm:py-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8 text-sm text-[#262626] dark:text-neutral-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#0A0A0A] dark:text-white">1. Overview &amp; Commitment</h2>
            <p>
              ABCD Agency (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is committed to protecting client confidential data, codebase integrity, and personal information. We strictly limit data collection to what is strictly necessary to deliver high-quality software engineering and consulting services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#0A0A0A] dark:text-white">2. Information We Collect</h2>
            <p>
              When you submit an inquiry or partner with us, we may collect:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-[#737373] dark:text-neutral-400">
              <li>Contact details (name, work email, phone number, company name).</li>
              <li>Project requirements, architectural specifications, and budget ranges.</li>
              <li>Operational and telemetry data necessary for deployment support.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#0A0A0A] dark:text-white">3. Mutual NDA &amp; Code Confidentiality</h2>
            <p>
              All proprietary project information, algorithms, credentials, and business logic shared with ABCD Agency are treated with strict confidentiality under enforceable mutual Non-Disclosure Agreements (NDAs). We never share, sell, or disclose client source code to third parties.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#0A0A0A] dark:text-white">4. Contact Us</h2>
            <p>
              For privacy-related inquiries or data deletion requests, contact us at{" "}
              <a href="mailto:privacy@abcdagency.com" className="font-semibold underline">
                privacy@abcdagency.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
