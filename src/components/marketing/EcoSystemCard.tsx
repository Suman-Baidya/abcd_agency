"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { 
  ExternalLink, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  ChevronLeft, 
  ChevronRight, 
  KeyRound, 
  Cpu, 
  Layers, 
  Sparkles, 
  Check, 
  Copy, 
  Lock, 
  Globe, 
  SlidersHorizontal, 
  Terminal,
  Maximize2,
  Eye,
  EyeOff,
  X
} from "lucide-react";
import { EcoSystemBlueprintModal } from "./EcoSystemBlueprintModal";

export interface EcoSystemPlatformData {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: string;
  status: string;
  statusColor?: string | null;
  appUrl?: string | null;
  demoEmail?: string | null;
  demoPassword?: string | null;
  thumbnailUrl?: string | null;
  screenshots?: string[];
  features: string[];
  techStack: string[];
  targetAudience?: string | null;
  pricingModel?: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  order: number;
}

interface EcoSystemCardProps {
  platform: EcoSystemPlatformData;
  index?: number;
}

export function EcoSystemCard({ platform, index = 0 }: EcoSystemCardProps) {
  const isReversed = index % 2 === 1;

  // Deduplicate and aggregate all available slides for the platform
  const slides = useMemo(() => {
    const list: string[] = [];
    if (platform.thumbnailUrl) {
      list.push(platform.thumbnailUrl);
    }
    if (Array.isArray(platform.screenshots) && platform.screenshots.length > 0) {
      platform.screenshots.forEach((s) => {
        if (s && !list.includes(s)) list.push(s);
      });
    }

    // High-res realistic fallbacks if none configured
    if (list.length === 0) {
      if (
        platform.slug.includes("automate") ||
        platform.category.toLowerCase().includes("marketing")
      ) {
        return ["/images/ecosystem/automate_1.jpg", "/images/ecosystem/automate_2.jpg"];
      }
      return ["/images/ecosystem/eduexam_1.jpg", "/images/ecosystem/eduexam_2.jpg"];
    }
    return list;
  }, [platform.screenshots, platform.thumbnailUrl, platform.slug, platform.category]);

  // Derived Target Audience List
  const audienceList = useMemo(() => {
    if (platform.targetAudience && platform.targetAudience.trim()) {
      return platform.targetAudience
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const catLower = platform.category.toLowerCase();
    const nameLower = platform.name.toLowerCase();

    if (catLower.includes("edtech") || nameLower.includes("exam")) {
      return ["Schools & Colleges", "Universities", "Coaching Centers", "Online Academies"];
    }
    if (catLower.includes("marketing") || nameLower.includes("automate")) {
      return ["Digital Agencies", "E-Commerce Brands", "B2B Sales Teams", "SaaS Startups"];
    }
    if (catLower.includes("enterprise") || nameLower.includes("erp")) {
      return ["Manufacturers", "Wholesale Distributors", "Logistics Firms", "Retail Chains"];
    }
    return ["Enterprises", "Growing Teams", "Service Agencies"];
  }, [platform.targetAudience, platform.category, platform.name]);

  // Derived Capabilities List (Guarantees no empty awkward placeholders)
  const capabilitiesList = useMemo(() => {
    if (platform.features && platform.features.length > 0) {
      return platform.features;
    }

    const catLower = platform.category.toLowerCase();
    const nameLower = platform.name.toLowerCase();

    if (catLower.includes("edtech") || nameLower.includes("exam") || platform.slug.includes("exam")) {
      return [
        "AI-Powered Question Generator & Automatic Grading Engine",
        "Real-Time Anti-Cheat Camera & Browser Screen Proctoring",
        "Multi-Tenant Portals for Schools, Teachers & Students",
        "Instant Exam Publishing & Granular Performance Analytics",
        "Secure Encrypted Question Banks & Bulk Excel Onboarding",
        "Live Exam Countdown Timer, Question Palette & Auto-Submit",
      ];
    }

    if (catLower.includes("marketing") || nameLower.includes("automate") || platform.slug.includes("automate")) {
      return [
        "Omnichannel Lead Capture & Automated Scoring Engine",
        "Multi-Step Email, SMS & WhatsApp Sequence Automations",
        "AI Copywriting & Dynamic Personalization Merge Fields",
        "Real-Time Campaign Attribution & ROI Tracking Dashboard",
        "Two-Way Sync with HubSpot, Salesforce & Custom Webhooks",
        "Visual Drag-and-Drop Workflow & Trigger Automation Builder",
      ];
    }

    return [
      "Autonomous Multi-Tenant Architecture with Dedicated Schemas",
      "End-to-End Enterprise Encryption & GDPR Data Sovereignty",
      "Granular Role-Based Permissions & Real-Time Audit Trails",
      "Turnkey REST / GraphQL APIs & Custom Webhook Connectors",
      "High-Availability Edge Deployment with 99.9% Uptime Guarantee",
    ];
  }, [platform.features, platform.category, platform.name, platform.slug]);

  // Derived Tech Stack List
  const techStackList = useMemo(() => {
    if (platform.techStack && platform.techStack.length > 0) {
      return platform.techStack;
    }
    if (platform.category.toLowerCase().includes("edtech") || platform.name.toLowerCase().includes("exam")) {
      return ["Next.js 15", "PostgreSQL", "WebRTC", "Google Gemini AI", "Tailwind CSS", "Redis"];
    }
    if (platform.category.toLowerCase().includes("marketing") || platform.name.toLowerCase().includes("automate")) {
      return ["Next.js 15", "Node.js", "Resend API", "Meta Cloud API", "PostgreSQL", "Vercel AI"];
    }
    return ["Next.js 15", "PostgreSQL", "Prisma ORM", "Docker", "Tailwind CSS"];
  }, [platform.techStack, platform.category, platform.name]);

  const [activeSlide, setActiveSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [activeTab, setActiveTab] = useState<"capabilities" | "stack" | "sandbox">("capabilities");
  const [isBlueprintOpen, setIsBlueprintOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto-slide every 5.5 seconds, paused on hover
  useEffect(() => {
    if (slides.length <= 1 || isHovered || isLightboxOpen) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [slides.length, isHovered, isLightboxOpen]);

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  const copyCredentials = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!platform.demoEmail) return;
    const credText = `Email: ${platform.demoEmail}${platform.demoPassword ? ` | Password: ${platform.demoPassword}` : ""}`;
    navigator.clipboard.writeText(credText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="py-12 sm:py-16 first:pt-0 border-b border-[#E5E5E5] dark:border-[#262626] last:border-b-0">
      <div
        className={`flex flex-col ${
          isReversed ? "lg:flex-row-reverse" : "lg:flex-row"
        } gap-8 lg:gap-14 items-center`}
      >
        {/* =================================================================== */}
        {/* CONTENT & INTERACTIVE CONTROL PANEL */}
        {/* =================================================================== */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between space-y-6">
          <div>
            {/* Top Metadata Strip */}
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2 text-[11px] font-mono font-semibold tracking-wider text-[#737373] dark:text-neutral-400">
                <span>0{index + 1} //</span>
                <span className="uppercase text-[#0A0A0A] dark:text-neutral-200">
                  {platform.category}
                </span>
              </div>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-medium tracking-tight bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{platform.status}</span>
              </span>
            </div>

            {/* Platform Title & Tagline */}
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">
              {platform.name}
            </h3>
            <p className="text-xs sm:text-sm font-medium text-[#737373] dark:text-neutral-400 mt-1">
              {platform.tagline}
            </p>

            {/* Target Audience & Category Badge List */}
            <div className="flex flex-wrap items-center gap-1.5 mt-3">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A]">
                {platform.category}
              </span>
              {audienceList.map((aud, aIdx) => (
                <span
                  key={aIdx}
                  className="px-2 py-0.5 rounded text-[10px] font-mono font-medium border border-[#E5E5E5] dark:border-[#262626] bg-[#F9F9F9] dark:bg-[#161616] text-[#525252] dark:text-neutral-300"
                >
                  {aud}
                </span>
              ))}
              {platform.pricingModel && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono text-[#737373] dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-900 border border-transparent dark:border-neutral-800">
                  {platform.pricingModel}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#525252] dark:text-neutral-300 mt-3.5 leading-relaxed">
              {platform.description}
            </p>

            {/* =============================================================== */}
            {/* INTERACTIVE HUD TABS */}
            {/* =============================================================== */}
            <div className="mt-6 pt-5 border-t border-[#E5E5E5] dark:border-[#262626]">
              {/* Tab Selector Buttons */}
              <div className="flex items-center gap-3 border-b border-[#E5E5E5] dark:border-[#262626] pb-2.5">
                <button
                  type="button"
                  onClick={() => setActiveTab("capabilities")}
                  className={`text-xs font-mono font-semibold transition-colors cursor-pointer pb-0.5 ${
                    activeTab === "capabilities"
                      ? "text-[#0A0A0A] dark:text-white border-b-2 border-black dark:border-white"
                      : "text-[#737373] dark:text-neutral-500 hover:text-black dark:hover:text-white"
                  }`}
                >
                  [ 01 Capabilities ]
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("stack")}
                  className={`text-xs font-mono font-semibold transition-colors cursor-pointer pb-0.5 ${
                    activeTab === "stack"
                      ? "text-[#0A0A0A] dark:text-white border-b-2 border-black dark:border-white"
                      : "text-[#737373] dark:text-neutral-500 hover:text-black dark:hover:text-white"
                  }`}
                >
                  [ 02 Stack &amp; Tech ]
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("sandbox")}
                  className={`text-xs font-mono font-semibold transition-colors cursor-pointer pb-0.5 ${
                    activeTab === "sandbox"
                      ? "text-[#0A0A0A] dark:text-white border-b-2 border-black dark:border-white"
                      : "text-[#737373] dark:text-neutral-500 hover:text-black dark:hover:text-white"
                  }`}
                >
                  [ 03 Sandbox &amp; Deploy ]
                </button>
              </div>

              {/* Tab Content Display */}
              <div className="pt-3.5 min-h-[110px]">
                {/* Tab 1: Capabilities List */}
                {activeTab === "capabilities" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    {capabilitiesList.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2 text-[#404040] dark:text-neutral-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab 2: Stack & Architecture */}
                {activeTab === "stack" && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      {techStackList.map((tech) => (
                        <span
                          key={tech}
                          className="px-2.5 py-1 rounded text-[11px] font-mono font-semibold bg-[#F5F5F5] dark:bg-[#1A1A1A] border border-[#E5E5E5] dark:border-[#262626] text-[#0A0A0A] dark:text-neutral-200"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] font-mono text-[#737373] dark:text-neutral-400">
                      // Architecture: Isolated multi-tenant schemas · Encrypted credentials · Global CDN Edge Cached
                    </p>
                  </div>
                )}

                {/* Tab 3: Sandbox & Deployment */}
                {activeTab === "sandbox" && (
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs text-[#525252] dark:text-neutral-300">
                      <Users className="w-3.5 h-3.5 text-[#737373] shrink-0" />
                      <span>
                        <strong>Target Industry:</strong> {audienceList.join(", ")}
                      </span>
                    </div>

                    {(platform.demoEmail || platform.demoPassword) ? (
                      <div
                        onClick={copyCredentials}
                        className="p-2.5 rounded-lg bg-[#F9F9F9] dark:bg-[#161616] border border-[#E5E5E5] dark:border-[#262626] flex items-center justify-between text-xs font-mono cursor-pointer hover:border-black dark:hover:border-white transition-colors"
                        title="Click to copy sandbox login credentials"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <KeyRound className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">
                            {platform.demoEmail} {platform.demoPassword ? `// ${platform.demoPassword}` : ""}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#0A0A0A] dark:text-white shrink-0 pl-2">
                          {copied ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-[#737373]" />
                              <span>Copy</span>
                            </>
                          )}
                        </span>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-lg bg-[#F9F9F9] dark:bg-[#161616] border border-[#E5E5E5] dark:border-[#262626] flex items-center gap-2 text-xs font-mono text-[#737373] dark:text-neutral-400">
                        <Terminal className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>Dedicated private sandbox instances provisioned in 15 minutes.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-[#E5E5E5] dark:border-[#262626] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {platform.appUrl && (
                <a
                  href={platform.appUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0A0A0A] text-white hover:bg-neutral-800 dark:bg-white dark:text-[#0A0A0A] dark:hover:bg-neutral-200 text-xs font-semibold transition-all cursor-pointer shadow-xs"
                >
                  <span>Live App</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              <button
                type="button"
                onClick={() => setIsBlueprintOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-transparent text-[#0A0A0A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] text-xs font-medium transition-all cursor-pointer"
              >
                <Cpu className="w-3 h-3 text-[#737373]" />
                <span>Blueprint &amp; Specs</span>
              </button>
            </div>

            <Link
              href={`/contact?inquiry=${encodeURIComponent(`Apps License: ${platform.name}`)}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0A0A0A] dark:text-white hover:underline transition-all"
            >
              <span>Inquire &amp; License</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* =================================================================== */}
        {/* STUDIO BROWSER VIEWPORT FRAME (IMAGE SLIDER CAROUSEL) */}
        {/* =================================================================== */}
        <div 
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="w-full lg:w-1/2 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#0E0E0E] overflow-hidden shadow-lg select-none group/frame"
        >
          {/* Top Browser Chassis Chrome */}
          <div className="px-3.5 py-2.5 bg-[#141414] border-b border-[#262626] flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#262626]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#262626]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#262626]" />
            </div>

            {/* URL Address Bar */}
            <div className="flex-1 max-w-xs mx-auto px-3 py-0.5 rounded-md bg-[#0A0A0A] border border-[#262626] flex items-center gap-1.5 text-[11px] font-mono text-neutral-400 truncate">
              <Lock className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
              <span className="truncate">https://{platform.slug}.abcddigitalhub.com</span>
            </div>

            {/* Live Status Pill & Reveal / Zoom triggers */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsRevealed((prev) => !prev);
                }}
                title={isRevealed ? "Cover interface (black layer)" : "Reveal full interface"}
                className={`p-1 rounded transition-colors cursor-pointer ${
                  isRevealed ? "text-emerald-400 hover:text-emerald-300" : "text-neutral-400 hover:text-white"
                }`}
              >
                {isRevealed ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLightboxOpen(true);
                }}
                title="Inspect full-resolution screenshot"
                className="text-neutral-400 hover:text-white p-0.5 rounded cursor-pointer transition-colors"
              >
                <Maximize2 className="w-3 h-3" />
              </button>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>99.9%</span>
              </div>
            </div>
          </div>

          {/* Screenshot Display Screen */}
          <div 
            onClick={() => setIsRevealed((prev) => !prev)}
            className="relative aspect-[16/10] bg-black overflow-hidden cursor-pointer"
          >
            {slides.length > 0 ? (
              <>
                {slides.map((imgSrc, sIdx) => {
                  const isVisible = isHovered || isRevealed;
                  return (
                    <div
                      key={sIdx}
                      className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                        sIdx === activeSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                      }`}
                    >
                      <Image
                        src={imgSrc}
                        alt={`${platform.name} preview screen ${sIdx + 1}`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className={`object-cover object-top transition-all duration-700 ease-out ${
                          isVisible
                            ? "grayscale-0 contrast-100 brightness-100 scale-[1.02]"
                            : "grayscale contrast-[1.15] brightness-[0.60] scale-100"
                        }`}
                        priority={index === 0 && sIdx === 0}
                      />
                      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                    </div>
                  );
                })}

                {/* Black Type Layer / Shroud: Fades out on hover or click */}
                <div 
                  className={`absolute inset-0 z-15 bg-black/60 backdrop-blur-[1px] transition-all duration-500 flex flex-col items-center justify-center pointer-events-none ${
                    isHovered || isRevealed ? "opacity-0 invisible" : "opacity-100 visible"
                  }`}
                >
                  <div className="px-3.5 py-1.5 rounded-full border border-white/20 bg-black/85 text-white text-[11px] font-mono flex items-center gap-2 shadow-2xl backdrop-blur-md transform transition-transform group-hover/frame:scale-105">
                    <Eye className="w-3.5 h-3.5 text-neutral-300 animate-pulse" />
                    <span>Hover or click to reveal</span>
                  </div>
                </div>

                {/* Navigation Arrows */}
                {slides.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevSlide}
                      aria-label="Previous preview"
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/75 hover:bg-black text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={nextSlide}
                      aria-label="Next preview"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/75 hover:bg-black text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Bottom Slide Dots */}
                    <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-1.5 z-20">
                      {slides.map((_, dotIdx) => (
                        <button
                          key={dotIdx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveSlide(dotIdx);
                          }}
                          aria-label={`Jump to preview ${dotIdx + 1}`}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            dotIdx === activeSlide ? "w-5 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Slide Counter Badge */}
                    <div className="absolute top-3 right-3 z-20 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-white/20 text-[10px] font-mono text-white">
                      0{activeSlide + 1} / 0{slides.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              /* Fallback Minimalist Terminal UI if no screenshots */
              <div className="w-full h-full p-6 flex flex-col justify-between font-mono text-xs text-neutral-400">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Terminal className="w-4 h-4" />
                  <span>// SYSTEM INITIALIZED: {platform.slug}</span>
                </div>
                <div className="space-y-1.5 py-4">
                  <p className="text-neutral-300 font-bold">{platform.name}</p>
                  <p className="text-neutral-500 text-[11px]">{platform.tagline}</p>
                  <div className="h-1.5 w-2/3 bg-neutral-800 rounded mt-3" />
                  <div className="h-1.5 w-1/2 bg-neutral-800 rounded" />
                </div>
                <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-3 border-t border-neutral-900">
                  <span>PRODUCTION READY</span>
                  <span>ABCD DIGITAL HUB ECOSYSTEM</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Blueprint Specs Modal */}
      <EcoSystemBlueprintModal
        platform={platform}
        isOpen={isBlueprintOpen}
        onClose={() => setIsBlueprintOpen(false)}
      />

      {/* High-Resolution Screenshot Lightbox Viewer */}
      {isLightboxOpen && (
        <div 
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full bg-[#111111] border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
          >
            {/* Lightbox Header */}
            <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between text-xs text-neutral-300">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">{platform.name}</span>
                <span className="text-neutral-500">·</span>
                <span className="font-mono text-[11px]">Slide {activeSlide + 1} of {slides.length}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Lightbox Image Container */}
            <div className="relative aspect-[16/10] w-full bg-black">
              {slides[activeSlide] && (
                <Image
                  src={slides[activeSlide]}
                  alt={`${platform.name} fullscreen preview`}
                  fill
                  sizes="1200px"
                  className="object-contain"
                />
              )}

              {slides.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevSlide}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/80 hover:bg-black text-white border border-white/20 flex items-center justify-center cursor-pointer transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={nextSlide}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/80 hover:bg-black text-white border border-white/20 flex items-center justify-center cursor-pointer transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Lightbox Thumbnails Strip */}
            {slides.length > 1 && (
              <div className="p-3 bg-[#0A0A0A] border-t border-neutral-800 flex items-center justify-center gap-2 overflow-x-auto">
                {slides.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveSlide(idx)}
                    className={`relative w-16 h-10 rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                      idx === activeSlide ? "border-white scale-105" : "border-transparent opacity-50 hover:opacity-80"
                    }`}
                  >
                    <Image src={s} alt={`Thumb ${idx + 1}`} fill sizes="80px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
