import React from "react";
import Link from "next/link";
import { db } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/dashboard/StatCard";
import { 
  Code2, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Check, 
  ArrowRight, 
  ExternalLink,
  Zap,
  Clock,
  CheckCircle2,
  Phone,
  MessageCircle,
  Mail,
  Cpu,
  Database,
  Globe,
  Bot,
  Plus,
  ArrowUpRight,
  ChevronRight
} from "lucide-react";

export const dynamic = "force-dynamic";

const TECH_CAPABILITIES = [
  {
    category: "Frontend & Web Architecture",
    code: "FE-01",
    icon: Globe,
    techs: ["Next.js 15 (App Router)", "TypeScript", "Tailwind CSS", "React Server Components", "Framer Motion", "Shadcn UI"],
    description: "Ultra-fast, SEO-optimized web applications with sub-second page loads and responsive mobile layouts.",
  },
  {
    category: "Backend, APIs & Cloud DBs",
    code: "BE-02",
    icon: Database,
    techs: ["PostgreSQL (Neon Serverless)", "Prisma ORM", "Node.js / Express", "Next.js Server Actions", "Redis Caching", "REST & GraphQL"],
    description: "Robust data architectures with relational integrity, serverless auto-scaling, and secure transactional pipelines.",
  },
  {
    category: "AI Agents & Intelligent Automations",
    code: "AI-03",
    icon: Bot,
    techs: ["Google Gemini 2.5 Flash", "OpenAI GPT-4o", "Vercel AI SDK", "WhatsApp Cloud API", "LangChain", "Autonomous Workflows"],
    description: "Intelligent agent integrations, automated lead capture pipelines, and custom conversational AI solutions.",
  },
  {
    category: "Security, Auth & DevOps",
    code: "SEC-04",
    icon: ShieldCheck,
    techs: ["Auth.js (NextAuth / Google OAuth)", "Vercel Edge Platform", "Cloudinary Media CDN", "Resend Email API", "Role-Based Access (RBAC)"],
    description: "Enterprise security standards, session-protected routes, encrypted secrets, and continuous deployment pipelines.",
  },
];

const DEFAULT_PACKAGES = [
  {
    id: "pkg-1",
    name: "Startup MVP & Sprint",
    tierCode: "TIER 01",
    targetAudience: "Early-stage startups and rapid product validation",
    subHeading: "Fixed-Scope Sprint",
    deliverables: [
      "Custom responsive web application",
      "Next.js 15 + Tailwind CSS architecture",
      "Neon PostgreSQL database & Prisma ORM",
      "Authentication (Google OAuth + Email)",
      "Contact & lead capture automation",
      "14-Day launch warranty & handover",
    ],
    support: "14 Days Launch Warranty",
    timeline: "1–2 Weeks Delivery",
    investment: "₹15,000",
  },
  {
    id: "pkg-2",
    name: "Core Platform & SaaS",
    tierCode: "TIER 02",
    targetAudience: "Established businesses & scalable digital products",
    subHeading: "Production Grade System",
    deliverables: [
      "Full client/admin dual dashboard portal",
      "Role-based access control (Admin & Client)",
      "Real-time analytics & transaction ledger",
      "Cloudinary media upload & CDN storage",
      "Automated transactional emails (Resend)",
      "30-Day dedicated post-launch support",
    ],
    support: "30 Days Dedicated Support",
    timeline: "2–4 Weeks Delivery",
    investment: "₹35,000",
  },
  {
    id: "pkg-3",
    name: "Enterprise & Custom AI",
    tierCode: "TIER 03",
    targetAudience: "Organizations demanding bespoke software & AI workflows",
    subHeading: "High-Scale Architecture",
    deliverables: [
      "Bespoke full-stack system architecture",
      "Gemini / OpenAI intelligent agent workflows",
      "WhatsApp Cloud API webhook automations",
      "Custom third-party API & CRM integrations",
      "Performance optimization & 99.9% uptime SLA",
      "60-Day ongoing priority maintenance",
    ],
    support: "60 Days Priority Maintenance",
    timeline: "4–8 Weeks Delivery",
    investment: "₹65,000+",
  },
];

const DEFAULT_SERVICES = [
  {
    id: "svc-1",
    code: "POD-01",
    name: "Full-Stack Web Development Pod",
    scope: "Dedicated engineering sprint capacity for Next.js, React, APIs, and database migrations.",
    monthlyRetainer: "₹35,000/mo",
    yearlyPlan: "₹3,50,000/yr (Save 20%)",
  },
  {
    id: "svc-2",
    code: "POD-02",
    name: "UI/UX & Product Design Sprint",
    scope: "Design systems, mobile-first Figma prototypes, user journeys, and component UI libraries.",
    monthlyRetainer: "₹25,000/mo",
    yearlyPlan: "₹2,50,000/yr (Save 20%)",
  },
  {
    id: "svc-3",
    code: "POD-03",
    name: "AI & Business Automation Retainer",
    scope: "Autonomous AI agents, customer support WhatsApp bots, CRM syncing, and data extraction pipelines.",
    monthlyRetainer: "₹30,000/mo",
    yearlyPlan: "₹3,00,000/yr (Save 20%)",
  },
];

