import React from "react";
import Link from "next/link";
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
  ChevronRight,
  Shield,
  FileCheck,
  Server,
  Lock,
  Workflow,
  Headphones,
  CheckCircle,
  FileText
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Our Services & Packages — Client Portal | ABCD Agency",
  description: "Explore our fixed-scope delivery packages, core engineering capabilities, and production technology standards.",
};

const SUPPORT_CONTACTS = {
  phone: "+918944899747",
  phoneDisplay: "+91 89448 99747",
  whatsapp: "918167685731",
  whatsappDisplay: "+91 81676 85731",
  email: "sb.abcd321@gmail.com",
};

// =============================================================================
// 1. DELIVERY & ENGAGEMENT PACKAGES (NO PRICES)
// =============================================================================
const PACKAGES = [
  {
    id: "pkg-startup-mvp",
    name: "Startup MVP & Rapid Launch",
    tierCode: "TIER 01 // SPRINT",
    targetAudience: "Early-stage founders and businesses launching a new digital product or validating a core concept.",
    subHeading: "Rapid Product Validation Sprint",
    timeline: "1–2 Weeks Delivery",
    warranty: "30-Day Launch Warranty Included",
    badge: "Fast-Track Launch",
    highlight: false,
    keyFeatures: [
      "Custom responsive web application architecture",
      "Next.js 15 (App Router) + Tailwind CSS interface",
      "Serverless PostgreSQL database (Neon) & Prisma ORM",
      "Authentication & session management (OAuth + Email)",
      "Dynamic lead capture & inquiry notification pipeline",
      "Production deployment on Vercel Edge with custom domain",
      "Complete admin dashboard walkthrough & handover guide",
    ],
    idealFor: "MVPs, landing portals, product prototypes, and quick market entry.",
    ctaText: "Select Startup MVP",
    ctaHref: "/portal/inquiries?package=startup-mvp",
  },
  {
    id: "pkg-core-platform",
    name: "Core Platform & Full-Stack SaaS",
    tierCode: "TIER 02 // PRODUCTION",
    targetAudience: "Established startups, scaling companies, and businesses demanding robust client portals & internal workflows.",
    subHeading: "Production-Grade System Architecture",
    timeline: "2–4 Weeks Delivery",
    warranty: "30-Day Launch Warranty Included",
    badge: "MOST POPULAR // PRODUCTION READY",
    highlight: true,
    keyFeatures: [
      "Dual-portal architecture (Client Portal & Admin Dashboard)",
      "Role-based access control (Super Admin, Team & Client RBAC)",
      "Real-time audit trails, transaction ledgers & project tracking",
      "Cloudinary media CDN integration with server-signed uploads",
      "Automated transactional email workflows (Resend API)",
      "Core Web Vitals optimization, dynamic SEO & metadata",
      "Relational indexing, connection pooling & high concurrency",
      "Complete interactive guided tours & accessibility compliance",
    ],
    idealFor: "SaaS platforms, multi-user portals, booking systems & client hubs.",
    ctaText: "Choose Core Platform",
    ctaHref: "/portal/inquiries?package=core-platform",
  },
  {
    id: "pkg-enterprise-ai",
    name: "Enterprise Architecture & Custom AI",
    tierCode: "TIER 03 // ENTERPRISE",
    targetAudience: "High-scale organizations requiring bespoke AI workflows, autonomous bots, and mission-critical SLAs.",
    subHeading: "High-Scale & Intelligent Automation",
    timeline: "4–8 Weeks Delivery",
    warranty: "30-Day Launch Warranty Included",
    badge: "High-Scale & AI",
    highlight: false,
    keyFeatures: [
      "Autonomous AI agent workflows (Gemini 2.5 Flash / GPT-4o)",
      "WhatsApp Cloud API webhooks & custom conversational bots",
      "Complex third-party API, ERP, CRM, and webhook synchronizations",
      "Multi-tenant data isolation, encrypted records & disaster recovery",
      "Automated unit/integration test coverage & CI/CD deployment pipelines",
      "High-availability database replication & performance tuning",
      "99.9% uptime SLA with dedicated direct-channel engineering support",
    ],
    idealFor: "Complex enterprises, high-volume automation, and AI-driven products.",
    ctaText: "Inquire for Enterprise AI",
    ctaHref: "/portal/inquiries?package=enterprise-ai",
  },
];

