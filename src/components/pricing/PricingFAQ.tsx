import React from "react";

interface FAQItem {
  q: string;
  a: string;
}

const faqs: FAQItem[] = [
  {
    q: "How does billing and invoicing work for the Fixed-Scope Sprint?",
    a: "Fixed sprints are typically split 50% upfront to initiate architectural discovery and 50% upon final production deployment and QA approval.",
  },
  {
    q: "Can we pause or scale down the Growth Retainer?",
    a: "Yes. You can pause or adjust your engineering retainer at any time with a 14-day notice before your next billing cycle.",
  },
  {
    q: "What happens after our software goes live?",
    a: "All fixed projects include a complimentary 30-day bug warranty. We also offer ongoing maintenance retainers for continuous feature iterations.",
  },
  {
    q: "Do you sign NDAs before initial discovery discussions?",
    a: "Yes. We execute mutual Non-Disclosure Agreements (NDAs) prior to reviewing proprietary specs, codebases, or business datasets.",
  },
];

export function PricingFAQ() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400 mb-2">
          Clear Answers
        </p>
        <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">
          Frequently Asked Questions on Pricing &amp; Contracts
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="p-6 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#111111] transition-colors duration-200"
          >
            <h4 className="text-sm font-bold text-[#0A0A0A] dark:text-white mb-2">
              {faq.q}
            </h4>
            <p className="text-xs sm:text-sm text-[#737373] dark:text-neutral-400 leading-relaxed">
              {faq.a}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
