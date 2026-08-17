import React from "react";
import { Pricing } from "@/components/marketing/Pricing";
import { PageHeader } from "@/components/ui/PageHeader";
import { ComparisonTable } from "@/components/pricing/ComparisonTable";
import { PricingFAQ } from "@/components/pricing/PricingFAQ";
import { Testimonials } from "@/components/marketing/Testimonials";
import { CTASection } from "@/components/marketing/CTASection";

export const metadata = {
  title: "Pricing & Engagement Models — ABCD Agency",
  description:
    "Explore transparent pricing models for software development: Fixed-Scope Sprints, Growth Retainers, and Enterprise Consulting.",
};

export default function PricingPage() {
  return (
    <div className="bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white transition-colors duration-200">
      {/* Hero Header */}
      <PageHeader
        subtitle="Investment & Models"
        title="Predictable costs. Senior engineering velocity."
        description="Transparent structures tailored for high-growth startups and established Indian businesses. No hidden overhead, full code transfer."
      />

      {/* Engagement Models Tiers */}
      <Pricing />

      {/* Comparison Matrix */}
      <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ComparisonTable />
      </section>

      {/* Testimonials */}
      <Testimonials />

      {/* Pricing FAQs */}
      <section className="py-20 md:py-28 border-t border-[#E5E5E5] dark:border-[#262626] px-4 sm:px-6 lg:px-8">
        <PricingFAQ />
      </section>

      {/* CTA */}
      <CTASection />
    </div>
  );
}