// =============================================================================
// 2. WHAT WE PROVIDE — CORE ENGINEERING SERVICES (NO PRICES)
// =============================================================================
const SERVICES = [
  {
    id: "svc-web-saas",
    code: "SVC-01",
    title: "Full-Stack Web & SaaS Engineering",
    category: "Software Architecture",
    icon: Globe,
    description:
      "End-to-end engineering for mission-critical web applications, client portals, and multi-tenant SaaS platforms built for high performance and seamless scale.",
    deliverables: [
      "Next.js 15 App Router & React Server Components",
      "Serverless PostgreSQL database schemas & Prisma ORM",
      "Role-based permissions (RBAC) & protected API routes",
      "Sub-second page speeds & optimized Core Web Vitals",
    ],
    inquiryHref: "/portal/inquiries?service=web-app",
  },
  {
    id: "svc-uiux",
    code: "SVC-02",
    title: "UI/UX Design Systems & Interfaces",
    category: "Product Experience",
    icon: Sparkles,
    description:
      "Clean, high-converting interfaces crafted mobile-first. Every component is designed with rigorous typography, accessibility (WCAG), and responsive ergonomics.",
    deliverables: [
      "Modular design systems & reusable component libraries",
      "Mobile-first responsive layouts tested at 375px–1440px",
      "Subtle micro-interactions & fluid transitions",
      "Strict dark/light theme consistency & accessible contrast",
    ],
    inquiryHref: "/portal/inquiries?service=ui-ux",
  },
  {
    id: "svc-ai-automation",
    code: "SVC-03",
    title: "AI Agents & Business Automation",
    category: "Intelligent Workflows",
    icon: Bot,
    description:
      "Production-ready AI integrations using Google Gemini and OpenAI. From autonomous document processing to live WhatsApp Cloud API customer support automations.",
    deliverables: [
      "Google Gemini 2.5 Flash & OpenAI agent integration",
      "WhatsApp Cloud API webhooks & interactive bot flows",
      "Structured JSON extraction & automated lead routing",
      "Custom business workflow triggers & webhook pipelines",
    ],
    inquiryHref: "/portal/inquiries?service=ai-automation",
  },
  {
    id: "svc-database-api",
    code: "SVC-04",
    title: "Database Architecture & Cloud APIs",
    category: "Backend & Data",
    icon: Database,
    description:
      "Bulletproof relational data modeling with Neon PostgreSQL and Prisma ORM. Zero-downtime schema migrations, query indexing, and low-latency API endpoints.",
    deliverables: [
      "Normalized relational schemas with strict data integrity",
      "Connection pooling & serverless instant auto-scaling",
      "Type-safe Prisma client & Next.js Server Actions",
      "Automated backups & point-in-time recovery",
    ],
    inquiryHref: "/portal/inquiries?service=database-api",
  },
  {
    id: "svc-dedicated-pod",
    code: "SVC-05",
    title: "Dedicated Engineering Pods & Sprints",
    category: "Ongoing Velocity",
    icon: Zap,
    description:
      "Retain dedicated engineering capacity for ongoing feature delivery, weekly release cycles, code refactoring, and rapid turnaround on new feature backlogs.",
    deliverables: [
      "Dedicated senior engineering capacity & sprint planning",
      "Weekly milestone releases & continuous staging deployments",
      "Priority bug-fix turnaround with defined SLA guarantees",
      "Direct communication channel with Principal Solutions Architect",
    ],
    inquiryHref: "/portal/inquiries?service=engineering-pod",
  },
  {
    id: "svc-devops-security",
    code: "SVC-06",
    title: "Cloud Infrastructure, Security & DevOps",
    category: "Operations & Reliability",
    icon: ShieldCheck,
    description:
      "Enterprise security standards, session-protected routes, encrypted secrets, and continuous automated deployment on Vercel Edge with global CDN distribution.",
    deliverables: [
      "Vercel Edge Platform deployment & automated CI/CD",
      "Auth.js session tokens & CSRF/XSS protection",
      "Cloudinary media CDN with server-signed secure uploads",
      "Resend API with DKIM/SPF verified transactional email",
    ],
    inquiryHref: "/portal/inquiries?service=devops-security",
  },
];

