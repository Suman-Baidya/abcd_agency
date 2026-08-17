import React from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { servicesData } from "@/data/services";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Process } from "@/components/marketing/Process";
import { TechStack } from "@/components/marketing/TechStack";
import { CTASection } from "@/components/marketing/CTASection";

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
        subtitle="Capabilities & Specializations"
        title="Full-lifecycle engineering for ambitious software products."
        description="We operate as a high-velocity extension of your core team. From initial system architecture to production scaling, we deliver clean, resilient code."
      />

      {/* Detailed Services Grid */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {servicesData.map((service) => (
            <Card
              key={service.slug}
              variant="muted"
              className="flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-[#0A0A0A] dark:text-white tracking-tight">
                    {service.title}
                  </h2>
                </div>

                <p className="text-sm text-[#737373] dark:text-neutral-400 leading-relaxed mb-6">
                  {service.heroDesc}
                </p>

                <div className="space-y-4 mb-8">
                  <p className="text-xs font-mono uppercase tracking-wider text-[#737373] dark:text-neutral-400">
                    What We Deliver:
                  </p>
                  <ul className="space-y-2">
                    {service.deliverables.map((item) => (
                      <li key={item} className="text-xs font-medium text-[#0A0A0A] dark:text-neutral-200 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0A0A0A] dark:bg-white" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6 border-t border-[#E5E5E5] dark:border-[#262626] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-wrap gap-1.5">
                  {service.technologies.slice(0, 3).map((tech) => (
                    <Badge key={tech} variant="outline" size="sm">
                      {tech}
                    </Badge>
                  ))}
                </div>
                <Link
                  href={`/services/${service.slug}`}
                  className="text-xs font-bold text-[#0A0A0A] dark:text-white hover:underline underline-offset-4 inline-flex items-center gap-1"
                >
                  Service Details →
                </Link>
              </div>
            </Card>
          ))}
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
