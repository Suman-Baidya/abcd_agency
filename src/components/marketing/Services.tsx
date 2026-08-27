import React from "react";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";

interface ServiceItem {
  title: string;
  description: string;
  deliverables: string[];
  href: string;
  icon: React.ReactNode;
}

const services: ServiceItem[] = [
  {
    title: "Custom WebApp & Software Development",
    description:
      "Build fast, scalable, and secure digital infrastructure tailored to client operations.",
    deliverables: [
      "Full-Stack Web Applications",
      "Modern Marketing Websites",
      "API Integration & Backend",
      "Maintenance & Speed Optimization",
    ],
    href: "/services/web-development",
    icon: (
      <svg
        className="w-6 h-6 stroke-[#0A0A0A] dark:stroke-white"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" />
        <path d="m9 8 3 3-3 3" />
        <line x1="14" x2="15" y1="14" y2="14" />
      </svg>
    ),
  },
  {
    title: "Creative UI/UX & Digital Product Design",
    description:
      "We design interfaces that turn visitors into your loyal customers on autopilot.",
    deliverables: [
      "Product UI/UX Design",
      "Landing Page Redesigns",
      "Design Systems & Identity",
      "Conversion‑Focused Layouts",
    ],
    href: "/services/ui-ux",
    icon: (
      <svg
        className="w-6 h-6 stroke-[#0A0A0A] dark:stroke-white"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="m4.93 4.93 4.24 4.24M14.83 9.17l4.24-4.24M14.83 14.83l4.24 4.24M9.17 14.83l-4.24 4.24" />
      </svg>
    ),
  },
  {
    title: "Performance Marketing & Lead Gen",
    description:
      "Drive targeted traffic and measurable revenue for local and national businesses.",
    deliverables: [
      "Meta & Google Ads",
      "Lead Funnel Architecture",
      "Search Engine Optimization (SEO)",
      "Email Marketing & Automation",
    ],
    href: "/services/marketing",
    icon: (
      <svg
        className="w-6 h-6 stroke-[#0A0A0A] dark:stroke-white"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 3h12" />
        <path d="M6 8h12" />
        <path d="m6 13 8.5 8" />
        <path d="M6 13h3" />
        <path d="M9 13c6.667 0 6.667-10 0-10" />
      </svg>
    ),
  },
  {
    title: "Business Automation & Cloud IT Services",
    description:
      "Streamline manual daily business operations using modern cloud tools.",
    deliverables: [
      "Custom AI Agents & Chatbots",
      "Workflow Automation",
      "Business Intelligence Dashboards",
      "Cloud Hosting & Domain Setup",
    ],
    href: "/services/automation",
    icon: (
      <svg
        className="w-6 h-6 stroke-[#0A0A0A] dark:stroke-white"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 2a4 4 0 0 0-4 4c0 2 2 3 2 6H6a4 4 0 0 0-4 4v2h20v-2a4 4 0 0 0-4-4h-4c0-3 2-4 2-6a4 4 0 0 0-4-4z" />
        <circle cx="9" cy="18" r="1" />
        <circle cx="15" cy="18" r="1" />
      </svg>
    ),
  },
];

export function Services() {
  return (
    <section className="py-20 md:py-32 bg-white dark:bg-[#0A0A0A] transition-colors duration-200" id="services">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mb-16">
          <SectionHeader
            subtitle="Core Capabilities"
            title="Engineering tailored to business velocity."
            description="We do not sell generic templates. We build custom, resilient digital systems engineered to scale from day one."
            align="center"
          />
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <Card
              key={service.title}
              variant="muted"
              hoverEffect={true}
              className="flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-lg bg-white dark:bg-[#1A1A1A] border border-[#E5E5E5] dark:border-[#262626] flex items-center justify-center mb-6">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-[#0A0A0A] dark:text-white tracking-tight mb-3">
                  {service.title}
                </h3>
                <p className="text-sm text-[#737373] dark:text-neutral-400 leading-relaxed mb-6">
                  {service.description}
                </p>
              </div>

              <div>
                <ul className="space-y-2 pt-4 border-t border-[#E5E5E5] dark:border-[#262626] mb-6">
                  {service.deliverables.map((item) => (
                    <li
                      key={item}
                      className="text-xs font-medium text-[#0A0A0A] dark:text-neutral-200 flex items-center gap-2"
                    >
                      <span className="w-1 h-1 rounded-full bg-[#0A0A0A] dark:bg-white" />
                      {item}
                    </li>
                  ))}
                </ul>

                <Link
                  href={service.href}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0A0A0A] dark:text-white hover:underline underline-offset-4"
                >
                  Learn more
                  <svg
                    className="w-3.5 h-3.5 stroke-current"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
