import React from "react";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";

interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
  company: string;
  initials: string;
}

const testimonials: TestimonialItem[] = [
  {
    quote:
      "ABCD Agency transformed our entire student verification workflow. What used to take days of manual spreadsheet verification across 50 branches now happens instantaneously.",
    author: "Rajesh Sharma",
    role: "Director of Operations",
    company: "RGYCSP National Network",
    initials: "RS",
  },
  {
    quote:
      "Their engineering speed is unmatched. We launched our SaaS MVP in 3 weeks, and the code quality with Next.js and Prisma has made onboarding subsequent developers completely frictionless.",
    author: "Priya Venkatesh",
    role: "Founder & CTO",
    company: "ApexFlow Analytics",
    initials: "PV",
  },
  {
    quote:
      "No corporate fluff, no bloated retainers. Just senior engineers who understood our product requirements on day one and shipped robust, bug-free production code.",
    author: "Anand Mehta",
    role: "Head of Product",
    company: "FinVantage Solutions",
    initials: "AM",
  },
];

export function Testimonials() {
  return (
    <section className="py-20 md:py-32 bg-white dark:bg-[#0A0A0A] transition-colors duration-200" id="testimonials">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16">
          <SectionHeader
            subtitle="Client Feedback"
            title="Trusted by founders and operators."
            description="Here is what leaders say about partnering with ABCD Agency for critical engineering sprints."
            align="center"
          />
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((item) => (
            <Card
              key={item.author}
              variant="muted"
              hoverEffect={true}
              className="flex flex-col justify-between"
            >
              <div className="mb-8">
                {/* Minimal quote mark */}
                <div className="text-2xl font-serif text-neutral-400 dark:text-neutral-600 mb-4 select-none">
                  “
                </div>
                <p className="text-sm sm:text-base text-[#262626] dark:text-neutral-300 leading-relaxed font-normal">
                  {item.quote}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-[#E5E5E5] dark:border-[#262626]">
                <div className="w-10 h-10 rounded-full bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] flex items-center justify-center font-bold text-xs">
                  {item.initials}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#0A0A0A] dark:text-white">{item.author}</p>
                  <p className="text-[11px] text-[#737373] dark:text-neutral-400">
                    {item.role}, {item.company}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
