"use client";

import React, { useState } from "react";
import { 
  Palette, 
  BookOpen,
  ShieldCheck, 
  FileText,
  Phone,
  Zap,
  ChevronDown,
  IndianRupee,
  KeyRound
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ImageUploadInput } from "@/components/ui/ImageUploadInput";
import { updateBrandingSettings, updateContactAndSocialSettings, updateWidgetSettings, updateAuthSettings } from "./actions";

const TABS = [
  { id: "branding", label: "Branding & Contact", icon: Palette },
  { id: "blog", label: "Blog", icon: BookOpen },
  { id: "legal", label: "Legal Pages", icon: ShieldCheck },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "pricing", label: "Pricing", icon: IndianRupee },
];

import toast from "react-hot-toast";
import { PricingTabContent } from "./PricingTabContent";

export default function SettingsTabs({ 
  initialConfig,
  pricingPackages = [],
  pricingServices = [],
}: { 
  initialConfig: any;
  pricingPackages?: any[];
  pricingServices?: any[];
}) {
  const [activeTab, setActiveTab] = useState("branding");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  const handleBrandingSubmit = async (formData: FormData) => {
    const promise = updateBrandingSettings(formData);
    toast.promise(promise, {
      loading: 'Saving branding...',
      success: 'Branding saved!',
      error: 'Failed to save branding.',
    });
  };

  const handleContactSubmit = async (formData: FormData) => {
    const promise = updateContactAndSocialSettings(formData);
    toast.promise(promise, {
      loading: 'Saving contact settings...',
      success: 'Contact settings saved!',
      error: 'Failed to save contact settings.',
    });
  };

  const handleWidgetSubmit = async (formData: FormData) => {
    const promise = updateWidgetSettings(formData);
    toast.promise(promise, {
      loading: 'Saving widget settings...',
      success: 'Widget settings saved!',
      error: 'Failed to save widget settings.',
    });
  };

  const handleAuthSubmit = async (formData: FormData) => {
    const promise = updateAuthSettings(formData);
    toast.promise(promise, {
      loading: 'Saving authentication settings...',
      success: 'Authentication settings saved!',
      error: 'Failed to save authentication settings.',
    });
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">
          Site Management
        </h1>
        <p className="text-sm text-[#737373] mt-1">
          Configure the global landing page, branding, and navigation.
        </p>
      </div>

      {/* Top Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto p-1.5 mb-8 border border-[#E5E5E5] dark:border-[#262626] rounded-xl bg-white dark:bg-[#0A0A0A] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                isActive 
                  ? "bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] shadow-md"
                  : "text-[#737373] hover:text-[#0A0A0A] hover:bg-[#F5F5F5] dark:hover:text-white dark:hover:bg-[#111111]"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "opacity-100" : "opacity-70"}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "branding" && (
        <div className="space-y-4">
          
          {/* Accordion 1: Visual Identity */}
          <div className="rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] overflow-hidden transition-all duration-300 shadow-sm">
            <button 
              onClick={() => toggleSection("visual")}
              className="w-full flex items-center justify-between p-4 px-5 text-left hover:bg-[#FBFBFB] dark:hover:bg-[#111111] transition-colors focus-visible:outline-none"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111] flex items-center justify-center shrink-0">
                  <Palette className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#0A0A0A] dark:text-white tracking-tight">Visual Identity</h3>
                  <p className="text-xs text-[#737373] mt-0.5">Site name, logo, and brand colors.</p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#737373] transition-transform duration-300 ${expandedSection === "visual" ? "rotate-180" : ""}`} />
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedSection === "visual" ? "max-h-[800px] border-t border-[#E5E5E5] dark:border-[#262626] opacity-100" : "max-h-0 opacity-0"}`}>
              <form action={handleBrandingSubmit} className="p-6 space-y-8 bg-white dark:bg-[#0A0A0A]">
                <div>
                  <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">Agency Name</label>
                  <input
                    type="text"
                    name="agencyName"
                    defaultValue={initialConfig.agencyName}
                    className="w-full max-w-md px-3 py-2.5 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  <ImageUploadInput 
                    name="lightLogoUrl" 
                    label="Light Mode Logo" 
                    defaultValue={initialConfig.lightLogoUrl} 
                  />
                  <ImageUploadInput 
                    name="darkLogoUrl" 
                    label="Dark Mode Logo" 
                    defaultValue={initialConfig.darkLogoUrl} 
                  />
                  <ImageUploadInput 
                    name="faviconUrl" 
                    label="Favicon" 
                    defaultValue={initialConfig.faviconUrl} 
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button variant="primary" size="sm" type="submit">Save Changes</Button>
                </div>
              </form>
            </div>
          </div>

          {/* Accordion 2: Contact & Social Presence */}
          <div className="rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] overflow-hidden transition-all duration-300 shadow-sm">
            <button 
              onClick={() => toggleSection("contact")}
              className="w-full flex items-center justify-between p-4 px-5 text-left hover:bg-[#FBFBFB] dark:hover:bg-[#111111] transition-colors focus-visible:outline-none"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111] flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#0A0A0A] dark:text-white tracking-tight">Contact & Social Presence</h3>
                  <p className="text-xs text-[#737373] mt-0.5">Direct support channels and community links.</p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#737373] transition-transform duration-300 ${expandedSection === "contact" ? "rotate-180" : ""}`} />
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedSection === "contact" ? "max-h-[800px] border-t border-[#E5E5E5] dark:border-[#262626] opacity-100" : "max-h-0 opacity-0"}`}>
              <form action={handleContactSubmit} className="p-6 bg-white dark:bg-[#0A0A0A]">
                <div>
                  <div className="space-y-10">
                    {/* Contact Fields */}
                    <div className="space-y-5">
                      <h4 className="text-sm font-semibold text-[#0A0A0A] dark:text-white border-b border-[#E5E5E5] dark:border-[#262626] pb-2">Direct Contact</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        <div>
                          <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">Contact Email</label>
                          <input
                            type="email"
                            name="contactEmail"
                            defaultValue={initialConfig.contactEmail}
                            className="w-full px-3 py-2.5 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">Phone</label>
                          <input
                            type="tel"
                            name="contactPhone"
                            defaultValue={initialConfig.contactPhone}
                            className="w-full px-3 py-2.5 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">WhatsApp Number</label>
                          <input
                            type="tel"
                            name="whatsappNumber"
                            defaultValue={initialConfig.whatsappNumber ? initialConfig.whatsappNumber.replace(/[^0-9]/g, "") : ""}
                            placeholder="e.g. +919876543210"
                            className="w-full px-3 py-2.5 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                          />
                        </div>
                      </div>
                    </div>
                    {/* Social Fields */}
                    <div className="space-y-5">
                      <h4 className="text-sm font-semibold text-[#0A0A0A] dark:text-white border-b border-[#E5E5E5] dark:border-[#262626] pb-2">Social Links</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        <div>
                          <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">YouTube URL</label>
                          <input
                            type="url"
                            name="youtubeUrl"
                            defaultValue={initialConfig.youtubeUrl || ""}
                            placeholder="https://youtube.com/..."
                            className="w-full px-3 py-2.5 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">Facebook URL</label>
                          <input
                            type="url"
                            name="facebookUrl"
                            defaultValue={initialConfig.facebookUrl || ""}
                            placeholder="https://facebook.com/..."
                            className="w-full px-3 py-2.5 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">Instagram URL</label>
                          <input
                            type="url"
                            name="instagramUrl"
                            defaultValue={initialConfig.instagramUrl || ""}
                            placeholder="https://instagram.com/..."
                            className="w-full px-3 py-2.5 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">LinkedIn URL</label>
                          <input
                            type="url"
                            name="linkedinUrl"
                            defaultValue={initialConfig.linkedinUrl || ""}
                            placeholder="https://linkedin.com/..."
                            className="w-full px-3 py-2.5 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">X (Twitter) URL</label>
                          <input
                            type="url"
                            name="twitterUrl"
                            defaultValue={initialConfig.twitterUrl || ""}
                            placeholder="https://x.com/..."
                            className="w-full px-3 py-2.5 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">Behance URL</label>
                          <input
                            type="url"
                            name="behanceUrl"
                            defaultValue={initialConfig.behanceUrl || ""}
                            placeholder="https://behance.net/..."
                            className="w-full px-3 py-2.5 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-8 border-t border-[#E5E5E5] dark:border-[#262626] pt-6">
                    <Button variant="primary" size="sm" type="submit">Save Changes</Button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Accordion 4: Floating Widget Controls */}
          <div className="rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] overflow-hidden transition-all duration-300 shadow-sm">
            <button 
              onClick={() => toggleSection("widgets")}
              className="w-full flex items-center justify-between p-4 px-5 text-left hover:bg-[#FBFBFB] dark:hover:bg-[#111111] transition-colors focus-visible:outline-none"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111] flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#0A0A0A] dark:text-white tracking-tight">Floating Widget Controls</h3>
                  <p className="text-xs text-[#737373] mt-0.5">WhatsApp and AI Chatbot visibility and configuration.</p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#737373] transition-transform duration-300 ${expandedSection === "widgets" ? "rotate-180" : ""}`} />
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedSection === "widgets" ? "max-h-96 border-t border-[#E5E5E5] dark:border-[#262626] opacity-100" : "max-h-0 opacity-0"}`}>
              <form action={handleWidgetSubmit} className="p-6 space-y-5 bg-white dark:bg-[#0A0A0A]">
                <div className="flex items-center justify-between max-w-md mb-4">
                  <div>
                    <p className="text-sm font-semibold text-[#0A0A0A] dark:text-white">Enable WhatsApp Widget</p>
                    <p className="text-xs text-[#737373] mt-0.5">Show the chat bubble on all public pages.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input type="checkbox" name="enableWhatsappWidget" defaultChecked={initialConfig.enableWhatsappWidget} className="sr-only peer" />
                    <div className="w-9 h-5 bg-[#E5E5E5] dark:bg-[#262626] peer-focus:ring-2 peer-focus:ring-[#0A0A0A] dark:peer-focus:ring-white rounded-full peer peer-checked:bg-[#0A0A0A] dark:peer-checked:bg-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-[#0A0A0A] after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                </div>
                <div className="flex justify-end max-w-md">
                  <Button variant="primary" size="sm" type="submit">Save Changes</Button>
                </div>
              </form>
            </div>
          </div>

          {/* Accordion 5: Authentication & Verification Controls */}
          <div className="rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] overflow-hidden transition-all duration-300 shadow-sm">
            <button 
              onClick={() => toggleSection("auth")}
              className="w-full flex items-center justify-between p-4 px-5 text-left hover:bg-[#FBFBFB] dark:hover:bg-[#111111] transition-colors focus-visible:outline-none"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111] flex items-center justify-center shrink-0">
                  <KeyRound className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#0A0A0A] dark:text-white tracking-tight">Authentication & Verification Controls</h3>
                  <p className="text-xs text-[#737373] mt-0.5">Control email OTP verification on registration (Default: Inactive/Off).</p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#737373] transition-transform duration-300 ${expandedSection === "auth" ? "rotate-180" : ""}`} />
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedSection === "auth" ? "max-h-96 border-t border-[#E5E5E5] dark:border-[#262626] opacity-100" : "max-h-0 opacity-0"}`}>
              <form action={handleAuthSubmit} className="p-6 space-y-5 bg-white dark:bg-[#0A0A0A]">
                <div className="flex items-center justify-between max-w-xl mb-4">
                  <div>
                    <p className="text-sm font-semibold text-[#0A0A0A] dark:text-white">Require Email OTP Verification</p>
                    <p className="text-xs text-[#737373] mt-0.5">When active, newly registered clients must verify a 6-digit OTP sent to their email before accessing the portal. When inactive (default), users are instantly verified.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
                    <input type="checkbox" name="requireEmailVerification" defaultChecked={initialConfig.requireEmailVerification} className="sr-only peer" />
                    <div className="w-9 h-5 bg-[#E5E5E5] dark:bg-[#262626] peer-focus:ring-2 peer-focus:ring-[#0A0A0A] dark:peer-focus:ring-white rounded-full peer peer-checked:bg-[#0A0A0A] dark:peer-checked:bg-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-[#0A0A0A] after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                  </label>
                </div>
                <div className="flex justify-end max-w-xl">
                  <Button variant="primary" size="sm" type="submit">Save Changes</Button>
                </div>
              </form>
            </div>
          </div>
          
        </div>
      )}
      
      {activeTab === "pricing" && (
        <PricingTabContent pricingPackages={pricingPackages} pricingServices={pricingServices} />
      )}

      {activeTab !== "branding" && activeTab !== "pricing" && (
        <div className="py-16 flex flex-col items-center justify-center text-center border border-dashed border-[#E5E5E5] dark:border-[#262626] rounded-2xl bg-white dark:bg-transparent">
          <p className="text-[#737373] text-sm">Settings for {TABS.find(t => t.id === activeTab)?.label} are coming soon.</p>
        </div>
      )}
    </div>
  );
}