// =============================================================================
// 3. WHAT WE USE — PRODUCTION TECHNOLOGIES & STANDARDS
// =============================================================================
const TECH_CATEGORIES = [
  {
    category: "Frontend & Web Architecture",
    code: "TECH-01",
    icon: Globe,
    techs: [
      { name: "Next.js 15 (App Router)", role: "Core Framework", desc: "Server Components, streaming SSR, and edge rendering for blazing performance." },
      { name: "TypeScript", role: "Type Safety", desc: "Strict type checking across the full stack for zero runtime surprises." },
      { name: "Tailwind CSS", role: "Design System", desc: "Utility-first responsive styling adhering to a curated black & white palette." },
      { name: "React 19", role: "UI Engine", desc: "Modern declarative interfaces with optimistic state and fluid interactions." },
    ],
  },
  {
    category: "Backend, Database & Cloud Data",
    code: "TECH-02",
    icon: Database,
    techs: [
      { name: "PostgreSQL (Neon Serverless)", role: "Relational DB", desc: "Serverless SQL database with auto-scaling, branching, and high availability." },
      { name: "Prisma ORM", role: "Database Client", desc: "Type-safe database queries, automated migrations, and schema validation." },
      { name: "Next.js Server Actions", role: "API Layer", desc: "Zero-bundle server execution with automatic input validation and security." },
      { name: "Connection Pooling", role: "Scalability", desc: "High-concurrency query handling capable of processing thousands of requests." },
    ],
  },
  {
    category: "AI Intelligence & Automations",
    code: "TECH-03",
    icon: Bot,
    techs: [
      { name: "Google Gemini 2.5 Flash", role: "AI Engine", desc: "State-of-the-art multimodal reasoning, structured outputs, and sub-second latency." },
      { name: "Vercel AI SDK", role: "AI Integration", desc: "Streaming AI completions, tool calling, and unified model interfaces." },
      { name: "WhatsApp Cloud API", role: "Messaging", desc: "Direct customer communication, automated onboarding, and webhook routing." },
      { name: "Autonomous Workflows", role: "Automation", desc: "Background event-driven processing for lead capture and notifications." },
    ],
  },
  {
    category: "Security, Auth & Edge Infrastructure",
    code: "TECH-04",
    icon: ShieldCheck,
    techs: [
      { name: "Auth.js (NextAuth / Google)", role: "Authentication", desc: "Secure OAuth 2.0 flows, encrypted sessions, and role-based access control." },
      { name: "Vercel Edge Platform", role: "Global Hosting", desc: "Worldwide edge compute, automated SSL certificates, and 99.99% uptime." },
      { name: "Cloudinary CDN", role: "Media Delivery", desc: "Server-signed secure uploads, automated optimization, and global asset delivery." },
      { name: "Resend Email API", role: "Transactional Email", desc: "High-deliverability email infrastructure for agreements, invoices, and alerts." },
    ],
  },
];

// =============================================================================
// TRUST PILLARS & PROCESS ROADMAP
// =============================================================================
const TRUST_PILLARS = [
  {
    icon: FileCheck,
    title: "Turnkey Production Launch",
    description: "Fully configured production environments, live domain setups, database migrations, and operational readiness.",
  },
  {
    icon: Shield,
    title: "30-Day Launch Warranty",
    description: "Every delivery includes 30 days of comprehensive launch warranty with priority bug resolution and maintenance.",
  },
  {
    icon: Lock,
    title: "Non-Disclosure & Security",
    description: "Strict confidentiality, role-based access control (RBAC), encrypted credentials, and tamper-evident records.",
  },
  {
    icon: Headphones,
    title: "Direct Architect Access",
    description: "Speak directly with senior engineers and solutions architects via phone, WhatsApp, or email—zero middleman delays.",
  },
];

const DELIVERY_STEPS = [
  {
    step: "01",
    title: "Scope & Consultation",
    description: "We review your requirements, select or customize the right package, and define exact milestone deliverables.",
  },
  {
    step: "02",
    title: "Legal SOW & Agreement",
    description: "We issue a clear, transparent Statement of Work in the portal with binding milestones, review windows, and zero surprises.",
  },
  {
    step: "03",
    title: "Live Staging & Sprints",
    description: "You watch your product evolve in real time on private staging URLs with scheduled sprint demos and progress updates.",
  },
  {
    step: "04",
    title: "Acceptance & Production Launch",
    description: "After testing and formal client sign-off, we deploy live to your domain and initiate 30 days of launch warranty support.",
  },
];

