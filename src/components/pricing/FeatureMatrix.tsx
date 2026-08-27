"use client";

import React, { useState } from "react";
import { Check, Info, Minus, Plus, ChevronDown } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

const matrixData = [
  {
    category: "Website & Design",
    features: [
      { label: "Website / Web App", starter: "Up to 5 Pages", growth: "Custom Multi-page Site", enterprise: "Full-Stack Web App" },
      { label: "Responsive Design", starter: true, growth: true, enterprise: true },
      { label: "UI/UX Design System", starter: "Template-Based", growth: "Conversion-Focused", enterprise: "Fully Custom + Figma" },
      { label: "Custom Admin Dashboard", starter: false, growth: false, enterprise: true },
    ]
  },
  {
    category: "Lead & Marketing",
    features: [
      { label: "Lead Capture Forms", starter: "Basic Contact Form", growth: "Multi-Step Forms", enterprise: "Custom CRM Sync" },
      { label: "WhatsApp Integration", starter: "Button Only", growth: "Automated Alerts", enterprise: "AI Chatbot (24/7)" },
      { label: "Meta Ads (FB/IG) Setup", starter: false, growth: true, enterprise: true },
      { label: "Google Ads (PPC)", starter: false, growth: false, enterprise: true },
      { label: "Analytics & Tracking", starter: false, growth: "Pixel + Conversion", enterprise: "Full-Stack Analytics" },
    ]
  },
  {
    category: "SEO & Visibility",
    features: [
      { label: "On-Page SEO", starter: "Basic Setup", growth: "Advanced Optimization", enterprise: "Enterprise-Grade SEO" },
      { label: "Google Business Profile", starter: true, growth: true, enterprise: true },
      { label: "Monthly SEO Reports", starter: false, growth: true, enterprise: true },
    ]
  },
  {
    category: "Tech & Infrastructure",
    features: [
      { label: "SSL Security", starter: true, growth: true, enterprise: true },
      { label: "Database Architecture", starter: false, growth: false, enterprise: "Scalable & Optimized" },
      { label: "API Integrations", starter: false, growth: false, enterprise: "Custom Third-Party APIs" },
      { label: "AI Automation", starter: false, growth: false, enterprise: true },
      { label: "Cloud Deployment", starter: false, growth: false, enterprise: "Hardened & Monitored" },
    ]
  },
  {
    category: "Support & Delivery",
    features: [
      { label: "Dedicated Support", starter: "15 Days", growth: "30 Days", enterprise: "Priority VIP + Training" },
      { label: "Performance Reports", starter: false, growth: "Monthly", enterprise: "Weekly + Custom KPIs" },
      { label: "Staff Training & Docs", starter: false, growth: false, enterprise: true },
      { label: "Estimated Timeline", starter: "5–10 Days", growth: "10–20 Days", enterprise: "Custom Milestone" },
    ]
  }
];

