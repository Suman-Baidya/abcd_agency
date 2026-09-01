"use client";

import React, { useState, useEffect } from "react";
import { getPortalData, updatePortalProfile } from "../actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  User, 
  ShieldCheck, 
  MonitorSmartphone, 
  ChevronDown, 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Briefcase, 
  CheckCircle2,
  Lock
} from "lucide-react";
import toast from "react-hot-toast";

export default function PortalProfilePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    email: "",
    phone: "",
    whatsapp: "",
    isWhatsappSame: true,
    industry: "",
    location: "",
    website: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const loadData = () => {
    getPortalData().then((res) => {
      if (res && res.user) {
        const u = res.user;
        setData(res);
        setFormData((prev) => ({
          ...prev,
          name: u.name || "",
          companyName: u.companyName || "",
          email: u.email || "",
          phone: u.phone || "",
          whatsapp: u.whatsapp || "",
          isWhatsappSame: u.isWhatsappSame ?? true,
          industry: u.industry || "",
          location: u.location || "",
          website: u.website || "",
        }));
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.companyName.trim()) {
      toast.error("Contact name and Company name are required.");
      return;
    }

    setIsSaving(true);
    try {
      await updatePortalProfile({
        name: formData.name,
        companyName: formData.companyName,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        isWhatsappSame: formData.isWhatsappSame,
        industry: formData.industry,
        location: formData.location,
        website: formData.website,
      });

      toast.success("Profile information updated successfully!");
      loadData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.newPassword) {
      toast.error("Please enter a new password.");
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (formData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await updatePortalProfile({
        name: formData.name,
        companyName: formData.companyName,
        newPassword: formData.newPassword,
      });

      toast.success("Password updated successfully!");
      setFormData((prev) => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
    } catch (err: any) {
      toast.error(err?.message || "Failed to update password.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-black dark:border-white border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#737373] dark:text-neutral-400">Loading profile & account settings...</p>
      </div>
    );
  }

  const user = data?.user;
  const client = data?.client;
  const isProspect = user?.role === "USER";

  const initials = (user?.name || "U")
    .trim()
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const totalProjects = client?.projects?.length || 0;
  const totalDocs = client?.documents?.length || 0;
  const totalInvoices = client?.transactions?.length || 0;

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "Recent";

  const lastLogin = user?.lastLoginAt
    ? new Date(user.lastLoginAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    : "Active Session";

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">
          Client Profile
        </h1>
        <p className="text-sm text-[#737373] dark:text-neutral-400 mt-1">
          Manage your personal information, organization details, and account settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Profile Summary Card (Super Admin Profile Style) */}
        <Card className="!p-0 overflow-hidden lg:col-span-1 border border-[#E5E5E5] dark:border-[#262626]">
          <div className="p-6 sm:p-8 flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] flex items-center justify-center text-2xl font-bold mb-4 ring-4 ring-[#E5E5E5] dark:ring-[#262626]">
              {initials}
            </div>

            <h2 className="text-lg font-bold text-[#0A0A0A] dark:text-white">
              {user?.name}
            </h2>
            <p className="text-xs text-[#737373] dark:text-neutral-400 mt-0.5">
              {user?.email}
            </p>

            <div className="flex items-center gap-2 mt-3">
              <Badge
                variant="solid"
                className="bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] border-none text-xs font-semibold px-3 py-1"
              >
                {isProspect ? "Prospect Account" : "Client Account"}
              </Badge>
            </div>

            {/* Quick Stats */}
            <div className="w-full mt-6 pt-6 border-t border-[#E5E5E5] dark:border-[#262626] grid grid-cols-3 gap-4">
              <div>
                <p className="text-lg font-bold text-[#0A0A0A] dark:text-white">
                  {totalProjects}
                </p>
                <p className="text-[10px] font-semibold text-[#737373] dark:text-neutral-400 uppercase tracking-wider">
                  Projects
                </p>
              </div>
              <div>
                <p className="text-lg font-bold text-[#0A0A0A] dark:text-white">
                  {totalInvoices}
                </p>
                <p className="text-[10px] font-semibold text-[#737373] dark:text-neutral-400 uppercase tracking-wider">
                  Invoices
                </p>
              </div>
              <div>
                <p className="text-lg font-bold text-[#0A0A0A] dark:text-white">
                  {totalDocs}
                </p>
                <p className="text-[10px] font-semibold text-[#737373] dark:text-neutral-400 uppercase tracking-wider">
                  Files
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
                {memberSince}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#737373] dark:text-neutral-400">
                Last Login
              </span>
              <span className="font-semibold text-[#0A0A0A] dark:text-white">
                {lastLogin}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#737373] dark:text-neutral-400">
                Location
              </span>
              <span className="font-semibold text-[#0A0A0A] dark:text-white">
                {user?.location || "India"}
              </span>
            </div>
          </div>
        </Card>

        {/* Edit Form Accordions (Matching Super Admin Profile Accordion style) */}
        <div className="lg:col-span-2 space-y-4">
          {/* 1. Personal & Organization Details Accordion */}
          <div className="rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] overflow-hidden transition-all duration-300 shadow-xs">
            <button
              onClick={() => setExpandedSection(expandedSection === "personal" ? null : "personal")}
              className="w-full flex items-center justify-between p-4 px-5 text-left hover:bg-[#FBFBFB] dark:hover:bg-[#111111] transition-colors focus-visible:outline-none cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111] flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#0A0A0A] dark:text-white tracking-tight">
                    Personal & Organization Details
                  </h3>
                  <p className="text-xs text-[#737373] dark:text-neutral-400 mt-0.5">
                    Update your contact details, company profile, and address.
                  </p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#737373] transition-transform duration-300 ${expandedSection === "personal" ? "rotate-180" : ""}`} />
            </button>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedSection === "personal" ? "max-h-[1200px] border-t border-[#E5E5E5] dark:border-[#262626] opacity-100" : "max-h-0 opacity-0"}`}>
              <form onSubmit={handleSaveProfile}>
                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
                        Contact Person Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
                        Company / Organization Name *
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        required
                        value={formData.companyName}
                        onChange={handleChange}
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
                      value={formData.email}
                      disabled
                      className="w-full px-3 py-2.5 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-[#F5F5F5] dark:bg-[#111111] text-[#737373] dark:text-neutral-400 cursor-not-allowed"
                    />
                    <p className="text-[10px] text-[#737373] dark:text-neutral-400 mt-1">
                      Email is linked to your authentication credentials and cannot be modified directly.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        className="w-full px-3 py-2.5 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
                        WhatsApp Number
                      </label>
                      <input
                        type="tel"
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        className="w-full px-3 py-2.5 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
                        Industry / Sector
                      </label>
                      <input
                        type="text"
                        name="industry"
                        value={formData.industry}
                        onChange={handleChange}
                        placeholder="e.g. Fintech, Healthcare, SaaS"
                        className="w-full px-3 py-2.5 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
                        Location / City
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g. Bangalore, India"
                        className="w-full px-3 py-2.5 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
                      Website URL
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://yourcompany.com"
                      className="w-full px-3 py-2.5 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                    />
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#0A0A0A] flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs cursor-pointer"
                    onClick={loadData}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="text-xs cursor-pointer"
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving Changes..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* 2. Security & Password Accordion */}
          <div className="rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] overflow-hidden transition-all duration-300 shadow-xs">
            <button
              onClick={() => setExpandedSection(expandedSection === "security" ? null : "security")}
              className="w-full flex items-center justify-between p-4 px-5 text-left hover:bg-[#FBFBFB] dark:hover:bg-[#111111] transition-colors focus-visible:outline-none cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#0A0A0A] dark:text-white tracking-tight">Security & Credentials</h3>
                  <p className="text-xs text-[#737373] dark:text-neutral-400 mt-0.5">Manage your password and authentication settings.</p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#737373] transition-transform duration-300 ${expandedSection === "security" ? "rotate-180" : ""}`} />
            </button>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedSection === "security" ? "max-h-[800px] border-t border-[#E5E5E5] dark:border-[#262626] opacity-100" : "max-h-0 opacity-0"}`}>
              <form onSubmit={handleUpdatePassword}>
                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        placeholder="Enter new password"
                        className="w-full px-3 py-2.5 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#0A0A0A] dark:text-white mb-1.5">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm new password"
                        className="w-full px-3 py-2.5 text-sm border border-[#E5E5E5] dark:border-[#262626] rounded-md bg-transparent text-[#0A0A0A] dark:text-white placeholder:text-[#737373] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white"
                      />
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#0A0A0A] flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="text-xs cursor-pointer"
                    disabled={isUpdatingPassword}
                  >
                    {isUpdatingPassword ? "Updating Password..." : "Update Password"}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* 3. Active Sessions Accordion */}
          <div className="rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] overflow-hidden transition-all duration-300 shadow-xs">
            <button
              onClick={() => setExpandedSection(expandedSection === "sessions" ? null : "sessions")}
              className="w-full flex items-center justify-between p-4 px-5 text-left hover:bg-[#FBFBFB] dark:hover:bg-[#111111] transition-colors focus-visible:outline-none cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111] flex items-center justify-center shrink-0">
                  <MonitorSmartphone className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#0A0A0A] dark:text-white tracking-tight">Active Sessions</h3>
                  <p className="text-xs text-[#737373] dark:text-neutral-400 mt-0.5">Devices currently authenticated to your portal.</p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-[#737373] transition-transform duration-300 ${expandedSection === "sessions" ? "rotate-180" : ""}`} />
            </button>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedSection === "sessions" ? "max-h-[800px] border-t border-[#E5E5E5] dark:border-[#262626] opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="divide-y divide-[#E5E5E5] dark:divide-[#262626]">
                <div className="px-6 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-[#F5F5F5] dark:bg-[#262626] flex items-center justify-center shrink-0">
                      <MonitorSmartphone className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0A0A0A] dark:text-white flex items-center gap-2">
                        Web Browser Session
                        <Badge
                          variant="solid"
                          size="sm"
                          className="bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 border-none text-[10px]"
                        >
                          Current
                        </Badge>
                      </p>
                      <p className="text-xs text-[#737373] dark:text-neutral-400 mt-0.5">
                        {user?.location || "India"} · Active now
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
