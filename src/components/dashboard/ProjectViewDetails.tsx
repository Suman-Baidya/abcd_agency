import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Project } from "@prisma/client";
import { Badge } from "@/components/ui/Badge";
import { Edit, Trash2, RotateCcw, KeyRound, Building2, Globe } from "lucide-react";
import { formatProjectDeadline } from "@/lib/formatDate";

interface ProjectViewDetailsProps {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
}

export function ProjectViewDetails({ project, onEdit, onDelete }: ProjectViewDetailsProps) {
  const timelineDisplay = formatProjectDeadline(project.deadline).fullDisplay;

  return (
    <div className="space-y-10">
      {/* Header Info & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight text-[#0A0A0A] dark:text-white">{project.title}</h2>
            {project.isFeatured && (
              <Badge variant="solid" size="sm" className="mt-1">Featured</Badge>
            )}
          </div>
          <p className="text-[#737373] dark:text-neutral-400 text-lg">{project.tagline}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/admin/revisions?projectId=${project.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] hover:border-black dark:hover:border-white text-[#0A0A0A] dark:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
            Revision Requests
          </Link>
        </div>
      </div>

      {/* Thumbnail Banner Preview if uploaded */}
      {(project as any).thumbnailUrl && (
        <div className="relative w-full h-48 sm:h-56 rounded-xl border border-[#E5E5E5] dark:border-[#262626] overflow-hidden bg-black">
          <Image
            src={(project as any).thumbnailUrl}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            className="object-cover object-top"
          />
        </div>
      )}

      {/* Executive Metadata Tiles: 2 Columns × 2 Rows (4 Boxes) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Box 1: Project Type */}
        <div className="p-4 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#FAFAFA] dark:bg-[#141414] flex flex-col justify-between gap-2.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#737373] dark:text-neutral-500">
            Type
          </span>
          <div>
            {(project as any).projectType === "CLIENT_WORK" ? (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-[#0A0A0A] dark:text-white border border-[#E5E5E5] dark:border-[#333333]">
                <Building2 className="w-4 h-4 text-neutral-500 shrink-0" />
                <span>Client Deliverable</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Live Sandbox Blueprint</span>
              </span>
            )}
          </div>
        </div>

        {/* Box 2: Public Showcase Status */}
        <div className="p-4 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#FAFAFA] dark:bg-[#141414] flex flex-col justify-between gap-2.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#737373] dark:text-neutral-500">
            Public Showcase
          </span>
          <div>
            {(project as any).isPublished !== false ? (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span>Visible on /work</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-[#E5E5E5] dark:border-[#333333]">
                <span className="w-2 h-2 rounded-full bg-neutral-400 shrink-0" />
                <span>Hidden (Draft)</span>
              </span>
            )}
          </div>
        </div>

        {/* Box 3: Client */}
        <div className="p-4 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#FAFAFA] dark:bg-[#141414] flex flex-col justify-between gap-2.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#737373] dark:text-neutral-500">
            Client
          </span>
          <p className="text-sm font-semibold text-[#0A0A0A] dark:text-white truncate" title={project.client}>
            {project.client}
          </p>
        </div>

        {/* Box 4: Category */}
        <div className="p-4 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#FAFAFA] dark:bg-[#141414] flex flex-col justify-between gap-2.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#737373] dark:text-neutral-500">
            Category
          </span>
          <p className="text-sm font-semibold text-[#0A0A0A] dark:text-white truncate" title={project.category}>
            {project.category}
          </p>
        </div>
      </div>

      {/* Sandbox Demo Credentials if configured */}
      {(project as any).demoUrl && (
        <div className="p-5 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] space-y-3">
          <h3 className="text-xs font-bold text-[#0A0A0A] dark:text-white uppercase tracking-wider flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#737373] dark:text-neutral-400" />
            <span>Live Sandbox Access</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div>
              <span className="text-[#737373] dark:text-neutral-400 block text-[11px]">URL</span>
              <a
                href={(project as any).demoUrl}
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-[#0A0A0A] dark:text-white underline truncate block mt-0.5"
              >
                {(project as any).demoUrl}
              </a>
            </div>
            <div>
              <span className="text-[#737373] dark:text-neutral-400 block text-[11px]">Email</span>
              <span className="font-semibold text-[#0A0A0A] dark:text-white block mt-0.5">
                {(project as any).demoEmail || "—"}
              </span>
            </div>
            <div>
              <span className="text-[#737373] dark:text-neutral-400 block text-[11px]">Password</span>
              <span className="font-semibold text-[#0A0A0A] dark:text-white block mt-0.5">
                {(project as any).demoPassword || "—"}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-xs font-bold text-[#0A0A0A] dark:text-white uppercase tracking-wider">Executive Summary</h3>
        <p className="text-base text-[#262626] dark:text-neutral-300 leading-relaxed">
          {project.summary}
        </p>
      </div>

      {project.techStack.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-[#E5E5E5] dark:border-[#262626]">
          <h3 className="text-xs font-bold text-[#0A0A0A] dark:text-white uppercase tracking-wider">Tech Stack</h3>
          <div className="flex flex-wrap gap-2">
            {project.techStack.map(t => (
              <Badge key={t} variant="outline" size="sm">{t}</Badge>
            ))}
          </div>
        </div>
      )}

      {project.content && (
        <div className="space-y-4 pt-6 border-t border-[#E5E5E5] dark:border-[#262626]">
          <h3 className="text-xs font-bold text-[#0A0A0A] dark:text-white uppercase tracking-wider">Deep Dive Content</h3>
          <div 
            className="prose prose-sm prose-neutral dark:prose-invert max-w-none text-[#737373] dark:text-neutral-400 p-6 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#FAFAFA] dark:bg-[#111111]"
            dangerouslySetInnerHTML={{ __html: project.content }}
          />
        </div>
      )}
    </div>
  );
}
