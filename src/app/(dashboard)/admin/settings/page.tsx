import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/lib/siteConfig";

export const metadata = {
  title: "Settings — ABCD Agency",
};

export default function SettingsPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">
          Settings
        </h1>
        <p className="text-sm text-[#737373] dark:text-neutral-400 mt-1">
          Manage your agency preferences and configurations.
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* General */}
        <Card className="!p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E5E5E5] dark:border-[#262626]">
            <h2 className="text-base font-bold text-[#0A0A0A] dark:text-white">
              General
            </h2>
            <p className="text-xs text-[#737373] dark:text-neutral-400 mt-0.5">
              Basic agency information and branding.
            </p>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
                  Agency Name
                </label>
                <input
                  type="text"
                  defaultValue="ABCD Agency"
                  className="w-full px-3 py-2.5 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
                  Contact Email
                </label>
                <input
                  type="email"
                  defaultValue={siteConfig.contact.email}
                  className="w-full px-3 py-2.5 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
                  Phone
                </label>
                <input
                  type="tel"
                  defaultValue={siteConfig.contact.mobile}
                  className="w-full px-3 py-2.5 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
                  Website
                </label>
                <input
                  type="url"
                  defaultValue="https://abcdagency.com"
                  className="w-full px-3 py-2.5 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
                Address
              </label>
              <textarea
                rows={2}
                defaultValue="Tripura, India"
                className="w-full px-3 py-2.5 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white resize-none"
              />
            </div>
          </div>
          <div className="px-6 py-4 border-t border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#0A0A0A] flex justify-end">
            <Button variant="primary" size="sm">
              Save Changes
            </Button>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="!p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E5E5E5] dark:border-[#262626]">
            <h2 className="text-base font-bold text-[#0A0A0A] dark:text-white">
              Notifications
            </h2>
            <p className="text-xs text-[#737373] dark:text-neutral-400 mt-0.5">
              Configure how you receive alerts and updates.
            </p>
          </div>
          <div className="divide-y divide-[#E5E5E5] dark:divide-[#262626]">
            {[
              {
                title: "Email Notifications",
                desc: "Receive email updates for new inquiries and project changes.",
              },
              {
                title: "Project Deadline Alerts",
                desc: "Get notified 3 days before project deadlines.",
              },
              {
                title: "New Client Alerts",
                desc: "Receive alerts when a new client inquiry is submitted.",
              },
              {
                title: "Weekly Digest",
                desc: "Receive a weekly summary of activity and revenue.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="px-6 py-4 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="text-sm font-semibold text-[#0A0A0A] dark:text-white">
                    {item.title}
                  </p>
                  <p className="text-xs text-[#737373] dark:text-neutral-400 mt-0.5">
                    {item.desc}
                  </p>
                </div>
                {/* Toggle Switch */}
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-[#E5E5E5] dark:bg-[#262626] peer-focus:ring-2 peer-focus:ring-[#0A0A0A] dark:peer-focus:ring-white rounded-full peer peer-checked:bg-[#0A0A0A] dark:peer-checked:bg-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-[#0A0A0A] after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full" />
                </label>
              </div>
            ))}
          </div>
        </Card>

        {/* Integrations */}
        <Card className="!p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E5E5E5] dark:border-[#262626]">
            <h2 className="text-base font-bold text-[#0A0A0A] dark:text-white">
              Integrations
            </h2>
            <p className="text-xs text-[#737373] dark:text-neutral-400 mt-0.5">
              Connected services and API keys.
            </p>
          </div>
          <div className="divide-y divide-[#E5E5E5] dark:divide-[#262626]">
            {[
              {
                name: "Google OAuth",
                status: "Connected",
                icon: "G",
              },
              {
                name: "Resend Email",
                status: "Connected",
                icon: "R",
              },
              {
                name: "Cloudinary",
                status: "Not Connected",
                icon: "C",
              },
              {
                name: "Google Gemini AI",
                status: "Connected",
                icon: "AI",
              },
            ].map((integration) => (
              <div
                key={integration.name}
                className="px-6 py-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-md bg-[#F5F5F5] dark:bg-[#262626] flex items-center justify-center text-xs font-bold text-[#0A0A0A] dark:text-white shrink-0">
                    {integration.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0A0A0A] dark:text-white">
                      {integration.name}
                    </p>
                    <p
                      className={`text-xs mt-0.5 ${
                        integration.status === "Connected"
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-[#737373] dark:text-neutral-400"
                      }`}
                    >
                      {integration.status}
                    </p>
                  </div>
                </div>
                <Button
                  variant={
                    integration.status === "Connected"
                      ? "ghost"
                      : "secondary"
                  }
                  size="sm"
                  className="text-xs"
                >
                  {integration.status === "Connected"
                    ? "Manage"
                    : "Connect"}
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="!p-0 overflow-hidden border-red-200 dark:border-red-900/50">
          <div className="px-6 py-4 border-b border-red-200 dark:border-red-900/50">
            <h2 className="text-base font-bold text-red-700 dark:text-red-400">
              Danger Zone
            </h2>
            <p className="text-xs text-[#737373] dark:text-neutral-400 mt-0.5">
              Irreversible actions. Proceed with caution.
            </p>
          </div>
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#0A0A0A] dark:text-white">
                Delete Account
              </p>
              <p className="text-xs text-[#737373] dark:text-neutral-400 mt-0.5">
                Permanently delete this account and all associated data.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="text-xs text-red-700 dark:text-red-400 border-red-300 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/10 shrink-0"
            >
              Delete Account
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
