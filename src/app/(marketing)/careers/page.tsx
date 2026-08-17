import React from "react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CTASection } from "@/components/marketing/CTASection";

export const metadata = {
  title: "Careers & Engineering Network — ABCD Agency",
  description:
    "Join the ABCD Agency engineering network. We partner with senior full-stack developers, UI/UX designers, and AI specialists.",
};

const roles = [
  {
    title: "Senior Full-Stack Engineer (Next.js / Prisma)",
    type: "Contract / Project-Based",
    location: "Remote (Global)",
    description:
      "Looking for senior TypeScript engineers with deep experience in Next.js App Router, Prisma ORM, and high-performance serverless backend architectures.",
    tags: ["Next.js", "TypeScript", "Prisma", "PostgreSQL"],
  },
  {
    title: "UI/UX Product Designer (Figma to Code)",
    type: "Contract / Sprint-Based",
    location: "Remote (Global)",
    description:
      "Looking for meticulous UI/UX designers capable of crafting minimal, high-converting black & white design systems and implementing them in clean Tailwind CSS.",
    tags: ["Figma", "Tailwind CSS", "Design Systems", "Accessibility"],
  },
  {
    title: "AI Solutions & Automation Engineer",
    type: "Contract / Project-Based",
    location: "Remote (Global)",
    description:
      "Seeking engineers with proven experience deploying production LLM workflows using Gemini, Groq, and autonomous agent frameworks.",
    tags: ["Google Gemini", "Groq AI", "Vercel AI SDK", "Python / TS"],
  },
];

export default function CareersPage() {
  return (
    <div className="bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white transition-colors duration-200">
      {/* Hero Header */}
      <PageHeader
        subtitle="Careers & Network"
        title="Join a collective of senior engineers."
        description="We don't do junior hires or bloated management tiers. We partner with exceptional, autonomous engineers to ship high-impact software."
      />

      {/* Open Roles */}
      <section className="py-20 md:py-28 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">
            Current Openings &amp; Network Roles
          </h2>
          <p className="text-sm text-[#737373] dark:text-neutral-400 mt-2">
            Apply directly to join our project roster or dedicated sprint teams.
          </p>
        </div>

        <div className="space-y-6">
          {roles.map((role) => (
            <Card
              key={role.title}
              variant="muted"
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
            >
              <div className="space-y-3 max-w-xl">
                <div className="flex items-center gap-3">
                  <Badge variant="solid" size="sm">
                    {role.type}
                  </Badge>
                  <span className="text-xs font-mono text-[#737373] dark:text-neutral-400">{role.location}</span>
                </div>

                <h3 className="text-lg font-bold text-[#0A0A0A] dark:text-white tracking-tight">
                  {role.title}
                </h3>

                <p className="text-xs text-[#737373] dark:text-neutral-400 leading-relaxed">
                  {role.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-2">
                  {role.tags.map((tag) => (
                    <Badge key={tag} variant="outline" size="sm">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                href="mailto:careers@abcdagency.com"
                variant="primary"
                size="md"
                className="w-full sm:w-auto"
              >
                Apply via Email
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <CTASection />
    </div>
  );
}
