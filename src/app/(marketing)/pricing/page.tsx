import React from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FeatureMatrix } from "@/components/pricing/FeatureMatrix";
import { IndianRupee, Check } from "lucide-react";
import { db } from "@/lib/prisma";

export const metadata = {
  title: "Pricing | ABCD Agency",
  description: "Transparent, flexible pricing for high-converting websites, web apps, and digital marketing services.",
};

export default async function PricingPage() {
  const packages = await db.pricingPackage.findMany({ orderBy: { order: "asc" } });
  const services = await db.pricingService.findMany({ orderBy: { order: "asc" } });

  return (
    <main className="min-h-screen bg-[#FBFBFB] dark:bg-[#0A0A0A]">
      <PageHeader
        title="Pricing & Investment"
        subtitle="Transparent Plans"
        description="Scalable digital solutions tailored for startups, growing businesses, and enterprises."
        icon={<IndianRupee className="w-32 h-32" />}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Pricing" },
        ]}
      />

      {/* Pricing Packages Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-16">
          <SectionHeader
            subtitle="CORE PACKAGES"
            title="Foundational plans for your business."
            description="Choose the package that best fits your growth goals."
            align="left"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {packages.map((pkg, i) => {
            const isMiddle = i === 1;

            // Use dynamic fields from DB, fallback to defaults if empty
            const subHeading = pkg.subHeading || (i === 0 ? "Custom Scope" : i === 1 ? "Monthly Retainer" : "Tailored Architecture");
            const subDesc = pkg.subDesc || (i === 0 ? "flat project fee" : i === 1 ? "bi-weekly sprint cycles" : "milestone-based SLA");
            const ctaLabel = pkg.ctaLabel || (i === 0 ? "Get a Fixed Quote" : i === 1 ? "Start Dedicated Sprint" : "Book Architecture Review");

            // Parse the investment string for better display
            let displayInvestment = pkg.investment;
            let investmentNote = "";

            if (displayInvestment.toLowerCase().includes("(ad spend separate)")) {
              displayInvestment = displayInvestment.replace(/\s*\(ad spend separate\)/i, "").trim();
              investmentNote = "*Ad spend separate";
            }

            if (displayInvestment.includes(" to ")) {
              // "₹80,000 to ₹1,20,000+" -> "₹80,000+"
              displayInvestment = displayInvestment.split(" to ")[0];
            }

            // Standardize trailing Plus
            displayInvestment = displayInvestment.replace(/\+/g, "").trim() + " Plus";

            return (
              <div
                key={pkg.id}
                className={`flex flex-col rounded-2xl border overflow-hidden transition-all duration-300 ${
                  isMiddle
                    ? "bg-[#0A0A0A] dark:bg-[#0A0A0A] border-[#262626] shadow-2xl md:scale-[1.04] z-10"
                    : "bg-white dark:bg-[#111111] border-[#E5E5E5] dark:border-[#262626] shadow-sm hover:shadow-lg"
                }`}
              >
                {/* Header */}
                <div className="p-8 pb-6">
                  {/* Tag */}
                  <div className="flex items-center gap-3 mb-6">
                    <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${
                      isMiddle ? "text-white/40" : "text-[#A3A3A3] dark:text-neutral-500"
                    }`}>
                      {isMiddle ? "Most Popular" : "Engagement"}
                    </span>
                    {isMiddle && (
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white border border-white/20 rounded-full px-3 py-1">
                        Recommended
                      </span>
                    )}
                  </div>

                  {/* Main heading */}
                  <h3 className={`text-[1.6rem] font-extrabold tracking-tight leading-tight mb-2 ${
                    isMiddle ? "text-white" : "text-[#0A0A0A] dark:text-white"
                  }`}>
                    {pkg.name}
                  </h3>

                  {/* Description */}
                  <p className={`text-[13px] leading-relaxed min-h-[42px] ${
                    isMiddle ? "text-white/50" : "text-[#737373] dark:text-neutral-400"
                  }`}>
                    {pkg.targetAudience}
                  </p>
                </div>

                {/* Sub heading block */}
                <div className={`mx-8 pb-6 border-b ${
                  isMiddle ? "border-white/10" : "border-[#E5E5E5] dark:border-[#262626]"
                }`}>
                  <h4 className={`text-[1.4rem] font-extrabold tracking-tight leading-tight ${
                    isMiddle ? "text-white" : "text-[#0A0A0A] dark:text-white"
                  }`}>
                    {subHeading}
                  </h4>
                  <p className={`text-xs mt-1 ${
                    isMiddle ? "text-white/30" : "text-[#A3A3A3] dark:text-neutral-500"
                  }`}>
                    {subDesc}
                  </p>
                </div>

                {/* Features */}
                <div className="px-8 pt-6 flex-1">
                  <ul className="space-y-3.5">
                    {pkg.deliverables.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className={`w-[15px] h-[15px] shrink-0 mt-[3px] ${
                          isMiddle ? "text-white/60" : "text-[#0A0A0A] dark:text-white"
                        }`} strokeWidth={2.5} />
                        <span className={`text-[13px] leading-relaxed ${
                          isMiddle ? "text-white/60" : "text-[#737373] dark:text-neutral-300"
                        }`}>
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Investment + CTA */}
                <div className="p-8">
                  {/* Investment */}
                  <div className={`mb-6 pb-6 border-b ${
                    isMiddle ? "border-white/10" : "border-[#E5E5E5] dark:border-[#262626]"
                  }`}>
                    <span className={`text-[10px] font-bold uppercase tracking-[0.15em] block mb-1.5 ${
                      isMiddle ? "text-white/30" : "text-[#A3A3A3] dark:text-neutral-500"
                    }`}>
                      Investment
                    </span>
                    <span className={`text-2xl font-extrabold tracking-tight ${
                      isMiddle ? "text-white" : "text-[#0A0A0A] dark:text-white"
                    }`}>
                      {displayInvestment}
                    </span>
                    <span className={`block text-[11px] mt-1 ${
                      isMiddle ? "text-white/30" : "text-[#A3A3A3] dark:text-neutral-500"
                    }`}>
                      {pkg.support} · {pkg.timeline}
                    </span>
                    {investmentNote && (
                      <span className={`block text-[10px] mt-1 italic font-medium ${
                        isMiddle ? "text-white/40" : "text-[#A3A3A3] dark:text-neutral-500"
                      }`}>
                        {investmentNote}
                      </span>
                    )}
                  </div>

                  {/* Call to Action */}
                  <a
                    href="/contact"
                    className={`block w-full py-3.5 rounded-xl text-center text-sm font-bold tracking-tight transition-all duration-200 ${
                      isMiddle
                        ? "bg-white text-[#0A0A0A] hover:bg-neutral-200"
                        : "bg-[#0A0A0A] text-white hover:bg-[#1a1a1a] dark:bg-white dark:text-[#0A0A0A] dark:hover:bg-neutral-200"
                    }`}
                  >
                    {ctaLabel}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <FeatureMatrix />

      {/* Additional & Retainer Services */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-16">
          <SectionHeader
            subtitle="ONGOING SUPPORT"
            title="Additional & Retainer Services."
            description="Scale your operations and maintain peak performance with our specialized monthly retainers."
            align="left"
          />
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((srv, idx) => (
            <div
              key={srv.id}
              className="group rounded-2xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] p-6 hover:shadow-lg hover:border-[#0A0A0A]/20 dark:hover:border-white/20 transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Left: Name + Scope */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-bold text-[#A3A3A3] dark:text-neutral-500 uppercase tracking-[0.15em] shrink-0">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-[15px] font-bold text-[#0A0A0A] dark:text-white tracking-tight truncate">
                      {srv.name}
                    </h3>
                  </div>
                  <p className="text-[12px] text-[#737373] dark:text-neutral-400 leading-relaxed pl-8">
                    {srv.scope}
                  </p>
                </div>

                {/* Right: Pricing */}
                <div className="flex items-center gap-6 pl-8 sm:pl-0 shrink-0">
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A3A3A3] dark:text-neutral-500 block mb-0.5">Monthly</span>
                    <span className="text-sm font-extrabold text-[#0A0A0A] dark:text-white">{srv.monthlyRetainer}</span>
                  </div>
                  <div className="w-px h-8 bg-[#E5E5E5] dark:bg-[#262626]" />
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A3A3A3] dark:text-neutral-500 block mb-0.5">Yearly</span>
                    <span className="text-sm font-extrabold text-[#0A0A0A] dark:text-white">{srv.yearlyPlan}</span>
                    <span className="block text-[9px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mt-0.5">Save ~2 Months</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
