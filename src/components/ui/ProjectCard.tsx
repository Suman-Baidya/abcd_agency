"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { ExternalLink, ArrowRight, Building2 } from "lucide-react";

export interface ProjectCardData {
  title: string;
  slug: string;
  client?: string;
  category: string;
  tagline: string;
  summary: string;
  impact: string;
  techStack: string[];
  thumbnailUrl?: string | null;
  projectType?: string;
  demoUrl?: string | null;
  demoEmail?: string | null;
  demoPassword?: string | null;
  demoRole?: string | null;
}

interface ProjectCardProps {
  project: ProjectCardData;
  hrefPrefix?: string;
}

export function ProjectCard({ project, hrefPrefix = "/work/" }: ProjectCardProps) {
  const isSandbox =
    project.projectType === "SANDBOX" || (!project.projectType && Boolean(project.demoUrl));
  const studyHref = `${hrefPrefix}${project.slug}`;

  // Limit tech stack chips to max 4 to keep card height balanced
  const visibleTech = project.techStack.slice(0, 4);
  const remainingCount = project.techStack.length - visibleTech.length;

  return (
    <div className="group flex flex-col rounded-2xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:hover:border-neutral-700 h-full">
      {/* Top Section: Thumbnail Banner or Architectural Blueprint */}
      <div className="relative h-60 sm:h-64 w-full bg-[#0A0A0A] border-b border-[#E5E5E5] dark:border-[#262626] overflow-hidden shrink-0">
        {project.thumbnailUrl ? (
          /* Actual Thumbnail / Banner Image */
          <Link href={studyHref} className="block relative w-full h-full">
            <Image
              src={project.thumbnailUrl}
              alt={project.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
            />
            {/* Scrim Gradients for Badge Legibility */}
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-none" />
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
          </Link>
        ) : (
          /* Architectural Blueprint Fallback (Monochrome Tech System Mockup) */
          <Link href={studyHref} className="block relative w-full h-full p-4 select-none">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 bg-[#0F0F0F] bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:14px_14px]" />

            {/* Simulated Miniature Browser Window */}
            <div className="relative h-full w-full rounded-xl border border-neutral-800 bg-[#141414]/90 shadow-2xl flex flex-col overflow-hidden backdrop-blur-xs transition-transform duration-500 group-hover:scale-[1.02]">
              {/* Browser Header Bar */}
              <div className="h-7 px-3 border-b border-neutral-800 bg-[#1A1A1A] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-neutral-700" />
                  <div className="w-2 h-2 rounded-full bg-neutral-700" />
                  <div className="w-2 h-2 rounded-full bg-neutral-700" />
                </div>
                <div className="px-2.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[9px] font-mono text-neutral-400 truncate max-w-[170px]">
                  system.preview/{project.slug}
                </div>
                <div className="w-2" />
              </div>

              {/* Wireframe UI Content */}
              <div className="flex-1 p-3 flex gap-2.5 overflow-hidden">
                {/* Mini Sidebar */}
                <div className="w-12 border-r border-neutral-800/80 pr-2 flex flex-col gap-1.5 shrink-0">
                  <div className="w-6 h-1.5 rounded-full bg-neutral-700" />
                  <div className="w-8 h-1 rounded-full bg-neutral-800" />
                  <div className="w-7 h-1 rounded-full bg-neutral-800" />
                  <div className="w-5 h-1 rounded-full bg-neutral-800" />
                </div>

                {/* Mini Dashboard Content */}
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2">
                    <div className="flex-1 h-8 rounded border border-neutral-800/80 bg-neutral-900/50 p-1">
                      <div className="w-10 h-1 bg-neutral-700 rounded-full mb-1" />
                      <div className="w-6 h-2 bg-neutral-500 rounded-full" />
                    </div>
                    <div className="flex-1 h-8 rounded border border-neutral-800/80 bg-neutral-900/50 p-1">
                      <div className="w-12 h-1 bg-neutral-700 rounded-full mb-1" />
                      <div className="w-8 h-2 bg-neutral-500 rounded-full" />
                    </div>
                  </div>
                  {/* Chart Wireframe Line */}
                  <div className="h-10 rounded border border-neutral-800/80 bg-neutral-900/40 p-1.5 flex items-end justify-between gap-1">
                    <div className="w-2 h-3 bg-neutral-800 rounded-t" />
                    <div className="w-2 h-5 bg-neutral-700 rounded-t" />
                    <div className="w-2 h-7 bg-neutral-600 rounded-t" />
                    <div className="w-2 h-4 bg-neutral-800 rounded-t" />
                    <div className="w-2 h-8 bg-neutral-500 rounded-t" />
                    <div className="w-2 h-6 bg-neutral-700 rounded-t" />
                  </div>
                </div>
              </div>
            </div>

            {/* Gradient Scrim for Bottom Action Overlay */}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
          </Link>
        )}

        {/* Floating Top Badges (Category & Impact Metric) */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 pointer-events-none z-10">
          <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider text-white bg-black/80 backdrop-blur-md border border-white/20 truncate shadow-xs">
            {project.category}
          </span>

          {project.impact && (
            <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-tight text-[#0A0A0A] bg-white border border-white/90 shadow-xs shrink-0">
              {project.impact}
            </span>
          )}
        </div>

        {/* Floating Bottom Preview Controls */}
        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between gap-2 z-10">
          {/* Status Chip */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/15 text-[11px] font-mono text-white">
            {isSandbox ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-300 font-semibold">Live Sandbox</span>
              </>
            ) : (
              <>
                <Building2 className="w-3 h-3 text-neutral-400" />
                <span className="text-neutral-300">Client Deliverable</span>
              </>
            )}
          </div>

          {/* Quick Direct "Open Sandbox" button directly on the banner */}
          {isSandbox && project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white text-[#0A0A0A] hover:bg-neutral-200 text-xs font-bold transition-all shadow-md cursor-pointer hover:scale-105 active:scale-95"
              title="Open the live interactive demo app in a new tab"
            >
              <span>Open Sandbox</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* Card Body & Details */}
      <div className="p-6 sm:p-7 flex flex-col flex-1 justify-between">
        <Link href={studyHref} className="block group/link">
          <h3 className="text-xl font-bold text-[#0A0A0A] dark:text-white tracking-tight group-hover/link:underline underline-offset-4 line-clamp-1 mb-1">
            {project.title}
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-[#404040] dark:text-neutral-300 line-clamp-1 mb-2">
            {project.tagline}
          </p>
          <p className="text-xs text-[#737373] dark:text-neutral-400 leading-relaxed line-clamp-2">
            {project.summary}
          </p>
        </Link>

        {/* Tech Stack Chips */}
        <div className="mt-5 pt-4 border-t border-[#E5E5E5] dark:border-[#262626]">
          <div className="flex flex-wrap gap-1.5 items-center">
            {visibleTech.map((tag) => (
              <Badge key={tag} variant="outline" size="sm" className="text-[10px]">
                {tag}
              </Badge>
            ))}
            {remainingCount > 0 && (
              <span className="text-[10px] font-mono text-[#737373] dark:text-neutral-500 pl-1">
                +{remainingCount} more
              </span>
            )}
          </div>
        </div>

        {/* Bottom Actions Row: Left side View Details, Right side Contact Us */}
        <div className="mt-5 pt-4 border-t border-[#E5E5E5] dark:border-[#262626] flex items-center justify-between gap-3">
          <Link
            href={studyHref}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0A0A0A] dark:text-white hover:underline underline-offset-4 transition-all"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </Link>

          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0A0A0A] text-white hover:bg-neutral-800 dark:bg-white dark:text-[#0A0A0A] dark:hover:bg-neutral-200 text-xs font-semibold transition-colors shadow-xs"
          >
            <span>Contact Us</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
