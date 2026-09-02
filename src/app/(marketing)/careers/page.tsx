import React from "react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CTASection } from "@/components/marketing/CTASection";
import { Rocket, Mail, Briefcase, Sparkles, Send } from "lucide-react";
import { getSiteConfig } from "@/lib/dbConfig";

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

export default async function CareersPage() {
  const siteConfig = await getSiteConfig();
  const isHiringOpen = !!siteConfig.enableCareers;

  return (
    <div className="bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white transition-colors duration-200">
      {/* Hero Header */}
      <PageHeader
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Careers", href: "/careers" },
        ]}
        title="Careers & Talent Network"
        description="We partner with exceptional, autonomous engineers and designers to build high-impact software."
        icon={<Rocket className="w-32 h-32" />}
      />

      {/* Main Section */}
      <section className="py-20 md:py-28 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {isHiringOpen ? (
          <>
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-semibold">
                  {siteConfig.careersStatusText || "Actively Hiring"}
                </span>
              </div>
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
                    href={`mailto:${siteConfig.contactEmail || "careers@abcdagency.com"}?subject=Application for ${encodeURIComponent(role.title)}`}
                    variant="primary"
                    size="md"
                    className="w-full sm:w-auto shrink-0"
                  >
                    Apply via Email
                  </Button>
                </Card>
              ))}
            </div>
          </>
        ) : (
          /* When Hiring is Currently Closed / Paused */
          <div className="max-w-3xl mx-auto">
            <Card
              variant="muted"
              className="p-8 sm:p-12 text-center rounded-2xl border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111]"
            >
              <div className="w-14 h-14 mx-auto mb-6 rounded-2xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#1A1A1A] flex items-center justify-center text-[#0A0A0A] dark:text-white shadow-xs">
                <Briefcase className="w-6 h-6" />
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#1A1A1A] mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="text-xs font-mono uppercase tracking-wider text-[#737373] dark:text-neutral-300 font-semibold">
                  {siteConfig.careersStatusText || "Currently Closed"}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] dark:text-white mb-3">
                No Open Positions Right Now
              </h2>

              <p className="text-sm text-[#737373] dark:text-neutral-400 max-w-xl mx-auto leading-relaxed mb-8">
                {siteConfig.careersNotice ||
                  "We are not actively hiring for full-time positions at the moment, but we welcome open applications for future engineering and design sprints."}
              </p>

              {/* Talent Pool Box */}
              <div className="p-6 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] text-left max-w-xl mx-auto mb-8 space-y-3 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#0A0A0A] dark:text-white">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Join Our Talent Network</span>
                </div>
                <p className="text-xs text-[#737373] dark:text-neutral-400 leading-relaxed">
                  Are you an exceptional senior developer, UI/UX craftsman, or AI researcher? Drop your GitHub / portfolio link and resume to our lead engineering team for future project collaboration.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  href={`mailto:${siteConfig.contactEmail || "hello@abcdagency.com"}?subject=Open Talent Network Application - [Your Name]`}
                  variant="primary"
                  size="md"
                  className="w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Send Portfolio &amp; Resume
                </Button>
                <Button
                  href="/"
                  variant="secondary"
                  size="md"
                  className="w-full sm:w-auto"
                >
                  Return to Home
                </Button>
              </div>
            </Card>
          </div>
        )}
      </section>

      {/* CTA */}
      <CTASection />
    </div>
  );
}
