import React from "react";
import Link from "next/link";
import Image from "next/image";
import { PageHeader } from "@/components/ui/PageHeader";
import { servicesData } from "@/data/services";
import { Badge } from "@/components/ui/Badge";
import { Process } from "@/components/marketing/Process";
import { TechStack } from "@/components/marketing/TechStack";
import { CTASection } from "@/components/marketing/CTASection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Layers } from "lucide-react";

export const metadata = {
  title: "Engineering Services & Capabilities — ABCD Agency",
  description:
    "Explore our full-stack software development services: Web & SaaS development, business digitalization, UI/UX design systems, and AI integration.",
};

export default function ServicesPage() {
  return (
    <div className="bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white transition-colors duration-200">
      {/* Services Hero */}
      <PageHeader
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
        ]}
        title="Agency Services"
        description="From a fast MVP to complex multi-tenant SaaS, we architect and engineer every single layer."
        icon={<Layers className="w-32 h-32" />}
      />

      {/* ── Detailed Services Section ── */}
      <section className="py-16 sm:py-28" id="services-detail">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section header */}
          <div className="mb-16 sm:mb-20">
            <SectionHeader
              subtitle="What We Build"
              title="Four capabilities, zero compromise."
              description="Each service is a self-contained discipline — staffed by specialists, executed with precision, and wired to ship."
              align="left"
            />
          </div>

          {/* Service rows */}
          <div className="divide-y divide-[#E5E5E5] dark:divide-[#262626]">
            {servicesData.map((service, index) => (
              /*
               * The outer wrapper provides the left-padding gap where
               * the accent bar lives — it NEVER overlaps with content.
               */
              <div key={service.slug} className="group relative pl-6">

                {/* Accent bar — confined to the pl-6 gap on the left */}
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-0 h-full w-[3px] rounded-full bg-[#0A0A0A] dark:bg-white scale-y-0 group-hover:scale-y-100 origin-top transition-transform duration-500 ease-out"
                />

                <div className="py-10 sm:py-14 grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-10 lg:gap-20 items-start">

                  {/* ── Left column: index + title + CTA + process steps ── */}
                  <div className="flex flex-col gap-5 lg:sticky lg:top-24">

                    {/* Index number + tag pill — matches Process component style */}
                    <div className="flex items-center gap-3">
                      <span className="text-5xl sm:text-6xl font-extrabold leading-none tracking-tighter text-neutral-200 dark:text-neutral-800 select-none transition-colors duration-300 group-hover:text-[#0A0A0A] dark:group-hover:text-white">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded bg-[#F5F5F5] dark:bg-[#222222] border border-[#E5E5E5] dark:border-[#333333] text-[#0A0A0A] dark:text-neutral-200 shrink-0">
                        Service {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] dark:text-white leading-tight">
                      {service.title}
                    </h2>

                    {/* Short description */}
                    <p className="text-sm text-[#737373] dark:text-neutral-400 leading-relaxed">
                      {service.shortDesc}
                    </p>

                    {/* CTA */}
                    <Link
                      href={`/services/${service.slug}`}
                      className="group/link inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#0A0A0A] dark:text-white border border-[#0A0A0A] dark:border-white px-4 py-2.5 rounded-md w-fit hover:bg-[#0A0A0A] hover:text-white dark:hover:bg-white dark:hover:text-[#0A0A0A] transition-colors duration-200 focus-visible:ring-2 ring-[#0A0A0A] dark:ring-white outline-none"
                    >
                      Explore Service
                      <svg
                        className="w-3.5 h-3.5 stroke-current transition-transform duration-200 group-hover/link:translate-x-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2.5"
                        aria-hidden="true"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </Link>

                    {/* Process steps — fills vertical space with useful context */}
                    <div className="pt-4 border-t border-[#E5E5E5] dark:border-[#262626]">
                      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#737373] dark:text-neutral-500 mb-4">
                        How We Approach It
                      </p>
                      <ol className="relative flex flex-col gap-0">
                        {service.processSteps.map((step, stepIdx) => (
                          <li key={step} className="relative flex gap-3 pb-5 last:pb-0">
                            {/* Connecting line */}
                            {stepIdx < service.processSteps.length - 1 && (
                              <span
                                aria-hidden="true"
                                className="absolute left-[9px] top-5 bottom-0 w-[1px] bg-[#E5E5E5] dark:bg-[#333333]"
                              />
                            )}
                            {/* Step dot */}
                            <span className="mt-[3px] flex-shrink-0 w-[19px] h-[19px] rounded-full border-2 border-[#E5E5E5] dark:border-[#333333] bg-white dark:bg-[#0A0A0A] flex items-center justify-center z-10 group-hover:border-[#0A0A0A] dark:group-hover:border-white transition-colors duration-300">
                              <span className="w-[5px] h-[5px] rounded-full bg-[#737373] dark:bg-neutral-500 group-hover:bg-[#0A0A0A] dark:group-hover:bg-white transition-colors duration-300" />
                            </span>
                            <span className="text-xs font-medium text-[#0A0A0A] dark:text-neutral-300 leading-snug pt-0.5">
                              {step}
                            </span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  {/* ── Right column: image + deliverables + quote + tech ── */}
                  <div className="flex flex-col gap-7">

                    {/* Service image */}
                    <div className="relative h-48 sm:h-56 rounded-xl overflow-hidden border border-[#E5E5E5] dark:border-[#262626]">
                      <Image
                        src={service.image}
                        alt={service.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 66vw"
                        className="object-cover grayscale opacity-70 dark:opacity-50 group-hover:scale-105 group-hover:opacity-90 dark:group-hover:opacity-70 transition-all duration-700 ease-out"
                      />
                      {/* Bottom fade for readability */}
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-t from-white/30 dark:from-[#0A0A0A]/30 to-transparent pointer-events-none"
                      />
                    </div>

                    {/* Deliverables grid */}
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#737373] dark:text-neutral-500 mb-4">
                        What We Deliver
                      </p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                        {service.deliverables.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-2.5 text-sm font-medium text-[#0A0A0A] dark:text-neutral-200"
                          >
                            <span className="mt-[6px] w-[5px] h-[5px] shrink-0 rounded-full border border-[#0A0A0A] dark:border-neutral-400" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Hero description — blockquote style */}
                    <p className="text-sm text-[#737373] dark:text-neutral-400 leading-relaxed border-l-2 border-[#E5E5E5] dark:border-[#333333] pl-4 italic font-sans">
                      {service.heroDesc}
                    </p>

                    {/* Tech tags */}
                    <div className="flex flex-wrap gap-2">
                      {service.technologies.map((tech) => (
                        <Badge key={tech} variant="muted" size="sm">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Execution Process Section */}
      <Process />

      {/* Production Tech Stack */}
      <TechStack />

      {/* Closing CTA */}
      <CTASection />
    </div>
  );
}
