import React from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SectionHeader } from "@/components/ui/SectionHeader";

interface PricingTier {
  name: string;
  tagline: string;
  price: string;
  cadence: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  featured?: boolean;
}

const tiers: PricingTier[] = [
  {
    name: "Fixed-Scope Sprint",
    tagline: "Ideal for MVPs, landing systems, and well-defined feature rollouts.",
    price: "Custom Scope",
    cadence: "flat project fee",
    features: [
      "Complete architecture specification",
      "Full-stack Next.js 15 & Prisma build",
      "UI/UX Figma design included",
      "Automated CI/CD & testing setup",
      "30-day post-launch warranty",
    ],
    ctaLabel: "Get a Fixed Quote",
    ctaHref: "/contact?tier=sprint",
    featured: false,
  },
  {
    name: "Growth Retainer",
    tagline: "Dedicated monthly engineering capacity for scaling software products.",
    price: "Monthly Retainer",
    cadence: "bi-weekly sprint cycles",
    features: [
      "Dedicated senior full-stack engineers",
      "Unlimited sprint requests (one at a time)",
      "Direct Slack & async communications",
      "Real-time code reviews & deployments",
      "Zero lock-in — pause or cancel anytime",
    ],
    ctaLabel: "Start Dedicated Sprint",
    ctaHref: "/contact?tier=retainer",
    featured: true,
  },
  {
    name: "Enterprise Consulting",
    tagline: "End-to-end digital transformation, legacy migration, & AI workflows.",
    price: "Tailored Architecture",
    cadence: "milestone-based SLA",
    features: [
      "Full internal ERP / portal architecture",
      "Proprietary AI & LLM pipeline engineering",
      "Enterprise security & role-based access",
      "Dedicated technical lead & architect",
      "24/7 priority SLA & maintenance",
    ],
    ctaLabel: "Book Architecture Review",
    ctaHref: "/contact?tier=enterprise",
    featured: false,
  },
];

export function Pricing() {
  return (
    <section className="py-20 md:py-32 bg-[#FBFBFB] dark:bg-[#111111] border-y border-[#E5E5E5] dark:border-[#262626] transition-colors duration-200" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-16">
          <SectionHeader
            subtitle="Transparent Engagement Models"
            title="Predictable investment, maximum velocity."
            description="Choose the engagement structure that aligns with your product goals. No hidden fees, full IP ownership."
            align="center"
          />
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {tiers.map((tier) => {
            if (tier.featured) {
              return (
                <div
                  key={tier.name}
                  className="rounded-xl p-8 bg-[#0A0A0A] dark:bg-[#161616] text-white border border-[#262626] dark:border-[#383838] shadow-xl flex flex-col justify-between relative lg:-translate-y-2"
                >
                  {/* Recommended Pill */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono uppercase tracking-widest text-[#737373] dark:text-neutral-400">
                      Most Popular
                    </span>
                    <Badge variant="dark" size="sm">
                      Recommended
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold tracking-tight text-white mb-2">
                      {tier.name}
                    </h3>
                    <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
                      {tier.tagline}
                    </p>

                    <div className="pb-6 mb-6 border-b border-[#262626] dark:border-[#333333]">
                      <span className="text-3xl font-extrabold text-white tracking-tight">
                        {tier.price}
                      </span>
                      <p className="text-xs text-neutral-400 mt-1">{tier.cadence}</p>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {tier.features.map((feat) => (
                        <li
                          key={feat}
                          className="text-xs text-neutral-200 flex items-start gap-2.5"
                        >
                          <svg
                            className="w-4 h-4 stroke-white flex-shrink-0 mt-0.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2.5"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    href={tier.ctaHref}
                    variant="white"
                    size="lg"
                    className="w-full text-center font-semibold"
                  >
                    {tier.ctaLabel}
                  </Button>
                </div>
              );
            }

            return (
              <div
                key={tier.name}
                className="rounded-xl p-8 bg-white dark:bg-[#161616] text-[#0A0A0A] dark:text-white border border-[#E5E5E5] dark:border-[#262626] shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono uppercase tracking-widest text-[#737373] dark:text-neutral-400">
                      Engagement
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold tracking-tight text-[#0A0A0A] dark:text-white mb-2">
                    {tier.name}
                  </h3>
                  <p className="text-xs text-[#737373] dark:text-neutral-400 mb-6 leading-relaxed">
                    {tier.tagline}
                  </p>

                  <div className="pb-6 mb-6 border-b border-[#E5E5E5] dark:border-[#262626]">
                    <span className="text-3xl font-extrabold text-[#0A0A0A] dark:text-white tracking-tight">
                      {tier.price}
                    </span>
                    <p className="text-xs text-[#737373] dark:text-neutral-400 mt-1">{tier.cadence}</p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feat) => (
                      <li
                        key={feat}
                        className="text-xs text-[#262626] dark:text-neutral-200 flex items-start gap-2.5"
                      >
                        <svg
                          className="w-4 h-4 stroke-[#0A0A0A] dark:stroke-white flex-shrink-0 mt-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2.5"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  href={tier.ctaHref}
                  variant="primary"
                  size="lg"
                  className="w-full text-center"
                >
                  {tier.ctaLabel}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
