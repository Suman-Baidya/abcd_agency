"use client";

import React, { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { updatePricingPackage, updatePricingService, createPricingService, deletePricingService, reorderPricingService } from "./actions";
import toast from "react-hot-toast";
import { ChevronDown, Package, Briefcase, Plus, Trash2, Pencil, ArrowUp, ArrowDown } from "lucide-react";

export function PricingTabContent({
  pricingPackages,
  pricingServices
}: {
  pricingPackages: any[];
  pricingServices: any[];
}) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<{id: string, name: string} | null>(null);
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
        if (id === "new") {
          await createPricingService(data);
          toast.success(`Service "${data.name}" created successfully!`);
        } else {
          await updatePricingService(id, data);
          toast.success(`Service "${data.name}" updated successfully!`);
        }
      } catch (e) {
        toast.error("Failed to save service.");
      }
    });
  };

  const confirmDeleteService = () => {
    if (!serviceToDelete) return;
    const { id, name } = serviceToDelete;
    startTransition(async () => {
      try {
        await deletePricingService(id);
        toast.success(`Service "${name}" deleted!`);
        setServiceToDelete(null);
      } catch (e) {
        toast.error("Failed to delete service.");
      }
    });
  };

  const handleReorderService = (id: string, direction: "up" | "down") => {
    startTransition(async () => {
      try {
        await reorderPricingService(id, direction);
      } catch (e) {
        toast.error("Failed to reorder service.");
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
              {pricingPackages.map((pkg) => {
                let displayInvestment = pkg.investment;
                if (displayInvestment.toLowerCase().includes("(ad spend separate)")) {
                  displayInvestment = displayInvestment.replace(/\s*\(ad spend separate\)/i, "").trim();
                }
                if (displayInvestment.includes(" to ")) {
                  displayInvestment = displayInvestment.split(" to ")[0];
                }
                displayInvestment = displayInvestment.replace(/\+/g, "").trim() + " Plus";

                return (
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
                        {displayInvestment}
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
                );
              })}
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
          <div className="p-6 bg-white dark:bg-[#0A0A0A]">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-sm font-bold text-[#0A0A0A] dark:text-white uppercase tracking-wider">Services List</h4>
              <Button variant="primary" size="sm" onClick={() => setEditingServiceId("new")}>
                <Plus className="w-4 h-4 mr-2" /> Add New Service
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pricingServices.map((srv, index) => (
                <div key={srv.id} className="border border-[#E5E5E5] dark:border-[#262626] rounded-xl p-5 flex flex-col justify-between gap-4 bg-white dark:bg-[#0A0A0A] shadow-sm relative group hover:border-[#0A0A0A] dark:hover:border-white transition-colors duration-300">
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-4">
                      <h4 className="font-bold text-lg text-[#0A0A0A] dark:text-white tracking-tight truncate">#{index + 1} {srv.name}</h4>
                      <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" type="button" onClick={() => handleReorderService(srv.id, "up")} className="h-8 px-2 text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white" disabled={index === 0 || isPending}><ArrowUp className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" type="button" onClick={() => handleReorderService(srv.id, "down")} className="h-8 px-2 text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white" disabled={index === pricingServices.length - 1 || isPending}><ArrowDown className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" type="button" onClick={() => setEditingServiceId(srv.id)} className="h-8 px-2 text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white bg-[#F5F5F5] dark:bg-[#111111] hover:bg-[#E5E5E5] dark:hover:bg-[#262626]"><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" type="button" onClick={() => setServiceToDelete({ id: srv.id, name: srv.name })} className="h-8 px-2 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/40" disabled={isPending}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 pt-4 border-t border-[#E5E5E5] dark:border-[#262626] mt-auto">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[#A3A3A3] mb-0.5">Monthly</div>
                      <div className="text-sm font-semibold text-[#0A0A0A] dark:text-white">{srv.monthlyRetainer}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[#A3A3A3] mb-0.5">Yearly</div>
                      <div className="text-sm font-semibold text-[#0A0A0A] dark:text-white">{srv.yearlyPlan}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Edit Modal for Packages */}
      {editingPackageId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0A0A0A] border border-[#E5E5E5] dark:border-[#262626] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {pricingPackages.filter(p => p.id === editingPackageId).map((pkg) => (
              <form key={pkg.id} action={async (formData) => { await handlePackageSubmit(pkg.id, formData); setEditingPackageId(null); }} className="flex flex-col h-full max-h-[90vh]">
                
                {/* Header (Sticky) */}
                <div className="px-6 sm:px-8 py-5 flex items-center justify-between border-b border-[#E5E5E5] dark:border-[#262626] shrink-0 bg-white dark:bg-[#0A0A0A] z-10">
                  <h4 className="font-bold text-[#0A0A0A] dark:text-white text-xl tracking-tight">Edit {pkg.name} Package</h4>
                  <Button variant="ghost" size="sm" type="button" onClick={() => setEditingPackageId(null)} disabled={isPending} className="hover:bg-[#F5F5F5] dark:hover:bg-[#111111] -mr-2">Close</Button>
                </div>
                
                <div className="p-6 sm:p-8 overflow-y-auto flex-1 custom-scrollbar">
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
                </div>
                
                <div className="px-6 sm:px-8 py-5 flex justify-end gap-3 border-t border-[#E5E5E5] dark:border-[#262626] shrink-0 bg-[#FBFBFB] dark:bg-[#111111] z-10">
                  <Button variant="secondary" size="md" type="button" onClick={() => setEditingPackageId(null)} disabled={isPending}>Cancel</Button>
                  <Button variant="primary" size="md" type="submit" disabled={isPending}>Save Changes</Button>
                </div>
              </form>
            ))}
          </div>
        </div>
      )}

      {/* Floating Edit Modal for Services */}
      {editingServiceId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0A0A0A] border border-[#E5E5E5] dark:border-[#262626] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {(editingServiceId === "new" ? [{ id: "new", name: "", scope: "", monthlyRetainer: "", yearlyPlan: "" }] : pricingServices.filter(s => s.id === editingServiceId)).map((srv) => (
              <form key={srv.id} action={async (formData) => { await handleServiceSubmit(srv.id, formData); setEditingServiceId(null); }} className="flex flex-col h-full max-h-[90vh]">
                
                <div className="px-6 sm:px-8 py-5 flex items-center justify-between border-b border-[#E5E5E5] dark:border-[#262626] shrink-0 bg-white dark:bg-[#0A0A0A] z-10">
                  <h4 className="font-bold text-[#0A0A0A] dark:text-white text-xl tracking-tight">{srv.id === "new" ? "Add New Service" : `Edit ${srv.name}`}</h4>
                  <Button variant="ghost" size="sm" type="button" onClick={() => setEditingServiceId(null)} disabled={isPending} className="hover:bg-[#F5F5F5] dark:hover:bg-[#111111] -mr-2">Close</Button>
                </div>
                
                <div className="p-6 sm:p-8 overflow-y-auto flex-1 custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-2 uppercase tracking-wide">Service Name</label>
                      <input type="text" name="name" defaultValue={srv.name} required className="w-full px-4 py-2.5 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] dark:focus:ring-white transition-shadow" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-2 uppercase tracking-wide">Scope & Deliverables</label>
                      <textarea name="scope" rows={3} defaultValue={srv.scope} required className="w-full px-4 py-3 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] dark:focus:ring-white transition-shadow resize-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-2 uppercase tracking-wide">Monthly Retainer</label>
                      <input type="text" name="monthlyRetainer" defaultValue={srv.monthlyRetainer} required className="w-full px-4 py-2.5 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] dark:focus:ring-white transition-shadow" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-2 uppercase tracking-wide">Yearly Plan</label>
                      <input type="text" name="yearlyPlan" defaultValue={srv.yearlyPlan} required className="w-full px-4 py-2.5 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-lg bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] dark:focus:ring-white transition-shadow" />
                    </div>
                  </div>
                </div>
                
                <div className="px-6 sm:px-8 py-5 flex justify-end gap-3 border-t border-[#E5E5E5] dark:border-[#262626] shrink-0 bg-[#FBFBFB] dark:bg-[#111111] z-10">
                  <Button variant="secondary" size="md" type="button" onClick={() => setEditingServiceId(null)} disabled={isPending}>Cancel</Button>
                  <Button variant="primary" size="md" type="submit" disabled={isPending}>Save Changes</Button>
                </div>
              </form>
            ))}
          </div>
        </div>
      )}
      {/* Custom Delete Alert Modal */}
      {serviceToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0A0A0A] border border-[#E5E5E5] dark:border-[#262626] rounded-2xl shadow-2xl p-6 sm:p-8 max-w-sm w-full animate-in zoom-in-95 duration-200 text-center">
            <h4 className="font-bold text-xl text-[#0A0A0A] dark:text-white mb-2">Delete Service</h4>
            <p className="text-sm text-[#737373] mb-8 leading-relaxed">
              Are you sure you want to delete <strong className="text-[#0A0A0A] dark:text-white">{serviceToDelete.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="secondary" size="md" onClick={() => setServiceToDelete(null)} disabled={isPending} className="flex-1">Cancel</Button>
              <Button variant="primary" size="md" onClick={() => confirmDeleteService()} disabled={isPending} className="flex-1 !bg-red-600 hover:!bg-red-700 !text-white !border-red-600">Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
