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
  KeyRound,
  Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ImageUploadInput } from "@/components/ui/ImageUploadInput";
import { 
  updateBrandingSettings, 
  updateContactAndSocialSettings, 
  updateWidgetSettings, 
  updateAuthSettings,
  updateCareersSettings
} from "./actions";

import toast from "react-hot-toast";
import { PricingTabContent } from "./PricingTabContent";
import { CareersTabContent } from "./CareersTabContent";
import { LegalTabContent } from "./LegalTabContent";

const TABS = [
  { id: "branding", label: "Branding", icon: Palette },
  { id: "careers", label: "Careers", icon: Briefcase },
  { id: "pricing", label: "Pricing", icon: IndianRupee },
  { id: "legal", label: "Legal Pages", icon: ShieldCheck },
  { id: "blog", label: "Blog", icon: BookOpen },
  { id: "documents", label: "Documents", icon: FileText },
];

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

  const handleCareersSubmit = async (formData: FormData) => {
    const promise = updateCareersSettings(formData);
    toast.promise(promise, {
      loading: 'Saving careers & hiring settings...',
      success: 'Careers settings saved!',
      error: 'Failed to save careers settings.',
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
          Configure global site settings, branding, dynamic careers, and legal policies.
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
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] shadow-xs"
                  : "text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#111111]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content: Branding & Contact */}
      {activeTab === "branding" && (
        <div className="space-y-4">
          {/* Accordion 1: General Branding */}
          <div className="rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] overflow-hidden transition-all duration-300 shadow-sm">
            <button 
              onClick={() => toggleSection("general")}
              className="w-full flex items-center justify-between p-4 px-5 text-left hover:bg-[#FBFBFB] dark:hover:bg-[#111111] transition-colors focus-visible:outline-none"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111] flex items-center justify-center shrink-0">
                  <Palette className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#0A0A0A] dark:text-white tracking-tight">General Branding</h3>
                  <p className="text-xs text-[#737373] mt-0.5">Agency title, dark/light logos, and favicon.</p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#737373] transition-transform duration-300 ${expandedSection === "general" ? "rotate-180" : ""}`} />
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedSection === "general" ? "max-h-[800px] border-t border-[#E5E5E5] dark:border-[#262626] opacity-100" : "max-h-0 opacity-0"}`}>
              <form action={handleBrandingSubmit} className="p-6 space-y-5 bg-white dark:bg-[#0A0A0A]">
                <div className="space-y-1.5 max-w-md">
                  <label className="text-xs font-semibold text-[#0A0A0A] dark:text-white">Agency Name</label>
                  <input
                    type="text"
                    name="agencyName"
                    defaultValue={initialConfig.agencyName}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-transparent text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
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
                </div>

                <div className="max-w-md">
                  <ImageUploadInput
                    name="faviconUrl"
                    label="Favicon (32x32 PNG/ICO)"
                    defaultValue={initialConfig.faviconUrl}
                  />
                </div>

                <div className="flex justify-end max-w-xl">
                  <Button variant="primary" size="sm" type="submit">Save Changes</Button>
                </div>
              </form>
            </div>
          </div>

          {/* Accordion 2: Contact Information */}
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
                  <h3 className="text-[15px] font-bold text-[#0A0A0A] dark:text-white tracking-tight">Contact Information</h3>
                  <p className="text-xs text-[#737373] mt-0.5">Primary email, phone numbers, and WhatsApp line.</p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#737373] transition-transform duration-300 ${expandedSection === "contact" ? "rotate-180" : ""}`} />
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedSection === "contact" ? "max-h-[800px] border-t border-[#E5E5E5] dark:border-[#262626] opacity-100" : "max-h-0 opacity-0"}`}>
              <form action={handleContactSubmit} className="p-6 space-y-5 bg-white dark:bg-[#0A0A0A]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#0A0A0A] dark:text-white">Contact Email</label>
                    <input
                      type="email"
                      name="contactEmail"
                      defaultValue={initialConfig.contactEmail}
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-transparent text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#0A0A0A] dark:text-white">Contact Phone</label>
                    <input
                      type="text"
                      name="contactPhone"
                      defaultValue={initialConfig.contactPhone}
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-transparent text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 max-w-md">
                  <label className="text-xs font-semibold text-[#0A0A0A] dark:text-white">WhatsApp Business Number (with country code)</label>
                  <input
                    type="text"
                    name="whatsappNumber"
                    defaultValue={initialConfig.whatsappNumber}
                    placeholder="e.g. 919876543210"
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-transparent text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                  />
                </div>

                <div className="flex justify-end max-w-xl">
                  <Button variant="primary" size="sm" type="submit">Save Changes</Button>
                </div>
              </form>
            </div>
          </div>

          {/* Accordion 3: Social Links */}
          <div className="rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] overflow-hidden transition-all duration-300 shadow-sm">
            <button 
              onClick={() => toggleSection("social")}
              className="w-full flex items-center justify-between p-4 px-5 text-left hover:bg-[#FBFBFB] dark:hover:bg-[#111111] transition-colors focus-visible:outline-none"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111] flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#0A0A0A] dark:text-white tracking-tight">Social Links</h3>
                  <p className="text-xs text-[#737373] mt-0.5">LinkedIn, Twitter/X, Instagram, Behance, YouTube.</p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#737373] transition-transform duration-300 ${expandedSection === "social" ? "rotate-180" : ""}`} />
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedSection === "social" ? "max-h-[800px] border-t border-[#E5E5E5] dark:border-[#262626] opacity-100" : "max-h-0 opacity-0"}`}>
              <form action={handleContactSubmit} className="p-6 space-y-4 bg-white dark:bg-[#0A0A0A]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#0A0A0A] dark:text-white">LinkedIn URL</label>
                    <input
                      type="url"
                      name="linkedinUrl"
                      defaultValue={initialConfig.linkedinUrl}
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-transparent text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#0A0A0A] dark:text-white">Twitter / X URL</label>
                    <input
                      type="url"
                      name="twitterUrl"
                      defaultValue={initialConfig.twitterUrl}
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-transparent text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#0A0A0A] dark:text-white">Facebook URL</label>
                    <input
                      type="url"
                      name="facebookUrl"
                      defaultValue={initialConfig.facebookUrl}
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-transparent text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#0A0A0A] dark:text-white">Instagram URL</label>
                    <input
                      type="url"
                      name="instagramUrl"
                      defaultValue={initialConfig.instagramUrl}
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-transparent text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#0A0A0A] dark:text-white">YouTube URL</label>
                    <input
                      type="url"
                      name="youtubeUrl"
                      defaultValue={initialConfig.youtubeUrl}
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-transparent text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#0A0A0A] dark:text-white">Behance URL</label>
                    <input
                      type="url"
                      name="behanceUrl"
                      defaultValue={initialConfig.behanceUrl}
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-transparent text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end max-w-xl">
                  <Button variant="primary" size="sm" type="submit">Save Changes</Button>
                </div>
              </form>
            </div>
          </div>

          {/* Accordion 4: Interactive Widgets */}
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
                  <h3 className="text-[15px] font-bold text-[#0A0A0A] dark:text-white tracking-tight">Interactive Widgets</h3>
                  <p className="text-xs text-[#737373] mt-0.5">Toggle WhatsApp floating chat bubble and other embeds.</p>
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
                  <h3 className="text-[15px] font-bold text-[#0A0A0A] dark:text-white tracking-tight">Authentication &amp; Verification Controls</h3>
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

      {/* Tab Content: Careers */}
      {activeTab === "careers" && (
        <CareersTabContent initialConfig={initialConfig} />
      )}
      
      {/* Tab Content: Pricing */}
      {activeTab === "pricing" && (
        <PricingTabContent pricingPackages={pricingPackages} pricingServices={pricingServices} />
      )}

      {/* Tab Content: Legal Pages */}
      {activeTab === "legal" && (
        <LegalTabContent initialConfig={initialConfig} />
      )}

      {/* Other Placeholder Tabs */}
      {activeTab !== "branding" && activeTab !== "careers" && activeTab !== "pricing" && activeTab !== "legal" && (
        <div className="py-16 flex flex-col items-center justify-center text-center border border-dashed border-[#E5E5E5] dark:border-[#262626] rounded-2xl bg-white dark:bg-transparent">
          <p className="text-[#737373] text-sm">Settings for {TABS.find(t => t.id === activeTab)?.label} are coming soon.</p>
        </div>
      )}
    </div>
  );
}
