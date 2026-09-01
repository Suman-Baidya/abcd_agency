"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ChevronDown, User, ShieldCheck, MonitorSmartphone } from "lucide-react";


export default function ProfilePage() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">
          Admin Profile
        </h1>
        <p className="text-sm text-[#737373] dark:text-neutral-400 mt-1">
          Manage your personal information and account settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="!p-0 overflow-hidden lg:col-span-1">
          <div className="p-6 sm:p-8 flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] flex items-center justify-center text-2xl font-bold mb-4 ring-4 ring-[#E5E5E5] dark:ring-[#262626]">
              SB
            </div>
            <h2 className="text-lg font-bold text-[#0A0A0A] dark:text-white">
              Suman Baidya
            </h2>
            <p className="text-xs text-[#737373] dark:text-neutral-400 mt-0.5">
              suman.baidya.pro@gmail.com
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Badge
                variant="solid"
                className="bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] border-none"
              >
                Super Admin
              </Badge>
            </div>

            {/* Quick Stats */}
            <div className="w-full mt-6 pt-6 border-t border-[#E5E5E5] dark:border-[#262626] grid grid-cols-3 gap-4">
              <div>
                <p className="text-lg font-bold text-[#0A0A0A] dark:text-white">
                  12
                </p>
                <p className="text-[10px] font-semibold text-[#737373] dark:text-neutral-400 uppercase tracking-wider">
                  Projects
                </p>
              </div>
              <div>
                <p className="text-lg font-bold text-[#0A0A0A] dark:text-white">
                  24
                </p>
                <p className="text-[10px] font-semibold text-[#737373] dark:text-neutral-400 uppercase tracking-wider">
                  Clients
                </p>
              </div>
              <div>
                <p className="text-lg font-bold text-[#0A0A0A] dark:text-white">
                  2y
                </p>
                <p className="text-[10px] font-semibold text-[#737373] dark:text-neutral-400 uppercase tracking-wider">
                  Active
                </p>
              </div>
            </div>
          </div>

          {/* Activity Info */}
          <div className="px-6 sm:px-8 py-4 border-t border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#0A0A0A] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#737373] dark:text-neutral-400">
                Member Since
              </span>
              <span className="font-semibold text-[#0A0A0A] dark:text-white">
                Jan 2025
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#737373] dark:text-neutral-400">
                Last Login
              </span>
              <span className="font-semibold text-[#0A0A0A] dark:text-white">
                Today, 09:45 AM
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#737373] dark:text-neutral-400">
                Timezone
              </span>
              <span className="font-semibold text-[#0A0A0A] dark:text-white">
                IST (UTC+5:30)
              </span>
            </div>
          </div>
        </Card>

        {/* Edit Form Accordions */}
        <div className="lg:col-span-2 space-y-4">
          {/* Personal Info Accordion */}
          <div className="rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] overflow-hidden transition-all duration-300 shadow-sm">
            <button
              onClick={() => setExpandedSection(expandedSection === "personal" ? null : "personal")}
              className="w-full flex items-center justify-between p-4 px-5 text-left hover:bg-[#FBFBFB] dark:hover:bg-[#111111] transition-colors focus-visible:outline-none"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111] flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#0A0A0A] dark:text-white tracking-tight">Personal Information</h3>
                  <p className="text-xs text-[#737373] mt-0.5">Update your personal details.</p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#737373] transition-transform duration-300 ${expandedSection === "personal" ? "rotate-180" : ""}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedSection === "personal" ? "max-h-[800px] border-t border-[#E5E5E5] dark:border-[#262626] opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
                      First Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Suman"
                      className="w-full px-3 py-2.5 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
                      Last Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Baidya"
                      className="w-full px-3 py-2.5 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    defaultValue="suman.baidya.pro@gmail.com"
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-[#F5F5F5] dark:bg-[#111111] text-[#737373] dark:text-neutral-400 cursor-not-allowed"
                    disabled
                  />
                  <p className="text-[10px] text-[#737373] dark:text-neutral-400 mt-1">
                    Email cannot be changed. Contact support for assistance.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      defaultValue="+91 6009 678 355"
                      className="w-full px-3 py-2.5 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
                      Location
                    </label>
                    <input
                      type="text"
                      defaultValue="Tripura, India"
                      className="w-full px-3 py-2.5 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
                    Bio
                  </label>
                  <textarea
                    rows={3}
                    defaultValue="Founder & CEO at ABCD Agency. Passionate about building premium digital experiences with AI-powered solutions."
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white resize-none"
                  />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#0A0A0A] flex justify-end gap-3">
                <Button variant="ghost" size="sm" className="text-xs">
                  Cancel
                </Button>
                <Button variant="primary" size="sm">
                  Save Changes
                </Button>
              </div>
            </div>
          </div>

          {/* Security Accordion */}
          <div className="rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] overflow-hidden transition-all duration-300 shadow-sm">
            <button
              onClick={() => setExpandedSection(expandedSection === "security" ? null : "security")}
              className="w-full flex items-center justify-between p-4 px-5 text-left hover:bg-[#FBFBFB] dark:hover:bg-[#111111] transition-colors focus-visible:outline-none"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#0A0A0A] dark:text-white tracking-tight">Security</h3>
                  <p className="text-xs text-[#737373] mt-0.5">Manage your password and security settings.</p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#737373] transition-transform duration-300 ${expandedSection === "security" ? "rotate-180" : ""}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedSection === "security" ? "max-h-[800px] border-t border-[#E5E5E5] dark:border-[#262626] opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
                    Current Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    className="w-full px-3 py-2.5 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      className="w-full px-3 py-2.5 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className="w-full px-3 py-2.5 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                    />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#0A0A0A] flex justify-end">
                <Button variant="primary" size="sm">
                  Update Password
                </Button>
              </div>
            </div>
          </div>

          {/* Active Sessions Accordion */}
          <div className="rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] overflow-hidden transition-all duration-300 shadow-sm">
            <button
              onClick={() => setExpandedSection(expandedSection === "sessions" ? null : "sessions")}
              className="w-full flex items-center justify-between p-4 px-5 text-left hover:bg-[#FBFBFB] dark:hover:bg-[#111111] transition-colors focus-visible:outline-none"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111] flex items-center justify-center shrink-0">
                  <MonitorSmartphone className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#0A0A0A] dark:text-white tracking-tight">Active Sessions</h3>
                  <p className="text-xs text-[#737373] mt-0.5">Devices currently signed in to your account.</p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#737373] transition-transform duration-300 ${expandedSection === "sessions" ? "rotate-180" : ""}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedSection === "sessions" ? "max-h-[800px] border-t border-[#E5E5E5] dark:border-[#262626] opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="divide-y divide-[#E5E5E5] dark:divide-[#262626]">
                {[
                  {
                    device: "Chrome on Windows",
                    location: "Tripura, India",
                    ip: "103.xx.xx.45",
                    time: "Active now",
                    current: true,
                  },
                  {
                    device: "Safari on iPhone",
                    location: "Tripura, India",
                    ip: "103.xx.xx.46",
                    time: "2 hours ago",
                    current: false,
                  },
                ].map((session) => (
                  <div
                    key={session.device}
                    className="px-6 py-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-[#F5F5F5] dark:bg-[#262626] flex items-center justify-center shrink-0">
                        <svg
                          className="w-4 h-4 text-[#0A0A0A] dark:text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#0A0A0A] dark:text-white flex items-center gap-2">
                          {session.device}
                          {session.current && (
                            <Badge
                              variant="solid"
                              size="sm"
                              className="bg-[#10B981]/10 text-[#10B981] dark:bg-[#10B981]/20 border-none"
                            >
                              Current
                            </Badge>
                          )}
                        </p>
                        <p className="text-xs text-[#737373] dark:text-neutral-400 mt-0.5">
                          {session.location} · {session.ip} · {session.time}
                        </p>
                      </div>
                    </div>
                    {!session.current && (
                      <button className="text-xs font-semibold text-red-700 dark:text-red-400 hover:underline shrink-0">
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