const SUPPORT_CONTACTS = {
  phone: "+918944899747",
  phoneDisplay: "+91 89448 99747",
  whatsapp: "918167685731",
  whatsappDisplay: "+91 81676 85731",
  email: "sb.abcd321@gmail.com",
};

export default async function PortalServicesPage() {
  const [dbPackages, dbServices] = await Promise.all([
    db.pricingPackage.findMany({ orderBy: { order: "asc" } }).catch(() => []),
    db.pricingService.findMany({ orderBy: { order: "asc" } }).catch(() => []),
  ]);

  const packages = dbPackages.length > 0 ? dbPackages : DEFAULT_PACKAGES;
  const services = dbServices.length > 0 ? dbServices : DEFAULT_SERVICES;

  return (
    <div className="space-y-10 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">
            Our Services & Packages
          </h1>
          <p className="text-sm text-[#737373] dark:text-neutral-400 mt-1">
            Review our engineering capabilities, milestone packages, dedicated retainers, and production deliverables.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="primary" size="sm" href="/portal/inquiries">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Submit Project Brief
          </Button>
        </div>
      </div>

      {/* KPI StatCards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tech Stacks" value="12+ Modern Tools" color="default" />
        <StatCard label="Engagement Model" value="Sprint & Retainer" color="default" />
        <StatCard label="Code Ownership" value="100% IP Handover" color="emerald" />
        <StatCard label="Response within" value="< 24 hours" color="emerald" />
      </div>

      {/* ========================================================================= */}
      {/* 1. PROJECT PACKAGES (PREMIUM CARDS) */}
      {/* ========================================================================= */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E5E5] dark:border-[#262626] pb-3">
          <div>
            <h2 className="text-base font-bold text-[#0A0A0A] dark:text-white">
              Milestone-Driven Packages
            </h2>
            <p className="text-xs text-[#737373] dark:text-neutral-400 mt-0.5">
              Transparent, fixed-scope engineering packages with guaranteed launch deliverables.
            </p>
          </div>
          <Link
            href="/portal/inquiries"
            className="text-xs font-bold text-[#0A0A0A] dark:text-white hover:underline inline-flex items-center gap-1"
          >
            Need Custom Scope? Submit Brief <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {packages.map((pkg: any, idx: number) => {
            const isFeatured = idx === 1;
            const tierCode = pkg.tierCode || `TIER 0${idx + 1}`;

            return (
              <div
                key={pkg.id}
                className={`group relative rounded-2xl flex flex-col justify-between transition-all duration-200 overflow-hidden ${
                  isFeatured
                    ? "bg-white dark:bg-[#111111] border-2 border-[#0A0A0A] dark:border-white shadow-xl"
                    : "bg-[#FAFAFA] dark:bg-[#0E0E0E] border border-[#E5E5E5] dark:border-[#242424] hover:border-[#0A0A0A] dark:hover:border-neutral-400 shadow-sm"
                }`}
              >
                {/* Top Banner Tag for Featured */}
                {isFeatured && (
                  <div className="bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] py-1.5 px-4 text-center text-[10px] font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    MOST POPULAR // PRODUCTION READY
                  </div>
                )}

                <div className="p-6 sm:p-7 space-y-6 flex-1 flex flex-col">
                  {/* Header info */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-semibold text-[#737373] uppercase tracking-wider">
                        [ {tierCode} ]
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                        <Clock className="w-3 h-3" /> {pkg.timeline || "Fast Turnaround"}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-[#0A0A0A] dark:text-white tracking-tight">
                      {pkg.name}
                    </h3>
                    <p className="text-xs text-[#737373] dark:text-neutral-400 leading-relaxed">
                      {pkg.targetAudience || pkg.subHeading}
                    </p>
                  </div>

                  {/* Price Box */}
                  <div className="p-4 rounded-xl bg-white dark:bg-[#151515] border border-[#E5E5E5] dark:border-[#222222] space-y-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0A0A0A] dark:text-white">
                        {pkg.investment}
                      </span>
                      <span className="text-xs font-medium text-[#737373]">/ milestone</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{pkg.support || "Post-Launch Warranty Included"}</span>
                    </div>
                  </div>

                  {/* Deliverables List */}
                  <div className="space-y-3 pt-2 flex-1">
                    <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#737373]">
                      Scope Deliverables
                    </p>
                    <ul className="space-y-2.5 text-xs">
                      {pkg.deliverables?.map((d: string, dIdx: number) => (
                        <li key={dIdx} className="flex items-start gap-2.5 text-[#0A0A0A] dark:text-neutral-200">
                          <div className="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                          <span className="leading-snug">{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card CTA Footer */}
                <div className="p-6 pt-0">
                  <Link
                    href="/portal/inquiries"
                    className={`w-full py-3 px-4 text-xs font-bold text-center rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isFeatured
                        ? "bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] hover:opacity-90 shadow-md hover:scale-[1.01]"
                        : "border border-[#0A0A0A] dark:border-white bg-white dark:bg-[#151515] text-[#0A0A0A] dark:text-white hover:bg-[#0A0A0A] hover:text-white dark:hover:bg-white dark:hover:text-[#0A0A0A]"
                    }`}
                  >
                    <span>Choose {pkg.name}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DEDICATED ENGINEERING RETAINERS (PREMIUM CARDS) */}
      {/* ========================================================================= */}
      <div className="space-y-5">
        <div className="border-b border-[#E5E5E5] dark:border-[#262626] pb-3">
          <h2 className="text-base font-bold text-[#0A0A0A] dark:text-white">
            Dedicated Engineering Pods & Retainers
          </h2>
          <p className="text-xs text-[#737373] dark:text-neutral-400 mt-0.5">
            Continuous development, priority SLA response, and weekly release sprints for expanding platforms.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((svc: any, idx: number) => {
            const code = svc.code || `POD-0${idx + 1}`;
            return (
              <div
                key={svc.id}
                className="group rounded-2xl p-6 bg-white dark:bg-[#0E0E0E] border border-[#E5E5E5] dark:border-[#242424] hover:border-[#0A0A0A] dark:hover:border-neutral-400 transition-all duration-200 flex flex-col justify-between space-y-5 shadow-xs hover:shadow-md"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-[#737373] uppercase tracking-wider">
                      [ {code} ]
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] flex items-center justify-center shrink-0">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-[#0A0A0A] dark:text-white group-hover:text-black dark:group-hover:text-white transition-colors">
                    {svc.name}
                  </h3>

                  <p className="text-xs text-[#737373] dark:text-neutral-400 leading-relaxed">
                    {svc.scope}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#E5E5E5] dark:border-[#222222] space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#737373] font-medium">Monthly Sprint</span>
                    <span className="font-bold text-base text-[#0A0A0A] dark:text-white">
                      {svc.monthlyRetainer}
                    </span>
                  </div>

                  {svc.yearlyPlan && (
                    <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <span>Annual Commitment</span>
                      <span>{svc.yearlyPlan}</span>
                    </div>
                  )}

                  <Link
                    href="/portal/inquiries"
                    className="w-full py-2.5 px-3 text-xs font-bold text-center rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-[#FAFAFA] dark:bg-[#161616] text-[#0A0A0A] dark:text-white hover:bg-[#0A0A0A] hover:text-white dark:hover:bg-white dark:hover:text-[#0A0A0A] transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Request Pod Retainer</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CORE TECHNICAL CAPABILITIES & STACKS */}
      {/* ========================================================================= */}
      <div className="space-y-5">
        <div className="border-b border-[#E5E5E5] dark:border-[#262626] pb-3">
          <h2 className="text-base font-bold text-[#0A0A0A] dark:text-white">
            Architectural & Technology Standards
          </h2>
          <p className="text-xs text-[#737373] dark:text-neutral-400 mt-0.5">
            Production-tested stacks selected for high performance, maintainability, and enterprise security.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TECH_CAPABILITIES.map((cap) => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.category}
                className="p-5 rounded-2xl bg-[#FAFAFA] dark:bg-[#0E0E0E] border border-[#E5E5E5] dark:border-[#242424] hover:border-[#0A0A0A] dark:hover:border-neutral-400 transition-all space-y-3.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#1A1A1A] border border-[#E5E5E5] dark:border-[#333333] flex items-center justify-center shrink-0 shadow-xs">
                      <Icon className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#0A0A0A] dark:text-white">{cap.category}</h3>
                      <span className="font-mono text-[10px] text-[#737373]">{cap.code}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-[#737373] dark:text-neutral-400 leading-relaxed">
                  {cap.description}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1 border-t border-[#E5E5E5] dark:border-[#202020]">
                  {cap.techs.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 text-[11px] font-mono font-medium rounded-lg bg-white dark:bg-[#161616] border border-[#E5E5E5] dark:border-[#2C2C2C] text-[#0A0A0A] dark:text-neutral-200"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. DIRECT ARCHITECTURAL CONSULTATION BANNER */}
      {/* ========================================================================= */}
      <div className="relative rounded-2xl p-6 sm:p-8 bg-[#0A0A0A] text-white dark:bg-[#111111] border border-[#222222] dark:border-[#2A2A2A] shadow-xl overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-mono font-bold tracking-widest uppercase border border-white/15">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              DIRECT SOLUTIONS ARCHITECT ACCESS
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              Have a unique technical challenge or complex system scope?
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Speak directly with our Principal Solutions Architect to review architecture diagrams, sprint feasibility, and get fixed milestone quotes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <a
              href={`tel:${SUPPORT_CONTACTS.phone}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-[#0A0A0A] hover:bg-neutral-100 transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
            >
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              <span>Call {SUPPORT_CONTACTS.phoneDisplay}</span>
            </a>

            <a
              href={`https://wa.me/${SUPPORT_CONTACTS.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>

            <a
              href={`mailto:${SUPPORT_CONTACTS.email}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-white/20 text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Brief</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
