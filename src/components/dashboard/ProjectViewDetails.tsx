import React from "react";
import Link from "next/link";
import { Project } from "@prisma/client";
import { Badge } from "@/components/ui/Badge";
import { Edit, Trash2, RotateCcw } from "lucide-react";
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

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 p-6 rounded-xl border border-[#E5E5E5] dark:border-[#262626] bg-[#FBFBFB] dark:bg-[#111111]">
        <div>
          <h3 className="text-[10px] font-bold text-[#737373] dark:text-neutral-500 uppercase tracking-widest mb-1">Client</h3>
          <p className="text-sm font-semibold text-[#0A0A0A] dark:text-white">{project.client}</p>
        </div>
        <div>
          <h3 className="text-[10px] font-bold text-[#737373] dark:text-neutral-500 uppercase tracking-widest mb-1">Category</h3>
          <p className="text-sm font-semibold text-[#0A0A0A] dark:text-white">{project.category}</p>
        </div>
        <div>
          <h3 className="text-[10px] font-bold text-[#737373] dark:text-neutral-500 uppercase tracking-widest mb-1">Impact</h3>
          <p className="text-sm font-semibold text-[#0A0A0A] dark:text-white">{project.impact}</p>
        </div>
        <div>
          <h3 className="text-[10px] font-bold text-[#737373] dark:text-neutral-500 uppercase tracking-widest mb-1">Timeline</h3>
          <p className="text-sm font-semibold text-[#0A0A0A] dark:text-white">{timelineDisplay}</p>
        </div>
      </div>

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
