import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { servicesData } from "@/data/services";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CTASection } from "@/components/marketing/CTASection";

export function generateStaticParams() {
  return servicesData.map((service) => ({
    slug: service.slug,
  }));
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = servicesData.find((s) => s.slug === slug);

  if (!service) {
    notFound();
  }

  return (
    <div className="bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white transition-colors duration-200">
      {/* Service Header */}
      <section className="pt-16 pb-16 md:pt-24 md:pb-20 border-b border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/services"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#737373] dark:text-neutral-400 hover:text-[#0A0A0A] dark:hover:text-white transition-colors mb-6"
          >
            <svg className="w-4 h-4 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to all services
          </Link>

          <p className="text-xs font-semibold uppercase tracking-wider text-[#737373] dark:text-neutral-400 mb-3">
            Service Deep Dive
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#0A0A0A] dark:text-white leading-tight mb-4">
            {service.title}
          </h1>
          <p className="text-lg sm:text-xl text-[#737373] dark:text-neutral-400 leading-relaxed">
            {service.heroDesc}
          </p>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Deliverables Breakdown */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#0A0A0A] dark:text-white mb-6">
            Key Deliverables &amp; Output
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {service.deliverables.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#111111] flex items-start gap-3"
              >
                <div className="w-5 h-5 rounded-full bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  ✓
                </div>
                <p className="text-xs sm:text-sm font-semibold text-[#0A0A0A] dark:text-white">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Process Phases */}
        <div className="p-8 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] shadow-xs">
          <h2 className="text-2xl font-bold tracking-tight text-[#0A0A0A] dark:text-white mb-6">
            Sprint Execution Roadmap
          </h2>
          <div className="space-y-4">
            {service.processSteps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-md bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] flex items-center justify-center font-bold text-xs flex-shrink-0">
                  0{idx + 1}
                </span>
                <p className="text-sm font-medium text-[#0A0A0A] dark:text-white">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack Chips */}
        <div>
          <h3 className="text-xs font-mono uppercase tracking-widest text-[#737373] dark:text-neutral-400 mb-4">
            Technologies Deployed For This Service
          </h3>
          <div className="flex flex-wrap gap-2">
            {service.technologies.map((tech) => (
              <Badge key={tech} variant="outline" size="md">
                {tech}
              </Badge>
            ))}
          </div>
        </div>

        {/* FAQ */}
        {service.faq.length > 0 && (
          <div className="pt-8 border-t border-[#E5E5E5] dark:border-[#262626]">
            <h2 className="text-2xl font-bold tracking-tight text-[#0A0A0A] dark:text-white mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {service.faq.map((item, idx) => (
                <div key={idx} className="p-6 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#111111]">
                  <h4 className="text-sm font-bold text-[#0A0A0A] dark:text-white mb-2">{item.q}</h4>
                  <p className="text-xs sm:text-sm text-[#737373] dark:text-neutral-400 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-8 flex justify-center">
          <Button href="/contact" variant="primary" size="lg">
            Consult on {service.title}
          </Button>
        </div>
      </section>

      {/* CTA */}
      <CTASection />
    </div>
  );
}
