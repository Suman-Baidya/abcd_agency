import React from "react";
import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-white dark:bg-[#0A0A0A] pt-16 pb-20 md:pt-24 md:pb-32 border-b border-[#E5E5E5] dark:border-[#262626] transition-colors duration-200">
      {/* Subtle Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(to right, currentColor 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Section Header */}
            <div className="mb-8">
              <SectionHeader
                subtitle="Software Engineering & Digital Consulting"
                title="High Performance Tech For Your Brands."
                description="We partner with fast-growing startups and Indian enterprises to engineer modern web applications, scalable SaaS architectures, and automated business workflows."
                align="left"
                as="h1"
              />
            </div>

            {/* CTAs */}
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
              <Button href="/contact" variant="primary" size="lg" className="w-full sm:w-auto">
                Start Your Project
              </Button>
              <Button href="/work" variant="secondary" size="lg" className="w-full sm:w-auto">
                View Our Work
              </Button>
            </div>

            {/* Micro-metrics */}
            <div className="mt-10 sm:mt-12 pt-6 border-t border-[#E5E5E5] dark:border-[#262626] w-full grid grid-cols-3 gap-4">
              <div>
                <p className="text-xl sm:text-2xl font-bold text-[#0A0A0A] dark:text-white tracking-tight">100%</p>
                <p className="text-xs text-[#737373] dark:text-[#A3A3A3] mt-0.5">Code Ownership</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-[#0A0A0A] dark:text-white tracking-tight">2–4 wks</p>
                <p className="text-xs text-[#737373] dark:text-[#A3A3A3] mt-0.5">Avg. MVP Sprint</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-[#0A0A0A] dark:text-white tracking-tight">99.9%</p>
                <p className="text-xs text-[#737373] dark:text-[#A3A3A3] mt-0.5">Uptime Standard</p>
              </div>
            </div>
          </div>

          {/* Right Column: Abstract Minimal Monochrome Visual Mockup */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="w-full max-w-md lg:max-w-none rounded-xl border border-[#E5E5E5] bg-[#F5F5F5] p-4 sm:p-6 shadow-sm">
              {/* Mockup Window Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#E5E5E5]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#E5E5E5]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#E5E5E5]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#E5E5E5]" />
                </div>
                <span className="text-[11px] font-mono text-[#737373] tracking-wider">
                  api.abcdagency.com/deploy
                </span>
                <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#0A0A0A] text-white">
                  LIVE
                </span>
              </div>

              {/* Mockup Architecture Diagram / Card Visual */}
              <div className="space-y-4 font-mono text-xs text-[#0A0A0A] dark:text-white">
                {/* Mockup Row 1 */}
                <div className="p-4 rounded-lg bg-white dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#262626] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] flex items-center justify-center font-bold text-xs">
                      ▲
                    </div>
                    <div>
                      <p className="font-semibold text-xs font-sans">Next.js 15 App Cluster</p>
                      <p className="text-[11px] text-[#737373] dark:text-[#A3A3A3]">Edge Routing &amp; SSR</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#0A0A0A] dark:text-[#E5E5E5] font-semibold">14ms latency</span>
                </div>

                {/* Mockup Row 2 */}
                <div className="p-4 rounded-lg bg-white dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#262626] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md border border-[#0A0A0A] dark:border-white text-[#0A0A0A] dark:text-white flex items-center justify-center font-bold text-xs">
                      ⚡
                    </div>
                    <div>
                      <p className="font-semibold text-xs font-sans">Serverless DB &amp; Prisma</p>
                      <p className="text-[11px] text-[#737373] dark:text-[#A3A3A3]">PostgreSQL Pool Active</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#0A0A0A] dark:text-[#E5E5E5] font-semibold">0ms cold start</span>
                </div>

                {/* Mockup Row 3 */}
                <div className="p-4 rounded-lg bg-white dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#262626] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-[#F5F5F5] dark:bg-[#262626] border border-[#E5E5E5] dark:border-[#333333] text-[#0A0A0A] dark:text-white flex items-center justify-center font-bold text-xs">
                      AI
                    </div>
                    <div>
                      <p className="font-semibold text-xs font-sans">Gemini 2.5 Inference</p>
                      <p className="text-[11px] text-[#737373] dark:text-[#A3A3A3]">Automated Lead Engine</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#0A0A0A] dark:text-[#E5E5E5] font-semibold">100% sync</span>
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>
    </section>
  );
}
