"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Palette, 
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
  updateContactSettings,
  updateSocialSettings,
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
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(
    tabParam && TABS.some((t) => t.id === tabParam) ? tabParam : "branding"
  );

  useEffect(() => {
    if (tabParam && TABS.some((t) => t.id === tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const [socialStates, setSocialStates] = useState<Record<string, boolean>>({
    enableLinkedin: initialConfig?.enableLinkedin !== false,
    enableTwitter: initialConfig?.enableTwitter !== false,
    enableFacebook: initialConfig?.enableFacebook !== false,
    enableInstagram: initialConfig?.enableInstagram !== false,
    enableYoutube: initialConfig?.enableYoutube !== false,
    enableBehance: initialConfig?.enableBehance !== false,
    enableWhatsappSocial: initialConfig?.enableWhatsappSocial !== false,
  });

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
    const promise = updateContactSettings(formData);
    toast.promise(promise, {
      loading: 'Saving contact settings...',
      success: 'Contact settings saved!',
      error: 'Failed to save contact settings.',
    });
  };

  const handleSocialSubmit = async (formData: FormData) => {
    const promise = updateSocialSettings(formData);
    toast.promise(promise, {
      loading: 'Saving social links & visibility...',
      success: 'Social links and active visibility saved!',
      error: 'Failed to save social links.',
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
              onClick={() => {
                setActiveTab(tab.id);
                router.replace(`/admin/settings?tab=${tab.id}`, { scroll: false });
              }}
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
                  <p className="text-xs text-[#737373] mt-0.5">Primary email, phone numbers, WhatsApp line, address, and domain.</p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#737373] transition-transform duration-300 ${expandedSection === "contact" ? "rotate-180" : ""}`} />
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedSection === "contact" ? "max-h-[1000px] border-t border-[#E5E5E5] dark:border-[#262626] opacity-100" : "max-h-0 opacity-0"}`}>
              <form action={handleContactSubmit} className="p-6 space-y-5 bg-white dark:bg-[#0A0A0A]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#0A0A0A] dark:text-white">Contact Email</label>
                    <input
                      type="email"
                      name="contactEmail"
                      defaultValue={initialConfig.contactEmail}
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-transparent text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#0A0A0A] dark:text-white">Contact Phone</label>
                    <input
                      type="text"
                      name="contactPhone"
                      defaultValue={initialConfig.contactPhone}
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-transparent text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5 max-w-xl">
                  <label className="text-xs font-semibold text-[#0A0A0A] dark:text-white">WhatsApp Business Number (with country code)</label>
                  <input
                    type="text"
                    name="whatsappNumber"
                    defaultValue={initialConfig.whatsappNumber}
                    placeholder="e.g. 918167685731"
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-transparent text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                  />
                  <p className="text-[11px] text-[#737373]">Used across direct contact buttons, consultation links, and WhatsApp widgets.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#0A0A0A] dark:text-white">Primary Website URL</label>
                    <input
                      type="url"
                      name="websiteUrl"
                      defaultValue={initialConfig.websiteUrl || "https://abcddigitalhub.com"}
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-transparent text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#0A0A0A] dark:text-white">Office Location / Address</label>
                    <input
                      type="text"
                      name="address"
                      defaultValue={initialConfig.address || "Tripura, India"}
                      className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-transparent text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end max-w-xl pt-2">
                  <Button variant="primary" size="sm" type="submit">Save Contact Details</Button>
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
                  <h3 className="text-[15px] font-bold text-[#0A0A0A] dark:text-white tracking-tight">Social Links &amp; Public Visibility</h3>
                  <p className="text-xs text-[#737373] mt-0.5">Toggle each platform Active / Inactive to show or hide it on the main site.</p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#737373] transition-transform duration-300 ${expandedSection === "social" ? "rotate-180" : ""}`} />
            </button>
            
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedSection === "social" ? "max-h-[2500px] border-t border-[#E5E5E5] dark:border-[#262626] opacity-100" : "max-h-0 opacity-0"}`}>
              <form action={handleSocialSubmit} className="p-6 space-y-6 bg-white dark:bg-[#0A0A0A]">
                <div className="flex items-center justify-between p-3.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-[#FAFAFA] dark:bg-[#111111]">
                  <div>
                    <p className="text-xs font-bold text-[#0A0A0A] dark:text-white">Public Site Display Rules</p>
                    <p className="text-[11px] text-[#737373] mt-0.5">Active links appear in the Footer, Header, and SEO metadata. Inactive links are completely hidden from public visitors.</p>
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#1A1A1A] text-[#0A0A0A] dark:text-white shrink-0">
                    {Object.values(socialStates).filter(Boolean).length} / 7 Active
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* LinkedIn */}
                  <div className="p-4 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#1A1A1A] flex items-center justify-center text-[#0A0A0A] dark:text-white shrink-0">
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#0A0A0A] dark:text-white">LinkedIn</span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border ${
                              socialStates.enableLinkedin
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#737373]"
                            }`}>
                              {socialStates.enableLinkedin ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#737373]">Company &amp; Founder Profile</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          name="enableLinkedin"
                          checked={socialStates.enableLinkedin}
                          onChange={(e) => setSocialStates((prev) => ({ ...prev, enableLinkedin: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-[#E5E5E5] dark:bg-[#262626] peer-focus:ring-2 peer-focus:ring-[#0A0A0A] dark:peer-focus:ring-white rounded-full peer peer-checked:bg-[#0A0A0A] dark:peer-checked:bg-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-[#0A0A0A] after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                      </label>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#737373] dark:text-neutral-400">Profile URL</label>
                      <input
                        type="url"
                        name="linkedinUrl"
                        defaultValue={initialConfig.linkedinUrl || ""}
                        placeholder="https://linkedin.com/company/abcddigitalhub"
                        className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                      />
                    </div>
                  </div>

                  {/* Twitter / X */}
                  <div className="p-4 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#1A1A1A] flex items-center justify-center text-[#0A0A0A] dark:text-white shrink-0">
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#0A0A0A] dark:text-white">Twitter / X</span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border ${
                              socialStates.enableTwitter
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#737373]"
                            }`}>
                              {socialStates.enableTwitter ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#737373]">Engineering Updates &amp; News</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          name="enableTwitter"
                          checked={socialStates.enableTwitter}
                          onChange={(e) => setSocialStates((prev) => ({ ...prev, enableTwitter: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-[#E5E5E5] dark:bg-[#262626] peer-focus:ring-2 peer-focus:ring-[#0A0A0A] dark:peer-focus:ring-white rounded-full peer peer-checked:bg-[#0A0A0A] dark:peer-checked:bg-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-[#0A0A0A] after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                      </label>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#737373] dark:text-neutral-400">Profile URL</label>
                      <input
                        type="url"
                        name="twitterUrl"
                        defaultValue={initialConfig.twitterUrl || ""}
                        placeholder="https://x.com/abcd_agency"
                        className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                      />
                    </div>
                  </div>

                  {/* Facebook */}
                  <div className="p-4 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#1A1A1A] flex items-center justify-center text-[#0A0A0A] dark:text-white shrink-0">
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073C24 5.404 18.627 0 12 0S0 5.404 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" /></svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#0A0A0A] dark:text-white">Facebook</span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border ${
                              socialStates.enableFacebook
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#737373]"
                            }`}>
                              {socialStates.enableFacebook ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#737373]">Official Agency Page</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          name="enableFacebook"
                          checked={socialStates.enableFacebook}
                          onChange={(e) => setSocialStates((prev) => ({ ...prev, enableFacebook: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-[#E5E5E5] dark:bg-[#262626] peer-focus:ring-2 peer-focus:ring-[#0A0A0A] dark:peer-focus:ring-white rounded-full peer peer-checked:bg-[#0A0A0A] dark:peer-checked:bg-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-[#0A0A0A] after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                      </label>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#737373] dark:text-neutral-400">Page URL</label>
                      <input
                        type="url"
                        name="facebookUrl"
                        defaultValue={initialConfig.facebookUrl || ""}
                        placeholder="https://facebook.com/abcddigitalhub"
                        className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                      />
                    </div>
                  </div>

                  {/* Instagram */}
                  <div className="p-4 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#1A1A1A] flex items-center justify-center text-[#0A0A0A] dark:text-white shrink-0">
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" /></svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#0A0A0A] dark:text-white">Instagram</span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border ${
                              socialStates.enableInstagram
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#737373]"
                            }`}>
                              {socialStates.enableInstagram ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#737373]">Visual Culture &amp; Behind The Scenes</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          name="enableInstagram"
                          checked={socialStates.enableInstagram}
                          onChange={(e) => setSocialStates((prev) => ({ ...prev, enableInstagram: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-[#E5E5E5] dark:bg-[#262626] peer-focus:ring-2 peer-focus:ring-[#0A0A0A] dark:peer-focus:ring-white rounded-full peer peer-checked:bg-[#0A0A0A] dark:peer-checked:bg-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-[#0A0A0A] after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                      </label>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#737373] dark:text-neutral-400">Profile URL</label>
                      <input
                        type="url"
                        name="instagramUrl"
                        defaultValue={initialConfig.instagramUrl || ""}
                        placeholder="https://instagram.com/abcd_agency"
                        className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                      />
                    </div>
                  </div>

                  {/* YouTube */}
                  <div className="p-4 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#1A1A1A] flex items-center justify-center text-[#0A0A0A] dark:text-white shrink-0">
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#0A0A0A] dark:text-white">YouTube</span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border ${
                              socialStates.enableYoutube
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#737373]"
                            }`}>
                              {socialStates.enableYoutube ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#737373]">Video Demos &amp; Walkthroughs</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          name="enableYoutube"
                          checked={socialStates.enableYoutube}
                          onChange={(e) => setSocialStates((prev) => ({ ...prev, enableYoutube: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-[#E5E5E5] dark:bg-[#262626] peer-focus:ring-2 peer-focus:ring-[#0A0A0A] dark:peer-focus:ring-white rounded-full peer peer-checked:bg-[#0A0A0A] dark:peer-checked:bg-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-[#0A0A0A] after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                      </label>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#737373] dark:text-neutral-400">Channel URL</label>
                      <input
                        type="url"
                        name="youtubeUrl"
                        defaultValue={initialConfig.youtubeUrl || ""}
                        placeholder="https://youtube.com/@abcddigitalhub"
                        className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                      />
                    </div>
                  </div>

                  {/* Behance */}
                  <div className="p-4 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#1A1A1A] flex items-center justify-center text-[#0A0A0A] dark:text-white shrink-0">
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M22 7h-7v-2h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-2.273-5.564-5.405 0-3.136 2.414-5.595 5.564-5.595 2.766 0 5.176 1.956 5.378 4.795h-6.728c.241 1.096 1.206 1.83 2.531 1.83 1.326 0 1.929-.623 2.152-1.353h3.768zm-5.06-4.63c-1.045 0-1.899.645-2.148 1.63h4.153c-.156-1.055-1.066-1.63-2.005-1.63zm-10.428-10.37h-8.238v20h8.775c3.344 0 5.485-1.644 5.485-4.475 0-1.745-1.127-3.238-2.616-3.834 1.139-.77 1.859-2.073 1.859-3.567 0-3.344-2.585-4.457-5.265-4.457h-3v-3.667zm-3.238 6.667h2.247c1.396 0 2.227.656 2.227 1.764 0 1.107-.831 1.764-2.227 1.764h-2.247v-3.528zm0 6.666h2.518c1.644 0 2.646.746 2.646 2.052 0 1.306-1.002 2.053-2.646 2.053h-2.518v-4.105z" /></svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#0A0A0A] dark:text-white">Behance</span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border ${
                              socialStates.enableBehance
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#737373]"
                            }`}>
                              {socialStates.enableBehance ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#737373]">Design Systems &amp; Case Studies</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          name="enableBehance"
                          checked={socialStates.enableBehance}
                          onChange={(e) => setSocialStates((prev) => ({ ...prev, enableBehance: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-[#E5E5E5] dark:bg-[#262626] peer-focus:ring-2 peer-focus:ring-[#0A0A0A] dark:peer-focus:ring-white rounded-full peer peer-checked:bg-[#0A0A0A] dark:peer-checked:bg-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-[#0A0A0A] after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                      </label>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#737373] dark:text-neutral-400">Portfolio URL</label>
                      <input
                        type="url"
                        name="behanceUrl"
                        defaultValue={initialConfig.behanceUrl || ""}
                        placeholder="https://behance.net/abcddigitalhub"
                        className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                      />
                    </div>
                  </div>

                  {/* WhatsApp Direct Social */}
                  <div className="p-4 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#1A1A1A] flex items-center justify-center text-[#0A0A0A] dark:text-white shrink-0">
                          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12.031 0C5.396 0 .029 5.367.029 11.987c0 2.108.549 4.168 1.595 5.972L0 24l6.235-1.587c1.734.945 3.684 1.442 5.796 1.442 6.636 0 12.003-5.367 12.003-11.987C24.034 5.367 18.667 0 12.031 0zm0 21.84c-1.802 0-3.568-.484-5.109-1.399l-.366-.217-3.797.967.985-3.699-.239-.379c-1.006-1.6-1.536-3.468-1.536-5.386 0-5.525 4.495-10.02 10.062-10.02 5.567 0 10.062 4.495 10.062 10.02 0 5.525-4.495 10.02-10.062 10.02zm5.513-7.514c-.302-.151-1.786-.882-2.063-.983-.277-.101-.478-.151-.68.151-.201.302-.781.983-.957 1.185-.176.201-.352.226-.654.075-.302-.151-1.275-.47-2.428-1.499-.898-.801-1.504-1.791-1.68-2.093-.176-.302-.019-.465.132-.616.136-.135.302-.352.453-.528.151-.176.201-.302.302-.503.101-.201.05-.377-.025-.528-.075-.151-.68-1.639-.931-2.244-.244-.59-.493-.51-.68-.52-.176-.009-.377-.009-.579-.009-.201 0-.528.075-.805.377-.277.302-1.057 1.033-1.057 2.519s1.082 2.922 1.233 3.123c.151.201 2.13 3.253 5.16 4.562.721.312 1.284.498 1.723.638.724.23 1.382.198 1.903.12.58-.087 1.786-.73 2.038-1.434.252-.704.252-1.308.176-1.434-.075-.126-.277-.201-.579-.352z" /></svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#0A0A0A] dark:text-white">WhatsApp Social Icon</span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border ${
                              socialStates.enableWhatsappSocial
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : "border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#737373]"
                            }`}>
                              {socialStates.enableWhatsappSocial ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#737373]">Footer &amp; Header Social Icon Link</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          name="enableWhatsappSocial"
                          checked={socialStates.enableWhatsappSocial}
                          onChange={(e) => setSocialStates((prev) => ({ ...prev, enableWhatsappSocial: e.target.checked }))}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-[#E5E5E5] dark:bg-[#262626] peer-focus:ring-2 peer-focus:ring-[#0A0A0A] dark:peer-focus:ring-white rounded-full peer peer-checked:bg-[#0A0A0A] dark:peer-checked:bg-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-[#0A0A0A] after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                      </label>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-[#737373] dark:text-neutral-400">Status Info</label>
                      <p className="text-xs text-[#737373] py-2">
                        Uses configured WhatsApp number ({initialConfig.whatsappNumber || "Not set"}). When active, the WhatsApp icon is included in public header &amp; footer social bars.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button variant="primary" size="sm" type="submit">Save Social Settings</Button>
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
