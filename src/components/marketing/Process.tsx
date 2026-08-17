import React from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";

interface StepItem {
  number: string;
  title: string;
  description: string;
  tag: string;
}

const steps: StepItem[] = [
  {
    number: "01",
    title: "Discover & Scope",
    description:
      "We unpack your business requirements, analyze technical constraints, and define an exact roadmap and architecture spec.",
    tag: "Days 1–3",
  },
  {
    number: "02",
    title: "Design & Prototype",
    description:
      "We craft interactive, high-fidelity UI systems in Figma focused on user conversion, performance, and accessibility.",
    tag: "Week 1",
  },
  {
    number: "03",
    title: "Full-Stack Build",
    description:
      "We develop clean, type-safe Next.js code with rigorous automated testing, database migrations, and CI/CD pipelines.",
    tag: "Weeks 2–3",
  },
  {
    number: "04",
    title: "Launch & Iterate",
    description:
      "We handle zero-downtime production deployment, telemetry setup, client onboarding, and ongoing performance optimization.",
    tag: "Week 4+",
  },
];

export function Process() {
  return (
    <section className="py-20 md:py-32 bg-[#FBFBFB] dark:bg-[#111111] border-y border-[#E5E5E5] dark:border-[#262626] transition-colors duration-200" id="process">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-16 sm:mb-20">
          <SectionHeader
            subtitle="Execution Framework"
            title="Transparent, sprint-based delivery."
            description="No endless meetings or opaque progress. We operate in rapid bi-weekly sprints with clear deliverables and daily async updates."
            align="left"
          />
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Desktop connecting line */}
          <div
            className="hidden lg:block absolute top-12 left-0 right-0 h-[1px] bg-[#E5E5E5] dark:bg-[#262626] z-0"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 relative z-10">
            {steps.map((step) => (
              <div
                key={step.number}
                className="relative flex flex-col bg-white dark:bg-[#161616] lg:bg-transparent lg:dark:bg-transparent p-6 lg:p-0 rounded-xl lg:rounded-none border border-[#E5E5E5] dark:border-[#262626] lg:border-none shadow-xs lg:shadow-none"
              >
                {/* Step indicator */}
                <div className="flex items-center justify-between mb-6">
                  <span className="text-4xl sm:text-5xl font-extrabold text-neutral-300 dark:text-neutral-700 tracking-tighter select-none">
                    {step.number}
                  </span>
                  <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded bg-[#F5F5F5] dark:bg-[#222222] border border-[#E5E5E5] dark:border-[#333333] text-[#0A0A0A] dark:text-neutral-200">
                    {step.tag}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#0A0A0A] dark:text-white tracking-tight mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-[#737373] dark:text-neutral-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
