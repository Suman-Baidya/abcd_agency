import React from "react";
import Link from "next/link";
import { getPortalData } from "./actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/dashboard/StatCard";
import { 
  Sparkles, 
  FolderKanban, 
  ArrowRight, 
  Layers, 
  Send, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Receipt, 
  FileText,
  RotateCcw,
  MessageCircle,
  Building2,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  ChevronRight
} from "lucide-react";
import { formatProjectDeadline } from "@/lib/formatDate";

export const dynamic = "force-dynamic";

export default async function PortalDashboardPage() {
  const data = await getPortalData();
  if (!data || !data.user) return null;

  const user = data.user;
  const client = data.client;
  const userInquiries = data.userInquiries || [];
  const isProspect = user.role === "USER";

  // Dynamic Onboarding Step Calculations
  const hasSubmittedBrief = userInquiries.length > 0;
  const hasReceivedProposal = userInquiries.some((i: any) => i.status === "Replied" || i.status === "Closed");
  const isConvertedClient = user.role === "CLIENT" || !!client;

  // Onboarding progress calculation
  const completedSteps = 1 + (hasSubmittedBrief ? 1 : 0) + (hasReceivedProposal ? 1 : 0) + (isConvertedClient ? 1 : 0);
  const progressPercent = completedSteps * 25;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div id="portal-tour-header" className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-sm text-[#737373] dark:text-neutral-400 mt-1">
            Welcome back, {user.name}. Here&apos;s a summary of your account & deliverables.
          </p>
        </div>

        <div id="portal-header-actions" className="flex items-center gap-3">
          {isProspect ? (
            <Button variant="primary" size="sm" href="/portal/inquiries">
              <Send className="w-3.5 h-3.5 mr-1" />
              Submit Project Brief
            </Button>
          ) : (
            <>
              <Button variant="secondary" size="sm" href="/portal/billing">
                View Invoices
              </Button>
              <Button variant="primary" size="sm" href="/portal/projects">
                View Projects
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. PROSPECT DASHBOARD VIEW */}
      {/* ========================================================================= */}
      {isProspect && (
        <div className="space-y-8">
          {/* KPI StatCards */}
          <div id="portal-kpi-stats" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Briefs" value={userInquiries.length} color="default" />
            <StatCard 
              label="Under Review" 
              value={userInquiries.filter((i: any) => i.status === "New" || i.status === "In Progress").length} 
              color="amber" 
            />
            <StatCard 
              label="Scoped & Replied" 
              value={userInquiries.filter((i: any) => i.status === "Replied" || i.status === "Closed").length} 
              color="emerald" 
            />
            <StatCard label="Response within" value="< 24 hours" color="emerald" />
          </div>

          {/* ===================================================================== */}
          {/* PREMIUM ONBOARDING ROADMAP SECTION */}
          {/* ===================================================================== */}
          <div id="portal-onboarding-section" className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#262626] shadow-xs space-y-6">
            {/* Roadmap Header & Progress Indicator */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5E5] dark:border-[#242424] pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-[#737373] uppercase tracking-widest">
                    [ ONBOARDING TIMELINE // PROSPECT TO CLIENT ]
                  </span>
                </div>
                <h2 className="text-lg font-bold text-[#0A0A0A] dark:text-white tracking-tight">
                  Your Client Onboarding Roadmap
                </h2>
                <p className="text-xs text-[#737373] dark:text-neutral-400">
                  Follow these 4 milestone steps to transition from project discovery to active sprint delivery.
                </p>
              </div>

              {/* Progress pill & bar */}
              <div className="sm:text-right space-y-1.5 shrink-0">
                <div className="flex items-center sm:justify-end gap-2 text-xs">
                  <span className="text-[#737373] font-medium">Onboarding Progress:</span>
                  <span className="font-bold text-[#0A0A0A] dark:text-white">{progressPercent}%</span>
                </div>
                <div className="w-48 h-2 rounded-full bg-[#E5E5E5] dark:bg-[#262626] overflow-hidden">
                  <div 
                    className="h-full bg-emerald-600 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 4 Connected Step Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
              {/* STEP 01: Account Created */}
              <div className="rounded-xl p-5 bg-[#F9F9F9] dark:bg-[#151515] border border-emerald-500/40 dark:border-emerald-500/30 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                      STEP 01
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" /> Completed
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#0A0A0A] dark:text-white">
                    Account Created
                  </h3>

                  <p className="text-xs text-[#737373] dark:text-neutral-400 leading-relaxed">
                    Organization profile authenticated with verified email credentials.
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E5E5E5] dark:border-[#262626] text-[11px] text-[#737373] flex items-center gap-1 font-mono truncate">
                  <span>✓ {user.email}</span>
                </div>
              </div>

              {/* STEP 02: Submit Project Brief */}
              <div className={`rounded-xl p-5 flex flex-col justify-between space-y-4 transition-all ${
                hasSubmittedBrief
                  ? "bg-[#F9F9F9] dark:bg-[#151515] border border-emerald-500/40 dark:border-emerald-500/30"
                  : "bg-white dark:bg-[#181818] border-2 border-[#0A0A0A] dark:border-white shadow-md"
              }`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`font-mono text-[11px] font-bold ${
                      hasSubmittedBrief ? "text-emerald-700 dark:text-emerald-400" : "text-[#0A0A0A] dark:text-white"
                    }`}>
                      STEP 02
                    </span>
                    {hasSubmittedBrief ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> Submitted
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Action Needed
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-[#0A0A0A] dark:text-white">
                    Submit Project Brief
                  </h3>

                  <p className="text-xs text-[#737373] dark:text-neutral-400 leading-relaxed">
                    Submit your requirements for architectural review within &lt; 24 hours.
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E5E5E5] dark:border-[#262626]">
                  {hasSubmittedBrief ? (
                    <Link 
                      href="/portal/inquiries"
                      className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span>{userInquiries.length} Brief{userInquiries.length > 1 ? "s" : ""} on File</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <Link
                      href="/portal/inquiries"
                      className="w-full py-2 px-3 text-xs font-bold text-center rounded-lg bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <span>Submit Brief</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>

              {/* STEP 03: Discovery & Proposal */}
              <div className={`rounded-xl p-5 flex flex-col justify-between space-y-4 ${
                hasReceivedProposal
                  ? "bg-[#F9F9F9] dark:bg-[#151515] border border-emerald-500/40 dark:border-emerald-500/30"
                  : hasSubmittedBrief
                  ? "bg-[#F9F9F9] dark:bg-[#151515] border border-amber-500/30"
                  : "bg-[#FAFAFA] dark:bg-[#121212] border border-[#E5E5E5] dark:border-[#222222] opacity-70"
              }`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-[#737373]">
                      STEP 03
                    </span>
                    {hasReceivedProposal ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> Proposal Ready
                      </span>
                    ) : hasSubmittedBrief ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                        <Clock className="w-3 h-3" /> In Review
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-[#737373]">
                        Upcoming
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-[#0A0A0A] dark:text-white">
                    Discovery & Proposal
                  </h3>

                  <p className="text-xs text-[#737373] dark:text-neutral-400 leading-relaxed">
                    Custom tech architecture, fixed milestone deliverables & pricing quotes.
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E5E5E5] dark:border-[#262626] text-[11px] text-[#737373]">
                  <span>Turnaround: &lt; 24h SLA</span>
                </div>
              </div>

              {/* STEP 04: Client Portal & Sprints */}
              <div className={`rounded-xl p-5 flex flex-col justify-between space-y-4 ${
                isConvertedClient
                  ? "bg-[#F9F9F9] dark:bg-[#151515] border border-emerald-500/40 dark:border-emerald-500/30"
                  : "bg-[#FAFAFA] dark:bg-[#121212] border border-[#E5E5E5] dark:border-[#222222] opacity-70"
              }`}>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-[#737373]">
                      STEP 04
                    </span>
                    {isConvertedClient ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> Active Client
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-[#737373]">
                        Upcoming
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-[#0A0A0A] dark:text-white">
                    Active Client Portal
                  </h3>

                  <p className="text-xs text-[#737373] dark:text-neutral-400 leading-relaxed">
                    Full access to live sprint Kanban boards, Git repositories, invoices & files.
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E5E5E5] dark:border-[#262626] text-[11px] text-[#737373]">
                  <span>Dedicated Pod Handover</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Feature Exploration Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6 flex flex-col justify-between space-y-4 hover:border-black dark:hover:border-white transition-colors">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#0A0A0A] dark:text-white">Explore Services & Tiers</h3>
                <p className="text-xs text-[#737373] dark:text-neutral-400">
                  Browse our high-performance tech stacks, portfolio case studies, and transparent pricing models.
                </p>
              </div>
              <Link
                href="/portal/services"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0A0A0A] dark:text-white hover:underline"
              >
                View Services & Pricing <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Card>

            <Card className="p-6 flex flex-col justify-between space-y-4 hover:border-black dark:hover:border-white transition-colors">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#0A0A0A] dark:text-white">Submit Project Inquiry</h3>
                <p className="text-xs text-[#737373] dark:text-neutral-400">
                  Ready to start? Fill out our structured project brief and our lead architect will review within 24 hours.
                </p>
              </div>
              <Link
                href="/portal/inquiries"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0A0A0A] dark:text-white hover:underline"
              >
                Start Inquiry <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Card>

            <Card className="p-6 flex flex-col justify-between space-y-4 hover:border-black dark:hover:border-white transition-colors">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#0A0A0A] dark:text-white">Direct WhatsApp Consultation</h3>
                <p className="text-xs text-[#737373] dark:text-neutral-400">
                  Prefer instant messaging? Speak directly with our technical founder on WhatsApp.
                </p>
              </div>
              <a
                href="https://wa.me/918167685731"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Chat on WhatsApp <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CONVERTED CLIENT DASHBOARD VIEW */}
      {/* ========================================================================= */}
      {!isProspect && client && (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div id="portal-kpi-stats" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Active Projects" value={client.projects.length} color="default" />
            <StatCard label="Total Invested" value={client.totalSpend || "₹0"} color="emerald" />
            <StatCard label="Pending Balance" value={client.dueBalance || "₹0"} color={client.dueBalance && client.dueBalance !== "₹0" ? "amber" : "default"} />
            <StatCard label="Revisions / Requests" value={client.revisionRequests.length} color="default" />
          </div>

          {/* Active Projects List */}
          <div id="portal-client-projects" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-[#0A0A0A] dark:text-white">Active Projects</h2>
              <Link href="/portal/projects" className="text-xs font-semibold text-[#737373] hover:underline">
                View Kanban Board →
              </Link>
            </div>

            {client.projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {client.projects.map((proj) => (
                  <Card key={proj.id} className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#737373]">
                          {proj.category}
                        </span>
                        <h3 className="text-base font-bold text-[#0A0A0A] dark:text-white mt-0.5">{proj.title}</h3>
                      </div>
                      <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-[#F5F5F5] dark:bg-[#222222] text-[#0A0A0A] dark:text-white border border-[#E5E5E5] dark:border-[#333333]">
                        {proj.status}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-[#737373]">Development Progress</span>
                        <span className="text-[#0A0A0A] dark:text-white">{proj.progress}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#E5E5E5] dark:bg-[#262626] overflow-hidden">
                        <div
                          className="h-full bg-[#0A0A0A] dark:bg-white rounded-full transition-all duration-500"
                          style={{ width: `${proj.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-3 border-t border-[#E5E5E5] dark:border-[#262626] text-[#737373]">
                      <span>Budget: <strong className="text-[#0A0A0A] dark:text-white">{proj.budget || "Custom"}</strong></span>
                      <span>Target: <strong className="text-[#0A0A0A] dark:text-white">{formatProjectDeadline(proj.deadline).dateRange}</strong></span>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center space-y-3">
                <p className="text-sm font-semibold text-[#0A0A0A] dark:text-white">No active projects assigned yet.</p>
                <p className="text-xs text-[#737373]">Your account manager is preparing your project setup.</p>
              </Card>
            )}
          </div>

          {/* Quick Action Matrix for Clients */}
          <div id="portal-quick-matrix" className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              href="/portal/documents"
              className="p-4 bg-white dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] rounded-xl hover:border-black dark:hover:border-white transition-colors text-center space-y-2"
            >
              <FileText className="w-5 h-5 mx-auto text-[#0A0A0A] dark:text-white" />
              <p className="text-xs font-bold text-[#0A0A0A] dark:text-white">Files & Documents</p>
            </Link>

            <Link
              href="/portal/revisions"
              className="p-4 bg-white dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] rounded-xl hover:border-black dark:hover:border-white transition-colors text-center space-y-2"
            >
              <RotateCcw className="w-5 h-5 mx-auto text-[#0A0A0A] dark:text-white" />
              <p className="text-xs font-bold text-[#0A0A0A] dark:text-white">Revision Request</p>
            </Link>

            <Link
              href="/portal/meetings"
              className="p-4 bg-white dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] rounded-xl hover:border-black dark:hover:border-white transition-colors text-center space-y-2"
            >
              <Calendar className="w-5 h-5 mx-auto text-[#0A0A0A] dark:text-white" />
              <p className="text-xs font-bold text-[#0A0A0A] dark:text-white">Book Meeting</p>
            </Link>

            <Link
              href="/portal/billing"
              className="p-4 bg-white dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] rounded-xl hover:border-black dark:hover:border-white transition-colors text-center space-y-2"
            >
              <Receipt className="w-5 h-5 mx-auto text-[#0A0A0A] dark:text-white" />
              <p className="text-xs font-bold text-[#0A0A0A] dark:text-white">Invoices & Billing</p>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
