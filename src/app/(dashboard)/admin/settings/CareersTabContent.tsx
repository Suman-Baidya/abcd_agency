"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { updateCareersSettings } from "./actions";
import toast from "react-hot-toast";
import { 
  Briefcase, 
  Sparkles, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  Mail,
  Sliders,
  Eye
} from "lucide-react";

export function CareersTabContent({ initialConfig }: { initialConfig: any }) {
  const [enableCareers, setEnableCareers] = useState<boolean>(!!initialConfig.enableCareers);
  const [statusText, setStatusText] = useState<string>(initialConfig.careersStatusText || "Currently Closed");
  const [noticeText, setNoticeText] = useState<string>(
    initialConfig.careersNotice ||
      "We are not actively hiring for full-time positions at the moment, but we welcome open applications for future engineering and design sprints."
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const promise = updateCareersSettings(formData);

    toast.promise(promise, {
      loading: "Saving careers configuration...",
      success: "Careers settings updated successfully!",
      error: "Failed to update careers settings.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Live Indicator */}
      <div className="p-5 rounded-2xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#1A1A1A] flex items-center justify-center shrink-0">
            <Briefcase className="w-6 h-6 text-[#0A0A0A] dark:text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-base font-bold text-[#0A0A0A] dark:text-white tracking-tight">
                Careers &amp; Hiring Control Center
              </h2>
              <span
                className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${
                  enableCareers
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                }`}
              >
                {enableCareers ? "Hiring Open" : "Positions Closed"}
              </span>
            </div>
            <p className="text-xs text-[#737373] dark:text-neutral-400">
              Manage public hiring availability, custom footer badges, and the careers page talent pool notice.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/careers"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#0A0A0A] dark:text-white hover:bg-[#E5E5E5] dark:hover:bg-[#262626] transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Public Page</span>
            <ExternalLink className="w-3 h-3 text-[#737373]" />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Settings Form (Col 1-7) */}
        <div className="lg:col-span-7">
          <form
            onSubmit={handleSubmit}
            className="p-6 rounded-2xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] space-y-6 shadow-xs"
          >
            <div className="flex items-center gap-2 pb-4 border-b border-[#E5E5E5] dark:border-[#262626]">
              <Sliders className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
              <h3 className="text-sm font-bold text-[#0A0A0A] dark:text-white">
                Hiring Availability Configuration
              </h3>
            </div>

            {/* Master Toggle */}
            <div className="flex items-start justify-between gap-4 p-4 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111]">
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#0A0A0A] dark:text-white">
                  Enable Active Job Openings
                </p>
                <p className="text-xs text-[#737373] dark:text-neutral-400 leading-relaxed">
                  When enabled, public visitors see active job listing cards. When disabled, it shows the &ldquo;No Open Positions / Talent Network&rdquo; state.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  name="enableCareers"
                  checked={enableCareers}
                  onChange={(e) => {
                    setEnableCareers(e.target.checked);
                    if (!e.target.checked && statusText === "Actively Hiring") {
                      setStatusText("Currently Closed");
                    } else if (e.target.checked && statusText === "Currently Closed") {
                      setStatusText("Actively Hiring");
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-[#E5E5E5] dark:bg-[#262626] peer-focus:ring-2 peer-focus:ring-[#0A0A0A] dark:peer-focus:ring-white rounded-full peer peer-checked:bg-[#0A0A0A] dark:peer-checked:bg-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-[#0A0A0A] after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
              </label>
            </div>

            {/* Status Label Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0A0A0A] dark:text-white flex items-center justify-between">
                <span>Status Badge Text</span>
                <span className="text-[10px] text-[#737373] font-normal">Appears in footer link and header badges</span>
              </label>
              <input
                type="text"
                name="careersStatusText"
                value={statusText}
                onChange={(e) => setStatusText(e.target.value)}
                placeholder="e.g. Currently Closed, Hiring Paused, Not Available, Actively Hiring"
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-transparent text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                required
              />
              <div className="flex items-center gap-1.5 pt-1">
                <span className="text-[10px] text-[#737373]">Presets:</span>
                {(["Currently Closed", "Hiring Paused", "Not Available", "Actively Hiring"] as const).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setStatusText(preset)}
                    className="text-[10px] font-mono px-2 py-0.5 rounded border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white transition-colors cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Explanation / Notice Notice */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0A0A0A] dark:text-white flex items-center justify-between">
                <span>Public Career Notice / Policy Explanation</span>
                <span className="text-[10px] text-[#737373] font-normal">Displayed on /careers when positions are closed</span>
              </label>
              <textarea
                name="careersNotice"
                rows={4}
                value={noticeText}
                onChange={(e) => setNoticeText(e.target.value)}
                placeholder="Provide details regarding why positions are not currently open or instructions on joining the talent roster..."
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-transparent text-[#0A0A0A] dark:text-white outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white resize-none"
              />
            </div>

            <div className="flex items-center justify-end pt-2">
              <Button variant="primary" size="sm" type="submit">
                Save Careers Settings
              </Button>
            </div>
          </form>
        </div>

        {/* Live Preview Card (Col 8-12) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Footer Preview */}
          <div className="p-5 rounded-2xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] space-y-4 shadow-xs">
            <h4 className="text-xs font-bold text-[#737373] uppercase tracking-wider font-mono">
              Live Footer Link Preview
            </h4>
            <div className="p-4 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111] flex items-center justify-between">
              <span className="text-xs text-[#737373]">Company &gt;</span>
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0A0A0A] dark:text-white">
                <span>Careers</span>
                {!enableCareers ? (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[#E5E5E5] dark:border-[#262626] bg-[#F5F5F5] dark:bg-[#1A1A1A] text-[#737373] dark:text-[#A3A3A3] tracking-tight">
                    {statusText || "Closed"}
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold tracking-tight">
                    Hiring
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Careers Page Banner Preview */}
          <div className="p-5 rounded-2xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] space-y-3 shadow-xs">
            <h4 className="text-xs font-bold text-[#737373] uppercase tracking-wider font-mono">
              Page State Summary
            </h4>
            <div className="p-4 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111] space-y-2.5">
              <div className="flex items-center gap-2">
                {enableCareers ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                )}
                <span className="text-xs font-bold text-[#0A0A0A] dark:text-white">
                  {enableCareers ? "Active Listings Mode" : "Talent Network Mode"}
                </span>
              </div>
              <p className="text-[11px] text-[#737373] dark:text-neutral-400 leading-relaxed">
                {enableCareers
                  ? "Visitors can browse open roles and click 'Apply via Email' to submit direct applications."
                  : "Visitors will see the 'No Open Positions Right Now' card with your custom notice and a button to submit their portfolio for future sprint contracts."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