export function FeatureMatrix() {
  // Only first category is open by default
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    "Website & Design": true,
  });

  const toggleSection = (cat: string) => {
    setOpenSections(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  const renderCell = (val: string | boolean) => {
    if (val === true) {
      return (
        <div className="w-5 h-5 rounded-full bg-[#0A0A0A] dark:bg-white flex items-center justify-center mx-auto md:mx-0">
          <Check className="w-3 h-3 text-white dark:text-[#0A0A0A]" strokeWidth={3} />
        </div>
      );
    }
    if (val === false) {
      return <span className="text-[#A3A3A3] dark:text-neutral-600 font-normal">—</span>;
    }
    return <span>{val}</span>;
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-12">
        <SectionHeader
          subtitle="DEEP DIVE"
          title="Compare all capabilities."
          description="See exactly what you're getting in each tier to make an informed decision."
          align="left"
        />
      </div>

      <div className="flex flex-col gap-4 relative">
        {/* Table Header (Desktop Only) */}
        <div className="hidden md:grid grid-cols-4 px-6 py-5 rounded-2xl bg-[#0A0A0A] dark:bg-white sticky top-[72px] self-start w-full z-30 shadow-xl border border-[#0A0A0A] dark:border-white transition-colors duration-300">
          <div className="col-span-1 text-[10px] font-bold uppercase tracking-widest text-white/50 dark:text-black/50">Feature</div>
          <div className="col-span-1 text-[10px] font-bold uppercase tracking-widest text-white/50 dark:text-black/50">Starter</div>
          <div className="col-span-1 text-[10px] font-bold uppercase tracking-widest text-white dark:text-black">Growth</div>
          <div className="col-span-1 text-[10px] font-bold uppercase tracking-widest text-white/50 dark:text-black/50">Enterprise</div>
        </div>

        {/* Categories */}
        {matrixData.map((category) => (
          <div key={category.category} className="rounded-2xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] overflow-hidden transition-all duration-300">
            <button
              onClick={() => toggleSection(category.category)}
              className="w-full flex items-center justify-between p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
            >
              <h3 className="text-lg font-bold text-[#0A0A0A] dark:text-white tracking-tight">
                {category.category}
              </h3>
              <div className={`p-2 rounded-full transition-transform duration-300 ${openSections[category.category] ? 'rotate-180 bg-[#F5F5F5] dark:bg-[#1A1A1A]' : 'bg-[#FAFAFA] dark:bg-[#111111] hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A]'}`}>
                <ChevronDown className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
              </div>
            </button>
            
            <div className={`grid transition-all duration-300 ease-in-out ${openSections[category.category] ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden">
                <div className="px-6 pb-6 pt-0">
                  <div className="flex flex-col gap-0 divide-y divide-[#E5E5E5] dark:divide-[#262626]">
                    {category.features.map((feat, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-4 py-4 md:py-5 gap-4 md:gap-0 group">
                        {/* Mobile Header / Desktop Feature Name */}
                        <div className="col-span-1 flex items-center">
                          <span className="text-sm font-bold md:font-semibold text-[#0A0A0A] md:text-[#737373] dark:text-white md:dark:text-neutral-400 group-hover:text-[#0A0A0A] dark:group-hover:text-white transition-colors">
                            {feat.label}
                          </span>
                        </div>
                        
                        {/* Mobile Values */}
                        <div className="grid grid-cols-3 md:hidden gap-2 bg-[#FAFAFA] dark:bg-[#111111] p-3 rounded-lg border border-[#E5E5E5] dark:border-[#262626]">
                           <div className="flex flex-col items-center text-center gap-2">
                             <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373]">Starter</span>
                             <span className="text-xs font-medium text-[#737373] dark:text-neutral-400">{renderCell(feat.starter)}</span>
                           </div>
                           <div className="flex flex-col items-center text-center gap-2 border-x border-[#E5E5E5] dark:border-[#262626] px-2">
                             <span className="text-[10px] font-bold uppercase tracking-wider text-[#0A0A0A] dark:text-white">Growth</span>
                             <span className="text-xs font-bold text-[#0A0A0A] dark:text-white">{renderCell(feat.growth)}</span>
                           </div>
                           <div className="flex flex-col items-center text-center gap-2">
                             <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373]">Enterprise</span>
                             <span className="text-xs font-medium text-[#737373] dark:text-neutral-400">{renderCell(feat.enterprise)}</span>
                           </div>
                        </div>

                        {/* Desktop Values */}
                        <div className="hidden md:flex col-span-1 items-center pr-4">
                          <span className="text-sm font-medium text-[#737373] dark:text-neutral-400">{renderCell(feat.starter)}</span>
                        </div>
                        <div className="hidden md:flex col-span-1 items-center pr-4">
                          <span className="text-sm font-bold text-[#0A0A0A] dark:text-white">{renderCell(feat.growth)}</span>
                        </div>
                        <div className="hidden md:flex col-span-1 items-center">
                          <span className="text-sm font-medium text-[#737373] dark:text-neutral-400">{renderCell(feat.enterprise)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
