"use client";

import React, { useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FaqAccordion } from "@/components/ui/FaqAccordion";

const faqData = {
  "How We Build": [
    {
      q: "What technologies do you specialize in?",
      a: "We specialize in modern web architectures. Our core stack includes Next.js (App Router), TypeScript, Tailwind CSS, Prisma, and serverless databases like Neon PostgreSQL. We also integrate AI via Vercel AI SDK and Google Gemini.",
    },
    {
      q: "Can you integrate with our existing legacy systems?",
      a: "Absolutely. We specialize in building secure microservices and modern APIs that wrap around legacy infrastructure, ensuring a seamless modernization process without business disruption.",
    },
    {
      q: "Do you provide UI/UX design services as well?",
      a: "Yes, we offer comprehensive UI/UX design. Our design system approach ensures that what we design is precisely what we engineer, maintaining the highest quality standards and perfect black & white aesthetics.",
    },
    {
      q: "How do you handle code ownership and intellectual property?",
      a: "You own 100% of the code and intellectual property upon project completion. We provide full source code handoffs, deployment keys, and documentation.",
    },
    {
      q: "What is your approach to application security?",
      a: "We implement secure-by-default architectures, utilizing encrypted databases, role-based access controls, strict API rate limiting, and standard OAuth patterns to protect your data.",
    },
  ],
  "Costs & Plans": [
    {
      q: "How do you handle project pricing?",
      a: "We offer both fixed-price project engagements for clearly scoped builds, and dedicated retainer models for ongoing product development. Our priority is transparency—no hidden fees, just predictable engineering velocity.",
    },
    {
      q: "What is included in your retainer models?",
      a: "Our retainers include a dedicated number of engineering hours per month, prioritized bug fixes, infrastructure monitoring, and continuous feature development aligned with your roadmap.",
    },
    {
      q: "Are there any hidden fees or ongoing server costs?",
      a: "No hidden fees. We architect using modern serverless platforms (like Vercel and Neon) which have generous free tiers. If your scale requires paid tiers, you pay the hosting provider directly at cost.",
    },
    {
      q: "Do you require a deposit to start work?",
      a: "Yes, we typically structure projects with a 30-50% mobilization deposit, with the remaining balance tied to specific, verifiable delivery milestones.",
    },
    {
      q: "What happens if the project scope changes mid-development?",
      a: "We use an agile approach. If requirements change, we discuss the impact on the timeline and budget, and issue a formal change order before proceeding with the new scope.",
    },
  ],
  "Delivery & Help": [
    {
      q: "What is your typical project timeline?",
      a: "For MVP builds and initial product launches, our standard sprint is 2-4 weeks. Larger enterprise transformations and complex SaaS architectures can take 2-3 months. We provide clear milestone deliverables throughout the process.",
    },
    {
      q: "Do you provide ongoing maintenance and support?",
      a: "Yes. Post-launch, we offer flexible Service Level Agreements (SLAs) ranging from standard bug fixes to 24/7 dedicated infrastructure monitoring and feature iteration.",
    },
    {
      q: "How do we communicate during the project?",
      a: "We set up a shared Slack or Discord channel for daily communication, and hold weekly video stand-ups to review progress, demonstrate features, and unblock any dependencies.",
    },
    {
      q: "What happens if there are bugs after launch?",
      a: "All our fixed-price projects come with a standard 30-day warranty period where critical bugs are fixed free of charge. For long-term peace of mind, we recommend our maintenance SLAs.",
    },
    {
      q: "Do you handle the hosting deployment?",
      a: "Yes, end-to-end deployment is included. We handle Vercel, AWS, or custom VPS setups, ensuring your application is live, optimized, and connected to your custom domain before handoff.",
    },
  ]
};

type TabId = keyof typeof faqData;

export function FAQSection() {
  const [activeTab, setActiveTab] = useState<TabId>("How We Build");
  const tabs: TabId[] = ["How We Build", "Costs & Plans", "Delivery & Help"];

  return (
    <section className="py-20 md:py-32 bg-white dark:bg-[#0A0A0A] border-t border-[#E5E5E5] dark:border-[#262626] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <SectionHeader
            subtitle="Common Questions"
            title="Everything you need to know."
            align="center"
          />
        </div>
        
        <div className="w-full flex flex-col items-center">
          
          {/* Tabs Navigation */}
          <div className="flex w-full overflow-x-auto border-b border-[#E5E5E5] dark:border-[#262626] mb-10 pb-px gap-8 sm:gap-16 justify-start sm:justify-center">
            {tabs.map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative pb-4 text-sm font-semibold transition-colors duration-200 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A0A0A] dark:focus-visible:ring-white rounded-t-sm ${
                    isActive 
                      ? "text-[#0A0A0A] dark:text-white" 
                      : "text-[#737373] dark:text-[#A3A3A3] hover:text-[#0A0A0A] dark:hover:text-white"
                  }`}
                >
                  {tab}
                  {/* Active underline */}
                  {isActive && (
                    <span className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#0A0A0A] dark:bg-white rounded-t-sm" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="w-full max-w-5xl" key={activeTab}>
            <FaqAccordion items={faqData[activeTab]} />
          </div>

        </div>
      </div>
    </section>
  );
}
