"use client";

import React, { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { updatePricingPackage, updatePricingService } from "./actions";
import toast from "react-hot-toast";
import { ChevronDown, DollarSign } from "lucide-react";

export function PricingTabContent({
  pricingPackages,
  pricingServices
}: {
  pricingPackages: any[];
  pricingServices: any[];
}) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  const handlePackageSubmit = (id: string, formData: FormData) => {
    const data = {
      name: formData.get("name"),
      targetAudience: formData.get("targetAudience"),
      deliverables: formData.get("deliverables"),
      support: formData.get("support"),
      timeline: formData.get("timeline"),
      investment: formData.get("investment"),
    };
    
    startTransition(async () => {
      try {
        await updatePricingPackage(id, data);
        toast.success(`Package "${data.name}" updated successfully!`);
      } catch (e) {
        toast.error("Failed to update package.");
      }
    });
  };

  const handleServiceSubmit = (id: string, formData: FormData) => {
    const data = {
      name: formData.get("name"),
      scope: formData.get("scope"),
      monthlyRetainer: formData.get("monthlyRetainer"),
      yearlyPlan: formData.get("yearlyPlan"),
    };
    
    startTransition(async () => {
      try {
        await updatePricingService(id, data);
        toast.success(`Service "${data.name}" updated successfully!`);
      } catch (e) {
        toast.error("Failed to update service.");
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Packages Accordion */}
      <div className="rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] overflow-hidden transition-all duration-300 shadow-sm">
        <button 
          onClick={() => toggleSection("packages")}
          className="w-full flex items-center justify-between p-4 px-5 text-left hover:bg-[#FBFBFB] dark:hover:bg-[#111111] transition-colors focus-visible:outline-none"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111] flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[#0A0A0A] dark:text-white tracking-tight">Pricing Packages</h3>
              <p className="text-xs text-[#737373] mt-0.5">Manage Starter, Growth, and Enterprise plans.</p>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-[#737373] transition-transform duration-300 ${expandedSection === "packages" ? "rotate-180" : ""}`} />
        </button>
        
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedSection === "packages" ? "max-h-[3000px] border-t border-[#E5E5E5] dark:border-[#262626] opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="p-6 space-y-8 bg-white dark:bg-[#0A0A0A]">
            {pricingPackages.map((pkg) => (
              <form key={pkg.id} action={(formData) => handlePackageSubmit(pkg.id, formData)} className="border border-[#E5E5E5] dark:border-[#262626] rounded-xl p-5 space-y-4">
                <h4 className="font-bold text-[#0A0A0A] dark:text-white text-base border-b border-[#E5E5E5] dark:border-[#262626] pb-2 mb-4">{pkg.name}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">Package Name</label>
                    <input type="text" name="name" defaultValue={pkg.name} required className="w-full px-3 py-2 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">Target Audience</label>
                    <input type="text" name="targetAudience" defaultValue={pkg.targetAudience} required className="w-full px-3 py-2 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">Deliverables (One per line)</label>
                    <textarea name="deliverables" rows={5} defaultValue={pkg.deliverables.join("\n")} required className="w-full px-3 py-2 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">Support Terms</label>
                    <input type="text" name="support" defaultValue={pkg.support} required className="w-full px-3 py-2 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">Timeline</label>
                    <input type="text" name="timeline" defaultValue={pkg.timeline} required className="w-full px-3 py-2 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">Investment</label>
                    <input type="text" name="investment" defaultValue={pkg.investment} required className="w-full px-3 py-2 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373]" />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button variant="outline" size="sm" type="submit" disabled={isPending}>Save Package</Button>
                </div>
              </form>
            ))}
          </div>
        </div>
      </div>

      {/* Services Accordion */}
      <div className="rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] overflow-hidden transition-all duration-300 shadow-sm">
        <button 
          onClick={() => toggleSection("services")}
          className="w-full flex items-center justify-between p-4 px-5 text-left hover:bg-[#FBFBFB] dark:hover:bg-[#111111] transition-colors focus-visible:outline-none"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111] flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[#0A0A0A] dark:text-white tracking-tight">Retainer Services</h3>
              <p className="text-xs text-[#737373] mt-0.5">Manage additional maintenance and marketing services.</p>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-[#737373] transition-transform duration-300 ${expandedSection === "services" ? "rotate-180" : ""}`} />
        </button>
        
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedSection === "services" ? "max-h-[5000px] border-t border-[#E5E5E5] dark:border-[#262626] opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="p-6 space-y-8 bg-white dark:bg-[#0A0A0A]">
            {pricingServices.map((srv) => (
              <form key={srv.id} action={(formData) => handleServiceSubmit(srv.id, formData)} className="border border-[#E5E5E5] dark:border-[#262626] rounded-xl p-5 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">Service Name</label>
                    <input type="text" name="name" defaultValue={srv.name} required className="w-full px-3 py-2 text-sm font-semibold border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">Scope & Deliverables</label>
                    <input type="text" name="scope" defaultValue={srv.scope} required className="w-full px-3 py-2 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">Monthly Retainer</label>
                    <input type="text" name="monthlyRetainer" defaultValue={srv.monthlyRetainer} required className="w-full px-3 py-2 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">Yearly Plan</label>
                    <input type="text" name="yearlyPlan" defaultValue={srv.yearlyPlan} required className="w-full px-3 py-2 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373]" />
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <Button variant="outline" size="sm" type="submit" disabled={isPending}>Save Service</Button>
                </div>
              </form>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
