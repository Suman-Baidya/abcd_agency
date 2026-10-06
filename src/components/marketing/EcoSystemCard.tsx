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
  Terminal
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
  const isLive =
    platform.status.toLowerCase().includes("live") ||
    platform.status.toLowerCase().includes("enterprise");

  // Collect all available slides for the platform
  const slides = useMemo(() => {
    const list: string[] = [];
    if (platform.screenshots && platform.screenshots.length > 0) {
      list.push(...platform.screenshots);
    } else if (platform.thumbnailUrl) {
      list.push(platform.thumbnailUrl);
    }
    return list;
  }, [platform.screenshots, platform.thumbnailUrl]);

  const [activeSlide, setActiveSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [activeTab, setActiveTab] = useState<"capabilities" | "stack" | "sandbox">("capabilities");
  const [isBlueprintOpen, setIsBlueprintOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto-slide every 5.5 seconds, pause when hovering
  useEffect(() => {
    if (slides.length <= 1 || isHovered) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [slides.length, isHovered]);

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
        {/* CONTENT & INTERACTIVE CONTROL PANEL (NO HEAVY BOX) */}
        {/* =================================================================== */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between space-y-6">
          <div>
            {/* Top Engineering Metadata Strip */}
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 text-[11px] font-mono font-semibold tracking-wider text-[#737373] dark:text-neutral-400">
                <span>0{index + 1} //</span>
                <span className="uppercase text-[#0A0A0A] dark:text-neutral-200">
                  {platform.category}
                </span>
              </div>

              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium tracking-tight bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
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

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#525252] dark:text-neutral-300 mt-3 leading-relaxed">
              {platform.description}
            </p>

            {/* =============================================================== */}
            {/* SMART INTERACTIVE SPECS HUD TABS */}
            {/* =============================================================== */}
            <div className="mt-6 pt-5 border-t border-[#E5E5E5] dark:border-[#262626]">
              {/* Tab Selector Buttons */}
              <div className="flex items-center gap-2 border-b border-[#E5E5E5] dark:border-[#262626] pb-2.5">
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
              <div className="pt-3 min-h-[90px]">
                {/* Tab 1: Capabilities */}
                {activeTab === "capabilities" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {platform.features && platform.features.length > 0 ? (
                      platform.features.slice(0, 4).map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2 text-[#404040] dark:text-neutral-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{feat}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[#737373] text-xs">Full turnkey capability specifications available upon request.</p>
                    )}
                  </div>
                )}

                {/* Tab 2: Stack & Architecture */}
                {activeTab === "stack" && (
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap gap-1.5">
                      {platform.techStack && platform.techStack.length > 0 ? (
                        platform.techStack.map((tech) => (
                          <span
                            key={tech}
                            className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-[#F5F5F5] dark:bg-[#1A1A1A] border border-[#E5E5E5] dark:border-[#262626] text-[#0A0A0A] dark:text-neutral-200"
                          >
                            {tech}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-[#737373]">Modern Next.js &amp; Cloud Infrastructure</span>
                      )}
                    </div>
                    <p className="text-[11px] font-mono text-[#737373] dark:text-neutral-400">
                      // Architecture: Isolated multi-tenant schemas · Encrypted secrets · Global CDN edge cached
                    </p>
                  </div>
                )}

                {/* Tab 3: Sandbox & Deployment */}
                {activeTab === "sandbox" && (
                  <div className="space-y-2">
                    {platform.targetAudience && (
                      <div className="flex items-center gap-2 text-xs text-[#525252] dark:text-neutral-300">
                        <Users className="w-3.5 h-3.5 text-[#737373] shrink-0" />
                        <span><strong>Target:</strong> {platform.targetAudience}</span>
                      </div>
                    )}

                    {(platform.demoEmail || platform.demoPassword) ? (
                      <div
                        onClick={copyCredentials}
                        className="p-2 rounded-lg bg-[#F9F9F9] dark:bg-[#161616] border border-[#E5E5E5] dark:border-[#262626] flex items-center justify-between text-xs font-mono cursor-pointer hover:border-black dark:hover:border-white transition-colors"
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
                      <p className="text-xs text-[#737373] font-mono">
                        Instant custom sandbox environment provisioned within 15 minutes.
                      </p>
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
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0A0A0A] text-white hover:bg-neutral-800 dark:bg-white dark:text-[#0A0A0A] dark:hover:bg-neutral-200 text-xs font-semibold transition-all cursor-pointer"
                >
                  <span>Live App</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              <button
                type="button"
                onClick={() => setIsBlueprintOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-transparent text-[#0A0A0A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] text-xs font-medium transition-all cursor-pointer"
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
        {/* STUDIO BROWSER VIEWPORT FRAME (SLICK & ADVANCED) */}
        {/* =================================================================== */}
        <div 
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="w-full lg:w-1/2 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#0E0E0E] overflow-hidden shadow-lg select-none"
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
              <span className="truncate">https://{platform.slug}.abcdagency.com</span>
            </div>

            {/* Live Status Pill */}
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>99.9%</span>
            </div>
          </div>

          {/* Screenshot Display Screen */}
          <div className="relative aspect-[16/10] bg-black overflow-hidden">
            {slides.length > 0 ? (
              <>
                {slides.map((imgSrc, sIdx) => (
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
                      className="object-cover object-top"
                      priority={index === 0 && sIdx === 0}
                    />
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                  </div>
                ))}

                {/* Navigation Arrows */}
                {slides.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prevSlide}
                      aria-label="Previous preview"
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={nextSlide}
                      aria-label="Next preview"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
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
                  <span>ABCD AGENCY ECOSYSTEM</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Blueprint Sandbox Modal */}
      <EcoSystemBlueprintModal
        platform={platform}
        isOpen={isBlueprintOpen}
        onClose={() => setIsBlueprintOpen(false)}
      />
    </article>
  );
}
