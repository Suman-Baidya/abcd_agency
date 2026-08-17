import React from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { TechStack } from "@/components/marketing/TechStack";
import { Testimonials } from "@/components/marketing/Testimonials";
import { CTASection } from "@/components/marketing/CTASection";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "About ABCD Agency — Engineering Philosophy & Team",
  description:
    "Learn about ABCD Agency, our engineering standards, founder story, and how we build mission-critical software for fast-growing businesses.",
};

const values = [
  {
    number: "01",
    title: "Radical Engineering Transparency",
    description:
      "No smoke and mirrors. You get direct access to our repositories, PRs, and senior engineers in daily async threads.",
  },
  {
    number: "02",
    title: "Zero Bloat & Peak Speed",
    description:
      "We avoid unnecessary dependencies and bloated frameworks. We build lean Next.js systems engineered for sub-second responses.",
  },
  {
    number: "03",
    title: "Production-First Architecture",
    description:
      "We don't build throwaway prototypes. Every line of code includes type safety, error boundaries, telemetry, and automated tests.",
  },
  {
    number: "04",
    title: "100% IP & Asset Ownership",
    description:
      "You own every commit, design file, and database schema from day one. Zero vendor lock-in or proprietary licensing traps.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white transition-colors duration-200">
      {/* Hero Header */}
      <PageHeader
        subtitle="About ABCD Agency"
        title="We build systems that scale, not just websites that look good."
        description="Founded on the principles of transparent engineering and zero bloat, ABCD Agency is a collective of senior developers building production-ready architectures."
      />

      {/* Founder Story & Mission */}
      <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <p className="text-xs font-mono uppercase tracking-widest text-[#737373] dark:text-neutral-400">
              The Mission
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">
              Bridging the gap between ambitious vision and robust software.
            </h2>
            <p className="text-sm sm:text-base text-[#737373] dark:text-neutral-400 leading-relaxed">
              Traditional agencies move too slow and charge excessive retainers. Freelancers often lack full-stack architecture discipline. ABCD Agency sits in the sweet spot: the agility of an elite product squad with the rigorous standards of enterprise engineering.
            </p>
            <p className="text-sm sm:text-base text-[#737373] dark:text-neutral-400 leading-relaxed">
              Whether architecting a nationwide student verification ERP or deploying low-latency AI inference pipelines, we focus relentlessly on business outcomes and code longevity.
            </p>
            <div className="pt-4">
              <Button href="/contact" variant="primary" size="md">
                Talk with our Technical Lead
              </Button>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#111111] p-8 sm:p-10 space-y-6">
              <h3 className="text-lg font-bold text-[#0A0A0A] dark:text-white tracking-tight">
                Our Operating Metrics
              </h3>
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-[#E5E5E5] dark:border-[#262626]">
                <div>
                  <p className="text-3xl sm:text-4xl font-extrabold text-[#0A0A0A] dark:text-white tracking-tight">
                    2–4 wks
                  </p>
                  <p className="text-xs text-[#737373] dark:text-neutral-400 mt-1">Average MVP Sprint</p>
                </div>
                <div>
                  <p className="text-3xl sm:text-4xl font-extrabold text-[#0A0A0A] dark:text-white tracking-tight">
                    100%
                  </p>
                  <p className="text-xs text-[#737373] dark:text-neutral-400 mt-1">TypeScript Strict Mode</p>
                </div>
                <div>
                  <p className="text-3xl sm:text-4xl font-extrabold text-[#0A0A0A] dark:text-white tracking-tight">
                    50+
                  </p>
                  <p className="text-xs text-[#737373] dark:text-neutral-400 mt-1">Centers Powered</p>
                </div>
                <div>
                  <p className="text-3xl sm:text-4xl font-extrabold text-[#0A0A0A] dark:text-white tracking-tight">
                    99.98%
                  </p>
                  <p className="text-xs text-[#737373] dark:text-neutral-400 mt-1">Uptime Record</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 md:py-28 bg-[#FBFBFB] dark:bg-[#111111] border-y border-[#E5E5E5] dark:border-[#262626]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mb-16">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400 mb-3">
              Our Principles
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">
              Standards we never compromise on.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((v) => (
              <div
                key={v.number}
                className="p-8 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#161616] shadow-xs"
              >
                <span className="text-3xl font-extrabold text-neutral-300 dark:text-neutral-700 font-mono mb-4 block">
                  {v.number}
                </span>
                <h3 className="text-lg font-bold text-[#0A0A0A] dark:text-white tracking-tight mb-2">
                  {v.title}
                </h3>
                <p className="text-sm text-[#737373] dark:text-neutral-400 leading-relaxed">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Production Tech Stack */}
      <TechStack />

      {/* Testimonials */}
      <Testimonials />

      {/* Closing CTA */}
      <CTASection />
    </div>
  );
}