export default function PortalServicesPage() {
  return (
    <div className="space-y-10 animate-in fade-in duration-300 pb-12">
      {/* ===================================================================== */}
      {/* HEADER & QUICK ACTIONS (1-Line Title & 1-Line Description) */}
      {/* ===================================================================== */}
      <div id="portal-services-header" className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">
            Our Services & Packages
          </h1>
          <p className="text-sm text-[#737373] dark:text-neutral-400 mt-1">
            Explore our delivery packages, specialized engineering capabilities, and modern technology standards.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button variant="primary" size="sm" href="/portal/inquiries">
            <Plus className="w-3.5 h-3.5 mr-1" />
            Submit Project Brief
          </Button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4 CORE TRUST KPI STATS */}
      {/* ===================================================================== */}
      <div id="portal-services-kpis" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Launch Warranty" value="30 Days Included" color="emerald" />
        <StatCard label="Quality Assurance" value="Multi-Stage QA" color="emerald" />
        <StatCard label="Security Standard" value="Role-Based RBAC" color="default" />
        <StatCard label="Response SLA" value="< 24h Turnaround" color="default" />
      </div>

      {/* ===================================================================== */}
      {/* 1. FIRST SECTION: DELIVERY & ENGAGEMENT PACKAGES */}
      {/* ===================================================================== */}
      <section id="portal-services-packages" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E5E5] dark:border-[#262626] pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold text-[#737373] uppercase tracking-widest mb-1">
              <span className="text-[#0A0A0A] dark:text-white">[ SECTION 01 ]</span>
              <span>•</span>
              <span>DELIVERY PACKAGES</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#0A0A0A] dark:text-white tracking-tight">
              Milestone-Driven Packages
            </h2>
            <p className="text-xs text-[#737373] dark:text-neutral-400 mt-0.5">
              Structured engineering scopes with guaranteed delivery timelines, 30 days of included warranty, and turnkey deployment.
            </p>
          </div>
          <Link
            href="/portal/inquiries"
            className="text-xs font-semibold text-[#0A0A0A] dark:text-white hover:underline inline-flex items-center gap-1 shrink-0"
          >
            Need Custom Scope? Submit Brief <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className={`group relative rounded-2xl flex flex-col justify-between transition-all duration-200 overflow-hidden ${
                pkg.highlight
                  ? "bg-white dark:bg-[#111111] border-2 border-[#0A0A0A] dark:border-white shadow-xl"
                  : "bg-[#FAFAFA] dark:bg-[#0E0E0E] border border-[#E5E5E5] dark:border-[#242424] hover:border-[#0A0A0A] dark:hover:border-neutral-400 shadow-xs"
              }`}
            >
              {/* Featured Badge */}
              {pkg.highlight && (
                <div className="bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] py-1.5 px-4 text-center text-[10px] font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  {pkg.badge}
                </div>
              )}

              <div className="p-6 sm:p-7 space-y-5 flex-1 flex flex-col">
                {/* Header info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-[#737373] uppercase tracking-wider">
                      [ {pkg.tierCode} ]
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                      <Clock className="w-3 h-3" /> {pkg.timeline}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-[#0A0A0A] dark:text-white tracking-tight">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-[#737373] dark:text-neutral-400 leading-relaxed">
                    {pkg.targetAudience}
                  </p>
                </div>

                {/* Value & Assurance Box (NO PRICE, 30-Day Warranty) */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#151515] border border-[#E5E5E5] dark:border-[#222222] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#0A0A0A] dark:text-white">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{pkg.warranty}</span>
                  </div>
                  <div className="text-[11px] text-[#737373] dark:text-neutral-400 pl-6">
                    <span className="font-medium text-[#0A0A0A] dark:text-white">Best for:</span> {pkg.idealFor}
                  </div>
                </div>

                {/* Deliverables List */}
                <div className="space-y-3 pt-1 flex-1">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#737373]">
                    Guaranteed Scope Deliverables
                  </p>
                  <ul className="space-y-2.5 text-xs">
                    {pkg.keyFeatures.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5 text-[#262626] dark:text-neutral-200">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Card CTA Footer */}
              <div className="p-6 pt-0">
                <Link
                  href={pkg.ctaHref}
                  className={`w-full py-3 px-4 text-xs font-bold text-center rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                    pkg.highlight
                      ? "bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] hover:opacity-90 shadow-md hover:scale-[1.01]"
                      : "border border-[#0A0A0A] dark:border-white bg-white dark:bg-[#151515] text-[#0A0A0A] dark:text-white hover:bg-[#0A0A0A] hover:text-white dark:hover:bg-white dark:hover:text-[#0A0A0A]"
                  }`}
                >
                  <span>{pkg.ctaText}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. SECOND SECTION: WHAT WE PROVIDE (OUR SERVICES) */}
      {/* ===================================================================== */}
      <section id="portal-services-list" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E5E5] dark:border-[#262626] pb-3">
          <div>
            <div className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold text-[#737373] uppercase tracking-widest mb-1">
              <span className="text-[#0A0A0A] dark:text-white">[ SECTION 02 ]</span>
              <span>•</span>
              <span>WHAT WE PROVIDE</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#0A0A0A] dark:text-white tracking-tight">
              Comprehensive Engineering Services
            </h2>
            <p className="text-xs text-[#737373] dark:text-neutral-400 mt-0.5">
              Specialized technical capabilities to architect, engineer, automate, and scale your digital products.
            </p>
          </div>
          <Link
            href="/portal/inquiries"
            className="text-xs font-semibold text-[#0A0A0A] dark:text-white hover:underline inline-flex items-center gap-1 shrink-0"
          >
            Request Custom Capabilities <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map((svc) => {
            const Icon = svc.icon;
            return (
              <div
                key={svc.id}
                className="group rounded-2xl p-6 bg-white dark:bg-[#0E0E0E] border border-[#E5E5E5] dark:border-[#242424] hover:border-[#0A0A0A] dark:hover:border-neutral-400 transition-all duration-200 flex flex-col justify-between space-y-5 shadow-xs hover:shadow-md"
              >
                <div className="space-y-4">
                  {/* Top category & icon */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-[#737373] uppercase tracking-wider">
                      [ {svc.code} ] // {svc.category}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] flex items-center justify-center shrink-0 shadow-xs">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Title & description */}
                  <div>
                    <h3 className="text-base font-bold text-[#0A0A0A] dark:text-white group-hover:text-black dark:group-hover:text-white transition-colors">
                      {svc.title}
                    </h3>
                    <p className="text-xs text-[#737373] dark:text-neutral-400 leading-relaxed mt-2">
                      {svc.description}
                    </p>
                  </div>

                  {/* Core Deliverables bullets */}
                  <div className="space-y-2 pt-2 border-t border-[#E5E5E5] dark:border-[#222222]">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#737373] block">
                      Core Deliverables
                    </span>
                    <ul className="space-y-1.5 text-xs">
                      {svc.deliverables.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-[#333333] dark:text-neutral-300">
                          <span className="text-[#737373] mt-0.5">•</span>
                          <span className="leading-snug">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-4 border-t border-[#E5E5E5] dark:border-[#222222]">
                  <Link
                    href={svc.inquiryHref}
                    className="w-full py-2.5 px-3 text-xs font-bold text-center rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-[#FAFAFA] dark:bg-[#161616] text-[#0A0A0A] dark:text-white hover:bg-[#0A0A0A] hover:text-white dark:hover:bg-white dark:hover:text-[#0A0A0A] transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    <span>Inquire for {svc.title.split("&")[0]}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 3. THIRD SECTION: WHAT WE USE — OUR TECHNOLOGIES */}
      {/* ===================================================================== */}
      <section id="portal-services-tech" className="space-y-6">
        <div className="border-b border-[#E5E5E5] dark:border-[#262626] pb-3">
          <div className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold text-[#737373] uppercase tracking-widest mb-1">
            <span className="text-[#0A0A0A] dark:text-white">[ SECTION 03 ]</span>
            <span>•</span>
            <span>WHAT WE USE</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#0A0A0A] dark:text-white tracking-tight">
            Production-Tested Technology Stacks
          </h2>
          <p className="text-xs text-[#737373] dark:text-neutral-400 mt-0.5">
            We use industry-standard modern stacks selected for sub-second speed, bank-grade security, and zero vendor lock-in.
          </p>
        </div>

        {/* 4 Architectural Groups */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {TECH_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.category}
                className="p-6 rounded-2xl bg-[#FAFAFA] dark:bg-[#0E0E0E] border border-[#E5E5E5] dark:border-[#242424] hover:border-[#0A0A0A] dark:hover:border-neutral-400 transition-all space-y-4 shadow-xs"
              >
                <div className="flex items-center justify-between border-b border-[#E5E5E5] dark:border-[#202020] pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#1A1A1A] border border-[#E5E5E5] dark:border-[#333333] flex items-center justify-center shrink-0 shadow-xs">
                      <Icon className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#0A0A0A] dark:text-white">{cat.category}</h3>
                      <span className="font-mono text-[10px] text-[#737373]">{cat.code}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                    Production Grade
                  </span>
                </div>

                {/* Tech Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {cat.techs.map((t) => (
                    <div
                      key={t.name}
                      className="p-3 rounded-xl bg-white dark:bg-[#151515] border border-[#E5E5E5] dark:border-[#262626] space-y-1 hover:border-[#0A0A0A] dark:hover:border-neutral-400 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0A0A0A] dark:text-white">{t.name}</span>
                        <span className="text-[9px] font-mono font-medium text-[#737373] uppercase">{t.role}</span>
                      </div>
                      <p className="text-[11px] text-[#737373] dark:text-neutral-400 leading-snug">
                        {t.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Client Trust Pillars */}
        <div className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#111111] border border-[#E5E5E5] dark:border-[#262626] space-y-4 shadow-sm">
          <div className="space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#0A0A0A] dark:text-white">
              Why Clients Trust Our Technical Foundation
            </h3>
            <p className="text-xs text-[#737373] dark:text-neutral-400">
              Every deliverable adheres to our strict engineering standards to ensure your business is protected at every phase.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {TRUST_PILLARS.map((p, idx) => {
              const Icon = p.icon;
              return (
                <div key={idx} className="p-4 rounded-xl bg-[#FAFAFA] dark:bg-[#161616] border border-[#E5E5E5] dark:border-[#262626] space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-[#0A0A0A] dark:bg-white text-white dark:text-[#0A0A0A] flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-xs font-bold text-[#0A0A0A] dark:text-white">{p.title}</h4>
                  <p className="text-[11px] text-[#737373] dark:text-neutral-400 leading-relaxed">
                    {p.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 4. RISK-FREE 4-STEP DELIVERY ROADMAP */}
      {/* ===================================================================== */}
      <section className="space-y-6">
        <div className="border-b border-[#E5E5E5] dark:border-[#262626] pb-3">
          <div className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold text-[#737373] uppercase tracking-widest mb-1">
            <span className="text-[#0A0A0A] dark:text-white">[ WORKFLOW ]</span>
            <span>•</span>
            <span>RISK-FREE DELIVERY</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[#0A0A0A] dark:text-white tracking-tight">
            How We Deliver Your Project
          </h2>
          <p className="text-xs text-[#737373] dark:text-neutral-400 mt-0.5">
            Transparent, milestone-based execution with zero hidden surprises and continuous live progress visibility.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {DELIVERY_STEPS.map((step) => (
            <div
              key={step.step}
              className="p-5 rounded-2xl bg-[#FAFAFA] dark:bg-[#0E0E0E] border border-[#E5E5E5] dark:border-[#242424] space-y-3 relative"
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black font-mono text-neutral-300 dark:text-neutral-700">
                  {step.step}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <h3 className="text-sm font-bold text-[#0A0A0A] dark:text-white">
                {step.title}
              </h3>
              <p className="text-xs text-[#737373] dark:text-neutral-400 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 5. DIRECT ARCHITECTURAL CONSULTATION BANNER */}
      {/* ===================================================================== */}
      <div id="portal-services-consultation" className="relative rounded-2xl p-6 sm:p-8 bg-[#0A0A0A] text-white dark:bg-[#111111] border border-[#222222] dark:border-[#2A2A2A] shadow-xl overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-xl font-bold text-white tracking-tight">
              Need a Custom Project Scope?
            </h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Connect directly with our Principal Solutions Architect to review architecture feasibility, sprint timelines, and obtain a tailored Statement of Work.
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

            <Link
              href="/portal/inquiries"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-white/20 text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Submit Project Brief</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
