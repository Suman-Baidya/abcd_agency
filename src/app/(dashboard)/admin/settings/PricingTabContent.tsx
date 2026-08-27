"use client";

import React, { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { updatePricingPackage, updatePricingService } from "./actions";
import toast from "react-hot-toast";
import { ChevronDown, Package, Briefcase } from "lucide-react";

export function PricingTabContent({
  pricingPackages,
  pricingServices
}: {
  pricingPackages: any[];
  pricingServices: any[];
}) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
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
              <Package className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[#0A0A0A] dark:text-white tracking-tight">Pricing Packages</h3>
              <p className="text-xs text-[#737373] mt-0.5">Manage Starter, Growth, and Enterprise plans.</p>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-[#737373] transition-transform duration-300 ${expandedSection === "packages" ? "rotate-180" : ""}`} />
        </button>
        
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedSection === "packages" ? "max-h-[3000px] border-t border-[#E5E5E5] dark:border-[#262626] opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="p-6 bg-white dark:bg-[#0A0A0A]">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {pricingPackages.map((pkg) => (
                  <div key={pkg.id} className="border border-[#E5E5E5] dark:border-[#262626] rounded-xl p-6 flex flex-col h-full bg-white dark:bg-[#0A0A0A] shadow-sm relative group hover:border-[#0A0A0A] dark:hover:border-white transition-colors duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-lg text-[#0A0A0A] dark:text-white tracking-tight">{pkg.name}</h4>
                        <p className="text-xs text-[#737373] mt-1">{pkg.targetAudience}</p>
                      </div>
                      <Button variant="secondary" size="sm" onClick={() => setEditingPackageId(pkg.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">Edit</Button>
                    </div>
                    
                    <div className="mt-4 mb-6">
                      <div className="text-2xl font-bold text-[#0A0A0A] dark:text-white tracking-tight">
                        {pkg.investment}
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-6 flex-grow">
                      <p className="text-xs font-semibold text-[#0A0A0A] dark:text-white uppercase tracking-wider mb-3">Deliverables</p>
                      {pkg.deliverables.slice(0, 4).map((d: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-[#737373]">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#E5E5E5] dark:bg-[#262626] mt-1.5 shrink-0" />
                          <span className="leading-snug">{d}</span>
                        </div>
                      ))}
                      {pkg.deliverables.length > 4 && (
                        <div className="text-xs text-[#737373] italic mt-2">+{pkg.deliverables.length - 4} more</div>
                      )}
                    </div>
                    
                    <div className="pt-4 border-t border-[#E5E5E5] dark:border-[#262626] mt-auto">
                      <div className="flex items-center justify-between text-xs font-medium text-[#737373]">
                        <span>{pkg.timeline}</span>
                        <span>{pkg.support}</span>
                      </div>
                    </div>
                  </div>
              ))}
            </div>
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
              <Briefcase className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
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
                  <Button variant="secondary" size="sm" type="submit" disabled={isPending}>Save Service</Button>
                </div>
              </form>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Edit Modal for Packages */}
      {editingPackageId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0A0A0A] border border-[#E5E5E5] dark:border-[#262626] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            {pricingPackages.filter(p => p.id === editingPackageId).map((pkg) => (
              <form key={pkg.id} action={async (formData) => { await handlePackageSubmit(pkg.id, formData); setEditingPackageId(null); }} className="p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-[#E5E5E5] dark:border-[#262626] pb-4">
                  <h4 className="font-bold text-[#0A0A0A] dark:text-white text-xl tracking-tight">Edit {pkg.name} Package</h4>
                  <Button variant="ghost" size="sm" type="button" onClick={() => setEditingPackageId(null)} disabled={isPending} className="hover:bg-[#F5F5F5] dark:hover:bg-[#111111]">Close</Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-2 uppercase tracking-wide">Package Name</label>
                    <input type="text" name="name" defaultValue={pkg.name} required className="w-full px-4 py-2.5 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] dark:focus:ring-white transition-shadow" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-2 uppercase tracking-wide">Target Audience</label>
                    <input type="text" name="targetAudience" defaultValue={pkg.targetAudience} required className="w-full px-4 py-2.5 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] dark:focus:ring-white transition-shadow" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-2 uppercase tracking-wide">Deliverables (One per line)</label>
                    <textarea name="deliverables" rows={5} defaultValue={pkg.deliverables.join("\n")} required className="w-full px-4 py-3 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] dark:focus:ring-white transition-shadow resize-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-2 uppercase tracking-wide">Support Terms</label>
                    <input type="text" name="support" defaultValue={pkg.support} required className="w-full px-4 py-2.5 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] dark:focus:ring-white transition-shadow" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-2 uppercase tracking-wide">Timeline</label>
                    <input type="text" name="timeline" defaultValue={pkg.timeline} required className="w-full px-4 py-2.5 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] dark:focus:ring-white transition-shadow" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-2 uppercase tracking-wide">Investment</label>
                    <input type="text" name="investment" defaultValue={pkg.investment} required className="w-full px-4 py-2.5 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] dark:focus:ring-white transition-shadow" />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-6 border-t border-[#E5E5E5] dark:border-[#262626]">
                  <Button variant="secondary" size="md" type="button" onClick={() => setEditingPackageId(null)} disabled={isPending}>Cancel</Button>
                  <Button variant="primary" size="md" type="submit" disabled={isPending}>Save Changes</Button>
                </div>
              </form>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
